import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, usePublicClient } from "wagmi";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Loader2, Vote, Lock, CheckCircle2, Clock } from "lucide-react";
import { getAllPolls, hasUserVoted, type Poll } from "@/lib/contract";
import { ethers } from "ethers";
 
interface VoteRecord {
  pollId: number;
  poll: Poll;
}
 
const MyVotes = () => {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    if (isConnected && address && publicClient) {
      fetchVotes();
    }
  }, [isConnected, address, publicClient]);

  const fetchVotes = async () => {
    if (!publicClient || !address) return;

    try {
      const provider = new ethers.BrowserProvider(publicClient as any);
      const allPolls = await getAllPolls(provider, chainId || undefined);
      
      const userVotes: VoteRecord[] = [];
      for (const poll of allPolls) {
        const hasVotedResult = await hasUserVoted(provider, poll.id, address, chainId || undefined);
        if (hasVotedResult) {
          userVotes.push({ pollId: poll.id, poll });
        }
      }

      setVotes(userVotes);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading votes",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getPollStatus = (poll: Poll) => {
    const now = Date.now();
    const expiry = Number(poll.expireAt) * 1000;
    if (expiry <= now || !poll.isActive) return "ended";
    return "active";
  };

  const getTimeRemaining = (expireAt: bigint) => {
    const now = Date.now();
    const expiry = Number(expireAt) * 1000;
    const diff = expiry - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return "< 1h left";
  };

  if (!isConnected || loading) {
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
          <p className="text-muted-foreground">Loading your votes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <FadeIn>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Vote className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Participation</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              My Votes
            </h1>
            <p className="text-muted-foreground mt-2">View all polls you've participated in</p>
          </div>
        </FadeIn>

        {votes.length === 0 ? (
          <FadeIn delay={0.2}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border"
            >
              <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Votes Yet</p>
              <p className="text-muted-foreground">
                You haven't voted on any polls yet. Start participating!
              </p>
            </motion.div>
          </FadeIn>
        ) : (
          <StaggerContainer className="grid gap-6" staggerDelay={0.1}>
            {votes.map((vote) => {
              const status = getPollStatus(vote.poll);
              const timeRemaining = getTimeRemaining(vote.poll.expireAt);
              
              return (
                <StaggerItem key={vote.pollId}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="overflow-hidden border-border bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 hover:opacity-100 transition-opacity" />
                      
                      <CardHeader className="relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{vote.poll.title}</CardTitle>
                            {vote.poll.description && (
                              <CardDescription>{vote.poll.description}</CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={status === "active" ? "default" : "secondary"}
                              className={status === "active" ? "bg-gradient-to-r from-primary to-accent text-white" : ""}
                            >
                              {status === "active" ? (
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  Active
                                </span>
                              ) : "Ended"}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative">
                        <motion.div 
                          className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/20">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">Vote Submitted</span>
                              <div className="flex items-center gap-1 text-sm text-primary">
                                <Lock className="h-3 w-3" />
                                <span>Encrypted & Secure</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{timeRemaining}</span>
                          </div>
                        </motion.div>
                        
                        <p className="text-sm text-muted-foreground mt-3">
                          {status === "active" 
                            ? "Your vote is encrypted and will be revealed when the poll ends."
                            : "Results are available once the poll creator reveals them."}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}

        {/* Stats summary */}
        {votes.length > 0 && (
          <FadeIn delay={0.3}>
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">{votes.length}</div>
                  <div className="text-sm text-muted-foreground">Total Votes</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">
                    {votes.filter(v => getPollStatus(v.poll) === "active").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Polls</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-muted-foreground">
                    {votes.filter(v => getPollStatus(v.poll) === "ended").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Ended Polls</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">100%</div>
                  <div className="text-sm text-muted-foreground">Privacy Protected</div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  );
};

export default MyVotes;
