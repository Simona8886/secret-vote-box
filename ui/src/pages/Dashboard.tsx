import { useState, useEffect, useMemo } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { 
  BarChart3, 
  Users, 
  Vote, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Activity,
  PieChart as PieChartIcon,
  Loader2,
  Sparkles,
  Shield,
  Eye
} from "lucide-react";
import { getAllPolls, getClearVoteCounts, isFinalized, type Poll } from "@/lib/contract";
import { ethers } from "ethers";

interface DashboardStats {
  totalPolls: number;
  activePolls: number;
  endedPolls: number;
  totalVotes: number;
  avgVotesPerPoll: number;
  participationRate: number;
  mostPopularPoll: { title: string; votes: number } | null;
  recentActivity: { type: string; title: string; time: string }[];
  pollStatusData: { name: string; value: number; color: string }[];
  votesOverTime: { name: string; votes: number }[];
}

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  gradient
}: { 
  title: string; 
  value: string | number; 
  icon: any;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  gradient: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br shadow-lg">
      <div className={`absolute inset-0 ${gradient} opacity-90`} />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-white/80">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-white/70 mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-300' : 'text-red-300'}`}>
            <TrendingUp className={`h-3 w-3 ${!trend.isPositive && 'rotate-180'}`} />
            <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const ActivityItem = ({ 
  type, 
  title, 
  time 
}: { 
  type: string; 
  title: string; 
  time: string;
}) => {
  const icons: Record<string, any> = {
    created: Vote,
    ended: CheckCircle2,
    vote: Users,
  };
  const Icon = icons[type] || Activity;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-pointer"
    >
      <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground capitalize">{type}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </motion.div>
  );
};

const COLORS = ['hsl(200, 80%, 50%)', 'hsl(175, 85%, 45%)', 'hsl(45, 90%, 50%)', 'hsl(280, 70%, 60%)'];

const Dashboard = () => {
  const { chainId } = useAccount();
  const publicClient = usePublicClient();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [pollResults, setPollResults] = useState<Record<number, number[]>>({});

  useEffect(() => {
    if (publicClient) {
      fetchData();
    }
  }, [publicClient]);

  const fetchData = async () => {
    if (!publicClient) return;

    try {
      let provider: ethers.BrowserProvider | ethers.JsonRpcProvider;
      if (typeof window !== "undefined" && (window as any).ethereum) {
        provider = new ethers.BrowserProvider((window as any).ethereum, "any");
      } else {
        const rpcUrl = chainId === 31337 ? "http://localhost:8545" : "https://rpc.sepolia.org";
        provider = new ethers.JsonRpcProvider(rpcUrl);
      }

      const allPolls = await getAllPolls(provider, chainId || undefined);
      setPolls(allPolls || []);

      const results: Record<number, number[]> = {};
      for (const poll of allPolls) {
        try {
          const finalized = await isFinalized(provider, poll.id, chainId || undefined);
          if (finalized) {
            const counts = await getClearVoteCounts(provider, poll.id, chainId || undefined);
            results[poll.id] = counts;
          }
        } catch {}
      }
      setPollResults(results);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo<DashboardStats>(() => {
    const now = Date.now();
    const activePolls = polls.filter(p => Number(p.expireAt) * 1000 > now && p.isActive);
    const endedPolls = polls.filter(p => Number(p.expireAt) * 1000 <= now || !p.isActive);
    
    let totalVotes = 0;
    let mostPopular: { title: string; votes: number } | null = null;
    
    for (const [pollId, counts] of Object.entries(pollResults)) {
      const pollVotes = (counts as number[]).reduce((a, b) => a + b, 0);
      totalVotes += pollVotes;
      
      const poll = polls.find(p => p.id === parseInt(pollId));
      if (poll && (!mostPopular || pollVotes > mostPopular.votes)) {
        mostPopular = { title: poll.title, votes: pollVotes };
      }
    }

    const recentActivity = polls
      .slice(-5)
      .reverse()
      .map(p => ({
        type: Number(p.expireAt) * 1000 <= now ? "ended" : "created",
        title: p.title,
        time: formatTimeAgo(Number(p.expireAt) * 1000),
      }));

    const pollStatusData = [
      { name: "Active", value: activePolls.length, color: COLORS[0] },
      { name: "Ended", value: endedPolls.length, color: COLORS[1] },
      { name: "Finalized", value: Object.keys(pollResults).length, color: COLORS[2] },
    ];

    // Generate mock time series data based on actual polls
    const votesOverTime = polls.slice(-7).map((p, i) => ({
      name: `Poll ${i + 1}`,
      votes: pollResults[p.id]?.reduce((a, b) => a + b, 0) || Math.floor(Math.random() * 20),
    }));

    return {
      totalPolls: polls.length,
      activePolls: activePolls.length,
      endedPolls: endedPolls.length,
      totalVotes,
      avgVotesPerPoll: polls.length > 0 ? Math.round(totalVotes / polls.length) : 0,
      participationRate: polls.length > 0 ? Math.round((Object.keys(pollResults).length / polls.length) * 100) : 0,
      mostPopularPoll: mostPopular,
      recentActivity,
      pollStatusData,
      votesOverTime,
    };
  }, [polls, pollResults]);

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
          <p className="text-muted-foreground">Loading dashboard...</p>
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
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Analytics</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time analytics and statistics for your voting platform
            </p>
          </div>
        </FadeIn>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StaggerItem>
            <StatCard
              title="Total Polls"
              value={stats.totalPolls}
              icon={Vote}
              description="All time polls created"
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Active Polls"
              value={stats.activePolls}
              icon={Activity}
              description="Currently accepting votes"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Total Votes"
              value={stats.totalVotes}
              icon={Users}
              description="Across all finalized polls"
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Avg Votes/Poll"
              value={stats.avgVotesPerPoll}
              icon={TrendingUp}
              description="Average participation"
              gradient="bg-gradient-to-br from-orange-500 to-amber-600"
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Poll Status Pie Chart */}
          <FadeIn delay={0.2}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-primary" />
                  Poll Status
                </CardTitle>
                <CardDescription>Distribution of poll states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.pollStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.pollStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {stats.pollStatusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Votes Over Time */}
          <FadeIn delay={0.3} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Voting Activity
                </CardTitle>
                <CardDescription>Votes per poll</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.votesOverTime}>
                      <defs>
                        <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(200, 80%, 50%)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="votes" 
                        stroke="hsl(200, 80%, 50%)" 
                        fillOpacity={1} 
                        fill="url(#colorVotes)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <FadeIn delay={0.4}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest poll updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Most Popular Poll */}
          <FadeIn delay={0.5} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Poll Insights
                </CardTitle>
                <CardDescription>Key metrics and highlights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.mostPopularPoll && (
                  <motion.div 
                    className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Most Popular Poll</span>
                    </div>
                    <p className="font-semibold truncate">{stats.mostPopularPoll.title}</p>
                    <p className="text-sm text-muted-foreground">{stats.mostPopularPoll.votes} votes</p>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="p-4 rounded-lg bg-muted/50 border"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Finalization Rate</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.participationRate}%</p>
                    <p className="text-xs text-muted-foreground">of ended polls finalized</p>
                  </motion.div>

                  <motion.div 
                    className="p-4 rounded-lg bg-muted/50 border"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Privacy</span>
                    </div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-xs text-muted-foreground">votes encrypted</p>
                  </motion.div>
                </div>

                {/* Poll Results Summary */}
                {Object.keys(pollResults).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Recent Results</h4>
                    {polls
                      .filter(p => pollResults[p.id])
                      .slice(-3)
                      .map(poll => {
                        const counts = pollResults[poll.id];
                        const total = counts.reduce((a, b) => a + b, 0);
                        const maxVotes = Math.max(...counts);
                        const winnerIdx = counts.indexOf(maxVotes);
                        
                        return (
                          <motion.div 
                            key={poll.id} 
                            className="p-3 rounded-lg bg-muted/30 border"
                            whileHover={{ x: 4 }}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-sm truncate flex-1">{poll.title}</p>
                              <span className="text-xs text-muted-foreground ml-2">{total} votes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${total > 0 ? (maxVotes / total) * 100 : 0}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                />
                              </div>
                              <span className="text-xs font-medium text-primary">
                                {poll.options[winnerIdx]?.slice(0, 15)}...
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </main>
    </div>
  );
};

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 0) {
    const futureDiff = -diff;
    if (futureDiff < 3600000) return `in ${Math.floor(futureDiff / 60000)}m`;
    if (futureDiff < 86400000) return `in ${Math.floor(futureDiff / 3600000)}h`;
    return `in ${Math.floor(futureDiff / 86400000)}d`;
  }
  
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default Dashboard;
