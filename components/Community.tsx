import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../services/firebase";
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

const Community: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ title: "", content: "", tags: "" });
  const [showEditor, setShowEditor] = useState(false);
  const [searching, setSearching] = useState("");

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
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.title || !newPost.content) return;

    try {
      await addDoc(collection(db, "posts"), {
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
      setNewPost({ title: "", content: "", tags: "" });
      setShowEditor(false);
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  const likePost = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, "posts", id), {
      likesCount: increment(1),
    });
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
            <div className="text-center py-8">
              <p className="text-zinc-400 font-bold mb-4 uppercase tracking-widest text-xs">
                Connectez-vous pour participer aux débats
              </p>
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

                <button className="flex items-center gap-2.5 text-zinc-500 hover:text-blue-500 transition-all group/btn">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/btn:bg-blue-500/10 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black">
                    {post.commentsCount}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Community;
