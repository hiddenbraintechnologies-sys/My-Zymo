import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Store, Shield, ChevronRight, LogOut } from "lucide-react";
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users, events, and vendors</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          <Shield className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate active-elevate-2 cursor-pointer transition-shadow" onClick={() => setLocation('/admin/users')} data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users-count">{stats?.totalUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.usersByRole.superAdmins ?? 0} super admins, {stats?.usersByRole.admins ?? 0} admins
            </p>
          </CardContent>
        </Card>

        <Card className="hover-elevate active-elevate-2 cursor-pointer transition-shadow" onClick={() => setLocation('/admin/events')} data-testid="card-total-events">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-events-count">{stats?.totalEvents ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All platform events</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate active-elevate-2 cursor-pointer transition-shadow" onClick={() => setLocation('/admin/vendors')} data-testid="card-total-vendors">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-vendors-count">{stats?.totalVendors ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered vendors</p>
          </CardContent>
        </Card>

        <Card className="hover-elevate active-elevate-2">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-regular-users-count">{stats?.usersByRole.users ?? 0}</div>
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
  );
}
