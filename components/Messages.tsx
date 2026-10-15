import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { sendCommunityMessage, listenToCommunityMessages, signInQuick } from "../services/firebase";
import { Message } from "../types";
import { Send, Users, ShieldAlert, Terminal } from "lucide-react";
import { motion } from "motion/react";
import Loader from "./Loader";

const Messages: React.FC = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [useFallbackMode, setUseFallbackMode] = useState(false);

  const loadLocalMessages = () => {
    const saved = localStorage.getItem("gabdev_chat_fallback");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initialMock = [
        {
          id: "mock-1",
          senderId: "mock-author-1",
          senderName: "Hervé Mba",
          senderPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Herve",
          text: "Bienvenue sur le chat GABdev ! Ce salon est configuré en mode local/résilient.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "mock-2",
          senderId: "mock-author-2",
          senderName: "Aïcha Gabon",
          senderPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aicha",
          text: "Salut tout le monde ! Prêt pour le prochain hackathon ? 🚀",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        }
      ];
      localStorage.setItem("gabdev_chat_fallback", JSON.stringify(initialMock));
      setMessages(initialMock);
    }
    setLoading(false);
  };

  // Listen to community messages in real-time
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (!useFallbackMode) {
      try {
        unsubscribe = listenToCommunityMessages(
          (fetched) => {
            setMessages(fetched);
            setLoading(false);
          },
          (error) => {
            console.warn("Firestore access denied or failed, switching to LocalStorage fallback:", error);
            setUseFallbackMode(true);
            loadLocalMessages();
          }
        );
      } catch (err) {
        console.warn("Firestore subscription failed immediately:", err);
        setUseFallbackMode(true);
        loadLocalMessages();
      }
    } else {
      loadLocalMessages();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [useFallbackMode]);

  // Sync between tabs in LocalStorage mode
  useEffect(() => {
    if (!useFallbackMode) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gabdev_chat_fallback" && e.newValue) {
        setMessages(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [useFallbackMode]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !input.trim()) return;

    const messageText = input.trim();
    setInput("");

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: user.uid,
      senderName: profile.displayName,
      senderPhoto: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      text: messageText,
      createdAt: new Date().toISOString(),
    };

    if (!useFallbackMode) {
      try {
        await sendCommunityMessage(
          user.uid,
          profile.displayName,
          profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          messageText
        );
      } catch (err) {
        console.warn("Failed to write to Firestore, writing to LocalStorage and switching to fallback:", err);
        setUseFallbackMode(true);
        const currentSaved = localStorage.getItem("gabdev_chat_fallback");
        const list = currentSaved ? JSON.parse(currentSaved) : [];
        const newList = [...list, newMsg];
        localStorage.setItem("gabdev_chat_fallback", JSON.stringify(newList));
        setMessages(newList);
      }
    } else {
      const currentSaved = localStorage.getItem("gabdev_chat_fallback");
      const list = currentSaved ? JSON.parse(currentSaved) : [];
      const newList = [...list, newMsg];
      localStorage.setItem("gabdev_chat_fallback", JSON.stringify(newList));
      setMessages(newList);
      window.dispatchEvent(new Event("storage"));
    }
  };

  if (!user || !profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto text-blue-500">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Messagerie Sécurisée</h2>
          <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
            Rejoignez le salon de discussion en un clic pour échanger en direct avec la communauté GABdev.
          </p>
        </div>
        <button
          onClick={async () => {
            const nickname = prompt("Choisissez votre pseudo :");
            if (nickname !== null) await signInQuick(nickname);
          }}
          className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-green-500/10 cursor-pointer"
        >
          Rejoindre le chat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Terminal Chat Container */}
      <div className="bg-zinc-950/80 border border-white/10 rounded-[32px] overflow-hidden flex flex-col h-[75vh] shadow-2xl relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-[32px] blur opacity-10 pointer-events-none" />

        {/* Chat Header */}
        <div className="px-6 py-4 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between z-10 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-[#22c55e]">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Salon GABdev Global
              </h3>
              <p className="text-[9px] text-[#22c55e] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                Live Chat
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>{messages.length} Messages</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar z-10">
          {loading ? (
            <Loader text="Connexion au salon..." />
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-20">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">
                Début de la transmission. Le canal est libre de bruit.
              </p>
              <p className="text-xs text-zinc-500 font-semibold max-w-xs leading-normal">
                Envoyez un premier message pour briser la glace !
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.senderId === user.uid;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <img
                      src={msg.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full border border-white/5 shrink-0"
                    />
                  )}
                  <div className={`max-w-[75%] space-y-1 ${isOwnMessage ? "text-right" : ""}`}>
                    {!isOwnMessage && (
                      <span className="text-[10px] font-bold text-green-400">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isOwnMessage
                          ? "bg-[#22c55e] text-black font-semibold shadow-lg shadow-green-500/5 rounded-tr-none"
                          : "bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-wider">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {isOwnMessage && (
                    <img
                      src={msg.senderPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full border border-white/5 shrink-0"
                    />
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-white/5 bg-zinc-900/30 flex gap-3 z-10"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Entrez votre message de transmission..."
            className="flex-grow bg-zinc-950/40 border border-white/5 rounded-2xl px-5 py-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-green-500/30 transition-all placeholder:text-zinc-700"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-30 text-black p-3.5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-green-500/10 flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Envoyer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Messages;
