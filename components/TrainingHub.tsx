import React, { useState, useEffect } from "react";
import { 
  GraduationCap, Sparkles, Play, Code, RefreshCw, Send, HelpCircle, 
  ChevronRight, BookOpen, Layers, Terminal, AlertCircle, FileCode, CheckCircle,
  Laptop, ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateLearningPath, sendMessageToGemini } from "../services/geminiService";

interface TrainingHubProps {
  onOpenTutor?: (context: string) => void;
}

interface GeneratedModule {
  title: string;
  concepts: string[];
  exercise: string;
  starterCode?: string;
}

interface GeneratedCourse {
  title: string;
  description: string;
  modules: GeneratedModule[];
}

const TEMPLATES = {
  airtel: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0c0a09; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div class="p-8 rounded-3xl border border-white/10 bg-zinc-900/60 max-w-sm text-center shadow-2xl">
    <div class="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-black text-xl shadow-[0_0_20px_rgba(220,38,38,0.4)]">AM</div>
    <h2 class="text-xl font-bold mb-2">Simulateur Airtel Money</h2>
    <p class="text-xs text-zinc-400 mb-6">Testez l'intégration du paiement mobile local au Gabon.</p>
    <button onclick="pay()" class="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all active:scale-95 shadow-lg shadow-red-600/20">Payer 1 500 FCFA</button>
  </div>
  <script>
    function pay() {
      const num = prompt("Entrez votre numéro Airtel Money (ex: 074XXXXXX) :");
      if (num) {
        alert("Demande USSD initiée sur " + num + ". Veuillez valider la transaction sur votre téléphone.");
      }
    }
  </script>
</body>
</html>`,
  regex: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0c0a09; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div class="p-8 rounded-3xl border border-white/10 bg-zinc-900/60 max-w-md w-full shadow-2xl">
    <h2 class="text-xl font-bold mb-6 text-green-500 flex items-center gap-2">🇬🇦 Validateur Numéro Gabon</h2>
    <div class="space-y-4">
      <input id="phone" type="text" placeholder="Entrez un numéro (ex: 077123456)" class="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors">
      <button onclick="validate()" class="w-full py-3.5 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-green-500/10">Vérifier l'opérateur</button>
      <p id="result" class="text-sm font-bold text-center mt-4"></p>
    </div>
  </div>
  <script>
    function validate() {
      const val = document.getElementById('phone').value.trim();
      const result = document.getElementById('result');
      // Regex pour Airtel Gabon (074, 077, 066...) et Moov Gabon (076, 095, 062, 065...)
      const airtelRegex = /^(074|077|066|044|046)\\d{6}$/;
      const moovRegex = /^(076|062|065|095)\\d{6}$/;
      
      if (airtelRegex.test(val)) {
        result.className = "text-sm font-bold text-center mt-4 text-red-500";
        result.innerText = "✓ Numéro Airtel Money valide !";
      } else if (moovRegex.test(val)) {
        result.className = "text-sm font-bold text-center mt-4 text-blue-400";
        result.innerText = "✓ Numéro Moov Money valide !";
      } else {
        result.className = "text-sm font-bold text-center mt-4 text-yellow-500";
        result.innerText = "❌ Numéro invalide ou opérateur inconnu au Gabon.";
      }
    }
  </script>
</body>
</html>`,
  bento: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #050505; color: #fff; font-family: sans-serif; padding: 2rem; }
  </style>
</head>
<body>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-2xl font-black mb-8 text-center uppercase tracking-widest text-zinc-500">Bento Grid Demo</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col justify-between h-48 hover:border-green-500/30 transition-all">
        <h2 class="text-lg font-bold">Projet Principal</h2>
        <p class="text-xs text-zinc-400">Ce bloc s'étend sur deux colonnes sur grand écran.</p>
      </div>
      <div class="p-6 rounded-2xl bg-blue-900/30 border border-blue-500/20 flex flex-col justify-between h-48 hover:border-blue-400/40 transition-all">
        <h2 class="text-lg font-bold text-blue-400">Fintech</h2>
        <p class="text-xs text-zinc-300">Intégration Airtel & Moov.</p>
      </div>
      <div class="p-6 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col justify-between h-48 hover:border-green-500/30 transition-all">
        <h2 class="text-lg font-bold">Badge</h2>
        <p class="text-xs text-zinc-400">Badge GABdev.</p>
      </div>
      <div class="md:col-span-2 p-6 rounded-2xl bg-zinc-900 border border-white/5 flex flex-col justify-between h-48 hover:border-green-500/30 transition-all">
        <h2 class="text-lg font-bold">Statistiques</h2>
        <p class="text-xs text-zinc-400">500+ Membres.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
  empty: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white flex items-center justify-center h-screen">
  <h1 class="text-2xl font-bold">Prêt pour coder dans le Playground GABdev !</h1>
</body>
</html>`
};

// Helper pour le Guide Interactif Frontend
const generateSiteCode = (
  type: "portfolio" | "landing" | "blog" | "dashboard",
  theme: "gabon" | "cyberpunk" | "minimal" | "glass",
  sections: { navbar: boolean; hero: boolean; features: boolean; testimonials: boolean; contact: boolean; footer: boolean }
): string => {
  let bodyBg = "";
  let bodyText = "";
  let accentColor = "";
  let accentHover = "";
  let accentText = "";
  let headerClass = "";
  let cardClass = "";
  let inputClass = "";
  let btnClass = "";
  let gradientClass = "";

  switch (theme) {
    case "gabon":
      bodyBg = "bg-zinc-950";
      bodyText = "text-white";
      accentColor = "bg-green-500";
      accentHover = "hover:bg-green-600";
      accentText = "text-green-500";
      headerClass = "bg-zinc-950/80 border-b border-white/5";
      cardClass = "bg-zinc-900/60 border border-white/10";
      inputClass = "bg-black border-white/10 text-white focus:border-green-500";
      btnClass = "bg-green-500 hover:bg-green-600 text-black";
      gradientClass = "from-green-500 via-yellow-500 to-blue-500";
      break;
    case "cyberpunk":
      bodyBg = "bg-slate-950";
      bodyText = "text-white font-mono";
      accentColor = "bg-cyan-400";
      accentHover = "hover:bg-cyan-500";
      accentText = "text-cyan-400";
      headerClass = "bg-slate-950/80 border-b border-cyan-500/20";
      cardClass = "bg-slate-900/80 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
      inputClass = "bg-slate-950 border-cyan-500/30 text-white focus:border-fuchsia-500";
      btnClass = "bg-cyan-500 hover:bg-cyan-600 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]";
      gradientClass = "from-fuchsia-500 via-purple-600 to-cyan-400";
      break;
    case "minimal":
      bodyBg = "bg-slate-50";
      bodyText = "text-slate-900";
      accentColor = "bg-indigo-600";
      accentHover = "hover:bg-indigo-700";
      accentText = "text-indigo-600";
      headerClass = "bg-white/80 border-b border-slate-200";
      cardClass = "bg-white border border-slate-200 shadow-sm";
      inputClass = "bg-white border-slate-200 text-slate-900 focus:border-indigo-600";
      btnClass = "bg-indigo-600 hover:bg-indigo-700 text-white";
      gradientClass = "from-slate-900 to-slate-700";
      break;
    case "glass":
      bodyBg = "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950";
      bodyText = "text-white";
      accentColor = "bg-pink-500";
      accentHover = "hover:bg-pink-600";
      accentText = "text-pink-400";
      headerClass = "bg-white/5 border-b border-white/10";
      cardClass = "bg-white/5 border border-white/10 shadow-xl backdrop-blur-md";
      inputClass = "bg-white/5 border-white/10 text-white focus:border-pink-500";
      btnClass = "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white";
      gradientClass = "from-pink-500 via-purple-500 to-emerald-400";
      break;
  }

  let brandName = "";
  let heroTitle = "";
  let heroDesc = "";
  let heroCta = "";
  let featuresTitle = "";
  let features = [] as any[];
  let testimonialsTitle = "";
  let testimonials = [] as any[];
  let contactTitle = "";
  let contactDesc = "";

  if (type === "portfolio") {
    brandName = "Alex.dev";
    heroTitle = "Créateur d'expériences numériques d'élite.";
    heroDesc = "Développeur Full-Stack basé à Libreville. Je conçois des applications web et mobiles performantes, esthétiques et adaptées à vos besoins.";
    heroCta = "Voir mes projets";
    featuresTitle = "Mes Compétences Clés";
    features = [
      { t: "Frontend React", d: "Interfaces modernes avec React, Next.js, et Tailwind CSS pour une fluidité absolue." },
      { t: "Backend Node.js", d: "Conception d'APIs sécurisées et robustes avec Express, SQL et NoSQL." },
      { t: "Mobile Flutter", d: "Développement cross-platform natif iOS et Android performant." }
    ];
    testimonialsTitle = "Témoignages Clients";
    testimonials = [
      { name: "Marc Mba", role: "Directeur, FintechGabon", quote: "Alex a développé notre portail de paiement Airtel Money en un temps record. Code propre et rigoureux." },
      { name: "Cynthia Ndong", role: "Fondatrice, E-Shop Gabon", quote: "Notre site e-commerce charge à la vitesse de l'éclair. Les clients adorent le design premium." }
    ];
    contactTitle = "Discutons de votre projet";
    contactDesc = "Besoin d'un développeur freelance ou d'un consultant pour votre startup ? Envoyez-moi un message.";
  } else if (type === "landing") {
    brandName = "SaaS.ga";
    heroTitle = "Propulsez votre entreprise tech au Gabon.";
    heroDesc = "La solution complète pour automatiser votre facturation, suivre vos clients et collecter vos paiements mobiles Airtel et Moov en toute sécurité.";
    heroCta = "Démarrer l'essai gratuit";
    featuresTitle = "Fonctionnalités Clés";
    features = [
      { t: "Paiements Mobiles", d: "Intégration native Airtel Money et Moov Money pour monétiser vos services." },
      { t: "Facturation Auto", d: "Génération automatique de factures PDF conformes aux réglementations locales." },
      { t: "Tableaux de Bord", d: "Visualisez votre chiffre d'affaires et la croissance de vos ventes en temps réel." }
    ];
    testimonialsTitle = "Ce que disent nos utilisateurs";
    testimonials = [
      { name: "Hervé Obame", role: "CEO, TechSolutions", quote: "Depuis que nous utilisons SaaS.ga, nous avons réduit nos retards de paiement de 80% au Gabon." },
      { name: "Grace Biyoghe", role: "Freelance", quote: "Simple, rapide et surtout adapté aux modes de paiement locaux. Je recommande à 100%." }
    ];
    contactTitle = "Demander une démonstration";
    contactDesc = "Curieux de voir comment SaaS.ga peut vous aider à automatiser vos opérations ? Contactez notre équipe.";
  } else if (type === "blog") {
    brandName = "TechGabon";
    heroTitle = "Le média des innovateurs et développeurs gabonais.";
    heroDesc = "Analyses, guides pratiques, actualités de la tech et interviews exclusives des talents de l'écosystème numérique gabonais.";
    heroCta = "Lire les articles";
    featuresTitle = "Derniers Articles";
    features = [
      { t: "L'essor de Flutter en Afrique", d: "Pourquoi le framework de Google est en train de conquérir le marché des applications mobiles." },
      { t: "Comprendre le Cloud Souverain", d: "Quels sont les enjeux de l'hébergement des données locales au Gabon ?" },
      { t: "Introduction au Serverless", d: "Comment déployer des fonctions cloud avec Firebase sans gérer de serveurs." }
    ];
    testimonialsTitle = "Recommandé par l'élite";
    testimonials = [
      { name: "Pierre Ondo", role: "Développeur Senior", quote: "TechGabon est ma source principale de veille technologique locale. Les articles sont très fouillés." },
      { name: "Mireille Alogo", role: "Étudiante en Génie Logiciel", quote: "Les tutoriels m'aident énormément dans mes projets universitaires. Merci pour ce contenu !" }
    ];
    contactTitle = "Rejoindre l'équipe de rédaction";
    contactDesc = "Vous souhaitez partager un tutoriel ou un retour d'expérience ? Écrivez-nous pour soumettre votre projet d'article.";
  } else if (type === "dashboard") {
    brandName = "Console.io";
    heroTitle = "Console Pilote de votre activité";
    heroDesc = "Gérez vos utilisateurs, suivez vos indicateurs de performance clés et contrôlez vos intégrations de paiement depuis un seul écran.";
    heroCta = "Accéder aux paramètres";
    featuresTitle = "Métriques Principales";
    features = [
      { t: "Revenus Mensuels", d: "2 450 000 FCFA (+12.4% ce mois-ci). Intégrations Airtel/Moov actives." },
      { t: "Utilisateurs Actifs", d: "1 240 développeurs connectés. Engagement de 84% sur la plateforme." },
      { t: "Taux de Conversion", d: "3.42% sur le Playground. Objectif mensuel atteint à 105%." }
    ];
    testimonialsTitle = "Alertes Système & Activités";
    testimonials = [
      { name: "Transaction validée", role: "Il y a 5 min", quote: "Achat de crédit API par Airtel Money (+15 000 FCFA)." },
      { name: "Nouveau membre", role: "Il y a 15 min", quote: "L'utilisateur @gabon_coder a rejoint le groupe de discussion global." }
    ];
    contactTitle = "Assistance technique";
    contactDesc = "Un problème avec une clé API ou un paiement mobile ? Contactez le support GABdev immédiatement.";
  }

  let html = `<!DOCTYPE html>
<html lang="fr" class="${theme === 'minimal' ? '' : 'dark'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
  </style>
</head>
<body class="${bodyBg} ${bodyText} min-h-screen transition-colors duration-300">
`;

  if (sections.navbar) {
    html += `  <!-- Barre de navigation -->
  <nav class="fixed top-0 inset-x-0 z-50 ${headerClass} backdrop-blur-md">
    <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <a href="#" class="text-lg font-black tracking-tighter ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}">${brandName}</a>
      <div class="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
        <a href="#hero" class="hover:${accentText} transition-colors">Accueil</a>
        <a href="#features" class="hover:${accentText} transition-colors">Découvrir</a>
        <a href="#testimonials" class="hover:${accentText} transition-colors">Avis</a>
        <a href="#contact" class="hover:${accentText} transition-colors">Contact</a>
      </div>
      <a href="#contact" class="px-4 py-2 rounded-xl ${btnClass} text-xs font-bold transition-all active:scale-95">Me contacter</a>
    </div>
  </nav>
`;
  }

  if (sections.hero) {
    let paddingClass = sections.navbar ? "pt-32 pb-20" : "py-20";
    html += `  <!-- Section Hero -->
  <section id="hero" class="${paddingClass} px-6 max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div class="space-y-6">
        <span class="inline-block px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${theme === 'minimal' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white/5 border-white/10 text-zinc-400'}">
          Nouveauté 2026
        </span>
        <h1 class="text-4xl md:text-5xl font-black tracking-tighter leading-tight ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}">
          ${heroTitle}
        </h1>
        <p class="text-sm leading-relaxed ${theme === 'minimal' ? 'text-slate-600' : 'text-zinc-400'} font-medium">
          ${heroDesc}
        </p>
        <div class="flex gap-4">
          <a href="#features" class="px-6 py-3.5 rounded-xl ${btnClass} text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-black/10">
            ${heroCta}
          </a>
          <a href="#contact" class="px-6 py-3.5 rounded-xl border ${theme === 'minimal' ? 'border-slate-300 hover:bg-slate-100' : 'border-white/10 hover:bg-white/5'} text-xs font-black uppercase tracking-wider transition-all active:scale-95">
            Nous écrire
          </a>
        </div>
      </div>
      <div class="relative flex justify-center">
        <div class="w-full aspect-[4/3] rounded-3xl ${cardClass} flex flex-col justify-between p-8 relative overflow-hidden shadow-2xl">
          <div class="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-tr ${gradientClass} rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div class="flex justify-between items-start">
            <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs ${accentText}">GA</div>
            <div class="px-3 py-1 rounded-full ${theme === 'minimal' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'} text-[9px] font-black uppercase">En Ligne</div>
          </div>
          <div class="space-y-2">
            <div class="h-2 w-20 bg-zinc-700/40 rounded"></div>
            <div class="h-6 w-3/4 bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent font-black text-lg">PROTOTYPE TERMINÉ</div>
            <p class="text-xs text-zinc-500">Intégration HTML/CSS validée à 100% avec Tailwind.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
`;
  }

  if (sections.features) {
    html += `  <!-- Section Découvrir / Features -->
  <section id="features" class="py-20 px-6 max-w-6xl mx-auto space-y-12">
    <div class="text-center max-w-xl mx-auto space-y-4">
      <h2 class="text-3xl font-black tracking-tight ${theme === 'minimal' ? 'text-slate-900' : 'text-white'} uppercase">${featuresTitle}</h2>
      <p class="text-xs ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'} font-medium">Découvrez notre savoir-faire technologique et nos services sur-mesure.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
`;
    features.forEach((f) => {
      html += `      <div class="p-8 rounded-3xl ${cardClass} space-y-4 hover:scale-[1.02] transition-transform duration-300">
        <h3 class="text-lg font-black tracking-tight ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}">${f.t}</h3>
        <p class="text-xs leading-relaxed ${theme === 'minimal' ? 'text-slate-600' : 'text-zinc-400'} font-medium">${f.d}</p>
      </div>
`;
    });
    html += `    </div>
  </section>
`;
  }

  if (sections.testimonials) {
    html += `  <!-- Section Avis / Testimonials -->
  <section id="testimonials" class="py-20 px-6 max-w-6xl mx-auto space-y-12">
    <div class="text-center max-w-xl mx-auto space-y-4">
      <h2 class="text-3xl font-black tracking-tight ${theme === 'minimal' ? 'text-slate-900' : 'text-white'} uppercase">${testimonialsTitle}</h2>
      <p class="text-xs ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'} font-medium">Le retour de nos clients est la plus belle preuve de notre expertise.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
`;
    testimonials.forEach((t) => {
      html += `      <div class="p-8 rounded-3xl ${cardClass} flex flex-col justify-between space-y-6">
        <p class="text-sm leading-relaxed ${theme === 'minimal' ? 'text-slate-700' : 'text-zinc-300'} italic font-medium">
          "${t.quote}"
        </p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-xs uppercase ${accentText}">
            ${t.name.charAt(0)}
          </div>
          <div>
            <h4 class="text-xs font-black ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}">${t.name}</h4>
            <p class="text-[10px] ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'} font-bold uppercase tracking-wider">${t.role}</p>
          </div>
        </div>
      </div>
`;
    });
    html += `    </div>
  </section>
`;
  }

  if (sections.contact) {
    html += `  <!-- Section Contact -->
  <section id="contact" class="py-20 px-6 max-w-md mx-auto">
    <div class="p-8 rounded-[32px] ${cardClass} space-y-6">
      <div class="space-y-2 text-center">
        <h2 class="text-2xl font-black tracking-tight ${theme === 'minimal' ? 'text-slate-900' : 'text-white'} uppercase">${contactTitle}</h2>
        <p class="text-xs ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'} leading-relaxed font-medium">${contactDesc}</p>
      </div>
      <form onsubmit="handleSubmit(event)" class="space-y-4">
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase tracking-wider ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'}">Nom complet</label>
          <input type="text" placeholder="Votre nom" required class="w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${inputClass}">
        </div>
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase tracking-wider ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'}">Adresse email</label>
          <input type="email" placeholder="nom@exemple.com" required class="w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${inputClass}">
        </div>
        <div class="space-y-1">
          <label class="text-[9px] font-black uppercase tracking-wider ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'}">Votre message</label>
          <textarea rows="4" placeholder="Décrivez votre besoin..." required class="w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none ${inputClass}"></textarea>
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl ${btnClass} text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98]">
          Envoyer le message
        </button>
      </form>
    </div>
  </section>
`;
  }

  if (sections.footer) {
    html += `  <!-- Pied de page -->
  <footer class="py-12 border-t ${theme === 'minimal' ? 'border-slate-200' : 'border-white/5'} px-6">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="text-center md:text-left">
        <h3 class="text-sm font-black ${theme === 'minimal' ? 'text-slate-900' : 'text-white'}">${brandName}</h3>
        <p class="text-[10px] ${theme === 'minimal' ? 'text-slate-500' : 'text-zinc-500'} mt-1">Conçu avec passion pour l'écosystème numérique gabonais.</p>
      </div>
      <p class="text-[10px] ${theme === 'minimal' ? 'text-slate-400' : 'text-zinc-600'} font-medium">
        &copy; 2026 ${brandName}. Tous droits réservés.
      </p>
    </div>
  </footer>
`;
  }

  html += `
  <script>
    function handleSubmit(e) {
      e.preventDefault();
      alert("Félicitations ! Votre message a bien été simulé. Le formulaire fonctionne à merveille.");
    }
  </script>
</body>
</html>`;

  return html;
};

const getWizardExplanation = (
  type: "portfolio" | "landing" | "blog" | "dashboard",
  theme: "gabon" | "cyberpunk" | "minimal" | "glass",
  sections: { navbar: boolean; hero: boolean; features: boolean; testimonials: boolean; contact: boolean; footer: boolean }
): string[] => {
  const steps = [];
  steps.push("⚙️ **Architecture HTML5 & Tailwind CDN** : Le document inclut les balises sémantiques `<nav>`, `<section>` et `<footer>` pour l'accessibilité SEO. Les styles reposent sur Tailwind CSS (chargé via CDN) afin de garder le code léger et facile à lire.");
  
  if (sections.navbar) {
    steps.push("🔗 **Barre de Navigation** : Une barre de navigation fixe (`fixed top-0`) avec un effet de flou transparent (`backdrop-blur-md`) pour une expérience moderne.");
  }
  if (sections.hero) {
    steps.push(`🖼️ **Zone Hero** : Une grille à deux colonnes présentant le message de type **${type}** à gauche, et une boîte de visualisation graphique avec dégradés animés à droite.`);
  }
  if (sections.features) {
    steps.push("📦 **Grille de Services/Fonctionnalités** : Grille responsive avec micro-animations au survol (`hover:scale-[1.02]`) pour dynamiser l'interface.");
  }
  if (sections.contact) {
    steps.push("✉️ **Formulaire de Contact** : Formulaire centré avec des états focus colorés. Le bouton réagit au clic via une animation d'échelle (`active:scale-[0.98]`).");
  }
  
  steps.push(`🎨 **Charte Graphique (${theme})** : Palette de couleur cohérente qui s'adapte dynamiquement au thème sélectionné (dégradés, couleurs de boutons et bordures).`);
  
  return steps;
};

const TrainingHub: React.FC<TrainingHubProps> = () => {
  const [activeTab, setActiveTab] = useState<"generator" | "playground" | "wizard">("generator");
  
  // States pour le generateur IA
  const [promptInput, setPromptInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [courseError, setCourseError] = useState<string | null>(null);

  // States pour le playground
  const [code, setCode] = useState(TEMPLATES.airtel);
  const [iframeKey, setIframeKey] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  // States pour le wizard de site
  const [wizardStep, setWizardStep] = useState(1);
  const [siteType, setSiteType] = useState<"portfolio" | "landing" | "blog" | "dashboard">("portfolio");
  const [siteTheme, setSiteTheme] = useState<"gabon" | "cyberpunk" | "minimal" | "glass">("gabon");
  const [selectedSections, setSelectedSections] = useState({
    navbar: true,
    hero: true,
    features: true,
    testimonials: true,
    contact: true,
    footer: true
  });
  const [wizardExplanation, setWizardExplanation] = useState<string[]>([]);

  // Mettre à jour l'iframe preview
  const refreshPreview = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleTemplateChange = (templateName: keyof typeof TEMPLATES) => {
    setCode(TEMPLATES[templateName]);
    refreshPreview();
  };

  const loadVSCodeCourse = () => {
    setGeneratedCourse({
      title: "Maîtriser VS Code : de l'installation à la configuration d'élite",
      description: "Devenez un professionnel de l'éditeur de code le plus populaire du marché. Apprenez à l'installer, le configurer pour le développement web, installer les meilleures extensions et utiliser ses raccourcis clavier de productivité.",
      modules: [
        {
          title: "Module 1 : Installation et Découverte de l'interface",
          concepts: ["Installation multiplateforme", "Explorateur de fichiers", "Terminal intégré", "Barre d'outils"],
          exercise: "Explorez l'interface de VS Code. Ouvrez le terminal intégré avec la combinaison de touches Ctrl + ` et configurez le dossier de travail du projet.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div class="max-w-xl w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-6 shadow-2xl">
    <div class="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20">
      <svg class="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.909 6.27a.5.5 0 0 0-.21-.3l-5.6-3.79a.5.5 0 0 0-.58.04l-5.4 4.54-5.4-4.54a.5.5 0 0 0-.58-.04l-5.6 3.79a.5.5 0 0 0-.21.3v11.46a.5.5 0 0 0 .21.3l5.6 3.79c.17.12.41.1.58-.04l5.4-4.54 5.4 4.54c.17.14.41.16.58.04l5.6-3.79a.5.5 0 0 0 .21-.3V6.27z"/>
      </svg>
    </div>
    <div>
      <h2 class="text-xl font-black uppercase text-blue-400">Interface Interactive VS Code</h2>
      <p class="text-xs text-slate-400 mt-2">Cliquez sur les zones de l'éditeur virtuel ci-dessous pour découvrir leur rôle.</p>
    </div>
    <div class="border border-slate-800 rounded-xl overflow-hidden bg-black/60 text-left font-mono text-[10px]">
      <div class="px-3 py-1.5 bg-slate-950 border-b border-slate-900 flex gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-red-500/50"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-green-500/50"></span>
      </div>
      <div class="flex h-36">
        <div class="w-16 border-r border-slate-900 p-2 space-y-2 bg-slate-950 text-slate-600 text-center">
          <div onclick="alert('Explorateur : gère vos dossiers et fichiers')" class="hover:text-blue-500 cursor-pointer">📁</div>
          <div onclick="alert('Recherche : recherche et remplace du texte')" class="hover:text-blue-500 cursor-pointer">🔍</div>
          <div onclick="alert('Extensions : installe de nouvelles fonctionnalités')" class="hover:text-blue-500 cursor-pointer">🔌</div>
        </div>
        <div class="flex-grow p-4 text-slate-400">
          // Zone d'édition de code<br>
          <span class="text-blue-400">const</span> hello = <span class="text-green-400">"Bienvenue dans VS Code !"</span>;
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
        },
        {
          title: "Module 2 : Configuration d'élite (Settings JSON)",
          concepts: ["Paramètres utilisateur", "editor.formatOnSave", "settings.json", "Thèmes de couleur"],
          exercise: "Ouvrez le fichier de configuration settings.json. Modifiez la valeur de 'editor.formatOnSave' sur true pour automatiser le formatage du code.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0f141c] text-slate-300 p-8 flex flex-col items-center justify-center min-h-screen">
  <div class="max-w-md w-full bg-[#151b27] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
    <h2 class="text-base font-black text-blue-400 uppercase tracking-wide">Éditeur settings.json Virtuel</h2>
    <p class="text-xs text-slate-500">Mettez à jour les valeurs dans le fichier de configuration JSON ci-dessous :</p>
    <div class="bg-black/50 p-4 rounded-xl font-mono text-[11px] text-green-500">
      {<br>
      &nbsp;&nbsp;"editor.fontSize": <input id="fsize" type="number" value="14" class="w-12 bg-zinc-900 border border-white/10 px-1 rounded text-white text-center">,<br>
      &nbsp;&nbsp;"editor.formatOnSave": <select id="fos" class="bg-zinc-900 border border-white/10 px-1 rounded text-white"><option value="false">false</option><option value="true">true</option></select>,<br>
      &nbsp;&nbsp;"workbench.colorTheme": "Nuit Gabon"<br>
      }
    </div>
    <button onclick="apply()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Appliquer les Paramètres</button>
  </div>
  <script>
    function apply() {
      const fsize = document.getElementById('fsize').value;
      const fos = document.getElementById('fos').value;
      alert("Paramètres appliqués !\\nTaille de police : " + fsize + "px\\nFormatage à la sauvegarde : " + fos);
    }
  </script>
</body>
</html>`
        },
        {
          title: "Module 3 : Les Extensions indispensables pour le Web",
          concepts: ["Prettier Code Formatter", "Live Server", "Tailwind CSS IntelliSense", "Auto Rename Tag"],
          exercise: "Installez et configurez l'extension Prettier pour assurer la mise en forme automatique et harmonieuse de vos fichiers de code HTML, CSS et JavaScript.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-md w-full bg-zinc-900 border border-white/10 p-6 rounded-2xl space-y-4">
    <h1 class="text-lg font-black uppercase text-green-500">Marketplace d'Extensions</h1>
    <div class="space-y-3">
      <div class="p-3 bg-black/40 rounded-xl flex items-center justify-between border border-white/5">
        <div>
          <h3 class="text-xs font-bold text-white uppercase">Prettier</h3>
          <p class="text-[10px] text-zinc-500">Formateur de code automatique.</p>
        </div>
        <button onclick="alert('Prettier installé !')" class="px-3 py-1 bg-green-500 hover:bg-green-600 text-black text-[10px] font-bold rounded-lg uppercase tracking-wide">Installer</button>
      </div>
      <div class="p-3 bg-black/40 rounded-xl flex items-center justify-between border border-white/5">
        <div>
          <h3 class="text-xs font-bold text-white uppercase">Live Server</h3>
          <p class="text-[10px] text-zinc-500">Lance un serveur local en un clic.</p>
        </div>
        <button onclick="alert('Live Server installé !')" class="px-3 py-1 bg-green-500 hover:bg-green-600 text-black text-[10px] font-bold rounded-lg uppercase tracking-wide">Installer</button>
      </div>
    </div>
  </div>
</body>
</html>`
        },
        {
          title: "Module 4 : Raccourcis Clavier et Productivité",
          concepts: ["Palette de commandes", "Multi-curseurs", "Duplication de ligne", "Recherche globale"],
          exercise: "Utilisez le raccourci Alt + Shift + Down (ou Option + Shift + Down) pour dupliquer des lignes rapidement dans votre éditeur.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-md w-full bg-zinc-900 border border-white/10 p-6 rounded-2xl text-center space-y-4">
    <h1 class="text-lg font-black uppercase tracking-wider text-amber-500">Défi Clavier VS Code</h1>
    <p class="text-xs text-zinc-400">Quel raccourci permet d'ouvrir la palette de commandes ?</p>
    <div class="grid grid-cols-2 gap-3 pt-2">
      <button onclick="check(false)" class="p-3 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded-xl text-zinc-300">Ctrl + Shift + P</button>
      <button onclick="check(true)" class="p-3 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded-xl text-zinc-300">Ctrl + P</button>
      <button onclick="check(false)" class="p-3 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded-xl text-zinc-300">Ctrl + F</button>
      <button onclick="check(false)" class="p-3 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded-xl text-zinc-300">Ctrl + \`</button>
    </div>
  </div>
  <script>
    function check(isP) {
      if (isP) {
        alert("Correct ! Ctrl + P (ou Cmd + P) ouvre la recherche de fichier rapide. Ctrl + Shift + P ouvre la palette de commandes entière.");
      } else {
        alert("Faux, essayez encore !");
      }
    }
  </script>
</body>
</html>`
        }
      ]
    });
  };

  const loadFEAugmentCourse = () => {
    setGeneratedCourse({
      title: "Devenir Développeur Front-End Augmenté en 2026",
      description: "Apprenez à transformer l'IA en un copilote de développement tout en consolidant des bases techniques solides en HTML5 sémantique, CSS3 moderne et JavaScript ES6+.",
      modules: [
        {
          title: "La fondation (Ne pas déléguer la compréhension)",
          concepts: ["HTML5 Sémantique", "CSS3 Flexbox & Grid", "JavaScript ES6+", "ChatGPT/Claude Prompting"],
          exercise: "Rédigez une page HTML sémantique structurant un CV en ligne avec CSS Flexbox. Demandez à l'IA d'expliquer la différence entre map() et forEach() en JavaScript.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 2rem; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-xl w-full bg-zinc-900/50 border border-white/5 rounded-3xl p-8 shadow-xl">
    <h1 class="text-3xl font-black text-green-500 mb-2 uppercase">Mon CV de Développeur</h1>
    <p class="text-xs text-zinc-400 mb-6">Projet de base pour pratiquer le HTML sémantique et CSS Flexbox.</p>
    
    <div class="space-y-4">
      <div class="p-4 rounded-xl bg-black/40 border border-white/5">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Compétences</h2>
        <div class="flex flex-wrap gap-2">
          <span class="text-[10px] font-bold px-2.5 py-1 bg-zinc-800 rounded-lg">HTML5</span>
          <span class="text-[10px] font-bold px-2.5 py-1 bg-zinc-800 rounded-lg">CSS3</span>
          <span class="text-[10px] font-bold px-2.5 py-1 bg-zinc-800 rounded-lg">JavaScript</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
        },
        {
          title: "Le passage au \"Développement Augmenté\"",
          concepts: ["GitHub Copilot / Cursor", "Pair programming IA", "Débogage assisté", "Tests unitaires (Vitest)"],
          exercise: "Ouvrez le Playground, écrivez une fonction de tri simple, puis demandez à MBOLO-IA de l'optimiser et de générer 3 cas de tests unitaires.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-md w-full bg-zinc-900 border border-white/10 p-6 rounded-2xl text-center space-y-4">
    <h1 class="text-lg font-black uppercase tracking-wider text-blue-400">Algorithme de Tri</h1>
    <p class="text-xs text-zinc-400">Pratiquez le pair programming avec MBOLO-IA pour optimiser ce code.</p>
    <div class="bg-black/50 p-4 rounded-xl text-left font-mono text-[11px] text-green-500">
      function trierTableau(arr) {<br>
      &nbsp;&nbsp;// À implémenter et optimiser avec l'IA<br>
      &nbsp;&nbsp;return arr;<br>
      }
    </div>
  </div>
</body>
</html>`
        },
        {
          title: "Spécialisation moderne (Roadmap 2026)",
          concepts: ["TypeScript", "React / Next.js", "Tailwind CSS", "API Mocking (JSON Server)"],
          exercise: "Créez l'interface d'un dashboard avec Tailwind CSS en simulant les appels API avec des données mockées générées par l'IA.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-8 min-h-screen">
  <div class="max-w-6xl mx-auto space-y-6">
    <h1 class="text-2xl font-black uppercase text-purple-400 tracking-wider">Console Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 class="text-xs font-bold text-slate-400 uppercase">Utilisateurs Actifs</h2>
        <p class="text-3xl font-black text-white mt-2">1,245</p>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 class="text-xs font-bold text-slate-400 uppercase">Transactions</h2>
        <p class="text-3xl font-black text-white mt-2">89,200 FCFA</p>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 class="text-xs font-bold text-slate-400 uppercase">Taux de Conversion</h2>
        <p class="text-3xl font-black text-white mt-2">12.4%</p>
      </div>
    </div>
  </div>
</body>
</html>`
        },
        {
          title: "Compétences humaines (Soft Skills)",
          concepts: ["Revue de code critique", "Architecture de composants", "Design d'expérience (UX)", "Soft Skills"],
          exercise: "Analysez une proposition de code générée par l'IA. Identifiez 2 failles d'optimisation ou de sécurité potentielles et corrigez-les.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-md w-full bg-zinc-900 border border-red-500/20 p-6 rounded-2xl text-center space-y-4">
    <h1 class="text-lg font-black uppercase tracking-wider text-red-500">Revue de Code de Sécurité</h1>
    <p class="text-xs text-zinc-400">MBOLO-IA a généré ce formulaire de saisie, mais il comporte une vulnérabilité XSS. Corrigez-la.</p>
    <input type="text" id="userInput" class="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs" placeholder="Entrez du texte...">
    <button onclick="displayInput()" class="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Afficher</button>
    <div id="output" class="p-4 bg-black/40 rounded-xl text-xs text-left min-h-12 border border-white/5"></div>
  </div>
  <script>
    function displayInput() {
      const input = document.getElementById('userInput').value;
      document.getElementById('output').innerHTML = input;
    }
  </script>
</body>
</html>`
        }
      ]
    });
  };

  const loadAntigravityCourse = () => {
    setGeneratedCourse({
      title: "Maîtriser Antigravity : L'Art du Vibe Coding de A à Z",
      description: "Apprenez à collaborer avec l'agent d'IA le plus puissant de Google DeepMind. Maîtrisez le Vibe Coding, formulez des requêtes d'élite, pilotez l'exploration de code en mode autonome et validez les plans d'exécution complexes.",
      modules: [
        {
          title: "Module 1 : L'Art du Vibe Coding & Rôle de Chef d'Orchestre",
          concepts: ["Vibe Coding", "Agent Autonome", "Prompting d'Intention", "Google DeepMind"],
          exercise: "Simulez une interaction de démarrage : demandez à Antigravity de planifier une nouvelle fonctionnalité de tableau de bord sans écrire de code directement, en évaluant sa capacité à comprendre le design global.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div class="p-8 rounded-3xl border border-white/10 bg-zinc-900/60 max-w-md text-center shadow-2xl space-y-6">
    <div class="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto border border-white/10 shadow-lg relative overflow-hidden group">
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 blur-md" />
      <svg class="w-12 h-12 relative z-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="anti-logo-m1" x1="0%" y1="100%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="20%" stopColor="#06b6d4" />
            <stop offset="40%" stopColor="#10b981" />
            <stop offset="60%" stopColor="#fbbf24" />
            <stop offset="80%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>
        </defs>
        <path d="M15,80 C15,45 30,15 50,15 C70,15 85,45 85,80 C85,80 72,80 72,80 C72,52 62,30 50,30 C38,30 28,52 28,80 Z" fill="url(#anti-logo-m1)" />
      </svg>
    </div>
    <h2 class="text-xl font-bold uppercase tracking-tight">Antigravity Terminal M1</h2>
    <p class="text-xs text-zinc-400">Consigne : Tapez votre requête de planification ci-dessous pour lancer l'agent de Vibe Coding.</p>
    <div class="space-y-3 text-left">
      <textarea id="prompt" placeholder="Ex: Planifie l'ajout d'une section météo dans le dashboard..." class="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 min-h-20 transition-all font-medium"></textarea>
      <button onclick="startVibe()" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20">Lancer l'Agent</button>
    </div>
    <div id="output" class="p-4 bg-black/40 rounded-xl text-[11px] font-mono text-green-500 text-left min-h-12 border border-white/5 hidden"></div>
  </div>
  <script>
    function startVibe() {
      const p = document.getElementById('prompt').value.trim();
      const out = document.getElementById('output');
      if (p) {
        out.classList.remove('hidden');
        out.innerHTML = "🪐 Antigravity en cours de planification...<br>[INFO] Analyse du projet en cours...<br>[INFO] Création du plan dans implementation_plan.md...<br>[SUCCÈS] Prêt pour exécution.";
      }
    }
  </script>
</body>
</html>`
        },
        {
          title: "Module 2 : La Recherche Autonome & Exploration",
          concepts: ["Analyse de Codebase", "Recherche Grep", "Lecture de Fichier", "Détection d'Architecture"],
          exercise: "Simulez une recherche technique : demandez à Antigravity de localiser un composant UI existant dans le projet et d'analyser ses propriétés sans intervention manuelle.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div class="p-8 rounded-3xl border border-white/10 bg-zinc-900/60 max-w-md w-full shadow-2xl space-y-6">
    <h2 class="text-lg font-bold text-center uppercase tracking-tight text-cyan-400">Grep Search Simulator</h2>
    <p class="text-xs text-zinc-400 text-center">Trouvez où sont déclarées les variables ou les fonctions de notre site.</p>
    <div class="space-y-4">
      <input id="query" type="text" placeholder="Entrez le terme à chercher (ex: onGoToServices)" class="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors text-xs font-semibold">
      <button onclick="search()" class="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-black rounded-xl transition-all shadow-lg shadow-cyan-500/10 text-xs uppercase tracking-widest">Rechercher dans le projet</button>
      <div id="results" class="p-4 bg-black/40 rounded-xl text-[10px] font-mono text-zinc-300 text-left min-h-16 border border-white/5 hidden overflow-x-auto"></div>
    </div>
  </div>
  <script>
    function search() {
      const q = document.getElementById('query').value.trim();
      const res = document.getElementById('results');
      res.classList.remove('hidden');
      if (q.toLowerCase().includes('ongotoservices')) {
        res.innerHTML = "🔍 Match trouvé dans components/JoinHub.tsx (Ligne 18)<br><span class='text-zinc-600'>18: const JoinHub: React.FC&lt;JoinHubProps&gt; = ({ onGoToServices }) =&gt; {</span>";
      } else {
        res.innerHTML = "🔍 Recherche de '" + q + "'... Aucun match exact trouvé dans le cache du composant.";
      }
    }
  </script>
</body>
</html>`
        },
        {
          title: "Module 3 : Édition de Code Sécurisée & Remplacements",
          concepts: ["replace_file_content", "multi_replace_file_content", "Diff Blocks", "Préservation des Docstrings"],
          exercise: "Configurez une demande de modification de code en ciblant précisément les lignes d'un bloc sans altérer le reste du fichier.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div class="p-8 rounded-3xl border border-white/10 bg-zinc-900/60 max-w-lg w-full shadow-2xl space-y-6">
    <h2 class="text-lg font-bold text-center uppercase tracking-tight text-pink-500">Simulateur de Code Diff</h2>
    <p class="text-xs text-zinc-400 text-center">Visualisez comment Antigravity applique des modifications ciblées.</p>
    <div class="grid grid-cols-2 gap-4 text-left font-mono text-[10px]">
      <div class="p-4 bg-red-900/20 border border-red-500/20 rounded-xl space-y-1">
        <div class="text-red-500 font-bold uppercase mb-2">Avant modification</div>
        <div>const add = (a, b) => {</div>
        <div class="bg-red-500/20 text-red-300">-  return a + b;</div>
        <div>}</div>
      </div>
      <div class="p-4 bg-green-900/20 border border-green-500/20 rounded-xl space-y-1">
        <div class="text-green-500 font-bold uppercase mb-2">Après modification</div>
        <div>const add = (a, b) => {</div>
        <div class="bg-green-500/20 text-green-300">+  if (typeof a !== 'number') return 0;</div>
        <div class="bg-green-500/20 text-green-300">+  return a + b;</div>
        <div>}</div>
      </div>
    </div>
    <div class="text-center">
      <button onclick="applyDiff()" class="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/20 text-xs uppercase tracking-widest active:scale-95">Appliquer la Modification</button>
      <p id="msg" class="text-xs text-green-400 mt-3 font-semibold hidden">✓ Remplacement appliqué avec succès sans toucher aux autres fonctions !</p>
    </div>
  </div>
  <script>
    function applyDiff() {
      document.getElementById('msg').classList.remove('hidden');
    }
  </script>
</body>
</html>`
        },
        {
          title: "Module 4 : Validation, Exécution & Clôture de Tâche",
          concepts: ["task.md", "walkthrough.md", "run_command", "Vérification Non-Régressive"],
          exercise: "Validez la conformité du code produit : exécutez un script de test, examinez son statut, puis générez le fichier walkthrough.md récapitulant les modifications.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  </style>
</head>
<body>
  <div class="p-8 rounded-3xl border border-white/10 bg-zinc-900/60 max-w-md w-full shadow-2xl text-center space-y-6">
    <h2 class="text-lg font-bold uppercase tracking-tight text-green-500">Console de Validation de Tâches</h2>
    <p class="text-xs text-zinc-400">Exécutez vos tests pour valider le code d'Antigravity.</p>
    
    <div class="p-4 bg-black/60 rounded-xl text-left space-y-2 border border-white/5">
      <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>✓ task.md initialisé</span>
        <span class="text-green-500">[OK]</span>
      </div>
      <div class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>✓ Modifications appliquées</span>
        <span class="text-green-500">[OK]</span>
      </div>
      <div id="test-row" class="flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>⚙ Exécution de 'npm test'</span>
        <span id="test-status" class="text-yellow-500">[EN COURS...]</span>
      </div>
    </div>
    
    <button onclick="runTest()" class="w-full py-3 bg-green-500 hover:bg-green-600 text-black font-black rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-green-500/10">Lancer les Tests</button>
  </div>
  <script>
    function runTest() {
      const status = document.getElementById('test-status');
      status.className = "text-green-500";
      status.innerHTML = "[SUCCÈS (4/4 PASSÉS)]";
      alert("Félicitations ! Les tests unitaires sont passés au vert. Vous pouvez générer le walkthrough.md.");
    }
  </script>
</body>
</html>`
        }
      ]
    });
  };

  const loadWebBasicsCourse = () => {
    setGeneratedCourse({
      title: "HTML, CSS & JavaScript : Le Guide Complet de A à Z",
      description: "Le point de départ idéal pour tout aspirant développeur web. Apprenez à concevoir des pages sémantiques, à les habiller avec un design moderne et responsive, et à injecter de l'interactivité dynamique.",
      modules: [
        {
          title: "Module 1 : HTML5 et la structure sémantique",
          concepts: ["Balises de base", "Hiérarchie des titres", "HTML5 Sémantique", "Liens et Images"],
          exercise: "Créez une structure sémantique pour un article de blog comprenant un en-tête <header> (avec titre h1), une zone de contenu <main> (avec paragraphes) et un pied de page <footer>.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-300 p-8 flex flex-col items-center justify-center min-h-screen">
  <div class="max-w-xl w-full bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-xl space-y-6">
    <h2 class="text-xs font-black uppercase text-green-500 tracking-wider">Exercice 1 : Structure Sémantique</h2>
    <p class="text-xs text-zinc-400">Complétez le code ci-dessous en utilisant les balises HTML5 adéquates.</p>
    
    <header class="border-b border-white/5 pb-4">
      <h1 class="text-2xl font-black text-white">Titre de mon Blog</h1>
    </header>
    
    <main class="py-4">
      <p class="text-xs leading-relaxed">Ceci est le premier paragraphe de mon article de blog. Il décrit les bases du développement frontend.</p>
    </main>
    
    <footer class="border-t border-white/5 pt-4 text-center text-[10px] text-zinc-500">
      &copy; 2026 GABdev Academy. Tous droits réservés.
    </footer>
  </div>
</body>
</html>`
        },
        {
          title: "Module 2 : CSS3 et la mise en page moderne (Flexbox)",
          concepts: ["Modèle de boîte", "Alignement Flexbox", "Flex direction", "Gap & Padding"],
          exercise: "Alignez horizontalement les cartes d'information avec un espacement régulier grâce à Flexbox (display: flex).",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-white p-8 min-h-screen flex items-center justify-center">
  <div class="max-w-4xl w-full text-center space-y-8">
    <h1 class="text-xl font-black uppercase tracking-wider text-blue-400">Mise en Page Responsive</h1>
    
    <div class="flex flex-col md:flex-row gap-4 justify-center">
      <div class="p-6 bg-zinc-900 border border-white/5 rounded-2xl w-full md:w-64">
        <h3 class="font-bold mb-2">Carte A</h3>
        <p class="text-xs text-zinc-400">Premier bloc de contenu aligné.</p>
      </div>
      <div class="p-6 bg-zinc-900 border border-white/5 rounded-2xl w-full md:w-64">
        <h3 class="font-bold mb-2">Carte B</h3>
        <p class="text-xs text-zinc-400">Deuxième bloc de contenu aligné.</p>
      </div>
      <div class="p-6 bg-zinc-900 border border-white/5 rounded-2xl w-full md:w-64">
        <h3 class="font-bold mb-2">Carte C</h3>
        <p class="text-xs text-zinc-400">Troisième bloc de contenu aligné.</p>
      </div>
    </div>
  </div>
</body>
</html>`
        },
        {
          title: "Module 3 : JavaScript et la manipulation du DOM",
          concepts: ["querySelector", "classList", "Gestionnaires d'événements", "classList.toggle"],
          exercise: "Modifiez le code de la fonction toggleActive pour alterner la couleur de fond et le texte d'un composant lors d'un clic.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-white flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-md w-full bg-zinc-900 border border-white/10 p-6 rounded-2xl text-center space-y-4">
    <h1 class="text-lg font-black uppercase text-amber-500">Interaction avec le DOM</h1>
    <div id="targetBox" class="p-8 rounded-xl bg-zinc-800 border border-white/5 transition-all text-sm font-bold">
      État initial
    </div>
    <button onclick="toggleActive()" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Activer / Désactiver</button>
  </div>
  <script>
    function toggleActive() {
      const box = document.getElementById('targetBox');
      if (box.classList.contains('bg-zinc-800')) {
        box.className = "p-8 rounded-xl bg-green-500 text-black border border-green-400 transition-all text-sm font-black uppercase";
        box.innerText = "État Actif !";
      } else {
        box.className = "p-8 rounded-xl bg-zinc-800 border border-white/5 transition-all text-sm font-bold text-white";
        box.innerText = "État initial";
      }
    }
  </script>
</body>
</html>`
        },
        {
          title: "Module 4 : Projet final : Une application interactive simple",
          concepts: ["Logique applicative", "Gestion d'état", "Incrémentation", "Mise à jour d'interface"],
          exercise: "Écrivez les fonctions JavaScript d'incrémentation et de décrémentation pour faire fonctionner le compteur.",
          starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-white flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-xs w-full bg-zinc-900 border border-white/10 p-8 rounded-3xl text-center space-y-6 shadow-2xl">
    <h1 class="text-xs font-black uppercase tracking-widest text-zinc-500">Compteur Interactif</h1>
    <div id="counterValue" class="text-6xl font-black text-white">0</div>
    <div class="flex gap-4">
      <button onclick="changeValue(-1)" class="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 font-black text-xl rounded-xl transition-all">-</button>
      <button onclick="changeValue(1)" class="flex-1 py-3 bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 font-black text-xl rounded-xl transition-all">+</button>
    </div>
  </div>
  <script>
    let value = 0;
    function changeValue(delta) {
      value += delta;
      document.getElementById('counterValue').innerText = value;
    }
  </script>
</body>
</html>`
        }
      ]
    });
  };

  // Generer le parcours
  const handleGenerateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;

    setIsGenerating(true);
    setCourseError(null);
    setGeneratedCourse(null);

    try {
      const result = await generateLearningPath(promptInput);
      if (result && result.title && result.modules) {
        setGeneratedCourse(result);
      } else {
        throw new Error("Format de réponse de l'IA invalide. Veuillez réessayer.");
      }
    } catch (err: any) {
      console.error(err);
      setCourseError(err.message || "Impossible de générer le parcours d'apprentissage actuellement. Vérifiez votre clé API.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Envoyer au Playground depuis un module genere
  const sendToPlayground = (module: GeneratedModule) => {
    setCode(module.starterCode || `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white p-8">
  <h1 class="text-xl font-bold mb-4">${module.title}</h1>
  <p class="text-sm text-zinc-400 mb-6">${module.exercise}</p>
  <!-- Écrivez votre solution ici -->
</body>
</html>`);
    setActiveTab("playground");
    refreshPreview();
  };

  // Demander de l'aide à MBOLO-IA sur le code
  const askMboloIAOnCode = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiTip(null);

    try {
      const responseStream = await sendMessageToGemini(
        `Regarde ce code HTML/CSS/JS et donne-moi un conseil rapide de développeur, signale d'éventuelles erreurs ou propose une idée d'amélioration pour le Gabon : \n\n\`\`\`html\n${code}\n\`\`\``,
        []
      );
      
      let fullResponse = "";
      for await (const chunk of responseStream) {
        if (chunk.text) {
          fullResponse += chunk.text;
          setAiTip(fullResponse);
        }
      }
    } catch (err) {
      console.error(err);
      setAiTip("Oups, impossible de contacter l'assistant MBOLO-IA. Vérifiez votre connexion.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      {/* En-tête */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
              <GraduationCap className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">
              LABORATOIRE TECHNOLOGIQUE GABON
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            Académie & Playground
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-xl font-medium">
            Générez des plans d'étude personnalisés avec notre IA puis testez instantanément votre code dans le bac à sable interactif.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap bg-zinc-900 border border-white/5 p-1.5 rounded-2xl gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
              activeTab === "generator"
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Générateur IA
          </button>
          <button
            onClick={() => setActiveTab("wizard")}
            className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
              activeTab === "wizard"
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Guide Interactif
          </button>
          <button
            onClick={() => setActiveTab("playground")}
            className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
              activeTab === "playground"
                ? "bg-green-500 text-black shadow-lg shadow-green-500/10"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code className="w-4 h-4" />
            Code Playground
          </button>
        </div>
      </header>

      {/* Rendu des onglets */}
      <main className="min-h-[600px]">
        {activeTab === "generator" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Formulaire de gauche */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-8 rounded-[32px] border border-white/10 bg-zinc-900/40 backdrop-blur-md space-y-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                  <BookOpen className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Que voulez-vous créer ?</h2>
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  Entrez n'importe quel sujet de développement (ex: *Intégrer Airtel Money en HTML*, *Créer un menu Bento Grid*, *Apprendre CSS Flexbox*). Notre IA rédigera un plan de formation sur-mesure pour vous.
                </p>

                {/* Suggestions de parcours */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Parcours suggérés :</span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => loadAntigravityCourse()}
                      className="p-3.5 rounded-2xl bg-black/40 border border-blue-500/30 hover:border-green-500/30 text-left transition-all flex items-center justify-between group cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.05)]"
                    >
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">🪐 Antigravity & Vibe Coding</span>
                        <span className="text-[9px] text-[#3b82f6] font-semibold block mt-0.5">Maîtrisez le Vibe Coding de A à Z avec l'IA de DeepMind</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-green-500 transition-colors shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => loadWebBasicsCourse()}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-green-500/30 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">🌐 HTML, CSS & JS de A à Z</span>
                        <span className="text-[9px] text-zinc-500 font-medium block mt-0.5">Les bases fondamentales du développement web</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-green-500 transition-colors shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => loadVSCodeCourse()}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-green-500/30 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">🛠️ VS Code de A à Z</span>
                        <span className="text-[9px] text-zinc-500 font-medium block mt-0.5">Installation, configuration d'élite, extensions</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-green-500 transition-colors shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => loadFEAugmentCourse()}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-green-500/30 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <span className="text-[10px] font-black text-white uppercase tracking-wider block">🚀 Front-End Augmenté 2026</span>
                        <span className="text-[9px] text-zinc-500 font-medium block mt-0.5">Apprenez à coder efficacement avec l'IA comme copilote</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-green-500 transition-colors shrink-0" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleGenerateCourse} className="space-y-4 pt-2">
                  <textarea
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Saisissez votre sujet d'étude ou l'application que vous rêvez de construire..."
                    rows={4}
                    className="w-full bg-black border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-all resize-none font-medium"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !promptInput.trim()}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-40 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-green-500/10"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Génération en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Générer mon parcours
                      </>
                    )}
                  </button>
                </form>
 
                {courseError && (
                  <div className="flex gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold items-start animate-in fade-in duration-300">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{courseError}</span>
                  </div>
                )}
              </div>
            </div>
 
            {/* Affichage du cours à droite */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                {generatedCourse ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {generatedCourse.title.toLowerCase().includes("antigravity") ? (
                      <div className="relative w-full p-8 rounded-[32px] overflow-hidden bg-gradient-to-r from-blue-950 via-zinc-950 to-slate-950 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 blur-xl pointer-events-none" />
                        <div className="relative z-10 flex-1 flex flex-col justify-center text-center sm:text-left">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 mb-4">
                            Formation Officielle
                          </span>
                          <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none mb-3">
                            {generatedCourse.title}
                          </h2>
                          <p className="text-sm text-zinc-400 leading-relaxed font-medium">{generatedCourse.description}</p>
                          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-3">Conçu par Google DeepMind</p>
                        </div>
                        <div className="relative z-10 w-24 h-24 flex items-center justify-center bg-zinc-900/60 rounded-3xl border border-white/10 shadow-2xl shrink-0">
                          <svg className="w-16 h-16 animate-pulse" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                              <linearGradient id="antigravity-logo-grad" x1="0%" y1="100%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#2563eb" />
                                <stop offset="20%" stopColor="#06b6d4" />
                                <stop offset="40%" stopColor="#10b981" />
                                <stop offset="60%" stopColor="#fbbf24" />
                                <stop offset="80%" stopColor="#ea580c" />
                                <stop offset="100%" stopColor="#db2777" />
                              </linearGradient>
                            </defs>
                            <path 
                              d="M15,80 C15,45 30,15 50,15 C70,15 85,45 85,80 C85,80 72,80 72,80 C72,52 62,30 50,30 C38,30 28,52 28,80 Z" 
                              fill="url(#antigravity-logo-grad)" 
                            />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 rounded-[32px] border border-white/5 bg-zinc-900/10">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                          Parcours personnalisé généré
                        </span>
                        <h2 className="text-3xl font-black text-white mt-4 mb-2 uppercase tracking-tight">{generatedCourse.title}</h2>
                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">{generatedCourse.description}</p>
                      </div>
                    )}
 
                    <div className="space-y-4">
                      {generatedCourse.modules.map((mod, index) => (
                        <div key={index} className="p-6 rounded-[28px] border border-white/10 bg-zinc-900/40 space-y-4">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[10px] font-black text-green-500 tracking-widest uppercase">Étape {index + 1}</span>
                              <h3 className="text-lg font-black text-white mt-1 uppercase tracking-tight">{mod.title}</h3>
                            </div>
                            <button
                              onClick={() => sendToPlayground(mod)}
                              className="px-4 py-2 rounded-xl bg-green-500 text-black hover:bg-green-600 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 shrink-0 active:scale-95 shadow-md shadow-green-500/5"
                            >
                              <Play className="w-3 h-3 fill-current" /> Coder
                            </button>
                          </div>
 
                          <div className="flex flex-wrap gap-1.5">
                            {mod.concepts.map((concept, i) => (
                              <span key={i} className="text-[10px] font-bold px-3 py-1 bg-black/40 rounded-lg text-zinc-400 border border-white/5">
                                {concept}
                              </span>
                            ))}
                          </div>
 
                          <p className="text-xs text-zinc-300 bg-black/30 border border-white/5 p-4 rounded-xl leading-relaxed font-medium">
                            <span className="font-bold text-zinc-400 block mb-1">🎯 Exercice :</span>
                            {mod.exercise}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {/* Empty State Invitation */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center p-6 text-center text-zinc-500 bg-zinc-900/10"
                    >
                      <BookOpen className="w-10 h-10 mb-3 text-zinc-700" />
                      <p className="font-black uppercase tracking-wider text-[10px] text-zinc-400">Générer un parcours sur-mesure</p>
                      <p className="text-[11px] text-zinc-500 max-w-xs mt-1 font-medium">
                        Saisissez le sujet de votre choix dans le formulaire de gauche pour générer un parcours personnalisé.
                      </p>
                    </motion.div>

                    {/* Featured Roadmap */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 rounded-[32px] border border-green-500/20 bg-zinc-900/40 backdrop-blur-md space-y-6 relative overflow-hidden group"
                    >
                      {/* Gradient glow effect */}
                      <div className="absolute -right-24 -top-24 w-48 h-48 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/15 transition-all duration-700" />
                      
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                          À LA UNE • ROADMAP 2026
                        </span>
                      </div>

                      <div className="text-left">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                          Devenir Développeur Front-End Augmenté
                        </h3>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-medium">
                          L'IA ne remplace pas l'apprentissage des fondamentaux, elle l'accélère. Ce parcours d'élite vous forme à utiliser l'IA comme copilote de développement tout en consolidant des bases techniques solides.
                        </p>
                      </div>

                      <div className="space-y-3 pt-2 text-left">
                        {[
                          { step: "1", title: "La fondation", desc: "HTML5 sémantique, CSS3 (Flexbox/Grid), JavaScript ES6+ sans déléguer à l'IA." },
                          { step: "2", title: "Développement Augmenté", desc: "Intégration de Cursor/GitHub Copilot, pair programming, débogage et tests unitaires." },
                          { step: "3", title: "Spécialisation moderne", desc: "Maîtrise de TypeScript, React/Next.js, Tailwind CSS et Mocking d'API." },
                          { step: "4", title: "Compétences humaines (Soft Skills)", desc: "Revue de code critique, architecture logicielle globale et UX design." }
                        ].map((m) => (
                          <div key={m.step} className="flex gap-4 items-start text-left text-xs">
                            <span className="w-5 h-5 rounded-lg bg-zinc-800 text-zinc-400 font-black flex items-center justify-center shrink-0 text-[10px]">
                              {m.step}
                            </span>
                            <div>
                              <strong className="text-zinc-200 block font-bold uppercase tracking-wide text-[10px]">{m.title}</strong>
                              <span className="text-zinc-500 text-[11px] font-medium leading-relaxed block mt-0.5">{m.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setGeneratedCourse({
                            title: "Devenir Développeur Front-End Augmenté en 2026",
                            description: "Apprenez à transformer l'IA en un copilote de développement tout en consolidant des bases techniques solides en HTML5 sémantique, CSS3 moderne et JavaScript ES6+.",
                            modules: [
                              {
                                title: "La fondation (Ne pas déléguer la compréhension)",
                                concepts: ["HTML5 Sémantique", "CSS3 Flexbox & Grid", "JavaScript ES6+", "ChatGPT/Claude Prompting"],
                                exercise: "Rédigez une page HTML sémantique structurant un CV en ligne avec CSS Flexbox. Demandez à l'IA d'expliquer la différence entre map() et forEach() en JavaScript.",
                                starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #09090b; color: #f4f4f5; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; min-height: 100vh; padding: 2rem; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-xl w-full bg-zinc-900/50 border border-white/5 rounded-3xl p-8 shadow-xl">
    <h1 class="text-3xl font-black text-green-500 mb-2 uppercase">Mon CV de Développeur</h1>
    <p class="text-xs text-zinc-400 mb-6">Projet de base pour pratiquer le HTML sémantique et CSS Flexbox.</p>
    
    <div class="space-y-4">
      <div class="p-4 rounded-xl bg-black/40 border border-white/5">
        <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-2">Compétences</h2>
        <div class="flex flex-wrap gap-2">
          <span class="text-[10px] font-bold px-2.5 py-1 bg-zinc-800 rounded-lg">HTML5</span>
          <span class="text-[10px] font-bold px-2.5 py-1 bg-zinc-800 rounded-lg">CSS3</span>
          <span class="text-[10px] font-bold px-2.5 py-1 bg-zinc-800 rounded-lg">JavaScript</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
                              },
                              {
                                title: "Le passage au \"Développement Augmenté\"",
                                concepts: ["GitHub Copilot / Cursor", "Pair programming IA", "Débogage assisté", "Tests unitaires (Vitest)"],
                                exercise: "Ouvrez le Playground, écrivez une fonction de tri simple, puis demandez à MBOLO-IA de l'optimiser et de générer 3 cas de tests unitaires.",
                                starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-md w-full bg-zinc-900 border border-white/10 p-6 rounded-2xl text-center space-y-4">
    <h1 class="text-lg font-black uppercase tracking-wider text-blue-400">Algorithme de Tri</h1>
    <p class="text-xs text-zinc-400">Pratiquez le pair programming avec MBOLO-IA pour optimiser ce code.</p>
    <div class="bg-black/50 p-4 rounded-xl text-left font-mono text-[11px] text-green-500">
      function trierTableau(arr) {<br>
      &nbsp;&nbsp;// À implémenter et optimiser avec l'IA<br>
      &nbsp;&nbsp;return arr;<br>
      }
    </div>
  </div>
</body>
</html>`
                              },
                              {
                                title: "Spécialisation moderne (Roadmap 2026)",
                                concepts: ["TypeScript", "React / Next.js", "Tailwind CSS", "API Mocking (JSON Server)"],
                                exercise: "Créez l'interface d'un dashboard avec Tailwind CSS en simulant les appels API avec des données mockées générées par l'IA.",
                                starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 p-8 min-h-screen">
  <div class="max-w-6xl mx-auto space-y-6">
    <h1 class="text-2xl font-black uppercase text-purple-400 tracking-wider">Console Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 class="text-xs font-bold text-slate-400 uppercase">Utilisateurs Actifs</h2>
        <p class="text-3xl font-black text-white mt-2">1,245</p>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 class="text-xs font-bold text-slate-400 uppercase">Transactions</h2>
        <p class="text-3xl font-black text-white mt-2">89,200 FCFA</p>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <h2 class="text-xs font-bold text-slate-400 uppercase">Taux de Conversion</h2>
        <p class="text-3xl font-black text-white mt-2">12.4%</p>
      </div>
    </div>
  </div>
</body>
</html>`
                              },
                              {
                                title: "Compétences humaines (Soft Skills)",
                                concepts: ["Revue de code critique", "Architecture de composants", "Design d'expérience (UX)", "Soft Skills"],
                                exercise: "Analysez une proposition de code générée par l'IA. Identifiez 2 failles d'optimisation ou de sécurité potentielles et corrigez-les.",
                                starterCode: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center min-h-screen p-8">
  <div class="max-w-md w-full bg-zinc-900 border border-red-500/20 p-6 rounded-2xl text-center space-y-4">
    <h1 class="text-lg font-black uppercase tracking-wider text-red-500">Revue de Code de Sécurité</h1>
    <p class="text-xs text-zinc-400">MBOLO-IA a généré ce formulaire de saisie, mais il comporte une vulnérabilité XSS. Corrigez-la.</p>
    <input type="text" id="userInput" class="w-full bg-black border border-white/10 rounded-xl px-4 py-2 text-xs" placeholder="Entrez du texte...">
    <button onclick="displayInput()" class="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all">Afficher</button>
    <div id="output" class="p-4 bg-black/40 rounded-xl text-xs text-left min-h-12 border border-white/5"></div>
  </div>
  <script>
    function displayInput() {
      const input = document.getElementById('userInput').value;
      document.getElementById('output').innerHTML = input;
    }
  </script>
</body>
</html>`
                              }
                            ]
                          });
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-green-500/10 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" /> Commencer ce parcours
                      </button>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : activeTab === "wizard" ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            {/* Progression */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-black text-sm w-9 h-9 flex items-center justify-center">
                  {wizardStep}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    {wizardStep === 1 && "Type de site web"}
                    {wizardStep === 2 && "Style & Thème visuel"}
                    {wizardStep === 3 && "Structure de la page"}
                    {wizardStep === 4 && "Guide & Code généré"}
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                    Étape {wizardStep} sur 4
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `${(wizardStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* ÉTAPE 1 : Type de site */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight font-black">Choisissez le type de site</h3>
                  <p className="text-xs text-zinc-400 font-medium">Sélectionnez le cas d'usage pour adapter automatiquement le contenu du site.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "portfolio", title: "Portfolio Personnel", desc: "Présentez vos compétences, projets et contact (idéal pour freelances).", icon: <Laptop className="w-5 h-5 text-green-500" /> },
                    { id: "landing", title: "Landing Page Produit", desc: "Présentez un produit, un service ou une startup avec appel à l'action.", icon: <Sparkles className="w-5 h-5 text-blue-500" /> },
                    { id: "blog", title: "Blog Technique", desc: "Partagez vos tutoriels et actualités technologiques avec vos lecteurs.", icon: <BookOpen className="w-5 h-5 text-amber-500" /> },
                    { id: "dashboard", title: "Console de Gestion", desc: "Tableau de bord d'administration avec indicateurs et alertes.", icon: <Layers className="w-5 h-5 text-purple-500" /> }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSiteType(t.id as any);
                        setWizardStep(2);
                      }}
                      className={`p-6 rounded-[28px] border text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-44 ${
                        siteType === t.id
                          ? "bg-green-500/10 border-green-500 text-white shadow-lg shadow-green-500/5"
                          : "bg-zinc-900/40 border-white/10 hover:border-white/20 text-zinc-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center">
                        {t.icon}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base tracking-tight uppercase">{t.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : Thème visuel */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Sélectionnez le thème visuel</h3>
                  <p className="text-xs text-zinc-400 font-medium">La charte graphique et la palette de couleur du site.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "gabon", title: "Nuit Gabon", desc: "Palette sombre avec accents Vert/Jaune/Bleu (couleurs nationales).", colors: ["#22c55e", "#fbbf24", "#3b82f6"] },
                    { id: "cyberpunk", title: "Néon Cyberpunk", desc: "Thème futuriste sombre avec accents Fuchsia et Cyan néon.", colors: ["#d946ef", "#06b6d4", "#a855f7"] },
                    { id: "minimal", title: "Minimaliste Moderne", desc: "Thème clair, épuré et spacieux avec des accents Indigo fins.", colors: ["#6366f1", "#0f172a", "#f8fafc"] },
                    { id: "glass", title: "Glassmorphic Premium", desc: "Flou de verre et dégradés profonds de rose et émeraude.", colors: ["#ec4899", "#10b981", "#8b5cf6"] }
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setSiteTheme(theme.id as any);
                        setWizardStep(3);
                      }}
                      className={`p-6 rounded-[28px] border text-left transition-all hover:scale-[1.01] flex flex-col justify-between h-44 ${
                        siteTheme === theme.id
                          ? "bg-green-500/10 border-green-500 text-white shadow-lg shadow-green-500/5"
                          : "bg-zinc-900/40 border-white/10 hover:border-white/20 text-zinc-300"
                      }`}
                    >
                      <div className="flex gap-2">
                        {theme.colors.map((c, idx) => (
                          <span key={idx} className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-base tracking-tight uppercase">{theme.title}</h4>
                        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">{theme.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-6 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Précédent
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : Choix de structure */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Structurez votre page</h3>
                  <p className="text-xs text-zinc-400 font-medium">Sélectionnez les sections à générer dans le code final.</p>
                </div>

                <div className="p-8 rounded-[32px] border border-white/10 bg-zinc-900/40 space-y-4">
                  {[
                    { key: "navbar", label: "Barre de Navigation (Header)", desc: "Menu fixe avec logo de marque et liens rapides." },
                    { key: "hero", label: "Section d'Accueil (Hero)", desc: "Message d'accroche principal, boutons d'action et visuel." },
                    { key: "features", label: "Grille de Services / Fonctionnalités", desc: "Mise en avant des compétences ou caractéristiques du produit." },
                    { key: "testimonials", label: "Zone d'Avis / Témoignages", desc: "Cartes d'avis et retours d'expérience clients." },
                    { key: "contact", label: "Formulaire de Contact Interactif", desc: "Formulaire de saisie complet relié à un message JavaScript." },
                    { key: "footer", label: "Pied de page (Footer)", desc: "Branding secondaire, copyright et liens légaux." }
                  ].map((s) => (
                    <label
                      key={s.key}
                      className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(selectedSections as any)[s.key]}
                        onChange={() => {
                          setSelectedSections((prev) => ({
                            ...prev,
                            [s.key]: !(prev as any)[s.key]
                          }));
                        }}
                        className="mt-1 w-4.5 h-4.5 text-green-500 bg-black border-white/10 rounded focus:ring-green-500 focus:ring-offset-black cursor-pointer"
                      />
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wide">
                          {s.label}
                        </h4>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">{s.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-6 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Précédent
                  </button>

                  <button
                    onClick={() => {
                      const generated = generateSiteCode(siteType, siteTheme, selectedSections);
                      setCode(generated);
                      setIframeKey((prev) => prev + 1);
                      setWizardExplanation(getWizardExplanation(siteType, siteTheme, selectedSections));
                      setWizardStep(4);
                    }}
                    className="px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-green-500/10 flex items-center gap-1"
                  >
                    Générer mon site <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : Guide & Explications */}
            {wizardStep === 4 && (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
                <div className="p-8 rounded-[32px] border border-green-500/20 bg-green-500/5 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Code source généré avec succès !</h3>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed font-medium">
                    Nous avons assemblé une structure HTML5 sémantique couplée au framework CSS **Tailwind CSS**. 
                    Voici un guide explicatif sur la composition de votre nouveau site :
                  </p>
                </div>

                {/* Explications interactives */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Guide de structure de code</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {wizardExplanation.map((exp: string, idx: number) => {
                      const [title, desc] = exp.split(" : ");
                      return (
                        <div key={idx} className="p-5 rounded-2xl border border-white/5 bg-zinc-900/20 flex gap-4 items-start">
                          <span className="text-sm shrink-0">{title.split(" ")[0]}</span>
                          <div>
                            <span className="text-xs font-black text-white uppercase tracking-wider block mb-1">
                              {title.substring(title.indexOf(" ") + 1)}
                            </span>
                            <p className="text-xs text-zinc-400 leading-relaxed font-medium">{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions finales */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-white/5">
                  <button
                    onClick={() => setWizardStep(3)}
                    className="px-6 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all w-full sm:w-auto"
                  >
                    Précédent
                  </button>

                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        setWizardStep(1);
                        setWizardExplanation([]);
                      }}
                      className="px-6 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs font-black uppercase tracking-wider transition-all w-full sm:w-auto"
                    >
                      Recommencer
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("playground");
                      }}
                      className="px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-black text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-green-500/10 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    >
                      <Code className="w-4 h-4" /> Ouvrir dans le Playground
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Live Playground */
          <div className="flex flex-col lg:flex-row gap-8 items-stretch h-auto lg:h-[700px] w-full">
            {/* Panneau de gauche - Éditeur */}
            <div className="flex-grow flex-shrink-0 lg:flex-1 w-full lg:w-1/2 flex flex-col bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative h-[500px] lg:h-auto">
              {/* Header de l'éditeur */}
              <div className="px-5 py-4 border-b border-white/10 bg-zinc-900/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5" /> index.html
                  </span>
                </div>

                {/* Template Selector */}
                <select
                  onChange={(e) => handleTemplateChange(e.target.value as keyof typeof TEMPLATES)}
                  className="bg-black border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase text-zinc-300 tracking-wider focus:outline-none focus:border-green-500 cursor-pointer max-w-[150px] sm:max-w-none text-ellipsis"
                >
                  <option value="airtel">Airtel Money Button</option>
                  <option value="regex">Gabon Phone Regex</option>
                  <option value="bento">Bento Grid Demo</option>
                  <option value="empty">Modèle Vide</option>
                </select>
              </div>

              {/* Textarea Code */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-grow bg-zinc-950 text-green-500 font-mono text-xs p-6 focus:outline-none resize-none leading-relaxed overflow-y-auto"
                spellCheck={false}
              />

              {/* Barre de contrôle du bas */}
              <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <button
                  onClick={askMboloIAOnCode}
                  disabled={aiLoading}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-600/10 disabled:opacity-40 w-full sm:w-auto"
                >
                  {aiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyse...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Analyser avec MBOLO-IA
                    </>
                  )}
                </button>
                <button
                  onClick={refreshPreview}
                  className="px-5 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-green-500/10 w-full sm:w-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Mettre à jour
                </button>
              </div>

              {/* Popup de réponse de MBOLO-IA */}
              <AnimatePresence>
                {aiTip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute inset-x-6 bottom-20 p-5 rounded-2xl bg-zinc-900 border border-blue-500/30 text-xs text-zinc-300 font-medium shadow-2xl z-20 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> MBOLO-IA Conseil
                      </span>
                      <button onClick={() => setAiTip(null)} className="text-zinc-500 hover:text-white transition-colors font-bold text-sm">✕</button>
                    </div>
                    <div className="max-h-36 overflow-y-auto leading-relaxed custom-scrollbar">
                      {aiTip}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Panneau de droite - Aperçu Preview */}
            <div className="flex-grow flex-shrink-0 lg:flex-1 w-full lg:w-1/2 flex flex-col bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl h-[500px] lg:h-auto">
              {/* Header de la preview */}
              <div className="px-5 py-4 border-b border-white/10 bg-zinc-900/50 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#60a5fa]" /> Rendu visuel
                </span>
                <span className="text-[9px] font-black text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live
                </span>
              </div>

              {/* Iframe Preview */}
              <iframe
                key={iframeKey}
                title="Playground Preview"
                srcDoc={code}
                className="flex-grow w-full bg-white"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TrainingHub;
