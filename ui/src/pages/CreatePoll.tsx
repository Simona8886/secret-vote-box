import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Plus, X, Lock, Sparkles, Loader2 } from "lucide-react";
import { createPoll, getContractAddress } from "@/lib/contract";
import { ethers } from "ethers";

const CreatePoll = () => {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expireAt, setExpireAt] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address || !walletClient) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a poll.",
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

    const filledOptions = options.filter(opt => opt.trim() !== "");
    if (filledOptions.length < 2) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide at least 2 options",
      });
      return;
    }

    setLoading(true);

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
      
      const expireDate = new Date(expireAt);
      const now = new Date();
      
      if (expireDate <= now) {
        toast({
          variant: "destructive",
          title: "Invalid expiration time",
          description: "Expiration time must be in the future.",
        });
        setLoading(false);
        return;
      }
      
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      const currentBlockTimestamp = block ? Number(block.timestamp) * 1000 : now.getTime();
      const expireTimestamp = Math.floor(expireDate.getTime() / 1000);
      const minExpireTimestamp = Math.floor(currentBlockTimestamp / 1000) + 300;
      
      if (expireTimestamp <= minExpireTimestamp) {
        const adjustedExpireDate = new Date((minExpireTimestamp + 1) * 1000);
        expireDate.setTime(adjustedExpireDate.getTime());
        toast({
          title: "Expiration time adjusted",
          description: "Expiration time has been adjusted to at least 5 minutes from now.",
        });
      }
      
      const tx = await createPoll(signer, title.trim(), description.trim(), filledOptions, expireDate, chainId || undefined);
      
      toast({
        title: "Transaction submitted",
        description: "Waiting for confirmation...",
      });

      await tx.wait();

      toast({
        title: "Poll created successfully!",
        description: "Your poll is now live and ready for votes.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating poll",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-border bg-card/80 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
            
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Poll
              </CardTitle>
              <CardDescription>Set up your encrypted poll with question and options</CardDescription>
            </CardHeader>
            
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Question *</Label>
                  <Input
                    id="title"
                    placeholder="What's your question?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add more context to your poll..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Poll Options *</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        required
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expireAt">Expiration Date & Time *</Label>
                  <Input
                    id="expireAt"
                    type="datetime-local"
                    value={expireAt}
                    onChange={(e) => setExpireAt(e.target.value)}
                    min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Expiration time must be at least 5 minutes from now.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label htmlFor="encrypted" className="font-medium">Encrypted Poll</Label>
                      <p className="text-sm text-muted-foreground">
                        Privacy protection enabled
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="encrypted"
                    checked={isEncrypted}
                    onCheckedChange={setIsEncrypted}
                    disabled
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Poll"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CreatePoll;
