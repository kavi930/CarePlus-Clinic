"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  X,
  Minimize2,
  Send,
  User,
  Loader2,
  AlertTriangle,
  Calendar,
  Phone,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

interface QuickAction {
  label: string;
  action: string;
  payload?: unknown;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  quickActions?: QuickAction[];
  escalateToHuman?: boolean;
  suggestBooking?: {
    serviceId?: string;
    doctorId?: string;
  };
}

export default function AIChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Namaste! Welcome to Apex Health Clinic (Vaishali, Ghaziabad). I am your clinic virtual receptionist. I can assist you with consultation timings for Dr. Kavita Goswami (MBBS, MD), clinic departments, and help you reserve an appointment slot.",
      timestamp: "Active now",
      quickActions: [
        { label: "📅 Book an Appointment", action: "start_booking" },
        { label: "🕒 Doctor Consulting Hours", action: "view_hours" },
        { label: "🩺 Clinic Services", action: "view_services" },
        { label: "📍 Clinic Address & Directions", action: "view_location" },
        { label: "💬 WhatsApp Us", action: "whatsapp" },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, data.reply]);
      } else {
        throw new Error(data.error || "Failed to reach assistant");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "assistant",
          text: "I am having temporary trouble connecting to the clinic server. For immediate assistance, please call us directly at 8861608612 or WhatsApp 8861608612.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickActions: [
            { label: "📞 Call 8861608612", action: "call" },
            { label: "📅 Book Appointment", action: "start_booking" },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: string) => {
    if (action === "start_booking") {
      router.push("/book");
      setIsOpen(false);
    } else if (action === "view_hours") {
      handleSend("What are the clinic and doctor consulting hours?");
    } else if (action === "view_services") {
      handleSend("What medical services and treatments do you offer?");
    } else if (action === "view_location") {
      handleSend("Where is Apex Health Clinic located?");
    } else if (action === "call") {
      window.location.href = "tel:8861608612";
    } else if (action === "whatsapp") {
      window.open("https://wa.me/918861608612", "_blank");
    } else if (action === "escalate_human") {
      router.push("/contact");
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            setHasUnread(false);
          }}
          className="group flex items-center gap-2.5 px-4.5 py-3 rounded-full bg-blue-900 hover:bg-blue-950 text-white shadow-xl shadow-blue-900/25 hover:shadow-blue-900/40 transition-all hover:scale-105"
          aria-label="Open clinic assistant chat"
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 text-teal-300" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="font-semibold text-sm">Ask Clinic Desk</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`w-[92vw] sm:w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? "h-14" : "h-[540px] max-h-[82vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600/30 border border-teal-400/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">Apex Health Clinic</div>
                <div className="text-[11px] text-teal-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Virtual Desk • Dr. Kavita Goswami
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 transition"
                aria-label="Minimize chat window"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 transition"
                aria-label="Close chat window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Emergency Banner */}
              <div className="bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center gap-1.5 text-[11px] text-amber-800 shrink-0">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Non-emergency assistant. For acute medical emergencies call 112.</span>
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-sm">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-blue-900 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        AH
                      </div>
                    )}
                    <div className="max-w-[82%] space-y-2">
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                          msg.sender === "user"
                            ? "bg-blue-900 text-white rounded-br-xs"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Quick Actions */}
                      {msg.quickActions && msg.quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.quickActions.map((qa, i) => (
                            <button
                              key={i}
                              onClick={() => handleAction(qa.action)}
                              className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-lg transition"
                            >
                              {qa.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Apex Desk is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about Dr. Goswami, timings, booking..."
                    className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="p-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white disabled:opacity-40 transition shadow-xs"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                  <span>Helpline: 8861608612</span>
                  <span>Plot No. 3, Vaishali</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
