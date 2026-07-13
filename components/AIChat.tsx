import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { collection, getDocs } from "firebase/firestore";
import { ChatMessage, Reminder } from "../types";
import { db } from "../services/firebase";
import { sendMessageToGemini } from "../services/geminiService";
import { View } from "../App";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, X, ChevronRight } from "lucide-react";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialContext?: string;
  currentView?: View;
}

interface SearchableResource {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const STORAGE_KEY = "gabdev_reminders";

const viewSuggestions: Record<string, string[]> = {
  home: [
    "Que propose GABdev ?",
    "Comment rejoindre la communauté WhatsApp ?",
    "Qui est le fondateur ?",
  ],
  services: [
    "Quelles sont les prestations de services ?",
    "Demander un devis pour un projet",
    "Quels langages utilisez-vous ?",
  ],
  community: [
    "Comment fonctionne le forum ?",
    "Comment puis-je contribuer ?",
    "Quels sont les sujets chauds ?",
  ],
  showcase: [
    "Quels projets sont en vedette ?",
    "Qui a développé Pizolub ?",
    "Comment soumettre un projet ?",
  ],
  blog: [
    "Quels articles puis-je lire ?",
    "Comment proposer un article ?",
    "Dernières actualités tech au Gabon",
  ],
  profile: [
    "Comment modifier mon profil ?",
    "À quoi servent les badges ?",
    "Comment obtenir le badge Hacker ?",
  ],
  dashboard: [
    "Que contient ma console ?",
    "Comment voir mes rappels ?",
    "Où configurer mes notifications ?",
  ],
};

const AIChat: React.FC<AIChatProps> = (props: AIChatProps) => {
  const { isOpen, onClose, initialContext, currentView = "home" } = props;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Bonjour ! Je suis **MBOLO-IA**, l'assistant intelligent de GABdev. Comment puis-je vous aider aujourd'hui sur vos projets, votre apprentissage ou votre transformation digitale ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialisation reconnaissance vocale
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "fr-FR";

      rec.onstart = () => {
        setIsVoiceActive(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript.trim()) {
          processMessage(transcript.trim());
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsVoiceActive(false);
      };

      rec.onend = () => {
        setIsVoiceActive(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (isOpen && initialContext) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: `Contexte d'apprentissage : ${initialContext}` },
        {
          role: "model",
          text: `Je vois que vous étudiez **${initialContext}**. C'est un excellent sujet ! Avez-vous une question spécifique ou souhaitez-vous que je vous donne une explication simplifiée ?`,
        },
      ]);
    }
  }, [isOpen, initialContext]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      // Arreter le TTS si on ferme le chat
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const updatedReminders = reminders.map((reminder) => {
        if (!reminder.notified && new Date(reminder.dueTime) <= now) {
          const reminderText = `🔔 **RAPPEL IMPORTANT**\n\n${reminder.task}`;
          setMessages((prev) => [
            ...prev,
            {
              role: "model",
              text: reminderText,
            },
          ]);
          speakText(reminderText);
          return { ...reminder, notified: true };
        }
        return reminder;
      });

      if (JSON.stringify(updatedReminders) !== JSON.stringify(reminders)) {
        setReminders(updatedReminders);
      }
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, [reminders, speechEnabled]);

  const speakText = (text: string) => {
    if (!speechEnabled || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();

    // Nettoyer le markdown pour la synthese vocale
    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/#+\s+([^\n]+)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/🔔/g, "Rappel, ")
      .replace(/📅/g, "Calendrier, ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "fr-FR";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const processMessage = async (userMessage: string) => {
    setIsLoading(true);

    try {
      // Arreter le TTS existant
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      const stream = await sendMessageToGemini(userMessage, messages);
      let fullResponse = "";
      let toolCalls: any[] = [];

      setMessages((prev) => [...prev, { role: "model", text: "" }]);

      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "model", text: fullResponse };
            return next;
          });
        }
        if (chunk.functionCalls) {
          toolCalls = [...toolCalls, ...chunk.functionCalls];
        }
      }

      if (fullResponse) {
        speakText(fullResponse);
      }

      if (toolCalls.length > 0) {
        for (const call of toolCalls) {
          if (call.name === "set_reminder") {
            const { task, dueTime } = call.args as {
              task: string;
              dueTime: string;
            };
            let resolvedDueTime = dueTime;

            if (dueTime.toLowerCase().includes("min")) {
              const mins = parseInt(dueTime) || 5;
              resolvedDueTime = new Date(
                Date.now() + mins * 60000,
              ).toISOString();
            } else if (dueTime.toLowerCase().includes("heure")) {
              const hrs = parseInt(dueTime) || 1;
              resolvedDueTime = new Date(
                Date.now() + hrs * 3600000,
              ).toISOString();
            } else if (isNaN(Date.parse(dueTime))) {
              resolvedDueTime = new Date(Date.now() + 300000).toISOString();
            }

            const newReminder: Reminder = {
              id: Math.random().toString(36).substr(2, 9),
              task,
              dueTime: resolvedDueTime,
              createdAt: new Date().toISOString(),
              notified: false,
            };

            setReminders((prev) => [...prev, newReminder]);
            const confirmationText = `📅 **Rappel enregistré**\n\n**Tâche:** ${task}\n**Échéance:** ${new Date(resolvedDueTime).toLocaleString("fr-FR")}`;
            setMessages((prev) => [
              ...prev,
              {
                role: "model",
                text: confirmationText,
              },
            ]);
            speakText(confirmationText);
          } else if (call.name === "list_reminders") {
            const activeReminders = reminders.filter((reminder) => !reminder.notified);
            if (activeReminders.length === 0) {
              const emptyText = "Vous n'avez aucun rappel actif. C'est le moment idéal pour innover !";
              setMessages((prev) => [
                ...prev,
                { role: "model", text: emptyText },
              ]);
              speakText(emptyText);
            } else {
              const listMarkdown = activeReminders
                .map(
                  (reminder) =>
                    `*   **${reminder.task}**\n    ⏰ Prévu le ${new Date(reminder.dueTime).toLocaleString("fr-FR")}`,
                )
                .join("\n");
              setMessages((prev) => [
                ...prev,
                {
                  role: "model",
                  text: `### Vos rappels actifs :\n\n${listMarkdown}`,
                },
              ]);
              speakText("Voici la liste de vos rappels actifs.");
            }
          } else if (call.name === "search_resources") {
            const searchQuery = (call.args as { query: string }).query.toLowerCase();
            const resourceSnapshot = await getDocs(collection(db, "resources"));
            const allResources = resourceSnapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() }) as SearchableResource,
            );
            const results = allResources.filter(
              (resource) =>
                resource.title.toLowerCase().includes(searchQuery) ||
                resource.tags?.some((tag) =>
                  tag.toLowerCase().includes(searchQuery),
                ) ||
                resource.description.toLowerCase().includes(searchQuery),
            );

            if (results.length === 0) {
              const notFoundText = `Je n'ai pas trouvé de ressources spécifiques pour "${searchQuery}". Vous pouvez consulter notre Blog ou explorer le Showcase.`;
              setMessages((prev) => [
                ...prev,
                { role: "model", text: notFoundText },
              ]);
              speakText(notFoundText);
            } else {
              const resultList = results
                .map(
                  (resource) =>
                    `*   [**${resource.title}**](#resources)\n    _${resource.description}_`,
                )
                .join("\n");
              setMessages((prev) => [
                ...prev,
                {
                  role: "model",
                  text: `### 📚 Ressources trouvées pour "${searchQuery}" :\n\n${resultList}\n\nRetrouvez également ces données dans la bibliothèque GABdev.`,
                },
              ]);
              speakText(`J'ai trouvé ${results.length} ressources correspondantes.`);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      const errorText = "Oups ! Une micro-coupure dans le Cloud... Réessayez dans un instant.";
      setMessages((prev) => [
        ...prev,
        { role: "model", text: errorText },
      ]);
      speakText(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    await processMessage(userMessage);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    setMessages((prev) => [...prev, { role: "user", text: suggestion }]);
    await processMessage(suggestion);
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("La reconnaissance vocale n'est pas configurée ou supportée sur votre navigateur.");
      return;
    }

    if (isVoiceActive) {
      recognitionRef.current.stop();
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      recognitionRef.current.start();
    }
  };

  if (!isOpen) return null;

  const suggestions = viewSuggestions[currentView] || viewSuggestions.home;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-end sm:p-6 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Assistant GABdev Chat"
    >
      <div className="w-full sm:w-[500px] h-[100dvh] sm:h-[750px] bg-zinc-900 border-l sm:border border-white/10 sm:rounded-3xl flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 overflow-hidden relative">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl relative z-20">
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] relative"
              aria-hidden="true"
            >
              <svg
                className="w-7 h-7 text-black"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 9h.01" />
                <path d="M16 9h.01" />
                <path d="M12 16a3 3 0 0 1-2.991-2.733 2.992 2.992 0 0 0 5.982 0A3 3 0 0 1 12 16Z" />
              </svg>
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
                </span>
              )}
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight">
                MBOLO-IA
              </h3>
              <p className="text-[10px] text-green-500 font-black tracking-widest uppercase flex items-center gap-1.5">
                <span
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                  aria-hidden="true"
                />
                Assistant officiel GABdev
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (speechEnabled && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              className={`p-2.5 rounded-full transition-all ${
                speechEnabled
                  ? "hover:bg-green-500/10 text-green-500"
                  : "hover:bg-white/5 text-zinc-500"
              }`}
              title={speechEnabled ? "Désactiver l'audio" : "Activer l'audio"}
              aria-label={speechEnabled ? "Désactiver l'audio" : "Activer l'audio"}
            >
              {speechEnabled ? (
                <Volume2 className="w-5 h-5 animate-pulse" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/5 rounded-full transition-all text-zinc-500 hover:text-white"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Historique des messages */}
        <div
          className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-10"
          role="log"
          aria-live="polite"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[88%] p-4 rounded-2xl text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-green-500 text-black font-bold shadow-lg shadow-green-500/10"
                    : "bg-zinc-800/80 text-zinc-100 border border-white/5"
                }`}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && !messages[messages.length - 1]?.text && (
            <div className="flex justify-start">
              <div className="bg-zinc-800/80 p-4 rounded-2xl border border-white/5 flex gap-1.5">
                <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-zinc-600 rounded-full animate-bounce" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Overlay pour la voix active */}
        <AnimatePresence>
          {isVoiceActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-[165px] top-[80px] bg-zinc-950/95 flex flex-col items-center justify-center z-30 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute w-28 h-28 bg-red-500/20 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                    className="absolute w-36 h-36 bg-red-500/10 rounded-full"
                  />
                  <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center z-20 shadow-xl shadow-red-500/30">
                    <Mic className="w-8 h-8" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-white font-black text-lg tracking-tight">MBOLO-IA vous écoute</p>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Parlez maintenant...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulaire et Suggestions */}
        <div className="p-6 border-t border-white/10 bg-zinc-900/50 relative z-20">
          
          {/* Suggestions contextuelles */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 no-scrollbar mask-horizontal">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="whitespace-nowrap px-4 py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-green-500/30 text-xs text-zinc-300 hover:text-white transition-all font-semibold active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-green-500" />
                {suggestion}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-4 rounded-2xl border transition-all active:scale-90 flex items-center justify-center shrink-0 ${
                  isVoiceActive
                    ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                    : "bg-zinc-800 border-white/5 text-zinc-400 hover:text-white hover:border-green-500/30"
                }`}
                aria-label={isVoiceActive ? "Arrêter l'écoute" : "Démarrer la saisie vocale"}
                title={isVoiceActive ? "Arrêter l'écoute" : "Démarrer la saisie vocale"}
              >
                {isVoiceActive ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isVoiceActive ? "Parlez maintenant..." : "Écrivez votre message..."}
                className="flex-grow bg-zinc-800 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-30 text-black p-4 rounded-2xl transition-all active:scale-90 shadow-lg shadow-green-500/10 flex items-center justify-center group shrink-0"
                aria-label="Envoyer le message"
              >
                <svg
                  className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <p className="text-[9px] text-zinc-700 mt-4 text-center font-bold tracking-widest uppercase">
              Assistant intelligent GABdev
            </p>
          </form>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        .prose pre { background: #000 !important; border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.75rem; margin: 1rem 0; overflow-x: auto; }
        .prose code { color: #22c55e; font-weight: bold; background: rgba(34,197,94,0.1); padding: 0.2rem 0.4rem; border-radius: 0.3rem; }
        .prose p { margin-bottom: 0.75rem; }
        .prose ul, .prose ol { margin-left: 1.25rem; margin-bottom: 0.75rem; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default AIChat;
