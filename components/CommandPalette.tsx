import React, { useState, useEffect, useRef } from "react";
import { 
  Search, Rocket, Briefcase, MessageSquare, GraduationCap, 
  LayoutDashboard, Newspaper, User, Terminal, X 
} from "lucide-react";
import { View } from "../App";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: View) => void;
}

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, setView }) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Click outside listener to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const commands: CommandItem[] = [
    {
      id: "home",
      label: "Aller à l'Accueil",
      category: "Navigation",
      icon: <Rocket className="w-4 h-4 text-green-500" />,
      action: () => { setView("home"); onClose(); }
    },
    {
      id: "services",
      label: "Explorer les Prestations & Services",
      category: "Navigation",
      icon: <Briefcase className="w-4 h-4 text-blue-500" />,
      action: () => { setView("services"); onClose(); }
    },
    {
      id: "training",
      label: "Accéder à l'Académie (Formations)",
      category: "Navigation",
      icon: <GraduationCap className="w-4 h-4 text-amber-500" />,
      action: () => { setView("training"); onClose(); }
    },
    {
      id: "community",
      label: "Ouvrir le Forum Communautaire",
      category: "Navigation",
      icon: <MessageSquare className="w-4 h-4 text-blue-400" />,
      action: () => { setView("community"); onClose(); }
    },
    {
      id: "showcase",
      label: "Découvrir la Vitrine de Projets (Showcase)",
      category: "Navigation",
      icon: <LayoutDashboard className="w-4 h-4 text-orange-500" />,
      action: () => { setView("showcase"); onClose(); }
    },
    {
      id: "blog",
      label: "Lire le GABdev Journal (Blog)",
      category: "Navigation",
      icon: <Newspaper className="w-4 h-4 text-purple-500" />,
      action: () => { setView("blog"); onClose(); }
    },
    {
      id: "profile",
      label: "Consulter mon Profil Hacker",
      category: "Navigation",
      icon: <User className="w-4 h-4 text-emerald-500" />,
      action: () => { setView("profile"); onClose(); }
    }
  ];

  // Filter commands
  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        ref={containerRef}
        className="w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-top-4 duration-200"
      >
        {/* Search header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 relative">
          <Search className="w-5 h-5 text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Où voulez-vous aller ? Tapez un mot-clé..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-grow bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none font-medium"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of results */}
        <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                    selectedIndex === idx 
                      ? "bg-white/5 border-l-2 border-green-500 pl-5 text-white" 
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                      {cmd.icon}
                    </span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wide block">{cmd.label}</span>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mt-0.5">{cmd.category}</span>
                    </div>
                  </div>
                  {selectedIndex === idx && (
                    <span className="text-[9px] font-black text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                      Entrée <Terminal className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-600 space-y-2">
              <span className="text-lg block">🔍</span>
              <span className="text-xs font-bold uppercase tracking-wider">Aucun résultat trouvé pour "{search}"</span>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 border-t border-white/5 bg-zinc-900/20 flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
          <div className="flex gap-4">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
          </div>
          <span>[esc] Fermer</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
