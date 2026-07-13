
import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CreatorBio from './components/CreatorBio';
import CompletedProjects from './components/CompletedProjects';
import JoinHub from './components/JoinHub';
import Footer from './components/Footer';
import AIChat from './components/AIChat';
import Profile from './components/Profile';
import Community from './components/Community';
import Showcase from './components/Showcase';
import Blog from './components/Blog';
import Dashboard from './components/Dashboard';
import TrainingHub from './components/TrainingHub';
import ViewLayout from './components/ViewLayout';
import Services from './components/Services';
import CommandPalette from './components/CommandPalette';
import { User, MessageSquare, LayoutDashboard, Newspaper, BarChart3, Briefcase, ArrowUp } from 'lucide-react';

export type View = 'home' | 'community' | 'showcase' | 'profile' | 'blog' | 'dashboard' | 'training' | 'services';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialisation à partir du hash de l'URL
  const getInitialView = (): View => {
    const hash = window.location.hash.replace('#/', '');
    const validViews: View[] = ['home', 'community', 'showcase', 'profile', 'blog', 'dashboard', 'training', 'services'];
    return validViews.includes(hash as View) ? (hash as View) : 'home';
  };

  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [chatContext, setChatContext] = useState<string | undefined>(undefined);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Écouter les raccourcis clavier pour la palette de commandes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchroniser le hash de l'URL avec l'état de la vue
  useEffect(() => {
    window.location.hash = `#/${currentView}`;
  }, [currentView]);

  // Écouter les changements du bouton Retour / Suivant du navigateur
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const validViews: View[] = ['home', 'community', 'showcase', 'profile', 'blog', 'dashboard', 'training', 'services'];
      if (validViews.includes(hash as View)) {
        setCurrentView(hash as View);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const openChatWithContext = (context: string) => {
    setChatContext(context);
    setIsChatOpen(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero 
              onStart={() => setIsChatOpen(true)} 
            />
            <CreatorBio onContactClick={() => setCurrentView('services')} />
            <CompletedProjects onContactClick={() => setCurrentView('services')} />
            <JoinHub onGoToServices={() => setCurrentView('services')} />
          </>
        );
      case 'profile':
        return (
          <ViewLayout title="Profil Hacker" subtitle="Gérez vos réglages, badges et contributions communautaires." accentColor="green" icon={<User className="w-6 h-6 text-green-500" />}>
            <Profile />
          </ViewLayout>
        );
      case 'community':
        return (
          <ViewLayout title="Forum Communautaire" subtitle="Débats, entraide et networking entre développeurs gabonais." accentColor="blue" icon={<MessageSquare className="w-6 h-6 text-blue-500" />}>
            <Community />
          </ViewLayout>
        );
      case 'showcase':
        return (
          <ViewLayout title="Projets Showcase" subtitle="Découvrez les meilleures innovations technologiques 'Made in Gabon'." accentColor="orange" icon={<LayoutDashboard className="w-6 h-6 text-orange-500" />}>
            <Showcase />
          </ViewLayout>
        );
      case 'blog':
        return (
          <ViewLayout title="GABdev Journal" subtitle="Articles techniques, news et retours d'expérience." accentColor="purple" icon={<Newspaper className="w-6 h-6 text-purple-500" />}>
            <Blog />
          </ViewLayout>
        );
      case 'dashboard':
        return (
          <ViewLayout title="Console Pilote" subtitle="Le centre de contrôle de votre activité sur le hub." accentColor="green" icon={<BarChart3 className="w-6 h-6 text-green-500" />}>
            <Dashboard />
          </ViewLayout>
        );

      case 'training':
        return <TrainingHub onOpenTutor={openChatWithContext} />;

      case 'services':
        return (
          <ViewLayout 
            title="Prestations & Services" 
            subtitle="Création de vos plateformes web, applications mobiles, infographies et designs sur-mesure." 
            accentColor="blue" 
            icon={<Briefcase className="w-6 h-6 text-blue-500" />}
          >
            <Services />
          </ViewLayout>
        );
      default:
        return <Hero onStart={() => setIsChatOpen(true)} />;
    }
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen flex flex-col relative">
          <Navbar setView={setCurrentView} currentView={currentView} />
          
          <main className="flex-grow">
            {renderView()}
          </main>
  
          <Footer />
  
        {/* Bouton Flottant de Retour en Haut */}
        <button
          onClick={scrollToTop}
          className={`fixed bottom-[92px] right-8 z-40 bg-zinc-900/95 hover:bg-zinc-800 text-white border border-white/10 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group hover:-translate-y-1 ${
            showScrollTop ? "opacity-100 scale-100 visible" : "opacity-0 scale-75 invisible pointer-events-none"
          }`}
          aria-label="Retourner en haut de la page"
        >
          <ArrowUp className="w-6 h-6 group-hover:animate-bounce" />
        </button>

        {/* Bouton Flottant IA */}
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 fab-gradient text-black w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50 group"
            aria-label="Ouvrir l'assistant IA"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" fill="currentColor"/>
              <path d="M8 11H10V13H8V11ZM14 11H16V13H14V11ZM7 15H17V16C17 17.657 15.657 19 14 19H10C8.343 19 7 17.657 7 16V15Z" fill="black"/>
              <path d="M7 12L10 15L7 18" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
  
        <AIChat 
          isOpen={isChatOpen} 
          onClose={() => {
            setIsChatOpen(false);
            setChatContext(undefined);
          }} 
          initialContext={chatContext}
          currentView={currentView}
        />

        <CommandPalette 
          isOpen={isPaletteOpen} 
          onClose={() => setIsPaletteOpen(false)} 
          setView={setCurrentView} 
        />
      </div>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
