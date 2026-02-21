
"use client";

import { useState, useRef, useEffect } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrainCircuit, Send, User, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { advisorChat } from "@/ai/flows/advisor-chat";

export default function AdvisorPage() {
  const { data, metrics, currency } = useFinancialData();
  const { format, rates } = useCurrency();

  const [messages, setMessages] = useState<{ role: "user" | "model", text: string }[]>([
    { role: "model", text: "Hello! I am your AI Wealth Assistant. I have full access to your portfolio. Ask me anything." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
      // 1. CONSTRUCT CONTEXT
      const context = `
            TODAY: ${new Date().toLocaleDateString()}
            CURRENCY: ${currency}

            OVERVIEW:
            - Net Worth: ${format(metrics.netWorth)}
            - Total Assets: ${format(metrics.totalAssets)}
            - Total Debt: ${format(metrics.totalLiabilities)}
            - Monthly Free Cash: ${format(metrics.operatingCashFlow)}

            LIVE EXCHANGE RATES (Respect to USD):
            ${Object.entries(rates || {}).map(([c, r]) => `- ${c}: ${r}`).join('\n')}

            ASSETS:
            - Monthly Salary & Income:
              * Base Salary: ${Number(data.assets?.salary?.amount || 0).toLocaleString()} ${data.assets?.salary?.currency || currency}
            - Real Estate:
            ${(data.assets?.realEstate || []).map(a => `   * ${a.name} (${a.location}): Value ${Number(a.currentValue).toLocaleString()} ${a.currency}. Rent Income: ${a.monthlyRent ? Number(a.monthlyRent).toLocaleString() + ' ' + (a.rentCurrency || a.currency) : 'None'} (${a.rentFrequency})`).join('\n')}
            - Under Development:
            ${(data.assets?.underDevelopment || []).map(a => `   * ${a.name} (${a.location}): Value ${Number(a.currentValue).toLocaleString()} ${a.currency}. Paid: ${Number(a.purchasePrice).toLocaleString()} ${a.currency}`).join('\n')}
            - Liquid & Physical:
            ${(data.assets?.cash || []).map(c => `   * Cash (${c.location}): ${Number(c.amount).toLocaleString()} ${c.currency}`).join('\n')}
            ${(data.assets?.gold || []).map(g => `   * Gold: ${g.grams}g (${g.location})`).join('\n')}
            ${(data.assets?.silver || []).map(s => `   * Silver: ${s.grams}g (${s.location})`).join('\n')}
            - Other Assets:
            ${(data.assets?.otherAssets || []).map(o => `   * ${o.description}: ${Number(o.value).toLocaleString()} ${o.currency}`).join('\n')}
            
            LIABILITIES & EXPENSES:
            - Monthly Household Expenses:
              * Total Monthly Burn: ${format(metrics.expenses?.household || 0)}
              ${(data.monthlyExpenses?.household || []).map((e: any) => `     -> ${e.description}: ${Number(e.amount).toLocaleString()} ${e.currency}`).join('\n')}
            - Bank Loans (Monthly Drain):
              * Total Monthly Drain: ${format(metrics.expenses?.loans || 0)}
            ${(data.liabilities?.loans || []).map(l => `   * ${l.lender}: Owe ${Number(l.remaining).toLocaleString()} / ${Number(l.initial).toLocaleString()} ${l.currency}. Monthly payment: ${Number(l.monthlyPayment).toLocaleString()} ${l.currency}`).join('\n')}
            - Installments (Off-plan etc.):
            ${(data.liabilities?.installments || []).map(i => {
        const next3 = i.schedule?.filter((s: any) => new Date(s.date) >= new Date()).slice(0, 3) || [];
        return `   * ${i.project} (${i.developer}): Owe ${Number(i.total - i.paid).toLocaleString()} ${i.currency}. Next payments: ${next3.map((p: any) => `${p.date}: ${Number(p.amount).toLocaleString()} ${i.currency}`).join(", ")}`;
      }).join('\n')}

            USER QUESTION: "${userMsg}"
            
            INSTRUCTIONS: Answer as a financial advisor. Be concise. Use bold for numbers.
        `;

      // 2. USE GENKIT FLOW
      const result = await advisorChat({ context });

      const reply = result.reply;
      setMessages(prev => [...prev, { role: "model", text: reply }]);

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "model", text: `Connection Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#020817] text-white p-4 md:p-6 pb-20">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 shrink-0">
        <div className="p-2 bg-pink-600/20 rounded-lg"><BrainCircuit className="h-6 w-6 text-pink-500" /></div>
        <div><h1 className="text-xl font-bold">AI Wealth Advisor</h1><p className="text-xs text-muted-foreground">Powered by Genkit &amp; Gemini</p></div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-pink-600'}`}>{msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}</div>
            <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-white/5 border border-white/10'}`}><ReactMarkdown>{msg.text}</ReactMarkdown></div>
          </div>
        ))}
        {isLoading && <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div><div className="p-3 rounded-2xl bg-white/5 text-sm text-muted-foreground">Thinking...</div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="pt-4 shrink-0">
        <div className="relative flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask..." className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:ring-pink-500" />
          <Button onClick={handleSend} disabled={isLoading} className="h-12 w-12 rounded-xl bg-pink-600 hover:bg-pink-700"><Send className="h-5 w-5" /></Button>
        </div>
      </div>
    </div>
  );
}
