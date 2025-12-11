import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  IndianRupee, 
  Plus, 
  Users, 
  ArrowRight, 
  Check, 
  Trash2, 
  Calculator,
  Sparkles,
  UserPlus,
  Lock,
  PartyPopper,
  FileDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/generated_images/myzymo_celebration_app_logo.png";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Member {
  id: string;
  name: string;
  color: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
}

interface Balance {
  from: string;
  to: string;
  amount: number;
}

const DEMO_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-rose-500",
];

export default function ExpenseSplitDemo() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  const [members, setMembers] = useState<Member[]>([
    { id: "1", name: "You", color: "bg-orange-500" },
    { id: "2", name: "Rahul", color: "bg-blue-500" },
    { id: "3", name: "Priya", color: "bg-green-500" },
  ]);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", description: "Dinner at Restaurant", amount: 1500, paidBy: "1", splitAmong: ["1", "2", "3"] },
    { id: "2", description: "Movie Tickets", amount: 600, paidBy: "2", splitAmong: ["1", "2", "3"] },
  ]);
  
  const [newMemberName, setNewMemberName] = useState("");
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    paidBy: "1",
    splitAmong: ["1", "2", "3"] as string[],
  });
  
  const [showAddExpense, setShowAddExpense] = useState(false);

  const addMember = () => {
    if (!newMemberName.trim()) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      color: DEMO_COLORS[members.length % DEMO_COLORS.length],
    };
    setMembers([...members, newMember]);
    setNewExpense(prev => ({
      ...prev,
      splitAmong: [...prev.splitAmong, newMember.id],
    }));
    setNewMemberName("");
  };

  const removeMember = (id: string) => {
    if (id === "1") return; // Can't remove yourself
    setMembers(members.filter(m => m.id !== id));
    // Reassign expenses paid by removed member to "You" (id "1") instead of deleting
    setExpenses(expenses.map(e => ({
      ...e,
      paidBy: e.paidBy === id ? "1" : e.paidBy,
      splitAmong: e.splitAmong.filter(s => s !== id),
    })).filter(e => e.splitAmong.length > 0)); // Only remove if no one left to split
    setNewExpense(prev => ({
      ...prev,
      splitAmong: prev.splitAmong.filter(s => s !== id),
      paidBy: prev.paidBy === id ? "1" : prev.paidBy,
    }));
  };

  const addExpense = () => {
    if (!newExpense.description.trim() || !newExpense.amount || newExpense.splitAmong.length === 0) return;
    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description.trim(),
      amount: parseFloat(newExpense.amount),
      paidBy: newExpense.paidBy,
      splitAmong: newExpense.splitAmong,
    };
    setExpenses([...expenses, expense]);
    setNewExpense({
      description: "",
      amount: "",
      paidBy: "1",
      splitAmong: members.map(m => m.id),
    });
    setShowAddExpense(false);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const toggleSplitMember = (memberId: string) => {
    setNewExpense(prev => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(memberId)
        ? prev.splitAmong.filter(id => id !== memberId)
        : [...prev.splitAmong, memberId],
    }));
  };

  const calculateBalances = (): Balance[] => {
    const netBalances: Record<string, number> = {};
    members.forEach(m => {
      netBalances[m.id] = 0;
    });

    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitAmong.length;
      netBalances[expense.paidBy] += expense.amount;
      expense.splitAmong.forEach(memberId => {
        netBalances[memberId] -= splitAmount;
      });
    });

    const balances: Balance[] = [];
    const debtors = Object.entries(netBalances)
      .filter(([, balance]) => balance < -0.01)
      .map(([id, balance]) => ({ id, balance: Math.abs(balance) }))
      .sort((a, b) => b.balance - a.balance);
    
    const creditors = Object.entries(netBalances)
      .filter(([, balance]) => balance > 0.01)
      .map(([id, balance]) => ({ id, balance }))
      .sort((a, b) => b.balance - a.balance);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(debtors[i].balance, creditors[j].balance);
      if (amount > 0.01) {
        balances.push({
          from: debtors[i].id,
          to: creditors[j].id,
          amount: Math.round(amount * 100) / 100,
        });
      }
      debtors[i].balance -= amount;
      creditors[j].balance -= amount;
      if (debtors[i].balance < 0.01) i++;
      if (creditors[j].balance < 0.01) j++;
    }

    return balances;
  };

  const getMember = (id: string) => members.find(m => m.id === id);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const balances = calculateBalances();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/50 to-background dark:from-orange-950/20 dark:via-amber-950/10 dark:to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white py-12 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <img src={logoUrl} alt="Myzymo" className="w-12 h-12" />
            <div>
              <span className="font-heading font-bold text-xl">Myzymo</span>
              <span className="block text-sm text-white/80">Bringing People Together</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge className="bg-white/20 text-white border-white/30">
              <Calculator className="w-3 h-3 mr-1" />
              Try It Free
            </Badge>
          </div>
          
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-3">
            Split Expenses Fairly
          </h1>
          <p className="text-white/90 text-lg max-w-xl">
            No more awkward money conversations! Track group expenses and see who owes whom instantly.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Interactive Demo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members Panel */}
          <Card className="lg:col-span-1" data-testid="card-members">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Group Members
              </CardTitle>
              <CardDescription>Add people to split expenses with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add member name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMember()}
                  data-testid="input-member-name"
                />
                <Button size="icon" onClick={addMember} data-testid="button-add-member">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {members.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    data-testid={`member-${member.id}`}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`${member.color} text-white text-xs`}>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.name}</span>
                    </div>
                    {member.id !== "1" && (
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={() => removeMember(member.id)}
                        data-testid={`button-remove-member-${member.id}`}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expenses Panel */}
          <Card className="lg:col-span-2" data-testid="card-expenses">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IndianRupee className="w-5 h-5 text-primary" />
                    Expenses
                  </CardTitle>
                  <CardDescription>Track what everyone spent</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    {totalExpenses.toLocaleString('en-IN')}
                  </Badge>
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddExpense(!showAddExpense)}
                    data-testid="button-toggle-add-expense"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Expense Form */}
              {showAddExpense && (
                <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="What was the expense for?"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                          data-testid="input-expense-description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="0"
                            className="pl-9"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                            data-testid="input-expense-amount"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Who paid?</Label>
                      <div className="flex flex-wrap gap-2">
                        {members.map((member) => (
                          <Button
                            key={member.id}
                            size="sm"
                            variant={newExpense.paidBy === member.id ? "default" : "outline"}
                            onClick={() => setNewExpense(prev => ({ ...prev, paidBy: member.id }))}
                            data-testid={`button-paid-by-${member.id}`}
                          >
                            {member.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Split among</Label>
                      <div className="flex flex-wrap gap-2">
                        {members.map((member) => (
                          <Button
                            key={member.id}
                            size="sm"
                            variant={newExpense.splitAmong.includes(member.id) ? "default" : "outline"}
                            onClick={() => toggleSplitMember(member.id)}
                            data-testid={`button-split-${member.id}`}
                          >
                            {newExpense.splitAmong.includes(member.id) && <Check className="w-3 h-3 mr-1" />}
                            {member.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowAddExpense(false)}
                        data-testid="button-cancel-expense"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={addExpense}
                        disabled={!newExpense.description || !newExpense.amount || newExpense.splitAmong.length === 0}
                        data-testid="button-save-expense"
                      >
                        Add Expense
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Expense List */}
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {expenses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <IndianRupee className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p>No expenses yet. Add your first expense!</p>
                    </div>
                  ) : (
                    expenses.map((expense) => {
                      const payer = getMember(expense.paidBy);
                      const splitAmount = expense.amount / expense.splitAmong.length;
                      return (
                        <div 
                          key={expense.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                          data-testid={`expense-${expense.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className={`${payer?.color} text-white text-xs`}>
                                {payer?.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{expense.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {payer?.name} paid • Split: ₹{splitAmount.toFixed(0)} each
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">
                              ₹{expense.amount.toLocaleString('en-IN')}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeExpense(expense.id)}
                              data-testid={`button-remove-expense-${expense.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Settlement Summary */}
        <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20" data-testid="card-settlements">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-100">
              <Sparkles className="w-5 h-5" />
              Settlement Summary
            </CardTitle>
            <CardDescription className="text-green-600/80 dark:text-green-200/80">
              Here's who needs to pay whom to settle up
            </CardDescription>
          </CardHeader>
          <CardContent>
            {balances.length === 0 ? (
              <div className="text-center py-6 text-green-600 dark:text-green-200">
                <Check className="w-10 h-10 mx-auto mb-2" />
                <p className="font-medium">All settled up!</p>
                <p className="text-sm opacity-80">No payments needed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {balances.map((balance, index) => {
                  const from = getMember(balance.from);
                  const to = getMember(balance.to);
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-green-900/20"
                      data-testid={`settlement-${index}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`${from?.color} text-white text-xs`}>
                            {from?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{from?.name}</span>
                        <span className="text-xs text-muted-foreground">pays</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={`${to?.color} text-white text-xs`}>
                            {to?.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{to?.name}</span>
                      </div>
                      <Badge className="bg-green-500 text-white text-base px-3">
                        ₹{balance.amount.toLocaleString('en-IN')}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Features for authenticated users */}
            {user && balances.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30"
                    onClick={() => {
                      // Mark all as paid - clear balances
                      setExpenses([]);
                    }}
                    data-testid="button-mark-paid"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Mark as Paid
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30"
                    onClick={() => {
                      // Copy settlement summary for sharing
                      const summary = balances.map(b => {
                        const fromMember = members.find(m => m.id === b.from);
                        const toMember = members.find(m => m.id === b.to);
                        return `${fromMember?.name} pays ${toMember?.name}: ₹${b.amount.toFixed(0)}`;
                      }).join('\n');
                      navigator.clipboard.writeText(summary);
                      alert('Settlement summary copied! Share via WhatsApp or SMS.');
                    }}
                    data-testid="button-send-reminder"
                  >
                    <ArrowRight className="w-3 h-3 mr-1" />
                    Share Summary
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30"
                    onClick={() => {
                      // Export as PDF
                      const doc = new jsPDF();
                      const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
                      const date = new Date().toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                      
                      // Title
                      doc.setFontSize(20);
                      doc.setTextColor(234, 88, 12); // Orange color
                      doc.text('Myzymo Expense Summary', 105, 20, { align: 'center' });
                      
                      // Date
                      doc.setFontSize(10);
                      doc.setTextColor(100, 100, 100);
                      doc.text(`Generated on ${date}`, 105, 28, { align: 'center' });
                      
                      // Members section
                      doc.setFontSize(14);
                      doc.setTextColor(0, 0, 0);
                      doc.text('Group Members', 14, 42);
                      doc.setFontSize(11);
                      doc.setTextColor(60, 60, 60);
                      doc.text(members.map(m => m.name).join(', '), 14, 50);
                      
                      // Expenses table
                      doc.setFontSize(14);
                      doc.setTextColor(0, 0, 0);
                      doc.text('Expenses', 14, 65);
                      
                      const expenseRows = expenses.map(e => [
                        e.description,
                        members.find(m => m.id === e.paidBy)?.name || 'Unknown',
                        `₹${e.amount.toLocaleString('en-IN')}`,
                        e.splitAmong.map(id => members.find(m => m.id === id)?.name).join(', ')
                      ]);
                      
                      autoTable(doc, {
                        startY: 70,
                        head: [['Description', 'Paid By', 'Amount', 'Split Among']],
                        body: expenseRows,
                        theme: 'striped',
                        headStyles: { fillColor: [234, 88, 12] },
                        styles: { fontSize: 10 },
                      });
                      
                      // Settlement section
                      const finalY = (doc as any).lastAutoTable.finalY + 15;
                      doc.setFontSize(14);
                      doc.setTextColor(0, 0, 0);
                      doc.text('Settlement Summary', 14, finalY);
                      
                      const settlementRows = balances.map(b => [
                        members.find(m => m.id === b.from)?.name || 'Unknown',
                        members.find(m => m.id === b.to)?.name || 'Unknown',
                        `₹${b.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                      ]);
                      
                      autoTable(doc, {
                        startY: finalY + 5,
                        head: [['From', 'Pays To', 'Amount']],
                        body: settlementRows.length > 0 ? settlementRows : [['All settled!', '', '']],
                        theme: 'striped',
                        headStyles: { fillColor: [22, 163, 74] }, // Green
                        styles: { fontSize: 10 },
                      });
                      
                      // Total
                      const totalY = (doc as any).lastAutoTable.finalY + 15;
                      doc.setFontSize(12);
                      doc.setTextColor(0, 0, 0);
                      doc.text(`Total Expenses: ₹${totalAmount.toLocaleString('en-IN')}`, 14, totalY);
                      
                      // Footer
                      doc.setFontSize(9);
                      doc.setTextColor(150, 150, 150);
                      doc.text('Generated by Myzymo - Bringing People Together', 105, 285, { align: 'center' });
                      
                      doc.save('myzymo-expense-summary.pdf');
                    }}
                    data-testid="button-export"
                  >
                    <FileDown className="w-3 h-3 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </div>
            )}
            
            {/* Premium features locked for non-authenticated users */}
            {!user && balances.length > 0 && (
              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                <p className="text-xs text-green-600/70 dark:text-green-300/70 mb-3 text-center">Premium features - Sign up to unlock</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="opacity-60 cursor-not-allowed"
                    disabled
                    data-testid="button-locked-mark-paid"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Mark as Paid
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="opacity-60 cursor-not-allowed"
                    disabled
                    data-testid="button-locked-send-reminder"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Send Reminder
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="opacity-60 cursor-not-allowed"
                    disabled
                    data-testid="button-locked-export"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Export Summary
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* CTA Section - Different for logged in vs logged out */}
        {user ? (
          <Card className="border-2 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" data-testid="card-cta">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-heading font-bold text-2xl mb-2 text-green-700 dark:text-green-300">
                    You're All Set!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    This is a demo tool. To save expenses permanently and collaborate with your group, 
                    use the full Group Planning feature.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/dashboard")}
                      data-testid="button-go-to-dashboard"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate("/expenses")}
                      data-testid="button-go-to-expenses"
                    >
                      View Expenses
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5" data-testid="card-cta">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center flex-shrink-0">
                  <PartyPopper className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-heading font-bold text-2xl mb-2">
                    Unlock Full Features
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Sign up to save your expenses, sync across devices, manage multiple events, 
                    track payments, send reminders, and much more!
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/signup")}
                      data-testid="button-signup-cta"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign Up Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => navigate("/login")}
                      data-testid="button-login-cta"
                    >
                      Already have an account? Log in
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Feature highlights */}
              <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, label: "Multiple Events" },
                  { icon: IndianRupee, label: "Payment Tracking" },
                  { icon: Lock, label: "Secure & Private" },
                  { icon: Sparkles, label: "AI Suggestions" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <feature.icon className="w-4 h-4 text-primary" />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
