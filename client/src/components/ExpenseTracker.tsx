import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, IndianRupee } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: number;
}

interface PersonExpense {
  name: string;
  initials: string;
  amount: number;
  status: "paid" | "pending";
}

// TODO: Remove mock data
const expenses: Expense[] = [
  {
    id: "1",
    description: "Venue Booking",
    amount: 15000,
    paidBy: "Rahul",
    splitAmong: 5,
  },
  {
    id: "2",
    description: "Catering",
    amount: 8000,
    paidBy: "Priya",
    splitAmong: 5,
  },
  {
    id: "3",
    description: "Decorations",
    amount: 3500,
    paidBy: "You",
    splitAmong: 5,
  },
];

const personExpenses: PersonExpense[] = [
  { name: "Rahul Kumar", initials: "RK", amount: 5300, status: "paid" },
  { name: "Priya Sharma", initials: "PS", amount: 5300, status: "paid" },
  { name: "Amit Patel", initials: "AP", amount: 5300, status: "pending" },
  { name: "Sneha Verma", initials: "SV", amount: 5300, status: "pending" },
  { name: "You", initials: "ME", amount: 5300, status: "paid" },
];

export default function ExpenseTracker() {
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const perPerson = totalExpense / 5;
  const totalPaid = personExpenses.filter(p => p.status === "paid").length;
  const paidPercentage = (totalPaid / personExpenses.length) * 100;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-2xl mb-1">
              ₹{totalExpense.toLocaleString('en-IN')}
            </h3>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
          </div>
          <div className="text-right">
            <h3 className="font-heading font-semibold text-2xl mb-1">
              ₹{perPerson.toLocaleString('en-IN')}
            </h3>
            <p className="text-sm text-muted-foreground">Per Person</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Payment Progress</span>
            <span className="text-muted-foreground">{totalPaid}/{personExpenses.length} paid</span>
          </div>
          <Progress value={paidPercentage} />
        </div>
      </Card>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-lg">Expenses</h3>
          <Button 
            size="sm" 
            className="gap-2"
            data-testid="button-add-expense"
            onClick={() => console.log('Add expense clicked')}
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>
        
        <div className="space-y-3">
          {expenses.map((expense) => (
            <Card 
              key={expense.id} 
              className="p-4 hover-elevate cursor-pointer"
              onClick={() => console.log(`Expense ${expense.id} clicked`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{expense.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    Paid by {expense.paidBy} • Split {expense.splitAmong} ways
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-semibold flex items-center">
                    <IndianRupee className="w-4 h-4" />
                    {expense.amount.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ₹{(expense.amount / expense.splitAmong).toLocaleString('en-IN')} each
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-heading font-semibold text-lg mb-4">Per Person Summary</h3>
        <div className="space-y-3">
          {personExpenses.map((person, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{person.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{person.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <Badge variant={person.status === "paid" ? "default" : "secondary"}>
                  {person.status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
