import React, { useEffect, useMemo, useState } from "react";
import { db } from "../services/firebase";
import Loader from "./Loader";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import {
  BookOpen,
  Search,
  Bookmark,
  ExternalLink,
  Code2,
  Copy,
  Check,
  X,
  FileCode,
  Shield,
  Layers,
  ArrowRight,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ResourceRecord {
  id: string;
  category: string;
  title: string;
  description: string;
  author: string;
  level: string;
  readTime: string;
  tags: string[];
  content?: string;
  codeSnippet?: string;
  link?: string;
}

const DEFAULT_RESOURCES: ResourceRecord[] = [
  {
    id: "res-airtel-moov",
    category: "FINTECH",
    title: "Guide complet : Intégrer Airtel Money & Moov Money au Gabon",
    description:
      "Tutoriel pas-à-pas pour initier des paiements par push USSD, écouter les webhooks de confirmation et sécuriser les transactions mobiles locales.",
    author: "Ivan Ndoumba Nguia",
    level: "Intermédiaire",
    readTime: "7 min de lecture",
    tags: ["Airtel", "Moov", "Fintech", "Gabon", "API"],
    codeSnippet: `// Exemple d'initialisation de transaction avec l'API Airtel Money Gabon
async function initiateAirtelPushPayment({ phoneNumber, amount, referenceId }) {
  const endpoint = "https://openapi.airtel.africa/merchant/v1/payments/";
  
  const payload = {
    reference: referenceId,
    subscriber: {
      country: "GA",
      currency: "XAF",
      msisdn: phoneNumber.replace(/^(\+241|0)/, "") // Format: 74xxxxxx
    },
    transaction: {
      amount: amount,
      country: "GA",
      currency: "XAF",
      id: referenceId
    }
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Country": "GA",
      "X-Currency": "XAF",
      "Authorization": "Bearer " + process.env.AIRTEL_API_TOKEN
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}`,
    content: `### Contexte de la Fintech au Gabon
Au Gabon, plus de 75% des transactions électroniques de proximité s'effectuent par Mobile Money (Airtel Money et Moov Money). Intégrer ces flux dans vos sites e-commerce ou applications est crucial pour le taux de conversion.

### Étapes clés :
1. **Validation du numéro client** : Vérifier que le numéro commence bien par 062/065/066 (Airtel) ou 074/077 (Moov).
2. **Push USSD** : Envoi de la demande de prélèvement sur le mobile du client qui valide avec son code secret.
3. **Webhook Callback** : Votre serveur écoute l'événement de validation et crédite la commande.`,
  },
  {
    id: "res-regex-gabon",
    category: "SNIPPET",
    title: "Snippet Regex : Validation des numéros gabonais à 9 chiffres",
    description:
      "Fonctions prêtes à l'emploi en JavaScript / TypeScript et Dart (Flutter) pour valider les nouveaux numéros de téléphone de l'ARCEP.",
    author: "Grace Ovono",
    level: "Débutant",
    readTime: "3 min de lecture",
    tags: ["Regex", "JavaScript", "TypeScript", "Flutter"],
    codeSnippet: `// TypeScript / JavaScript
export const isValidGabonPhone = (phone: string): boolean => {
  // Accepte avec ou sans préfixe international (+241 ou 00241 ou direct 0)
  const regex = /^(?:(?:\+|00)241|0)?([67]\d{7})$/;
  return regex.test(phone.replace(/\\s+/g, ''));
};

// Obtenir l'opérateur (Airtel vs Moov)
export const getOperator = (phone: string): 'AIRTEL' | 'MOOV' | 'UNKNOWN' => {
  const clean = phone.replace(/[^0-9]/g, '').slice(-8); // prend les 8 derniers chiffres
  if (/^(62|65|66)/.test(clean)) return 'AIRTEL';
  if (/^(74|77)/.test(clean)) return 'MOOV';
  return 'UNKNOWN';
};`,
    content: `Depuis la réforme du plan de numérotation national à 9 chiffres menée par l'ARCEP, tous les numéros mobiles gabonais débutent par 06 ou 07 suivis de 7 chiffres. Ce snippet évite les erreurs de saisie dans les formulaires et identifie l'opérateur mobile pour adapter automatiquement les logos de paiement.`,
  },
  {
    id: "res-cloud-souverain",
    category: "DOCUMENTATION",
    title: "Standardisation du Cloud et Hébergement Souverain au Gabon",
    description:
      "Directives d'architecture pour le déploiement sur infrastructures locales, la réduction du ping et la conformité légale de protection des données.",
    author: "Hervé Mba",
    level: "Avancé",
    readTime: "10 min de lecture",
    tags: ["Cloud", "Souveraineté", "Docker", "DevOps"],
    codeSnippet: `# Exemple docker-compose pour déploiement sur VM souveraine locale
version: '3.8'

services:
  web:
    image: gabdev/api-engine:latest
    restart: always
    environment:
      - NODE_ENV=production
      - DB_HOST=db.local
    ports:
      - "3000:3000"
    networks:
      - internal-net

networks:
  internal-net:
    driver: bridge`,
    content: `### Pourquoi l'hébergement local compte
Un temps de latence réduit entre Libreville, Port-Gentil et Franceville assure une fluidité maximale aux applications critiques (santé, éducation, transactions bancaires).
Ce guide recense les fournisseurs de datacenters nationaux et les mécanismes de bascule redondante (failover) sécurisée.`,
  },
  {
    id: "res-figma-ds",
    category: "OUTIL",
    title: "Design System GABdev Figma (Kit UI Officiel)",
    description:
      "Bibliothèque de composants UI Figma : boutons néon vert Gabon, cards sombres, bannières responsives et typographies modernes.",
    author: "Ivan Ndoumba Nguia",
    level: "Tous niveaux",
    readTime: "5 min de lecture",
    tags: ["Design", "Figma", "UI", "Tailwind"],
    codeSnippet: `/* Variables CSS principales du Design System GABdev */
:root {
  --gab-green: #22c55e;
  --gab-green-glow: rgba(34, 197, 94, 0.35);
  --gab-yellow: #eab308;
  --gab-blue: #3b82f6;
  --bg-dark: #09090b;
  --card-dark: rgba(24, 24, 27, 0.6);
}`,
    content: `Gagnez des heures lors de vos conceptions web et mobile. Ce kit Figma intègre toutes les spécifications visuelles du Hub GABdev, avec le respect des contrastes d'accessibilité et la préparation directe pour export Tailwind CSS.`,
  },
];

const Resources: React.FC = () => {
  const [resources, setResources] = useState<ResourceRecord[]>(DEFAULT_RESOURCES);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("TOUS");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    const saved = localStorage.getItem("gabdev_bookmarked_resources");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedResource, setSelectedResource] = useState<ResourceRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const resourcesQuery = query(collection(db, "resources"), orderBy("title"));
      const unsubscribe = onSnapshot(
        resourcesQuery,
        (snapshot: QuerySnapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs.map(
              (entry: QueryDocumentSnapshot) =>
                ({ id: entry.id, ...entry.data() }) as ResourceRecord,
            );
            // Merge with default resources so we never have an empty screen
            setResources(data.length > 0 ? data : DEFAULT_RESOURCES);
          }
        },
        (err) => {
          console.warn("Firestore resources offline, using built-in guide library:", err);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn("Error setting up resources listener:", err);
    }
  }, []);

  const categories = useMemo(() => {
    const dynamicCats = resources
      .map((r) => r.category?.trim().toUpperCase())
      .filter((c): c is string => Boolean(c));
    return ["TOUS", ...Array.from(new Set(dynamicCats)).sort()];
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesCategory =
        activeCategory === "TOUS" ||
        resource.category?.toUpperCase() === activeCategory.toUpperCase();
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, resources, searchQuery]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      localStorage.setItem("gabdev_bookmarked_resources", JSON.stringify(next));
      return next;
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="resources" className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Base de Savoirs & Outils
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ressources & Tutoriels
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
            La documentation pratique pour les développeurs au Gabon : intégration des paiements Airtel & Moov Money, snippets regex, architectures locales et design systems.
          </p>
        </div>

        <a
          href="https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/5 whitespace-nowrap"
        >
          Proposer un tutoriel
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Barre de recherche */}
      <div className="space-y-4 mb-10">
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un tutoriel, un mot-clé (Airtel, Moov, Regex, Cloud, Figma)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
          />
        </div>

        {/* Filtres Catégories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === category
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-zinc-900/40 text-zinc-400 hover:text-white border-white/5 hover:border-white/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des ressources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
        {filteredResources.map((resource) => {
          const isBookmarked = bookmarks.includes(resource.id);
          return (
            <div
              key={resource.id}
              className="group p-6 sm:p-8 rounded-3xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/5 hover:border-white/15 transition-all duration-300 flex flex-col justify-between shadow-xl relative"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md uppercase">
                      {resource.category}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2.5 py-1 rounded-md">
                      {resource.level || "Tous niveaux"}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBookmark(resource.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isBookmarked
                        ? "bg-blue-500/20 text-blue-400"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    }`}
                    aria-label="Enregistrer dans les favoris"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors mb-3 leading-snug">
                  {resource.title}
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm font-normal mb-6 leading-relaxed line-clamp-3">
                  {resource.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {resource.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2.5 py-1 bg-white/5 rounded-lg text-zinc-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer de la carte */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">
                  {resource.readTime || "5 min"} • Par {resource.author || "GABdev"}
                </span>

                <button
                  onClick={() => setSelectedResource(resource)}
                  className="flex items-center gap-1.5 text-xs font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider cursor-pointer"
                >
                  Consulter
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de lecture complète */}
      <AnimatePresence>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedResource(null)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md uppercase">
                  {selectedResource.category}
                </span>
                <span className="text-xs text-zinc-400">
                  {selectedResource.readTime}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-4 leading-snug">
                {selectedResource.title}
              </h2>

              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                {selectedResource.description}
              </p>

              {/* Code Snippet si présent */}
              {selectedResource.codeSnippet && (
                <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950">
                  <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-400 flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      Code d'exemple
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedResource.codeSnippet!)}
                      className="text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-400" />
                          <span className="text-green-400">Copié !</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
                    <code>{selectedResource.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Contenu Markdown / Texte */}
              {selectedResource.content && (
                <div className="text-xs sm:text-sm text-zinc-300 space-y-3 whitespace-pre-line leading-relaxed mb-6 bg-zinc-800/30 p-5 rounded-2xl border border-white/5">
                  {selectedResource.content}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedResource.tags?.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-bold px-2.5 py-1 bg-white/5 rounded-lg text-zinc-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Rédigé par <strong className="text-white">{selectedResource.author}</strong>
                </span>

                <button
                  onClick={() => setSelectedResource(null)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Resources;
