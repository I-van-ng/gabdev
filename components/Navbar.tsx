import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/firebase";
import {
  User,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Rocket,
  Newspaper,
  BarChart3,
  Moon,
  Sun,
  Search,
  Bell,
  GraduationCap,
  Lock,
  Briefcase,
  Menu,
  X,
} from "lucide-react";
import { View } from "../App";
import NotificationBell from "./NotificationBell";
import { motion, AnimatePresence } from "motion/react";

interface NavbarProps {
  setView: (view: View) => void;
  currentView: View;
}

const Navbar: React.FC<NavbarProps> = (props: NavbarProps) => {
  const { setView, currentView } = props;
  const { user, profile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const whatsappUrl = "https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13";

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("gabdev-theme");
    const shouldUseLightTheme =
      savedTheme === "light" ||
      (!savedTheme &&
        window.matchMedia?.("(prefers-color-scheme: light)").matches);

    setIsLightTheme(shouldUseLightTheme);
    document.documentElement.classList.toggle(
      "light-theme",
      shouldUseLightTheme,
    );
  }, []);

  const toggleTheme = () => {
    setIsLightTheme((previous) => {
      const next = !previous;
      document.documentElement.classList.toggle("light-theme", next);
      window.localStorage.setItem("gabdev-theme", next ? "light" : "dark");
      return next;
    });
  };

  interface NavItem {
    label: string;
    view: View;
    icon: any;
    restricted?: boolean;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { label: "ACCUEIL", view: "home" as View, icon: Rocket },
    { label: "SERVICES", view: "services" as View, icon: Briefcase },
    { label: "COMMUNAUTÉ", view: "community" as View, icon: MessageSquare },
    { label: "FORMATIONS", view: "training" as View, icon: GraduationCap, highlight: true },
    { label: "SHOWCASE", view: "showcase" as View, icon: LayoutDashboard },
    { label: "BLOG", view: "blog" as View, icon: Newspaper },
  ];

  const isMember = profile?.groups?.includes("gabdev-global") ?? false;

  return (
    <>
      <nav
        className="sticky top-0 z-40 w-full px-6 py-4 flex items-center justify-between custom-blur border-b border-white/5"
        aria-label="Menu principal"
      >
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setView("home")}
      >
        <div
          className="w-9 h-9 bg-[#22c55e] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-transform group-hover:scale-110"
          aria-hidden="true"
        >
          <svg
            className="w-6 h-6 text-black"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 9L5 12L8 15"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 9L19 12L16 15"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 18L13 6"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-xl font-black tracking-tight">
          Dev<span className="text-[#22c55e]">GAB</span>
        </span>
      </div>

      <ul className="hidden lg:flex items-center gap-8">
        {navItems.map((item) => (
          <li key={item.label} className="relative group/nav">
            <button
              onClick={() => {
                setView(item.view);
              }}
              className={`text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                currentView === item.view
                  ? "text-[#22c55e]"
                  : item.highlight
                    ? "text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse"
                    : "text-zinc-400 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.restricted && !isMember && (
                <Lock className="w-3 h-3 text-zinc-400/50" />
              )}
            </button>

            {item.restricted && !isMember && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-zinc-900 border border-white/10 rounded-lg text-[8px] font-bold text-zinc-400 invisible group-hover/nav:visible whitespace-nowrap z-50">
                REJOIGNEZ LE HUB POUR DÉBLOQUER
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Global Search Bar */}
      <div className="hidden xl:flex items-center relative flex-1 max-w-xs mx-8 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-green-500 transition-colors" />
        <input
          type="text"
          placeholder="Rechercher sur DevGAB..."
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-12 pr-4 py-2.5 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all font-medium"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        {user && <NotificationBell />}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all group"
          title="Basculer le thème"
        >
          {isLightTheme ? (
            <Moon className="w-4 h-4 text-blue-400 group-hover:-rotate-12 transition-transform" />
          ) : (
            <Sun className="w-4 h-4 text-yellow-500 group-hover:rotate-45 transition-transform" />
          )}
        </button>

        {user ? (
          <div className="relative group">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 p-1.5 pr-4 rounded-full transition-all border border-white/5 shadow-xl shadow-black/20 focus:ring-2 focus:ring-green-500/50 outline-none"
              aria-label="Menu profil de l'utilisateur"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <img
                src={
                  user.photoURL ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
                }
                alt="Profile"
                className="w-8 h-8 rounded-full border border-green-500/30"
                referrerPolicy="no-referrer"
              />
              <span className="text-[11px] font-black text-white uppercase hidden sm:inline">
                {profile?.displayName || user.displayName?.split(" ")[0]}
              </span>
            </button>

            <div 
              role="menu" 
              aria-label="Options du profil"
              className={`absolute right-0 mt-2 w-56 py-3 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl transition-all transform z-50 ${
                isMenuOpen 
                  ? "opacity-100 visible translate-y-0" 
                  : "opacity-0 invisible translate-y-4 lg:group-hover:opacity-100 lg:group-hover:visible lg:group-hover:translate-y-0"
              }`}
            >
              <div className="px-4 py-2 border-b border-white/5 mb-2">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Connecté en tant que
                </p>
                <p className="text-xs font-bold text-green-500 truncate">
                  {user.email}
                </p>
              </div>

              <button
                role="menuitem"
                onClick={() => { setView("profile"); setIsMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-[11px] font-black text-zinc-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors uppercase tracking-widest"
              >
                <User className="w-4 h-4 text-[#22c55e]" />
                Mon Profil
              </button>

              {profile?.role === "admin" && (
                <button
                  role="menuitem"
                  onClick={() => { setView("dashboard"); setIsMenuOpen(false); }}
                  className="w-full px-4 py-2.5 text-left text-[11px] font-black text-zinc-400 hover:text-white hover:bg-white/5 flex items-center gap-3 transition-colors uppercase tracking-widest"
                >
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  Tableau de bord
                </button>
              )}

              <div className="h-px bg-white/5 my-2" />

              <button
                role="menuitem"
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-[11px] font-black text-red-400 hover:text-red-300 hover:bg-red-500/5 flex items-center gap-3 transition-colors uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        ) : (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all uppercase shadow-[0_0_20px_rgba(34,197,94,0.2)] active:scale-95"
          >
            REJOINDRE
          </a>
        )}

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2.5 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all text-zinc-400 hover:text-white lg:hidden focus:ring-2 focus:ring-green-500/50 outline-none"
          aria-label={isMobileMenuOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>
      </div>
    </nav>

    {/* Mobile Menu Overlay */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="lg:hidden w-full bg-zinc-950/98 backdrop-blur-xl border-b border-white/5 overflow-hidden z-30"
        >
          <div className="px-6 py-6 flex flex-col gap-6">
            {/* Search bar inside mobile menu */}
            <div className="flex items-center relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-[#22c55e] transition-colors" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all font-medium"
              />
            </div>

            {/* Navigation Items */}
            <ul className="flex flex-col gap-4">
              {navItems.map((item) => (
                <li key={item.label} className="w-full">
                  <button
                    onClick={() => {
                      setView(item.view);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-3 px-4 rounded-2xl text-xs font-black tracking-widest uppercase transition-all flex items-center justify-between ${
                      currentView === item.view
                        ? "text-black bg-[#22c55e]"
                        : item.highlight
                          ? "text-amber-500 bg-amber-500/5 border border-amber-500/10"
                          : "text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    {item.restricted && !isMember && (
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Profile / Account section on mobile if logged in */}
            {user && (
              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                <div className="flex items-center gap-3 px-4">
                  <img
                    src={
                      user.photoURL ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full border border-green-500/30"
                    referrerPolicy="no-referrer"
                  />
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Connecté</p>
                    <p className="text-xs font-bold text-green-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setView("profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-3 px-4 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white flex items-center justify-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-[#22c55e]" />
                    Mon Profil
                  </button>

                  {profile?.role === "admin" && (
                    <button
                      onClick={() => {
                        setView("dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      className="py-3 px-4 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-white flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
                      Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-3 px-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 flex items-center justify-center gap-2 col-span-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>
);
};

export default Navbar;
