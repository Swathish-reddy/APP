"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  X,
  Send,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { BASE_URL } from "../../services/api";

interface Message {
  role: "assistant" | "user";
  content: string;
}
const QUICK_ACTIONS = [
  "Digital Twin",
  "AI Insights",
  "Disease Risk",
  "Doctor Intelligence",
  "Medication Center",
  "Lab Reports",
  "Emergency Center",
  "Analytics",
  "Settings",
  "Dashboard",
];
const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: `Hello 👋\n\nI'm the CogniVueX AI Help Assistant.\n\nI can help you understand every feature of the platform.\n\nExamples:\n• How does Digital Twin work?\n• Explain Disease Risk Center\n• Generate Lab Report\n• Help me use Analytics\n• Where are Medication settings?\n• How do I simulate What-If scenarios?`,
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const createMarkup = (text: string) => {
    let html = text;
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 text-slate-200 p-3 rounded-lg overflow-x-auto my-2 text-xs font-mono">$1</pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[0.9em] font-mono">$1</code>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\g, '<strong class="font-bold">$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\g, '<em class="italic">$1</em>');
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black mt-5 mb-3">$1</h1>');
    // Bullet lists
    html = html.replace(/^\s*-\s(.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>');
    html = html.replace(/^\s*\*\s(.*$)/gim, '<li class="ml-4 list-disc mb-1">$1</li>');
    // Ordered lists
    html = html.replace(/^\s*\d+\.\s(.*$)/gim, '<li class="ml-4 list-decimal mb-1">$1</li>');
    
    // Line breaks (if not inside a pre block)
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
      className="text-sm leading-relaxed max-w-none"
      dangerouslySetInnerHTML={createMarkup(content)} 
    />
  );
};


export function AIHelpAssistant({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    
    // For quick actions, map to a natural language prompt
    let payloadText = text;
    if (text === "Digital Twin") payloadText = "Explain the patient's projected health trajectory using the available CognivueX data.";
    else if (text === "AI Insights") payloadText = "Summarize the most important AI-generated insights from the available patient data.";
    else if (text === "Disease Risk") payloadText = "Explain the patient's current disease-risk predictions and the main factors contributing to them.";
    else if (text === "Doctor Intelligence") payloadText = "Summarize clinically relevant findings and questions that could be discussed with the treating clinician.";
    
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    
    try {
      const patientId = "P001"; // Simulated auth session patient context
      const res = await fetch(`${BASE_URL}/intelligence/patients/${patientId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: payloadText, mode: "patient", history: messages.map(m => ({ role: m.role, content: m.content })) }),
      });
      
      if (!res.ok) throw new Error("Failed to fetch response");
      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "I could not generate a response.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting to the AI service right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };
  
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };
  
  return (
    <AnimatePresence>
      {" "}
      {isOpen && (
        <motion.div
          drag={!isExpanded}
          dragConstraints={{ left: -800, right: 0, top: -800, bottom: 0 }}
          dragElastic={0.1}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed z-50 bottom-4 right-4 sm:bottom-24 sm:right-6 bg-card/90 dark:bg-card/90 backdrop-blur-xl border border-slate-200 dark:border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? "w-[100vw] h-[100vh] sm:w-[80vw] sm:h-[80vh] sm:max-w-4xl sm:bottom-1/2 sm:right-1/2 sm:translate-x-1/2 sm:translate-y-1/2" : "w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-2rem)]"}`}
          style={{
            minWidth: 300,
            minHeight: 400,
          }}
        >
          {" "}
          {}{" "}
          <div className={`flex items-center justify-between p-4 bg-gradient-to-r from-sky-500 to-indigo-500 text-white ${!isExpanded ? 'cursor-move' : ''}`}>
            {" "}
            <div className="flex items-center gap-2 font-bold">
              {" "}
              <Brain className="w-5 h-5" /> CogniVueX Help Assistant{" "}
            </div>{" "}
            <div className="flex items-center gap-1">
              {" "}
              <button
                onClick={clearChat}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Clear Chat"
              >
                {" "}
                <Trash2 className="w-4 h-4" />{" "}
              </button>{" "}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors hidden sm:block"
              >
                {" "}
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}{" "}
              </button>{" "}
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                {" "}
                <X className="w-4 h-4" />{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          {}{" "}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 bg-background/50">
            {" "}
            {messages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                {" "}
                <div
                  className={`p-3 rounded-2xl relative group shadow-sm ${msg.role === "user" ? "bg-indigo-500 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700"}`}
                >
                  {" "}
                  {msg.role === "assistant" ? <MarkdownRenderer content={msg.content} /> : <div className="whitespace-pre-wrap text-sm">{msg.content}</div>}{" "}
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(msg.content, i)}
                      className="absolute -right-8 top-2 p-1.5 bg-slate-200 dark:bg-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {" "}
                      {copiedIndex === i ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-muted-foreground dark:text-muted-foreground" />
                      )}{" "}
                    </button>
                  )}{" "}
                </div>{" "}
              </motion.div>
            ))}{" "}
            {isTyping && (
              <div className="flex gap-1 ml-2 items-center bg-slate-100 dark:bg-slate-800 w-fit p-4 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700">
                {" "}
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />{" "}
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100" style={{ animationDelay: '150ms' }} />{" "}
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200" style={{ animationDelay: '300ms' }} />{" "}
              </div>
            )}{" "}
            <div ref={messagesEndRef} />{" "}
          </div>{" "}
          {}{" "}
          <div className="p-3 border-t border-slate-200 dark:border-border overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 bg-background">
            {" "}
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                disabled={isTyping}
                className="px-3 py-1.5 bg-slate-100 dark:bg-muted text-foreground dark:text-muted-foreground text-xs font-medium rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-border shrink-0 disabled:opacity-50"
              >
                {" "}
                {action}{" "}
              </button>
            ))}{" "}
          </div>{" "}
          {}{" "}
          <div className="p-4 bg-slate-50 dark:bg-card border-t border-slate-200 dark:border-border flex gap-2 items-end">
            {" "}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask the AI Assistant... (Shift+Enter for new line)"
              className="flex-1 bg-card dark:bg-muted border border-slate-300 dark:border-border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none min-h-[44px] max-h-32"
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
              disabled={isTyping}
            />{" "}
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors shrink-0 h-fit"
            >
              {" "}
              <Send className="w-5 h-5" />{" "}
            </button>{" "}
          </div>{" "}
        </motion.div>
      )}{" "}
    </AnimatePresence>
  );
}
