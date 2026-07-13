import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  serverTimestamp,
} from "firebase/firestore";
import {
  Calendar,
  ChevronRight,
  Download,
  Mail,
  Newspaper,
  Share2,
  User,
} from "lucide-react";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  authorName: string;
  category: string;
  createdAt: any;
}

const LOCAL_ARTICLES: Article[] = [
  {
    id: "gabdev-vision",
    title: "Bâtir le Gabon Digital : La Vision de GABdev",
    excerpt: "Découvrez notre manifeste pour propulser l'élite technologique gabonaise au sommet de l'innovation africaine.",
    content: "GABdev est né d'une conviction simple : le Gabon regorge de talents technologiques exceptionnels, mais souvent dispersés et sous-représentés. Notre vision est de bâtir un hub d'excellence numérique connecté, capable de concevoir, développer et déployer des solutions souveraines adaptées à notre continent.\n\n### Nos 3 Piliers Fondateurs :\n\n1. **Fédérer les Talents** : Créer un réseau d'élite où développeurs, designers et entrepreneurs collaborent sur des projets innovants et partagent des ressources techniques avancées (design systems, SDKs de paiement, etc.).\n2. **Propulser par la Pratique** : Finie la théorie pure ! L'Académie GABdev forme par l'expérience et le développement concret de cas d'usage locaux comme l'automatisation financière, l'intégration des API Mobile Money (Airtel, Moov) et les architectures légères adaptées aux réalités réseaux.\n3. **Souveraineté Technologique** : Permettre aux PME et aux institutions locales d'accéder à des prestations techniques de niveau international, conçues localement avec fierté.\n\nEnsemble, écrivons le futur du numérique gabonais. Rejoignez le mouvement !",
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
    authorName: "Ivan Ndoumba Nguia",
    category: "VISION",
    createdAt: new Date(),
  }
];

const Blog: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(LOCAL_ARTICLES);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("TOUS");

  const getArticleDate = (createdAt: Article["createdAt"]) => {
    if (createdAt?.toDate) return createdAt.toDate();
    if (typeof createdAt === "string" || createdAt instanceof Date) {
      return new Date(createdAt);
    }
    return null;
  };

  const categories = [
    "TOUS",
    ...Array.from(
      new Set(
        articles
          .map((article) => article.category?.trim())
          .filter((category): category is string => Boolean(category)),
      ),
    ).sort((a, b) => a.localeCompare(b)),
  ];

  const filteredArticles =
    activeCategory === "TOUS"
      ? articles
      : articles.filter((article) => article.category === activeCategory);

  useEffect(() => {
    const articlesQuery = query(
      collection(db, "articles"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(
      articlesQuery,
      (snapshot: QuerySnapshot) => {
        const data = snapshot.docs.map(
          (entry: QueryDocumentSnapshot) =>
            ({ id: entry.id, ...entry.data() }) as Article,
        );
        const combined = [...data];
        LOCAL_ARTICLES.forEach(local => {
          if (!combined.some(art => art.id === local.id)) {
            combined.push(local);
          }
        });
        setArticles(combined);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore loading error, using local fallback articles:", error);
        setArticles(LOCAL_ARTICLES);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await addDoc(collection(db, "newsletter"), {
        email,
        subscribedAt: serverTimestamp(),
      });
      setSubscribed(true);
      setEmail("");
    } catch (error) {
      console.error("Newsletter error:", error);
    }
  };

  const exportToPDF = (article: Article) => {
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text(article.title, 10, 20);
    pdf.setFontSize(12);
    pdf.text(
      `Par ${article.authorName} - ${getArticleDate(article.createdAt)?.toLocaleDateString() || ""}`,
      10,
      30,
    );
    pdf.text(article.content, 10, 40, { maxWidth: 180 });
    pdf.save(`${article.title}.pdf`);
  };

  const shareArticle = (title: string) => {
    const url = window.location.href;
    const text = `Découvrez cet article sur GABdev : ${title}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {loading ? (
            <div className="bg-zinc-900/40 rounded-3xl p-12 text-center border border-white/5">
              <p className="font-black text-zinc-500 uppercase tracking-widest">
                Chargement des articles...
              </p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-zinc-900/40 rounded-3xl p-12 text-center border border-white/5">
              <Newspaper className="w-16 h-16 mx-auto mb-6 text-zinc-700" />
              <p className="font-black text-zinc-500 uppercase tracking-widest">
                {articles.length === 0
                  ? "Les premiers articles arrivent bientôt..."
                  : "Aucun article ne correspond à ce thème"}
              </p>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <article
                key={article.id}
                className="group bg-zinc-900/50 rounded-[40px] overflow-hidden border border-white/5 hover:border-green-500/30 transition-all duration-500"
              >
                <div className="relative h-[400px] overflow-hidden">
                  <img
                    src={
                      article.imageUrl ||
                      `https://picsum.photos/seed/${article.id}/1200/600`
                    }
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-green-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg">
                      {article.category || "EXPERT"}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight leading-tight group-hover:text-green-400 transition-colors">
                      {article.title}
                    </h2>
                    <div className="flex items-center gap-6 text-zinc-400 text-xs font-black uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-green-500" />
                        {article.authorName}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-500" />
                        {getArticleDate(article.createdAt)?.toLocaleDateString() ||
                          "Aujourd'hui"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-12">
                  <p className="text-zinc-400 text-lg leading-relaxed mb-8 font-medium italic">
                    "{article.excerpt}"
                  </p>

                  <div className="prose prose-invert prose-green mb-10 max-w-none leading-relaxed text-zinc-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => shareArticle(article.title)}
                        className="p-3 bg-white/5 hover:bg-zinc-800 rounded-2xl transition-all group/btn"
                        title="Partager sur Twitter"
                      >
                        <Share2 className="w-5 h-5 group-hover/btn:text-green-500 transition-colors" />
                      </button>
                      <button
                        onClick={() => exportToPDF(article)}
                        className="p-3 bg-white/5 hover:bg-zinc-800 rounded-2xl transition-all group/btn"
                        title="Exporter en PDF"
                      >
                        <Download className="w-5 h-5 group-hover/btn:text-green-500 transition-colors" />
                      </button>
                    </div>
                    <button className="flex items-center gap-2 text-green-500 font-black text-xs uppercase tracking-widest hover:translate-x-2 transition-transform">
                      Lire la suite <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-green-500/20 to-zinc-900 border border-green-500/20 rounded-[32px] p-8">
            <Mail className="w-10 h-10 text-green-500 mb-6" />
            <h3 className="text-2xl font-black mb-4 tracking-tight">
              Restez à l'affût
            </h3>
            <p className="text-zinc-400 text-sm mb-8 font-medium">
              Rejoignez 500+ développeurs gabonais. Recevez l'essentiel de la
              tech chaque lundi.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-500/20"
                >
                  S'abonner
                </button>
              </form>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
                <p className="text-green-500 font-black text-xs uppercase tracking-widest">
                  Merci ! Inscription validée.
                </p>
              </div>
            )}
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-[32px] p-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-6">
              Filtrer par thème
            </h3>
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-zinc-800 rounded-2xl text-left transition-all group"
                >
                  <span
                    className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                      activeCategory === category
                        ? "text-green-500"
                        : "text-zinc-400 group-hover:text-green-500"
                    }`}
                  >
                    {category}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
