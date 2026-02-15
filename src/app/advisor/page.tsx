"use client";

import { useState, useRef, useEffect } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useCurrency } from "@/hooks/use-currency";
import { convert } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BrainCircuit, Send, User, Bot, Loader2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";

export default function AdvisorPage() {
  const { data, metrics, currency, rates } = useFinancialData();
  const { format } = useCurrency();
  
  const [messages, setMessages] = useState<{role: "user" | "model", text: string}[]>([
    { role: "model", text: "Hello! I have analyzed your complete financial portfolio. Ask me about your installments, net worth, or cash flow." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    try {
        // 1. PREPARE THE CONTEXT (The "Brain")
        // We convert your complex data into a readable text summary for the AI
        const context = `
            CURRENT DATE: ${new Date().toLocaleDateString()}
            CURRENCY: ${currency}

            FINANCIAL SNAPSHOT:
            - Net Worth: ${format(metrics.netWorth)}
            - Total Assets: ${format(metrics.totalAssets)}
            - Total Liabilities: ${format(metrics.totalLiabilities)}
            - Monthly Free Cash (Salary only): ${format(metrics.operatingCashFlow)}

            ASSETS:
            ${data.assets.realEstate.map(a => `- ${a.name} (${a.location}): Valued at ${a.currentValue} ${a.currency}. Rent: ${a.monthlyRent} ${a.currency} (${a.rentFrequency})`).join('\n')}
            ${data.assets.underDevelopment.map(a => `- ${a.name} (Off-Plan): Value ${a.currentValue} ${a.currency}. Contract Price: ${a.purchasePrice}.`).join('\n')}
            - Cash: ${data.assets.cash.map(c => `${c.amount} ${c.currency} in ${c.location}`).join(', ')}
            - Gold: ${data.assets.gold.reduce((acc, g) => acc + g.grams, 0)}g
            - Silver: ${data.assets.silver.reduce((acc, s) => acc + s.grams, 0)}g

            LIABILITIES (INSTALLMENTS & LOANS):
            ${data.liabilities.installments.map(i => {
                // Find next payment from schedule
                const nextPay = i.schedule?.find((s:any) => new Date(s.date) >= new Date());
                const endDate = i.schedule && i.schedule.length > 0 ? i.schedule[i.schedule.length - 1].date : "Unknown";
                return `- ${i.project}: Total Due ${i.total - i.paid} ${i.currency}. Next payment: ${nextPay ? `${nextPay.amount} on ${nextPay.date} (${nextPay.description})` : "None"}. Ends on: ${endDate}`;
            }).join('\n')}
            ${data.liabilities.loans.map(l => `- Loan ${l.lender}: ${l.remaining} ${l.currency} remaining. Monthly payment: ${l.monthlyPayment}.`).join('\n')}

            USER QUESTION: "${userMsg}"
            
            INSTRUCTIONS:
            You are a wise, private financial advisor. Answer the user's question based STRICTLY on the data above.
            - Be concise.
            - If asking about dates, calculate the time difference (e.g. "In 3 months").
            - If asking about affordability, compare their "Monthly Free Cash" to the upcoming payments.
            - Use Bold for money amounts.
        `;

        // 2. CALL GEMINI API
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(context);
        const response = result.response.text();

        setMessages(prev => [...prev, { role: "model", text: response }]);

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: "model", text: "I'm having trouble connecting to the brain. Please check your API Key." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#020817] text-white p-4 md:p-6 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10 shrink-0">
        <div className="p-2 bg-pink-600/20 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-pink-500" />
        </div>
        <div>
            <h1 className="text-xl font-bold">AI Wealth Advisor</h1>
            <p className="text-xs text-muted-foreground">Powered by your live data & Gemini</p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4"/> : <Bot className="h-4 w-4"/>}
                </div>
                <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-white/5 border border-white/10'}`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
            </div>
        ))}
        {isLoading && (
            <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center"><Loader2 className="h-4 w-4 animate-spin"/></div>
                <div className="p-3 rounded-2xl bg-white/5 text-sm text-muted-foreground">Analyzing portfolio...</div>
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="pt-4 shrink-0">
        <div className="relative flex gap-2">
            <Input 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about payments, net worth, or advice..." 
                className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:ring-pink-500"
            />
            <Button onClick={handleSend} disabled={isLoading} className="h-12 w-12 rounded-xl bg-pink-600 hover:bg-pink-700">
                <Send className="h-5 w-5" />
            </Button>
        </div>
      </div>

    </div>
  );
}