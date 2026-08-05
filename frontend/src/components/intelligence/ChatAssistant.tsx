"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, Loader2, Stethoscope, ChevronRight } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const STARTER_QUESTIONS = [
  "Why is my diabetes risk high?",
  "Explain my blood pressure readings.",
  "Navigate to my Digital Twin.",
  "What is the What-If Simulator?",
  "Open the Analytics dashboard."
];

interface ChatAssistantProps {
  patientId: string;
  mode?: "patient" | "clinician";
}

// A lightweight custom Markdown renderer for the AI Assistant.
const MarkdownRenderer = ({ content }: { content: string }) => {
  const createMarkup = (text: string) => {
    let html = text;
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/50 p-3 rounded-lg overflow-x-auto my-2 border border-white/10 text-xs font-mono text-emerald-200">$1</pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1.5 py-0.5 rounded text-indigo-200 text-[0.9em] font-mono">$1</code>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-emerald-300">$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-white">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-5 mb-2 text-white border-b border-white/10 pb-1">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-6 mb-3 text-white">$1</h1>');
    // Bullet lists
    html = html.replace(/^\s*-\s(.*$)/gim, '<li class="ml-4 list-disc marker:text-emerald-500 mb-1">$1</li>');
    html = html.replace(/^\s*\*\s(.*$)/gim, '<li class="ml-4 list-disc marker:text-emerald-500 mb-1">$1</li>');
    // Ordered lists
    html = html.replace(/^\s*\d+\.\s(.*$)/gim, '<li class="ml-4 list-decimal marker:text-indigo-400 mb-1">$1</li>');
    
    // Line breaks (only apply if not inside a pre block)
    const parts = html.split(/(<pre[\s\S]*?<\/pre>)/g);
    for (let i = 0; i < parts.length; i++) {
        if (!parts[i].startsWith('<pre')) {
            parts[i] = parts[i].replace(/\n/g, "<br />");
        }
    }
    html = parts.join('');

    return { __html: html };
  };

  return (
    <div 
      className="text-sm leading-relaxed prose-sm max-w-none text-slate-200"
      dangerouslySetInnerHTML={createMarkup(content)} 
    />
  );
};


export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  patientId,
  mode = "patient",
}) => {
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        mode === "clinician"
          ? "**CogniVueX Clinical Copilot** — I have full access to this patient's digital twin, risk predictions, and clinical history.\n\nI can explain lab results, summarize reports, or navigate you to any module (e.g. *\"Open the Simulator\"*)."
          : "**CogniVueX Health Assistant** — I'm your AI medical guide.\n\nI can explain your reports, risk scores, medications, and health recommendations, or help you navigate the platform. What would you like to know?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    // Keep history of previous turns (up to 10 for context limits)
    const historyPayload = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/intelligence/patients/${patientId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...((localStorage.getItem("token")
              ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
              : {}) as Record<string, string>),
          },
          body: JSON.stringify({ message: text, mode, history: historyPayload }),
        },
      );
      
      const data = await res.json();
      
      const aiMsg: Message = {
        role: "assistant",
        content: data.response || "I could not process that query. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Handle AI-triggered platform navigation
      if (data.action && data.action.type === "NAVIGATE" && data.action.target) {
        const targetRoute = `/patients/${patientId}${data.action.target.startsWith('/') ? data.action.target : '/' + data.action.target}`;
        
        // Add a system message notifying of the navigation
        setTimeout(() => {
          setMessages((prev) => [
             ...prev, 
             { role: "assistant", content: `*Navigating to ${data.action.target}...*`, timestamp: new Date().toLocaleTimeString() }
          ]);
          router.push(targetRoute.replace('//', '/')); // ensure clean paths
        }, 1500);
      }
      
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "**Error:** Service temporarily unavailable. Please try again shortly.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-full border-none shadow-none flex flex-col bg-slate-950 rounded-none md:rounded-3xl overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full"></div>
      
      <CardHeader className="px-5 py-4 border-b border-white/10 bg-black/20 backdrop-blur-xl z-10">
        <CardTitle className="flex items-center gap-3 text-sm font-bold text-white tracking-wide">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
            {mode === "clinician" ? (
              <Stethoscope className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>
          {mode === "clinician" ? "Clinical Copilot" : "AI Health Assistant"}
          <span className="ml-auto flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(52,211,153,0.1)]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
            Online
          </span>
        </CardTitle>
      </CardHeader>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 z-10 scroll-smooth">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 w-full ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg ${
                msg.role === "assistant" 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
                  : "bg-slate-800 text-slate-300 border border-slate-700"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4 drop-shadow-md" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[85%] flex flex-col gap-1.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-4 py-3 text-sm shadow-xl border ${
                  msg.role === "assistant" 
                    ? "bg-slate-900/80 border-slate-700/50 rounded-2xl rounded-tl-sm backdrop-blur-md" 
                    : "bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-500/30 text-white rounded-2xl rounded-tr-sm"
                }`}
              >
                 {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content} />
                 ) : (
                    <p className="leading-relaxed drop-shadow-sm">{msg.content}</p>
                 )}
              </div>
              <span className="text-[10px] font-bold text-slate-500 px-1 uppercase tracking-wider">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-4 w-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <Bot className="w-4 h-4 drop-shadow-md" />
            </div>
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3 backdrop-blur-md shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-sm font-bold text-slate-300 tracking-wide animate-pulse">
                Thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2 z-10">
          {STARTER_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-[11px] font-bold bg-slate-800/50 hover:bg-indigo-500/20 border border-slate-700/50 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 rounded-full px-3 py-1.5 transition-all shadow-sm flex items-center gap-1 group"
            >
              {q} <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-1" />
            </button>
          ))}
        </div>
      )}

      <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-xl flex gap-3 z-10">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder={
            mode === "clinician"
              ? "Ask Copilot to analyze, explain, or navigate..."
              : "Ask Copilot anything..."
          }
          className="flex-1 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-indigo-500/50 h-11 px-4 rounded-xl shadow-inner"
          disabled={loading}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="h-11 w-11 p-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
        >
          <Send className="w-4 h-4 drop-shadow-md" />
        </Button>
      </div>
    </Card>
  );
};
