import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Store, Shield, ChevronRight, LogOut, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalVendors: number;
  usersByRole: {
    users: number;
    masterUsers: number;
    admins: number;
    superAdmins: number;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/admin/stats'],
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner - Warm Cream Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/80 to-orange-50 dark:from-orange-950/20 dark:via-amber-950/15 dark:to-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-8 shadow-sm">
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 flex items-center gap-3 text-foreground">
                <Sparkles className="w-7 h-7 text-orange-500" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-base md:text-lg">Manage users, events, and vendors</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-xl p-4 min-w-[90px] shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.totalUsers ?? 0}</div>
                <div className="text-xs md:text-sm text-orange-600/80 dark:text-orange-400/80">Users</div>
              </div>
              <div className="text-center bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-xl p-4 min-w-[90px] shadow-sm">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">{stats?.totalVendors ?? 0}</div>
                <div className="text-xs md:text-sm text-orange-600/80 dark:text-orange-400/80">Vendors</div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hidden sm:flex gap-2"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate active-elevate-2 cursor-pointer transition-shadow border border-orange-100 dark:border-orange-900/30" onClick={() => setLocation('/admin/users')} data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-total-users-count">{stats?.totalUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.usersByRole.superAdmins ?? 0} super admins, {stats?.usersByRole.admins ?? 0} admins
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate active-elevate-2 cursor-pointer transition-shadow border border-orange-100 dark:border-orange-900/30" onClick={() => setLocation('/admin/events')} data-testid="card-total-events">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-total-events-count">{stats?.totalEvents ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All platform events</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate active-elevate-2 cursor-pointer transition-shadow border border-orange-100 dark:border-orange-900/30" onClick={() => setLocation('/admin/vendors')} data-testid="card-total-vendors">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-total-vendors-count">{stats?.totalVendors ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered vendors</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate active-elevate-2 border border-orange-100 dark:border-orange-900/30">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-regular-users-count">{stats?.usersByRole.users ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Regular users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-between" data-testid="button-manage-users">
                Manage Users
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/events">
              <Button variant="outline" className="w-full justify-between" data-testid="button-manage-events">
                Manage Events
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/vendors">
              <Button variant="outline" className="w-full justify-between" data-testid="button-manage-vendors">
                Manage Vendors
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Super Admins</span>
              <span className="font-semibold" data-testid="text-super-admins-count">{stats?.usersByRole.superAdmins ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Admins</span>
              <span className="font-semibold" data-testid="text-admins-count">{stats?.usersByRole.admins ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Master Users</span>
              <span className="font-semibold" data-testid="text-master-users-count">{stats?.usersByRole.masterUsers ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Regular Users</span>
              <span className="font-semibold" data-testid="text-users-count">{stats?.usersByRole.users ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
