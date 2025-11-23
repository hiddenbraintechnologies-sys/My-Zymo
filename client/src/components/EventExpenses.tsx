import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Check, X, DollarSign } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface EventExpensesProps {
  eventId: string;
  participants: { id: string; name: string; image?: string }[];
}

// Mock expenses
const mockExpenses = [
  {
    id: "1",
    description: "Venue Booking - India Habitat Centre",
    amount: 50000,
    paidBy: "Rahul Kumar",
    splitAmong: 25,
    perPerson: 2000,
    status: "pending",
    approvals: 18,
    total: 25,
  },
  {
    id: "2",
    description: "Catering Services",
    amount: 35000,
    paidBy: "Priya Sharma",
    splitAmong: 25,
    perPerson: 1400,
    status: "approved",
    approvals: 25,
    total: 25,
  },
];

export default function EventExpenses({ eventId, participants }: EventExpensesProps) {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  const handleApprove = (expenseId: string) => {
    setExpenses(expenses.map(exp =>
      exp.id === expenseId
        ? { ...exp, approvals: exp.approvals + 1 }
        : exp
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Expense Management</h3>
          <p className="text-sm text-muted-foreground">Split costs among participants</p>
        </div>
        <Dialog open={isAddingExpense} onOpenChange={setIsAddingExpense}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-expense">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Add an expense to split among participants
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="expense-desc">Description</Label>
                <Input
                  id="expense-desc"
                  placeholder="e.g., Venue booking, Catering"
                  data-testid="input-expense-description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (₹)</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  placeholder="0"
                  data-testid="input-expense-amount"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsAddingExpense(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setIsAddingExpense(false)} className="flex-1" data-testid="button-submit-expense">
                  Add & Request Approval
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {expenses.map((expense) => (
          <Card key={expense.id} data-testid={`expense-${expense.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base">{expense.description}</CardTitle>
                  <CardDescription className="mt-1">
                    Paid by {expense.paidBy}
                  </CardDescription>
                </div>
                <Badge variant={expense.status === "approved" ? "default" : "secondary"}>
                  {expense.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">₹{expense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Split Among</p>
                  <p className="font-semibold">{expense.splitAmong} people</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Per Person</p>
                  <p className="font-semibold">₹{expense.perPerson.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Approvals</p>
                  <p className="font-semibold">{expense.approvals}/{expense.total}</p>
                </div>
              </div>

              {expense.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(expense.id)}
                    data-testid="button-approve-expense"
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    data-testid="button-reject-expense"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Share</p>
              <p className="text-2xl font-bold">
                ₹{expenses.reduce((sum, exp) => sum + exp.perPerson, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
