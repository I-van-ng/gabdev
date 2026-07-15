import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, signInWithGoogle, signInQuick } from "../services/firebase";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  MessageSquare,
  ThumbsUp,
  User,
  Plus,
  Search,
  Tag,
} from "lucide-react";
import { generateCommunityReply } from "../services/geminiService";

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
}

const Community: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  const [showEditor, setShowEditor] = useState(false);
  const [searching, setSearching] = useState("");

  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [postId: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});

  const getPostDate = (createdAt: Post["createdAt"]) => {
    if (createdAt?.toDate) return createdAt.toDate();
    if (typeof createdAt === "string" || createdAt instanceof Date) {
      return new Date(createdAt);
    }
    return null;
  };

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(postsQuery, (snapshot: QuerySnapshot) => {
      const postsData = snapshot.docs.map(
        (entry: QueryDocumentSnapshot) =>
          ({ id: entry.id, ...entry.data() }) as Post,
      );
      
      // Charger également les posts locaux (LocalStorage)
      const localPosts = JSON.parse(localStorage.getItem("gabdev_local_posts") || "[]");
      
      // Fusionner les posts
      setPosts([...localPosts, ...postsData]);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.title || !newPost.content) return;

    const isGuest = user.uid.startsWith("guest-");

    try {
      if (isGuest) {
        throw new Error("Guest Mode: Write local post");
      }

      const docRef = await addDoc(collection(db, "posts"), {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || "Hacker",
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      });

      const titleTemp = newPost.title;
      const contentTemp = newPost.content;

      setNewPost({ title: "", content: "", tags: "" });
      setShowEditor(false);

      // Trigger automatic AI comment after a short delay
      setTimeout(async () => {
        try {
          const replyText = await generateCommunityReply("post", titleTemp, contentTemp);
          await addDoc(collection(db, "posts", docRef.id, "comments"), {
            authorId: "antigravity-ai",
            authorName: "Antigravity (Google DeepMind)",
            content: replyText,
            createdAt: serverTimestamp(),
          });
          await updateDoc(doc(db, "posts", docRef.id), {
            commentsCount: increment(1),
          });
        } catch (err) {
          console.error("Failed to post AI welcome reply:", err);
        }
      }, 1500);
    } catch (error) {
      console.log("Saving post locally due to guest mode or offline error:", error);

      const localPostId = `local-post-${Date.now()}`;
      const localPost = {
        id: localPostId,
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || "Hacker",
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      };

      const existingLocal = JSON.parse(localStorage.getItem("gabdev_local_posts") || "[]");
      localStorage.setItem("gabdev_local_posts", JSON.stringify([localPost, ...existingLocal]));

      // Update state locally
      setPosts(prev => [localPost as any, ...prev]);

      const titleTemp = newPost.title;
      const contentTemp = newPost.content;

      setNewPost({ title: "", content: "", tags: "" });
      setShowEditor(false);

      // Trigger AI reply locally
      setTimeout(async () => {
        try {
          const replyText = await generateCommunityReply("post", titleTemp, contentTemp);
          const localComment = {
            id: `local-comment-${Date.now()}`,
            authorId: "antigravity-ai",
            authorName: "Antigravity (Google DeepMind)",
            content: replyText,
            createdAt: new Date().toISOString(),
          };

          const localCommentsKey = `gabdev_local_comments_${localPostId}`;
          localStorage.setItem(localCommentsKey, JSON.stringify([localComment]));

          setPosts(prev => prev.map(p => p.id === localPostId ? { ...p, commentsCount: 1 } : p));
        } catch (err) {
          console.error("Failed to post local AI reply:", err);
        }
      }, 1500);
    }
  };

  const likePost = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, "posts", id), {
      likesCount: increment(1),
    });
  };

  // Charger les commentaires d'une discussion lorsqu'elle est ouverte
  useEffect(() => {
    if (!expandedPostId) return;

    setLoadingComments((prev) => ({ ...prev, [expandedPostId]: true }));

    const isLocalPost = expandedPostId.startsWith("local-");

    if (isLocalPost) {
      const localCommentsKey = `gabdev_local_comments_${expandedPostId}`;
      const localComments = JSON.parse(localStorage.getItem(localCommentsKey) || "[]");
      setComments((prev) => ({ ...prev, [expandedPostId]: localComments }));
      setLoadingComments((prev) => ({ ...prev, [expandedPostId]: false }));
      return;
    }

    const q = query(
      collection(db, "posts", expandedPostId, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Comment
      );

      // Charger également les commentaires locaux pour ce post Firestore
      const localCommentsKey = `gabdev_local_comments_${expandedPostId}`;
      const localComments = JSON.parse(localStorage.getItem(localCommentsKey) || "[]");

      setComments((prev) => ({ ...prev, [expandedPostId]: [...list, ...localComments] }));
      setLoadingComments((prev) => ({ ...prev, [expandedPostId]: false }));
    });

    return () => unsubscribe();
  }, [expandedPostId]);

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!user || !text) return;

    const isLocal = user.uid.startsWith("guest-") || postId.startsWith("local-");

    try {
      if (isLocal) {
        throw new Error("Guest Mode: Write local comment");
      }

      await addDoc(collection(db, "posts", postId, "comments"), {
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || "Hacker",
        content: text,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "posts", postId), {
        commentsCount: increment(1),
      });

      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

      // Si l'utilisateur mentionne antigravity, déclencher une réponse IA
      if (text.toLowerCase().includes("antigravity")) {
        triggerAIResponseToComment(postId, text);
      }
    } catch (err) {
      console.log("Saving comment locally...", err);

      const localComment = {
        id: `local-comment-${Date.now()}`,
        authorId: user.uid,
        authorName: profile?.displayName || user.displayName || "Hacker",
        content: text,
        createdAt: new Date().toISOString(),
      };

      const localCommentsKey = `gabdev_local_comments_${postId}`;
      const existingComments = JSON.parse(localStorage.getItem(localCommentsKey) || "[]");
      const updatedComments = [...existingComments, localComment];
      localStorage.setItem(localCommentsKey, JSON.stringify(updatedComments));

      // Mettre à jour l'état immédiatement
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), localComment as any]
      }));

      // Incrémenter le compteur de commentaires localement
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

      // Déclencher une réponse IA locale si mentionné ou si c'est un post local
      if (text.toLowerCase().includes("antigravity") || postId.startsWith("local-")) {
        setTimeout(async () => {
          try {
            const replyText = await generateCommunityReply("comment", text);
            const localAIComment = {
              id: `local-comment-${Date.now()}`,
              authorId: "antigravity-ai",
              authorName: "Antigravity (Google DeepMind)",
              content: replyText,
              createdAt: new Date().toISOString(),
            };

            const localCommentsWithAI = [...updatedComments, localAIComment];
            localStorage.setItem(localCommentsKey, JSON.stringify(localCommentsWithAI));

            setComments(prev => ({
              ...prev,
              [postId]: [...(prev[postId] || []), localAIComment as any]
            }));

            setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
          } catch (err) {
            console.error("Failed to post local AI reply:", err);
          }
        }, 1500);
      }
    }
  };

  const triggerAIResponseToComment = async (postId: string, userComment: string) => {
    // Petit délai pour simuler la réflexion de l'IA
    setTimeout(async () => {
      try {
        const replyText = await generateCommunityReply("comment", userComment);
        await addDoc(collection(db, "posts", postId, "comments"), {
          authorId: "antigravity-ai",
          authorName: "Antigravity (Google DeepMind)",
          content: replyText,
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "posts", postId), {
          commentsCount: increment(1),
        });
      } catch (err) {
        console.error("Failed to post AI reply to comment:", err);
      }
    }, 1500);
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searching.toLowerCase()) ||
      post.content.toLowerCase().includes(searching.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searching.toLowerCase()),
      ),
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-zinc-900/40 p-6 rounded-[32px] border border-white/5">
        <div className="flex items-center gap-3 flex-grow">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={searching}
              onChange={(e) => setSearching(e.target.value)}
              className="bg-black/20 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full transition-all"
            />
          </div>
        </div>

        <button
          onClick={() => setShowEditor(!showEditor)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Discussion
        </button>
      </div>

      {showEditor && (
        <div className="mb-12 bg-zinc-900/50 border border-green-500/30 rounded-3xl p-8 animate-in slide-in-from-top duration-300">
          {!user ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">
                Connectez-vous pour participer aux débats
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  type="button"
                  onClick={async () => {
                    const name = prompt("Entrez votre pseudo pour vous connecter :");
                    if (name !== null) await signInQuick(name);
                  }}
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-green-500/10 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" /> Connexion Rapide (1-clic)
                </button>
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  className="bg-zinc-850 hover:bg-zinc-800 border border-white/5 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" /> Se connecter avec Google
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Titre de votre sujet..."
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 font-black text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <textarea
                placeholder="Décrivez votre sujet en détail..."
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                rows={5}
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-auto">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Tags (séparés par virgules)..."
                    value={newPost.tags}
                    onChange={(e) =>
                      setNewPost({ ...newPost, tags: e.target.value })
                    }
                    className="w-full sm:w-64 bg-zinc-800/50 border border-white/5 rounded-xl pl-12 pr-6 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-[#22c55e] hover:bg-[#16a34a] text-black px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-green-500/10"
                >
                  Publier la discussion
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-white/5">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
              Chargement des discussions...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
            <MessageSquare className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
              {posts.length === 0
                ? "Aucune discussion publiée pour le moment"
                : "Aucune discussion trouvée"}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-zinc-900/40 hover:bg-zinc-900 transition-all border border-white/5 rounded-3xl p-8 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl rounded-full group-hover:bg-green-500/10 transition-all" />

              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-green-500/30 transition-all">
                    <User className="w-5 h-5 text-zinc-500 group-hover:text-green-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg tracking-tight group-hover:text-green-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      {post.authorName}
                      <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                      {getPostDate(post.createdAt)?.toLocaleDateString() ||
                        "Maintenant"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3">
                {post.content}
              </p>

              <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                <button
                  onClick={() => likePost(post.id)}
                  className="flex items-center gap-2.5 text-zinc-500 hover:text-green-500 transition-all group/btn"
                >
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-green-500/10 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black">{post.likesCount}</span>
                </button>

                <button
                  onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                  className={`flex items-center gap-2.5 transition-all group/btn ${expandedPostId === post.id ? "text-blue-500" : "text-zinc-500 hover:text-blue-500"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${expandedPostId === post.id ? "bg-blue-500/10" : "bg-white/5 group-hover/btn:bg-blue-500/10"}`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black">
                    {post.commentsCount}
                  </span>
                </button>
              </div>

              {expandedPostId === post.id && (
                <div className="mt-8 pt-8 border-t border-white/5 space-y-6 animate-in fade-in duration-200">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">
                    Commentaires ({post.commentsCount})
                  </h4>

                  {/* Liste des commentaires */}
                  <div className="space-y-4">
                    {loadingComments[post.id] ? (
                      <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Chargement des réponses...</p>
                    ) : !comments[post.id] || comments[post.id].length === 0 ? (
                      <p className="text-xs text-zinc-600 font-bold uppercase tracking-wider">Aucun commentaire. Soyez le premier à répondre !</p>
                    ) : (
                      comments[post.id].map((comment) => {
                        const isAI = comment.authorId === "antigravity-ai";
                        return (
                          <div 
                            key={comment.id} 
                            className={`p-4 rounded-2xl border text-left relative overflow-hidden ${
                              isAI 
                                ? "bg-blue-950/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]" 
                                : "bg-black/20 border-white/5"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4 mb-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isAI ? "text-blue-400 font-black" : "text-zinc-400"}`}>
                                {isAI ? "🪐 " : ""}{comment.authorName}
                                {isAI && (
                                  <span className="text-[8px] font-black bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded text-blue-400 uppercase">Agent IA</span>
                                )}
                              </span>
                              <span className="text-[9px] text-zinc-600 font-medium">
                                {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleTimeString() : "À l'instant"}
                              </span>
                            </div>
                            <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Formulaire d'ajout de commentaire */}
                  {user ? (
                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <input
                        type="text"
                        placeholder="Votre réponse (mentionnez @antigravity pour m'appeler)..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-grow bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!(commentInputs[post.id]?.trim())}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 active:scale-95 shadow-md shadow-blue-500/5 cursor-pointer"
                      >
                        Répondre
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-3">
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Connectez-vous pour commenter</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={async () => {
                            const name = prompt("Entrez votre pseudo pour commenter :");
                            if (name !== null) await signInQuick(name);
                          }}
                          className="bg-[#22c55e] hover:bg-[#16a34a] text-black px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <User className="w-3 h-3" /> Connexion Rapide
                        </button>
                        <button
                          type="button"
                          onClick={() => signInWithGoogle()}
                          className="bg-zinc-800 hover:bg-zinc-700 border border-white/5 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <User className="w-3 h-3" /> Google
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
