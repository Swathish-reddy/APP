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
  content: `Hello 👋\n\nI'm the CogniVueX AI Help Assistant.\n\nI can help you understand every feature of the platform.\n\nExamples:\n• How does Digital Twin work?\n• Explain Disease Risk Center\n• Generate Lab Report\n• Help me use Analytics\n• Where are Medication settings?\n• Explain Hospital Dashboard\n• How do I simulate What-If scenarios?`,
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
  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I am the CogniVueX Help Assistant. You asked about:"${text}".\n\nAs an AI, I can explain platform functionality, guide new users, and suggest workflows. However, I cannot modify user data or perform administrative actions without explicit confirmation.\n\nIs there anything specific in the ${text} module you need help with?`,
        },
      ]);
    }, 1500);
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
          drag
          dragConstraints={{ left: -800, right: 0, top: -800, bottom: 0 }}
          dragElastic={0.1}
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed z-50 bottom-24 right-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${isExpanded ? "w-[80vw] h-[80vh] max-w-4xl" : "w-[400px] h-[600px]"}`}
          style={{
            resize: isExpanded ? "none" : "both",
            minWidth: 300,
            minHeight: 400,
          }}
        >
          {" "}
          {}{" "}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white cursor-move">
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
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
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
                  className={`p-3 rounded-2xl whitespace-pre-wrap text-sm relative group ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 dark:bg-slate-800 text-foreground rounded-bl-sm border border-slate-200 dark:border-slate-700"}`}
                >
                  {" "}
                  {msg.content}{" "}
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
              <div className="flex gap-1 ml-2 items-center bg-slate-100 dark:bg-slate-800 w-fit p-3 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700">
                {" "}
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />{" "}
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />{" "}
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />{" "}
              </div>
            )}{" "}
            <div ref={messagesEndRef} />{" "}
          </div>{" "}
          {}{" "}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
            {" "}
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-foreground dark:text-muted-foreground text-xs font-medium rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shrink-0"
              >
                {" "}
                {action}{" "}
              </button>
            ))}{" "}
          </div>{" "}
          {}{" "}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            {" "}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask the AI Assistant..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />{" "}
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-colors shrink-0"
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
