import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Lecture de la configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error("❌ Fichier firebase-applet-config.json introuvable.");
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log(`🌱 Initialisation de Firebase avec le projet : ${firebaseConfig.projectId}...`);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const seedData = async () => {
  try {
    console.log("⏳ Initialisation des données de test Firestore...");

    // 1. Seed Groups
    const groupsRef = collection(db, 'groups');
    const groupsSnap = await getDocs(groupsRef);
    if (groupsSnap.empty) {
      console.log("➡️ Ajout des groupes communautaires...");
      await setDoc(doc(db, 'groups', 'gabdev-global'), {
        id: 'gabdev-global',
        name: 'GABdev Global Hub',
        description: 'Le coeur de la communaute tech gabonaise. Partages, tech-talks et networking.',
        memberCount: 0,
        category: 'general',
        createdAt: new Date().toISOString()
      });
      await setDoc(doc(db, 'groups', 'gabdev-iot'), {
        id: 'gabdev-iot',
        name: 'IoT & Systèmes Embarqués Gabon',
        description: 'Robotique, domotique et développement embarqué connecté au Gabon.',
        memberCount: 0,
        category: 'tech',
        createdAt: new Date().toISOString()
      });
      console.log("✅ Groupes créés.");
    } else {
      console.log("ℹ️ Les groupes existent déjà.");
    }

    // 2. Seed Resources (pour MBOLO-IA et l'onglet ressources)
    const resourcesRef = collection(db, 'resources');
    const resourcesSnap = await getDocs(resourcesRef);
    if (resourcesSnap.empty) {
      console.log("➡️ Ajout des ressources et guides...");
      const sampleResources = [
        {
          title: "Intégrer Airtel Money & Moov Money",
          description: "Guide complet pour intégrer le paiement par Mobile Money dans vos applications web et mobiles au Gabon.",
          tags: ["Airtel", "Moov", "Fintech", "Gabon", "API"]
        },
        {
          title: "Standardisation du Cloud au Gabon",
          description: "Recommandations et bonnes pratiques pour l'hébergement des données locales et la souveraineté numérique.",
          tags: ["Cloud", "Souveraineté", "Docker", "AWS", "Hébergement"]
        },
        {
          title: "Design System GABdev Figma",
          description: "Composants UI officiels de la marque GABdev pour accélérer le prototypage de vos applications.",
          tags: ["Design", "Figma", "UI", "UX", "Tailwind"]
        },
        {
          title: "Validation Numéro Gabonais (Regex)",
          description: "Snippet Regex et fonctions de validation pour vérifier les nouveaux numéros gabonais à 9 chiffres (062, 065, 074, 077, etc.).",
          tags: ["Regex", "JavaScript", "Validation", "TypeScript"]
        }
      ];

      for (const res of sampleResources) {
        await addDoc(resourcesRef, {
          ...res,
          createdAt: new Date().toISOString()
        });
      }
      console.log("✅ Ressources créées.");
    } else {
      console.log("ℹ️ Les ressources existent déjà.");
    }

    // 3. Seed Articles (GABdev Journal)
    const articlesRef = collection(db, 'articles');
    const articlesSnap = await getDocs(articlesRef);
    if (articlesSnap.empty) {
      console.log("➡️ Ajout des articles de blog...");
      const sampleArticles = [
        {
          title: "Le boom de la Fintech au Gabon : Enjeux et Opportunités",
          excerpt: "Analyse profonde de l'adoption du Mobile Money et des solutions de paiement pour le commerce électronique gabonais.",
          content: "L'écosystème de la Fintech au Gabon connaît une croissance sans précédent. Porté par un taux de pénétration élevé du téléphone mobile et l'adoption massive des services Airtel Money et Moov Money, le commerce en ligne décolle.\n\n### Les défis techniques\n\n1. **Stabilité des APIs** : Les développeurs locaux font face à des connexions instables ou à des documentations parfois partielles.\n2. **Sécurité des transactions** : L'implémentation de la double authentification (OTP) est primordiale pour rassurer les usagers.\n3. **Expérience utilisateur (UX)** : Simplifier le tunnel de paiement mobile pour réduire l'abandon de panier.\n\nLes opportunités sont immenses pour les développeurs gabonais capables de créer des passerelles unifiées et fiables.",
          imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop",
          authorName: "Ivan Ndoumba Nguia",
          category: "FINTECH",
          createdAt: new Date().toISOString()
        },
        {
          title: "Introduction aux architectures Serverless avec Firebase",
          excerpt: "Pourquoi le Serverless est idéal pour lancer des projets rapidement au Gabon avec des coûts d'infrastructure minimaux.",
          content: "Lancer un projet tech demande de la rapidité et de l'efficacité. Le modèle Serverless permet de se concentrer uniquement sur le code de l'application sans gérer de serveurs physiques ou de machines virtuelles.\n\n### Avantages majeurs pour les startups gabonaises :\n\n*   **Coût à l'usage** : Vous ne payez que lorsque votre code est exécuté. C'est parfait pour démarrer avec un budget serré.\n*   **Scalabilité automatique** : Que vous ayez 10 ou 10 000 utilisateurs, Firebase gère la charge automatiquement.\n*   **Vitesse de développement** : Des services comme l'authentification et Firestore vous font gagner des semaines de travail.",
          imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
          authorName: "Elite Hacker",
          category: "CLOUD",
          createdAt: new Date().toISOString()
        }
      ];

      for (const art of sampleArticles) {
        await addDoc(articlesRef, art);
      }
      console.log("✅ Articles créés.");
    } else {
      console.log("ℹ️ Les articles existent déjà.");
    }

    // 4. Seed Posts (Forum Discussions)
    const postsRef = collection(db, 'posts');
    const postsSnap = await getDocs(postsRef);
    if (postsSnap.empty) {
      console.log("➡️ Ajout des discussions de forum...");
      const samplePosts = [
        {
          authorId: "seed-user-1",
          authorName: "Hervé Mba",
          title: "Quelle regex utilisez-vous pour valider les nouveaux numéros à 9 chiffres ?",
          content: "Bonjour à tous, depuis le passage au plan de numérotation à 9 chiffres de l'ARCEP, je galère un peu à écrire une regex robuste pour valider les numéros Airtel (062, 065, etc.) et Moov (074, 077, etc.). Est-ce que quelqu'un a un snippet propre à partager ?",
          tags: ["Regex", "JavaScript", "Aide"],
          likesCount: 5,
          commentsCount: 0,
          createdAt: new Date().toISOString()
        },
        {
          authorId: "seed-user-2",
          authorName: "Aïcha Gabon",
          title: "Retours d'expérience sur l'utilisation du cloud souverain (local)",
          content: "Hello la communauté ! Pour un projet gouvernemental, nous étudions l'hébergement des données exclusivement sur le territoire national. Avez-vous des retours sur les hébergeurs locaux ou les architectures adaptées ?",
          tags: ["Cloud", "Sécurité", "Débat"],
          likesCount: 8,
          commentsCount: 0,
          createdAt: new Date().toISOString()
        }
      ];

      for (const post of samplePosts) {
        await addDoc(postsRef, post);
      }
      console.log("✅ Forum initialisé.");
    } else {
      console.log("ℹ️ Le forum contient déjà des messages.");
    }

    // 5. Seed Showcase Projects
    const projectsRef = collection(db, 'projects');
    const projectsSnap = await getDocs(projectsRef);
    if (projectsSnap.empty) {
      console.log("➡️ Ajout de projets vitrines...");
      const sampleProjects = [
        {
          authorId: "seed-user-1",
          authorName: "Ivan Ndoumba Nguia",
          name: "Plateforme GABdev v2.5",
          description: "La plateforme communautaire de l'élite tech gabonaise, regroupant un forum, un showcase de projets, un assistant IA et un hub d'apprentissage en ligne.",
          demoUrl: "http://localhost:3000",
          githubUrl: "https://github.com/gabdev/gabdev-platform",
          imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=800&auto=format&fit=crop",
          tags: ["React", "Vite", "Firebase", "NodeJS"],
          createdAt: new Date().toISOString()
        },
        {
          authorId: "seed-user-3",
          authorName: "Grace Ovono",
          name: "Lib Gabon Pay (Airtel/Moov SDK)",
          description: "Un SDK léger en Node.js et Dart/Flutter pour simplifier l'intégration des flux de paiement par push USSD Airtel et Moov.",
          demoUrl: "https://pub.dev",
          githubUrl: "https://github.com/grace/lib-gabon-pay",
          imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
          tags: ["Fintech", "SDK", "Flutter", "NodeJS"],
          createdAt: new Date().toISOString()
        }
      ];

      for (const proj of sampleProjects) {
        await addDoc(projectsRef, proj);
      }
      console.log("✅ Projets vitrines créés.");
    } else {
      console.log("ℹ️ Les projets existent déjà.");
    }

    console.log("\n🌱 Base de données Firestore initialisée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données :", error);
  }
};

seedData();
