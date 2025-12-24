import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Clock, Users, Check, Loader2, Sparkles, Trophy, Eye } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
}

interface PollCardProps {
  id: string;
  question: string;
  description?: string;
  options: PollOption[];
  status: "active" | "ended";
  timeRemaining?: string;
  totalVotes: number;
  isEncrypted: boolean;
  userVote?: number;
  onVote?: (pollId: string, optionIndex: number) => void;
  finalized?: boolean;
  results?: {
    counts: number[];
    total: number;
    percentages: number[];
  };
  onReveal?: () => void;
  revealing?: boolean;
}

// Confetti particle component
const ConfettiParticle = ({ delay, color }: { delay: number; color: string }) => (
  <motion.div
    className="absolute w-2 h-2 rounded-full"
    style={{ background: color }}
    initial={{ 
      x: 0, 
      y: 0, 
      scale: 0,
      opacity: 1 
    }}
    animate={{ 
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      scale: [0, 1, 0],
      opacity: [1, 1, 0],
      rotate: Math.random() * 360
    }}
    transition={{ 
      duration: 1,
      delay,
      ease: "easeOut"
    }}
  />
);

// Winner celebration effect
const WinnerCelebration = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  const colors = [
    "hsl(200, 80%, 50%)",
    "hsl(175, 85%, 45%)",
    "hsl(45, 90%, 50%)",
    "hsl(280, 70%, 60%)",
    "hsl(340, 80%, 55%)",
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <ConfettiParticle 
          key={i} 
          delay={i * 0.03} 
          color={colors[i % colors.length]} 
        />
      ))}
    </div>
  );
};

const PollCard = ({
  id,
  question,
  description,
  options,
  status,
  timeRemaining,
  totalVotes,
  isEncrypted,
  userVote,
  onVote,
  finalized,
  results,
  onReveal,
  revealing,
}: PollCardProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [revealedOptions, setRevealedOptions] = useState<Set<number>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);

  // Trigger celebration when results are first shown
  useEffect(() => {
    if (finalized && results && !isRevealing) {
      setIsRevealing(true);
      // Stagger reveal each option
      options.forEach((_, idx) => {
        setTimeout(() => {
          setRevealedOptions(prev => new Set([...prev, idx]));
        }, idx * 300);
      });
      // Show celebration after all options revealed
      setTimeout(() => {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);
      }, options.length * 300 + 200);
    }
  }, [finalized, results]);

  const winnerIndex = results ? results.counts.indexOf(Math.max(...results.counts)) : -1;
  const hasWinner = results && results.counts[winnerIndex] > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-border bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Winner celebration */}
        <AnimatePresence>
          {showCelebration && <WinnerCelebration show={showCelebration} />}
        </AnimatePresence>

        <CardHeader className="relative">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                {question}
              </CardTitle>
              {description && (
                <CardDescription className="text-muted-foreground">
                  {description}
                </CardDescription>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge 
                variant={status === "active" ? "default" : "secondary"} 
                className={`shrink-0 ${status === "active" ? "bg-gradient-to-r from-primary to-accent text-white" : ""}`}
              >
                {status === "active" ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Active
                  </span>
                ) : "Ended"}
              </Badge>
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 relative">
          {/* Poll Options */}
          <div className="space-y-2">
            {options.map((option, index) => {
              const isWinner = finalized && hasWinner && index === winnerIndex;
              const isRevealed = revealedOptions.has(index);
              const percentage = results?.percentages[index] || 0;
              
              return (
                <motion.div
                  key={option.id}
                  initial={false}
                  animate={isRevealed ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant={userVote === index ? "default" : "outline"}
                    className={`w-full justify-between text-left h-auto py-3 relative overflow-hidden ${
                      isWinner ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    }`}
                    disabled={status === "ended" || (status === "active" && userVote !== undefined && userVote === index)}
                    onClick={() => onVote?.(id, index)}
                  >
                    <div className="flex-1 min-w-0 relative z-10">
                      <span className="truncate block flex items-center gap-2">
                        {option.text}
                        {isWinner && (
                          <motion.span
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
                          >
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          </motion.span>
                        )}
                      </span>
                      
                      {/* Results bar when finalized */}
                      {status === "ended" && finalized && results && isRevealed && (
                        <motion.div 
                          className="mt-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                isWinner 
                                  ? "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient" 
                                  : "bg-muted-foreground/30"
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 pl-2 shrink-0 relative z-10">
                      {status === "ended" && finalized && results && isRevealed ? (
                        <motion.span 
                          className={`text-sm font-medium tabular-nums ${isWinner ? "text-primary" : "text-foreground"}`}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {results.counts[index] ?? 0} ({percentage.toFixed(0)}%)
                        </motion.span>
                      ) : (
                        userVote === index && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                          >
                            <Check className="h-4 w-4" />
                          </motion.div>
                        )
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Poll Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {isEncrypted && status === "active" ? (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Lock className="h-3 w-3" />
                    Encrypted
                  </span>
                ) : (
                  <span>
                    {status === "ended" && finalized && results
                      ? `${results.total} votes`
                      : `${totalVotes} votes`}
                  </span>
                )}
              </div>
              {timeRemaining && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>
            
            {status === "active" && isEncrypted && (
              <motion.div 
                className="flex items-center gap-1.5 text-primary"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="h-4 w-4" />
                <span className="font-medium text-xs">Private vote</span>
              </motion.div>
            )}
          </div>

          {/* Reveal button for ended but not finalized polls */}
          {status === "ended" && !finalized && onReveal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              <Button
                onClick={onReveal}
                disabled={revealing}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
              >
                {revealing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Decrypting...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Reveal Results
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Decrypting indicator */}
          {status === "ended" && !finalized && revealing && (
            <motion.div 
              className="flex items-center justify-center gap-2 text-sm text-primary mt-2 p-3 rounded-lg bg-primary/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Decrypting on-chain...</span>
              <motion.div
                className="flex gap-1"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PollCard;
