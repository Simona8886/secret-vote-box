import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import PollCard from "@/components/PollCard";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import backgroundPattern from "@/assets/background-pattern.png";
import { Loader2, Vote, Shield, Sparkles } from "lucide-react";
import { getAllPolls, getEncryptedVoteCount, hasUserVoted, castVote, type Poll, getContractAddress, isFinalized as isFinalizedOnChain, getClearVoteCounts, requestFinalize, endPollTx } from "@/lib/contract";
import { getFHEVMInstance, encryptOptionIndex } from "@/lib/fhevm";
import { chains } from "@/lib/wagmi";
import { ethers } from "ethers";

interface Vote {
  pollId: number;
  optionIndex: number;
}

const Index = () => {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [finalizedByPoll, setFinalizedByPoll] = useState<Record<number, boolean>>({});
  const [resultsByPoll, setResultsByPoll] = useState<Record<number, { counts: number[]; total: number; percentages: number[] }>>({});
  const [revealingByPoll, setRevealingByPoll] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (publicClient) {
      fetchPolls();
    }
  }, [publicClient]);

  useEffect(() => {
    if (isConnected && address && publicClient) {
      fetchUserVotes();
    }
  }, [isConnected, address, publicClient]);

  const fetchPolls = async () => {
    if (!publicClient) return;

    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum, "any");
      } else {
        const rpcUrl = (chainId === 31337)
          ? "http://localhost:8545"
          : "https://rpc.sepolia.org";
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }
      const allPolls = await getAllPolls(provider, chainId || undefined);
      setPolls(allPolls || []);
      if (!allPolls || allPolls.length === 0) {
        setLoading(false);
        return;
      }
      for (const p of allPolls) {
        const now = Date.now();
        const ended = Number(p.expireAt) * 1000 <= now || !p.isActive;
        if (ended) {
          try {
            const finalized = await isFinalizedOnChain(provider, p.id, chainId || undefined);
            setFinalizedByPoll(prev => ({ ...prev, [p.id]: finalized }));
            if (finalized) {
              const counts = await getClearVoteCounts(provider, p.id, chainId || undefined);
              const total = counts.reduce((a, b) => a + b, 0);
              const percentages = counts.map(c => total > 0 ? (c * 100) / total : 0);
              setResultsByPoll(prev => ({ ...prev, [p.id]: { counts, total, percentages } }));
            } else {
              if (isConnected && address && !(revealingByPoll[p.id])) {
                handleRevealResults(p.id).catch(() => {});
              }
            }
          } catch { /* ignore */ }
        }
      }
    } catch (error: any) {
      console.error("Error fetching polls:", error);
      toast({
        variant: "destructive",
        title: "Error loading polls",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevealResults = async (pollId: number) => {
    if (!isConnected || !address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet.",
      });
      return;
    }
    if (!publicClient) return;
    try {
      setRevealingByPoll(prev => ({ ...prev, [pollId]: true }));
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum, "any");
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        try { await provider.send("eth_requestAccounts", []); } catch { /* ignore */ }
      }
      const signer = await provider.getSigner();
      try {
        const endTx = await endPollTx(signer, pollId, chainId || undefined);
        await endTx.wait();
      } catch {}
      const tx = await requestFinalize(signer, pollId, chainId || undefined);
      await tx.wait();
      const readProvider = new ethers.BrowserProvider(publicClient as any);
      for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const finalized = await isFinalizedOnChain(readProvider, pollId, chainId || undefined);
        if (finalized) {
          const counts = await getClearVoteCounts(readProvider, pollId, chainId || undefined);
          const total = counts.reduce((a, b) => a + b, 0);
          const percentages = counts.map(c => total > 0 ? (c * 100) / total : 0);
          setFinalizedByPoll(prev => ({ ...prev, [pollId]: true }));
          setResultsByPoll(prev => ({ ...prev, [pollId]: { counts, total, percentages } }));
          toast({ title: "Results revealed", description: "Clear results are now available." });
          return;
        }
      }
      toast({ variant: "destructive", title: "Reveal pending", description: "Decryption not completed yet. Please try again shortly." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to reveal results",
        description: error.message || "Please try again.",
      });
    } finally {
      setRevealingByPoll(prev => ({ ...prev, [pollId]: false }));
    }
  };

  const fetchUserVotes = async () => {
    if (!publicClient || !address) return;

    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum, "any");
      } else {
        const rpcUrl = (chainId === 31337)
          ? "http://localhost:8545"
          : "https://rpc.sepolia.org";
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }
      const votes: Vote[] = [];

      for (const poll of polls) {
        const hasVotedResult = await hasUserVoted(provider, poll.id, address, chainId || undefined);
        if (hasVotedResult) {
          const storageKey = `svb:votes:${chainId || 0}:${address}:${poll.id}`;
          const stored = localStorage.getItem(storageKey);
          const storedIndex = stored !== null ? parseInt(stored, 10) : -1;
          votes.push({ pollId: poll.id, optionIndex: isNaN(storedIndex) ? -1 : storedIndex });
        }
      }

      setUserVotes(votes);
    } catch (error: any) {
      console.error("Error loading votes:", error);
    }
  };

  const handleVote = async (pollId: string, optionIndex: number) => {
    if (!isConnected || !address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to vote.",
      });
      return;
    }

    if (!walletClient || !publicClient) {
      toast({
        variant: "destructive",
        title: "Wallet not available",
        description: "Please ensure your wallet is connected.",
      });
      return;
    }

    try {
      const poll = polls.find(p => p.id === parseInt(pollId));
      if (poll) {
        const status = getPollStatus(poll);
        if (status === "ended") {
          toast({
            variant: "destructive",
            title: "Poll ended",
            description: "This poll has already ended. Voting is closed.",
          });
          return;
        }
      }
    } catch {}

    try {
      let readProvider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        readProvider = new ethers.BrowserProvider((window as any).ethereum, "any");
      } else {
        const rpcUrl = (chainId === 31337)
          ? "http://localhost:8545"
          : "https://rpc.sepolia.org";
        readProvider = new ethers.JsonRpcProvider(rpcUrl);
      }
      const hasVotedResult = await hasUserVoted(readProvider, parseInt(pollId), address, chainId || undefined);
      if (hasVotedResult) {
        toast({
          variant: "destructive",
          title: "Already voted",
          description: "You have already voted on this poll.",
        });
        return;
      }
    } catch (error) {
      console.warn("Failed to check if user has voted:", error);
      toast({
        variant: "destructive",
        title: "Unable to verify voting status",
        description: "Please refresh the page and try again.",
      });
      return;
    }

    const contractAddress = getContractAddress(chainId || undefined);
    if (!contractAddress) {
      toast({
        variant: "destructive",
        title: "Contract not deployed",
        description: `Contract is not deployed on this network (Chain ID: ${chainId}). Please switch to a supported network.`,
      });
      return;
    }

    try {
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("No wallet provider detected. Please install or enable your wallet.");
      }
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum, "any");
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        try {
          await provider.send("eth_requestAccounts", []);
        } catch (reqErr) {
          throw new Error("Wallet not authorized. Please connect your wallet.");
        }
      }
      const signer = await provider.getSigner();

      console.log("Initializing FHEVM instance for voting...");
      const fhevm = await getFHEVMInstance(chainId);
      console.log("FHEVM instance initialized:", !!fhevm);

      toast({
        title: "Encrypting vote...",
        description: "Please wait while your vote is being encrypted.",
      });

      console.log("Encrypting option index:", optionIndex);
      const contractAddress = getContractAddress(chainId || undefined);
      const encryptedInput = await encryptOptionIndex(
        fhevm,
        contractAddress,
        address,
        optionIndex
      );
      console.log("Encrypted input:", {
        handlesLength: encryptedInput.handles.length,
        inputProofLength: encryptedInput.inputProof.length,
      });

      toast({
        title: "Submitting vote...",
        description: "Please confirm the transaction in your wallet.",
      });

      console.log("Casting vote with:", {
        pollId: parseInt(pollId),
        handle: encryptedInput.handles[0],
        proof: encryptedInput.inputProof,
      });

      const tx = await castVote(
        signer,
        parseInt(pollId),
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        chainId || undefined
      );

      toast({
        title: "Transaction submitted",
        description: "Waiting for confirmation...",
      });

      await tx.wait();

      toast({
        title: "Vote submitted successfully!",
        description: "Your encrypted vote has been recorded.",
      });

      try {
        const storageKey = `svb:votes:${chainId || 0}:${address}:${parseInt(pollId)}`;
        localStorage.setItem(storageKey, String(optionIndex));
      } catch {}

      await fetchPolls();
      if (address) {
        await fetchUserVotes();
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      toast({
        variant: "destructive",
        title: "Error submitting vote",
        description: error.message || "Failed to submit vote. Please try again.",
      });
    }
  };

  const getTimeRemaining = (expireAt: bigint) => {
    const now = Date.now();
    const expiry = Number(expireAt) * 1000;
    const diff = expiry - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return "Less than 1h remaining";
  };

  const getPollStatus = (poll: Poll) => {
    const now = Date.now();
    const expiry = Number(poll.expireAt) * 1000;
    if (expiry <= now || !poll.isActive) return "ended";
    return "active";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-10 w-10 text-primary" />
          </motion.div>
          <p className="text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${backgroundPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-tl from-accent/20 to-transparent blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <FadeIn>
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
            >
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">End-to-End Encrypted</span>
            </motion.div>
            
            <h2 className="text-4xl font-bold mb-3">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient">
                {polls.length > 0 ? `All Polls (${polls.length})` : "Active Polls"}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your vote remains encrypted until the poll closes. No one can see voting trends
              or pressure you based on current results. Vote freely, vote privately.
            </p>
          </div>
        </FadeIn>

        {!isConnected && (
          <FadeIn delay={0.2}>
            <motion.div 
              className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10"
              whileHover={{ scale: 1.01 }}
            >
              <Vote className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Connect Your Wallet</p>
              <p className="text-muted-foreground">
                Please connect your wallet to view and participate in polls.
              </p>
            </motion.div>
          </FadeIn>
        )}

        {polls.length === 0 ? (
          <FadeIn delay={0.2}>
            <motion.div 
              className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border"
              whileHover={{ scale: 1.01 }}
            >
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Polls Yet</p>
              <p className="text-muted-foreground">
                {isConnected ? "Be the first to create one!" : "Connect your wallet to create a poll."}
              </p>
            </motion.div>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
            {polls.map((poll) => {
              const userVote = userVotes.find(v => v.pollId === poll.id);
              const status = getPollStatus(poll);
              const finalized = finalizedByPoll[poll.id] || false;
              const results = resultsByPoll[poll.id];
              return (
                <StaggerItem key={poll.id}>
                  <PollCard
                    id={poll.id.toString()}
                    question={poll.title}
                    description={poll.description || undefined}
                    options={poll.options.map((opt, idx) => ({ id: `option-${idx}`, text: opt }))}
                    status={status as "active" | "ended"}
                    timeRemaining={getTimeRemaining(poll.expireAt)}
                    totalVotes={results?.total || 0}
                    isEncrypted={status === "active"}
                    userVote={userVote?.optionIndex}
                    onVote={handleVote}
                    finalized={finalized}
                    results={results}
                    onReveal={status === "ended" && !finalized ? () => handleRevealResults(poll.id) : undefined}
                    revealing={!!revealingByPoll[poll.id]}
                  />
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </main>
    </div>
  );
};

export default Index;
