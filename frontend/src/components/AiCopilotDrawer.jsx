import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Sparkles, X, Send, Loader2, Bot, User, Sprout, RotateCcw } from "lucide-react";
import { FormattedAiMessage } from "./FormattedAiMessage.jsx";

const QUICK_PROMPTS = [
  {
    label: "⚠️ Which of my farms are not doing well?",
    text: "Which of my farms are not doing well?",
    style: "bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border-rose-700/60 font-semibold",
  },
  {
    label: "📊 All farms overview",
    text: "Give me a health and satellite telemetry summary of all my registered farms.",
    style: "bg-forest-900/60 hover:bg-forest-800/80 text-emerald-200 border-forest-600/60",
  },
  {
    label: "🌾 Harmattan guide",
    text: "What are the key steps to protect my cocoa farm during the Harmattan dry season?",
    style: "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700",
  },
  {
    label: "🛰️ Explain indices",
    text: "How do I interpret my farm's NDVI, NDRE, and NDMI numbers?",
    style: "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700",
  },
];

export function AiCopilotDrawer() {
  const { user, activeOrg } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");

  const chatEndRef = useRef(null);

  // Check if current route is on a farm detail page (/farms/:id)
  const currentFarmMatch = location.pathname.match(/\/farms\/([a-f0-9]{24})/i);
  const currentUrlFarmId = currentFarmMatch ? currentFarmMatch[1] : null;

  useEffect(() => {
    if (user) {
      api.farms
        .list({
          orgId: activeOrg?._id || undefined,
          limit: 100,
        })
        .then((res) => {
          setFarms(res.farms || []);
        })
        .catch(() => {});
    }
  }, [user, activeOrg]);

  // Sync selected farm with URL if on a farm detail page
  useEffect(() => {
    if (currentUrlFarmId) {
      setSelectedFarmId(currentUrlFarmId);
    }
  }, [currentUrlFarmId]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          content: `Hello ${user?.name ? user.name.split(" ")[0] : "there"}! 👋 I am your **FarmTrack AI Agronomist**, powered by **Google Gemini** and connected directly to Sentinel-2 satellite telemetry.\n\nAsk me anything about your cocoa farms, dry season Harmattan resilience, canopy health (NDVI), chlorophyll stress (NDRE), or soil moisture management (NDMI).`,
        },
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  // Close with the Escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  async function handleSend(customText = null) {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    if (!customText) setInput("");
    setLoading(true);

    try {
      const res = await api.ai.chat({
        messages: newMessages,
        farmId: selectedFarmId || undefined,
        orgId: activeOrg?._id || undefined,
      });

      setMessages((prev) => [
        ...prev,
        { role: "model", content: res.reply || "I couldn't process that query. Please try again." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `⚠️ **AI Service Notice:** ${err.message || "Unable to reach Gemini AI service. Please verify your GEMINI_API key."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuickPrompt(promptText) {
    handleSend(promptText);
  }

  function handleReset() {
    setMessages([
      {
        role: "model",
        content: `Chat history reset. How can I assist you with your satellite monitoring or cocoa management today?`,
      },
    ]);
  }

  const selectedFarm = farms.find((f) => f._id === selectedFarmId);

  // If not logged in, don't show the assistant floating drawer
  if (!user) return null;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open FarmTrack AI Copilot"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-forest-800 via-forest-700 to-emerald-600 text-white font-bold text-sm shadow-xl shadow-forest-950/30 hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-emerald-400/30"
          title="Open FarmTrack AI Copilot"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
          </span>
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span className="hidden sm:inline">FarmTrack AI Mode</span>
          <span className="sm:hidden">Ask AI</span>
        </button>
      )}

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-950/50 sm:bg-slate-950/20 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Panel */}
          <div
            role="dialog"
            aria-label="FarmTrack AI Agronomist"
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-slate-900 text-slate-100 shadow-2xl flex flex-col border-l border-slate-700/80 animate-slide-in-right"
          >
            {/* Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-600 to-emerald-500 flex items-center justify-center text-white shadow-md shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-100" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-sm text-white truncate">FarmTrack AI Agronomist</h3>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider border border-emerald-500/30 shrink-0">
                      Gemini 3.5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Multispectral tree crop intelligence</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close AI Assistant"
                  aria-label="Close AI Assistant"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Active Context Bar */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                <Sprout className="w-3.5 h-3.5 text-forest-400" /> Context farm
              </span>
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                aria-label="Context farm"
                className="bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-forest-500 min-w-0 flex-1 max-w-[240px] truncate"
              >
                <option value="">General Knowledge (All Farms)</option>
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} ({f.cropType || "Cocoa"})
                  </option>
                ))}
              </select>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div key={idx} className={`flex gap-2.5 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        isUser
                          ? "bg-forest-600 text-white"
                          : "bg-emerald-950 border border-emerald-500/40 text-emerald-400"
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    {isUser ? (
                      <div className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 leading-relaxed bg-forest-700 text-white shadow-sm whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    ) : (
                      <div className="max-w-[92%] rounded-2xl rounded-tl-sm p-4 leading-relaxed bg-slate-800/95 text-slate-200 border border-slate-700/80 shadow-md overflow-hidden">
                        <FormattedAiMessage content={m.content} isDark={true} />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-2.5 animate-fade-in">
                  <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-sm px-4 py-3 text-xs text-slate-400 flex items-center gap-2.5">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                    </span>
                    <span>Analyzing satellite telemetry & crop records...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Suggested Quick Prompts (shown when only 1-2 messages) */}
            {messages.length <= 2 && (
              <div className="px-4 py-3 bg-slate-950/60 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Suggested questions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleQuickPrompt(p.text)}
                      className={`px-3 py-1.5 rounded-full text-[11px] border transition text-left ${p.style}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 bg-slate-800/90 border-t border-slate-700 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedFarm
                      ? `Ask about ${selectedFarm.name}...`
                      : "Ask 'which of my farms are not doing well?'"
                  }
                  disabled={loading}
                  aria-label="Message the AI agronomist"
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-forest-500/50 focus:border-forest-500 transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="p-3 rounded-xl bg-forest-600 hover:bg-forest-500 disabled:opacity-40 text-white shadow-sm transition"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}