import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Shield, ChevronLeft, Sparkles, Users } from "lucide-react";
import { Link } from "wouter";
import type { User } from "@shared/schema";

const ROLE_COLORS = {
  super_admin: "bg-red-500",
  admin: "bg-orange-500",
  master_user: "bg-blue-500",
  user: "bg-gray-500",
};

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  master_user: "Master User",
  user: "User",
};

export default function UserManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "admin",
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: typeof newUser) =>
      apiRequest('/api/admin/users/create-privileged', 'POST', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsCreateDialogOpen(false);
      setNewUser({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "user",
      });
      toast({
        title: "User created",
        description: "New user has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiRequest(`/api/admin/users/${userId}/role`, 'PATCH', { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/admin/users/${userId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isSuperAdmin = currentUser?.role === 'super_admin';

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/40 via-background to-amber-50/40 dark:from-background dark:via-background dark:to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner - Warm Cream Design */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/80 to-orange-50 dark:from-orange-950/20 dark:via-amber-950/15 dark:to-orange-950/20 border border-orange-100 dark:border-orange-900/30 p-6 shadow-sm">
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="icon" data-testid="button-back-admin" className="hover:bg-orange-100 dark:hover:bg-orange-900/30">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-3 text-foreground">
                  <Sparkles className="w-6 h-6 text-orange-500" />
                  User Management
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  Manage user accounts and permissions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white dark:bg-card border border-orange-200 dark:border-orange-800 rounded-xl p-3 min-w-[80px] shadow-sm">
                <div className="text-xl md:text-2xl font-bold text-orange-600 dark:text-orange-400">{users?.length ?? 0}</div>
                <div className="text-xs text-orange-600/80 dark:text-orange-400/80">Users</div>
              </div>
            </div>
          </div>
        </div>
      
      <div className="flex items-center justify-between">
        
        {isSuperAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-user">
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-user">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with a specific role
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    data-testid="input-username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    placeholder="john_doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    data-testid="input-password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      data-testid="input-firstName"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      data-testid="input-lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="master_user">Master User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createUserMutation.mutate(newUser)}
                  disabled={createUserMutation.isPending || !newUser.username || !newUser.email || !newUser.password}
                  data-testid="button-confirm-create"
                >
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {users?.length ?? 0} total users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
                data-testid={`user-item-${user.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-semibold text-foreground" data-testid={`text-username-${user.id}`}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`text-email-${user.id}`}>
                        @{user.username} • {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isSuperAdmin ? (
                    <Select
                      value={user.role || 'user'}
                      onValueChange={(value) => updateRoleMutation.mutate({ userId: user.id, role: value })}
                      disabled={user.id === currentUser?.id}
                    >
                      <SelectTrigger className="w-40" data-testid={`select-role-${user.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="master_user">Master User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.user}>
                      {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || 'User'}
                    </Badge>
                  )}

                  {user.id !== currentUser?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" data-testid={`button-delete-${user.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {user.firstName} {user.lastName}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            data-testid="button-confirm-delete"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
