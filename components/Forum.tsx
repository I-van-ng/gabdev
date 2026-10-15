import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, createPost, likePost, addCommentToPost } from "../services/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { Post, Comment } from "../types";
import Loader from "./Loader";
import {
  MessagesSquare,
  MessageSquare,
  Heart,
  Plus,
  Search,
  Sparkles,
  Bot,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const INITIAL_MOCK_POSTS: Post[] = [
  {
    id: "post-1",
    authorId: "herve-1",
    authorName: "Hervé Mba",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Herve",
    title: "Comment valider les numéros de téléphone gabonais (plan à 9 chiffres) ?",
    content:
      "Bonjour les développeurs ! Avec la nouvelle numérotation de l'ARCEP, les numéros ont désormais 9 chiffres (ex: 062 12 34 56 pour Airtel, 074 12 34 56 pour Moov). Avez-vous une expression régulière fiable en TypeScript ou Dart pour empêcher les erreurs de saisie dans les formulaires de paiement ?",
    tags: ["Regex", "Airtel", "Moov", "Fintech"],
    group: "Fintech & Paiement",
    likesCount: 12,
    likes: [],
    commentsCount: 2,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "post-2",
    authorId: "aicha-2",
    authorName: "Aïcha Gabon",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aicha",
    title: "Hébergement Cloud au Gabon : quelles solutions privilégier ?",
    content:
      "Hello la communauté ! Pour un projet institutionnel exigeant que les données restent sur le territoire national, quelles sont vos recommandations pour héberger une base PostgreSQL et des conteneurs Docker localement avec une bonne bande passante ?",
    tags: ["Cloud", "Souveraineté", "Docker", "DevOps"],
    group: "Cloud & Infra",
    likesCount: 16,
    likes: [],
    commentsCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "post-3",
    authorId: "brice-3",
    authorName: "Brice Ondo",
    authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brice",
    title: "Conseils pour décrocher ses premiers contrats freelance tech depuis Libreville",
    content:
      "Je viens de finir ma formation en React et Node.js. Quels sont vos meilleurs conseils pour trouver des clients locaux (PME, commerces) ou internationaux sans passer par des plateformes saturées ?",
    tags: ["Freelance", "Carrières", "React"],
    group: "Carrières & Freelance",
    likesCount: 9,
    likes: [],
    commentsCount: 1,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const STORAGE_FORUM_KEY = "gabdev_forum_posts_cache";

const Forum: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>(() => {
    const cached = localStorage.getItem(STORAGE_FORUM_KEY);
    return cached ? JSON.parse(cached) : INITIAL_MOCK_POSTS;
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("TOUS");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Comments for expanded post
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({
    "post-1": [
      {
        id: "c-1",
        authorId: "ivan-1",
        authorName: "Ivan Ndoumba Nguia",
        authorPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan",
        content:
          "Tu peux utiliser la regex standard : `/^(062|065|066|074|077)[0-9]{6}$/`. Elle couvre à la fois les préfixes Airtel et Moov à 9 chiffres.",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
  });

  const [commentInput, setCommentInput] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // New post modal state
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postGroup, setPostGroup] = useState("Fintech & Paiement");
  const [postTags, setPostTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const groups = [
    "TOUS",
    "Fintech & Paiement",
    "Flutter & Mobile",
    "React & Web",
    "Cloud & Infra",
    "Carrières & Freelance",
  ];

  // Listen to Firestore posts
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      unsubscribe = onSnapshot(
        q,
        (snapshot: QuerySnapshot) => {
          if (!snapshot.empty) {
            const list: Post[] = snapshot.docs.map((docSnap: QueryDocumentSnapshot) => ({
              id: docSnap.id,
              ...(docSnap.data() as any),
            }));
            setPosts(list);
            localStorage.setItem(STORAGE_FORUM_KEY, JSON.stringify(list));
          }
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore posts query offline, using cached/mock:", err);
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn("Firestore error on posts:", err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchGroup = selectedGroup === "TOUS" || post.group === selectedGroup;
    const matchSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchGroup && matchSearch;
  });

  const handleLike = async (postId: string) => {
    const currentUserId = user?.uid || "guest";
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasLiked = p.likes?.includes(currentUserId);
          const newLikes = hasLiked
            ? (p.likes || []).filter((id) => id !== currentUserId)
            : [...(p.likes || []), currentUserId];
          return {
            ...p,
            likes: newLikes,
            likesCount: (p.likesCount || 0) + (hasLiked ? -1 : 1),
          };
        }
        return p;
      })
    );

    if (user?.uid) {
      try {
        await likePost(postId, user.uid);
      } catch (err) {
        console.warn("Could not sync like to Firestore:", err);
      }
    }
  };

  const handleAddComment = async (postId: string, textToAdd?: string) => {
    const text = (textToAdd || commentInput).trim();
    if (!text) return;

    const authorName = profile?.displayName || user?.displayName || "Développeur Hub";
    const authorPhoto =
      profile?.photoURL ||
      user?.photoURL ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    const authorId = user?.uid || `guest-${Date.now()}`;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      authorId,
      authorName,
      authorPhoto,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      )
    );

    if (!textToAdd) {
      setCommentInput("");
    }

    if (user?.uid) {
      try {
        await addCommentToPost(postId, authorId, authorName, authorPhoto, text);
      } catch (err) {
        console.warn("Could not sync comment to Firestore:", err);
      }
    }
  };

  // Demander à MBOLO-IA de répondre au sujet
  const handleAskAI = async (post: Post) => {
    setAiGenerating(true);
    try {
      const response = await fetch("/api/ai/community-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextType: "post",
          titleOrUserComment: post.title,
          postContent: post.content,
        }),
      });

      if (!response.ok) throw new Error("Échec de la réponse IA");

      const data = await response.json();
      const aiReply = data.reply || "Voici une suggestion technique pour votre problème.";

      const aiComment: Comment = {
        id: `ai-${Date.now()}`,
        authorId: "mbolo-ia",
        authorName: "MBOLO-IA (Assistant GABdev)",
        authorPhoto: "https://api.dicebear.com/7.x/bottts/svg?seed=MBOLO",
        content: aiReply,
        createdAt: new Date().toISOString(),
      };

      setCommentsMap((prev) => ({
        ...prev,
        [post.id]: [...(prev[post.id] || []), aiComment],
      }));

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );

      // Ouvrir automatiquement les réponses
      setExpandedPostId(post.id);
    } catch (err) {
      console.error("AI community reply error:", err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      setErrorMsg("Veuillez remplir le titre et le contenu.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const parsedTags = postTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const authorName = profile?.displayName || user?.displayName || "Hacker GABdev";
    const authorPhoto =
      profile?.photoURL ||
      user?.photoURL ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    const authorId = user?.uid || `guest-${Date.now()}`;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId,
      authorName,
      authorPhoto,
      title: postTitle.trim(),
      content: postContent.trim(),
      tags: parsedTags.length > 0 ? parsedTags : ["Discussion"],
      group: postGroup,
      likesCount: 1,
      likes: [authorId],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    if (user?.uid) {
      try {
        await createPost(
          newPost.title,
          newPost.content,
          newPost.tags,
          newPost.group || "Fintech & Paiement",
          authorId,
          authorName,
          authorPhoto
        );
      } catch (err) {
        console.warn("Firestore createPost fallback:", err);
      }
    }

    const updated = [newPost, ...posts];
    setPosts(updated);
    localStorage.setItem(STORAGE_FORUM_KEY, JSON.stringify(updated));

    setSubmitting(false);
    setIsNewPostOpen(false);
    setPostTitle("");
    setPostContent("");
    setPostTags("");
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black tracking-widest uppercase mb-3">
            <MessagesSquare className="w-3.5 h-3.5" />
            Forum & Entraide Tech
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Questions & Réponses
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
            Posez vos questions techniques, échangez sur les bonnes pratiques et recevez l'aide de la communauté ainsi que de notre IA locale.
          </p>
        </div>

        <button
          onClick={() => setIsNewPostOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Poser une question
        </button>
      </div>

      {/* Barre de recherche et catégories */}
      <div className="space-y-4 mb-10">
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une question, une technologie (ex: Airtel, Cloud, React), un auteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedGroup === grp
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-zinc-900/40 text-zinc-400 hover:text-white border-white/5 hover:border-white/10"
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des sujets */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader text="Chargement des discussions..." />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-white/5 p-8">
          <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Aucune discussion trouvée</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6">
            Vous avez un doute technique ? Soyez le premier à poser une question dans ce salon !
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedGroup("TOUS");
            }}
            className="text-blue-400 text-xs font-black uppercase tracking-wider hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isExpanded = expandedPostId === post.id;
            const comments = commentsMap[post.id] || [];
            const hasLiked = post.likes?.includes(user?.uid || "guest");

            return (
              <div
                key={post.id}
                className="bg-zinc-900/40 border border-white/5 hover:border-white/15 rounded-3xl p-6 transition-all duration-200"
              >
                {/* Meta auteur et salon */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorPhoto || "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev"}
                      alt={post.authorName}
                      className="w-8 h-8 rounded-full bg-zinc-800 object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {post.authorName}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(post.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.group || "Discussion"}
                  </span>
                </div>

                {/* Titre & Contenu */}
                <h3 className="text-lg sm:text-xl font-black text-white mb-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-4 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold bg-white/5 text-zinc-400 px-2.5 py-1 rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Barre d'action */}
                <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        hasLiked
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "text-zinc-400 hover:text-red-400 hover:bg-white/5"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${hasLiked ? "fill-red-500 text-red-500" : ""}`}
                      />
                      <span>{post.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() =>
                        setExpandedPostId(isExpanded ? null : post.id)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount || comments.length} réponses</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-1" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Bouton IA */}
                  <button
                    onClick={() => handleAskAI(post)}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>
                      {aiGenerating ? "Génération IA..." : "Avis de MBOLO-IA"}
                    </span>
                  </button>
                </div>

                {/* Section Réponses dépliée */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 pt-5 border-t border-white/5 space-y-4"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Réponses de la communauté ({comments.length})
                      </h4>

                      {comments.length === 0 ? (
                        <p className="text-xs text-zinc-500 italic">
                          Pas encore de réponse. Soyez le premier à répondre ou demandez l'aide de l'IA ci-dessus !
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((c) => {
                            const isAI = c.authorId === "mbolo-ia";
                            return (
                              <div
                                key={c.id}
                                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                                  isAI
                                    ? "bg-purple-950/20 border-purple-500/30 text-zinc-200"
                                    : "bg-zinc-800/40 border-white/5 text-zinc-300"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <img
                                    src={c.authorPhoto}
                                    alt={c.authorName}
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                  <span
                                    className={`font-bold ${
                                      isAI ? "text-purple-300 flex items-center gap-1" : "text-white"
                                    }`}
                                  >
                                    {isAI && <Bot className="w-3.5 h-3.5" />}
                                    {c.authorName}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 ml-auto">
                                    {new Date(c.createdAt).toLocaleTimeString("fr-FR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <p className="whitespace-pre-line pl-7">{c.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Formulaire de réponse */}
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Écrire une réponse constructive..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(post.id);
                          }}
                          className="flex-grow bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Poser une question */}
      <AnimatePresence>
        {isNewPostOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button
                onClick={() => setIsNewPostOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest mb-1">
                <HelpCircle className="w-4 h-4" />
                Communauté d'entraide
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Poser une question tech
              </h2>
              <p className="text-zinc-400 text-xs mb-6 font-medium">
                Partagez votre problème ou demandez l'avis d'experts de l'écosystème gabonais.
              </p>

              <form onSubmit={handleCreatePost} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Sujet / Titre de la question *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Comment intégrer le webhook de notification Airtel Money ?"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={postGroup}
                    onChange={(e) => setPostGroup(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    {groups
                      .filter((g) => g !== "TOUS")
                      .map((grp) => (
                        <option key={grp} value={grp}>
                          {grp}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Détail du problème & code *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Expliquez ce que vous essayez d'accomplir, l'erreur rencontrée et vos pistes..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Mots-clés (séparés par des virgules)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Airtel, Webhook, Node.js, Express"
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                    className="w-full bg-zinc-800/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewPostOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 py-2.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {submitting ? "Publication..." : "Publier ma question"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Forum;
