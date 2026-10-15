import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, createProject, likeProject } from "../services/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { Project } from "../types";
import Loader from "./Loader";
import {
  FolderGit2,
  ExternalLink,
  Code2,
  GitBranch,
  Heart,
  Plus,
  Search,
  Sparkles,
  Share2,
  X,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const INITIAL_MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    authorId: "ivan-1",
    authorName: "Ivan Ndoumba Nguia",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan",
    name: "GABdev Platform v2.5",
    description:
      "La plateforme d'élite de la tech gabonaise : messagerie temps réel, assistant IA MBOLO-IA, showcase de projets, bibliothèque de tutoriels et prestations numériques.",
    demoUrl: "https://gabdev.ga",
    githubUrl: "https://github.com/gabdev/gabdev-platform",
    imageUrl:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
    tags: ["React", "Vite", "Firebase", "Gemini IA", "Tailwind"],
    likesCount: 24,
    likes: [],
    commentsCount: 8,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "proj-2",
    authorId: "grace-2",
    authorName: "Grace Ovono",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Grace",
    name: "Lib Gabon Pay (Airtel & Moov SDK)",
    description:
      "Un package Flutter et Node.js open-source pour intégrer rapidement les paiements mobiles Airtel Money et Moov Money au Gabon avec validation automatique des numéros.",
    demoUrl: "https://pub.dev",
    githubUrl: "https://github.com/gabdev/lib-gabon-pay",
    imageUrl:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
    tags: ["Flutter", "Fintech", "Mobile Money", "Node.js"],
    likesCount: 19,
    likes: [],
    commentsCount: 5,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "proj-3",
    authorId: "arnold-3",
    authorName: "Arnold Mba",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arnold",
    name: "SantéGab Connect",
    description:
      "Solution mobile et PWA de carnet de santé numérique et de géolocalisation des pharmacies de garde à Libreville, Owendo et Akanda.",
    demoUrl: "https://santegab.ga",
    githubUrl: "https://github.com/gabdev/santegab-connect",
    imageUrl:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop",
    tags: ["PWA", "Next.js", "Leaflet", "PostgreSQL"],
    likesCount: 15,
    likes: [],
    commentsCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
];

const STORAGE_PROJECTS_KEY = "gabdev_community_projects_cache";

const Projects: React.FC = () => {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>(() => {
    const cached = localStorage.getItem(STORAGE_PROJECTS_KEY);
    return cached ? JSON.parse(cached) : INITIAL_MOCK_PROJECTS;
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("TOUS");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTags, setProjectTags] = useState("");
  const [projectDemo, setProjectDemo] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectImage, setProjectImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Listen to Firestore projects with fallback
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot) => {
          if (!snapshot.empty) {
            const list: Project[] = snapshot.docs.map(
              (docSnap: QueryDocumentSnapshot) => ({
                id: docSnap.id,
                ...(docSnap.data() as any),
              })
            );
            setProjects(list);
            localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(list));
          }
          setLoading(false);
        },
        (error) => {
          console.warn("Firestore projects query offline, using cached/mock:", error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn("Firestore error on projects:", err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filter tags
  const allTags = ["TOUS", "React", "Flutter", "Fintech", "Mobile Money", "Gemini IA", "Node.js", "PWA"];

  const filteredProjects = projects.filter((project) => {
    const matchTag =
      selectedTag === "TOUS" ||
      project.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    const matchSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTag && matchSearch;
  });

  const handleLike = async (projectId: string) => {
    const currentUserId = user?.uid || "guest";
    // Optimistic update
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          const hasLiked = proj.likes?.includes(currentUserId);
          const newLikes = hasLiked
            ? (proj.likes || []).filter((id) => id !== currentUserId)
            : [...(proj.likes || []), currentUserId];
          return {
            ...proj,
            likes: newLikes,
            likesCount: (proj.likesCount || 0) + (hasLiked ? -1 : 1),
          };
        }
        return proj;
      })
    );

    if (user?.uid) {
      try {
        await likeProject(projectId, user.uid);
      } catch (err) {
        console.warn("Could not sync like to Firestore:", err);
      }
    }
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !projectDesc.trim()) {
      setSubmitError("Veuillez renseigner au moins le nom et la description.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const parsedTags = projectTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const authorName = profile?.displayName || user?.displayName || "Développeur Gabonais";
    const authorPhoto =
      profile?.photoURL ||
      user?.photoURL ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    const authorId = user?.uid || `guest-${Date.now()}`;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      authorId,
      authorName,
      authorPhoto,
      name: projectName.trim(),
      description: projectDesc.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ["Projet Gabon"],
      demoUrl: projectDemo.trim() || undefined,
      githubUrl: projectGithub.trim() || undefined,
      imageUrl:
        projectImage.trim() ||
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
      likesCount: 1,
      likes: [authorId],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      if (user?.uid) {
        await createProject(
          newProj.name,
          newProj.description,
          newProj.imageUrl || "",
          newProj.demoUrl || "",
          newProj.githubUrl || "",
          newProj.tags,
          authorId,
          authorName,
          authorPhoto
        );
      }
    } catch (err) {
      console.warn("Firestore createProject fallback:", err);
    }

    // Update local state
    setProjects((prev) => [newProj, ...prev]);
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify([newProj, ...projects]));

    setSubmitting(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsSubmitModalOpen(false);
      // Reset form
      setProjectName("");
      setProjectDesc("");
      setProjectTags("");
      setProjectDemo("");
      setProjectGithub("");
      setProjectImage("");
    }, 1200);
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black tracking-widest uppercase mb-3">
            <FolderGit2 className="w-3.5 h-3.5" />
            Showcase Communautaire
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Projets & Réalisations
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
            Découvrez ce que construit l'élite tech gabonaise : applications mobiles, plateformes SaaS, bibliothèques open-source et innovations locales.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Proposer un projet
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="space-y-4 mb-10">
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par mot-clé, technologie (ex: Flutter, Airtel, React), créateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedTag === tag
                  ? "bg-green-500 text-black border-green-500 shadow-md shadow-green-500/20"
                  : "bg-zinc-900/40 text-zinc-400 hover:text-white border-white/5 hover:border-white/10"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des projets */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader text="Chargement des projets..." />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
          <FolderGit2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aucun projet trouvé</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6">
            Essayez de modifier votre recherche ou soyez le premier à soumettre un projet dans cette catégorie !
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag("TOUS");
            }}
            className="text-green-400 text-xs font-black uppercase tracking-wider hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => {
            const hasLiked = project.likes?.includes(user?.uid || "guest");
            return (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/5 hover:border-white/15 rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-xl hover:-translate-y-1.5"
              >
                {/* Image du projet */}
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                  <img
                    src={project.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop"}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  
                  {/* Badges Tags sur l'image */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {project.tags?.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="bg-black/60 backdrop-blur-md text-[10px] font-bold text-green-400 px-2.5 py-1 rounded-lg border border-green-500/20"
                      >
                        {t}
                      </span>
                    ))}
                    {(project.tags?.length || 0) > 3 && (
                      <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold text-zinc-400 px-2 py-1 rounded-lg">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Auteur */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={project.authorPhoto || "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev"}
                        alt={project.authorName}
                        className="w-7 h-7 rounded-full bg-zinc-800 object-cover border border-white/10"
                      />
                      <span className="text-xs font-semibold text-zinc-400">
                        {project.authorName}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-green-400 transition-colors mb-2 leading-tight">
                      {project.name}
                    </h3>
                    <p className="text-zinc-400 text-xs sm:text-sm font-normal line-clamp-3 mb-6 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Actions & Liens */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-green-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Démo
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          Code
                        </a>
                      )}
                    </div>

                    <button
                      onClick={() => handleLike(project.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hasLiked
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "text-zinc-500 hover:text-red-400 hover:bg-white/5"
                      }`}
                      aria-label="Aimer ce projet"
                    >
                      <Heart
                        className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`}
                      />
                      <span>{project.likesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Soumettre un projet */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-green-400 text-xs font-black uppercase tracking-widest mb-1">
                <Sparkles className="w-4 h-4" />
                Partage Communautaire
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Proposer une réalisation
              </h2>
              <p className="text-zinc-400 text-xs mb-6 font-medium">
                Partagez votre application, API ou projet open-source avec les membres de GABdev.
              </p>

              {submitSuccess ? (
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
                  <p className="text-sm font-bold text-white">Projet ajouté avec succès !</p>
                  <p className="text-xs text-zinc-400">Votre réalisation est maintenant en ligne sur le hub.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitProject} className="space-y-4">
                  {submitError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Nom du projet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Airtel Pay Gateway, Mbolo PWA..."
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Description du projet *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Quel problème résout votre projet ? Quelles technologies sont employées ?"
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Technologies & Mots-clés (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Flutter, React, Airtel Money, Firebase"
                      value={projectTags}
                      onChange={(e) => setProjectTags(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Lien Démo / Live
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={projectDemo}
                        onChange={(e) => setProjectDemo(e.target.value)}
                        className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                        Lien GitHub / Repo
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={projectGithub}
                        onChange={(e) => setProjectGithub(e.target.value)}
                        className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                      URL de la capture d'écran / Image (optionnel)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={projectImage}
                      onChange={(e) => setProjectImage(e.target.value)}
                      className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-green-500 hover:bg-green-400 text-black font-black px-6 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? "Publication..." : "Publier le projet"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Projects;
