import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  IndianRupee, 
  Users, 
  ArrowRight, 
  Calendar,
  TrendingUp,
  Wallet,
  PlusCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  paidById: string;
  paidByName?: string;
  createdAt: string;
}

interface GroupWithExpenses {
  id: string;
  name: string;
  description?: string | null;
  budget?: number | null;
  preferredDate?: string | null;
  members?: { id: string; userId: string }[];
  expenses?: GroupExpense[];
  totalExpenses?: number;
  memberCount?: number;
}

export default function Expenses() {
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading } = useAuth();

  const { data: groups, isLoading: groupsLoading } = useQuery<GroupWithExpenses[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/api/login";
    return null;
  }

  const totalAcrossGroups = groups?.reduce((sum, group) => {
    return sum + (group.budget || 0);
  }, 0) || 0;

  const groupCount = groups?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/40 via-background to-emerald-50/40 dark:from-background dark:via-background dark:to-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Hero Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-6 md:p-8 text-white shadow-xl">
          <div className="absolute top-4 right-4 opacity-20">
            <IndianRupee className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white border-0 mb-3">
              <Wallet className="w-3 h-3 mr-1" />
              Expense Tracker
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Split Expenses</h1>
            <p className="text-green-100 text-sm md:text-base max-w-lg">
              Track and split expenses fairly among your group members. Never worry about who owes what!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{groupCount}</p>
                  <p className="text-xs text-muted-foreground">Active Groups</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{totalAcrossGroups.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground">Total Budget</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 dark:border-teal-800 col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹0</p>
                  <p className="text-xs text-muted-foreground">You Owe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups with Expenses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              Your Groups
            </h2>
          </div>

          {groupsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : groups && groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <Card 
                  key={group.id} 
                  className="hover-elevate cursor-pointer transition-all border-l-4 border-l-green-500"
                  onClick={() => navigate(`/groups/${group.id}`)}
                  data-testid={`card-group-${group.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
                          <IndianRupee className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {group.members?.length || 1} members
                            </span>
                            {group.preferredDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(group.preferredDate).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ₹{(group.budget || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <PlusCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Groups Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a group to start tracking and splitting expenses with friends
                </p>
                <Button 
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-green-500 to-emerald-500"
                  data-testid="button-create-group"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Tips */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              How Split Expenses Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500 rounded-full text-white font-bold text-sm w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <p className="font-medium">Add Expenses</p>
                  <p className="text-sm text-muted-foreground">Record who paid and for what</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500 rounded-full text-white font-bold text-sm w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <p className="font-medium">Split Fairly</p>
                  <p className="text-sm text-muted-foreground">Auto or manual split among members</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-500 rounded-full text-white font-bold text-sm w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <p className="font-medium">Settle Up</p>
                  <p className="text-sm text-muted-foreground">See who owes whom and settle</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
