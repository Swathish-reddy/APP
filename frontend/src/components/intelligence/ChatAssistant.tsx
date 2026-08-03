"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, Stethoscope } from "lucide-react";
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
const STARTER_QUESTIONS = [
  "Why is my diabetes risk high?",
  "Explain my blood pressure readings.",
  "What diet changes should I make?",
  "Which medications might interact?",
];
interface ChatAssistantProps {
  patientId: string;
  mode?: "patient" | "clinician";
}
export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  patientId,
  mode = "patient",
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        mode === "clinician"
          ? "**CogniVueX Clinical Copilot** — I have full access to this patient's digital twin, risk predictions, and clinical history. What would you like to analyze?"
          : "**CogniVueX Health Assistant** — I'm your AI medical guide. I can explain your reports, risk scores, medications, and health recommendations. What would you like to know?",
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
  }, [messages]);
  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };
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
          body: JSON.stringify({ message: text, mode }),
        },
      );
      const data = await res.json();
      const aiMsg: Message = {
        role: "assistant",
        content:
          data.response || "I could not process that query. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Service temporarily unavailable. Please try again shortly.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br />");
  };
  return (
    <Card className="h-full border-none shadow-none flex flex-col bg-gradient-to-b from-background to-muted/10">
      {" "}
      <CardHeader className="px-4 py-3 border-b">
        {" "}
        <CardTitle className="flex items-center gap-2 text-sm">
          {" "}
          {mode === "clinician" ? (
            <>
              <Stethoscope className="w-4 h-4 text-primary" /> Clinical Copilot
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 text-primary" /> AI Health Assistant
            </>
          )}{" "}
          <span className="ml-auto text-[10px] font-normal text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Online
          </span>{" "}
        </CardTitle>{" "}
      </CardHeader>{" "}
      {}{" "}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {" "}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {" "}
            <div
              className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {" "}
              {msg.role === "assistant" ? (
                <Bot className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}{" "}
            </div>{" "}
            <div
              className={`max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}
            >
              {" "}
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === "assistant" ? "bg-muted rounded-tl-none" : "bg-primary text-primary-foreground rounded-tr-none"}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
              />{" "}
              <span className="text-[10px] text-muted-foreground px-1">
                {msg.timestamp}
              </span>{" "}
            </div>{" "}
          </div>
        ))}{" "}
        {loading && (
          <div className="flex gap-3">
            {" "}
            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              {" "}
              <Bot className="w-4 h-4" />{" "}
            </div>{" "}
            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              {" "}
              <Loader2 className="w-4 h-4 animate-spin text-primary" />{" "}
              <span className="text-sm text-muted-foreground">
                Analyzing patient data...
              </span>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
      {}{" "}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {" "}
          {STARTER_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary rounded-full px-3 py-1 transition-colors"
            >
              {" "}
              {q}{" "}
            </button>
          ))}{" "}
        </div>
      )}{" "}
      {}{" "}
      <div className="p-3 border-t flex gap-2">
        {" "}
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder={
            mode === "clinician"
              ? "Ask about clinical findings..."
              : "Ask about your health..."
          }
          className="flex-1 text-sm"
          disabled={loading}
        />{" "}
        <Button
          size="icon"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          {" "}
          <Send className="w-4 h-4" />{" "}
        </Button>{" "}
      </div>{" "}
    </Card>
  );
};
