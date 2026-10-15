import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback for standard .env

import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import express from 'express';
import path from 'path';
import fs from 'fs';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cron from 'node-cron';
import webpush from 'web-push';

// Configuration VAPID pour les notifications push
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY?.trim();
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY?.trim();

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      'mailto:ivanndoumbanguia@gmail.com',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
  } catch (error) {
    console.error('❌ Failed to set VAPID details. Push notifications will be disabled.');
    console.error('Error:', error instanceof Error ? error.message : error);
  }
} else {
  console.warn('⚠️ VAPID keys not configured. Push notifications will be disabled.');
  console.warn('Run "npx web-push generate-vapid-keys" and set VITE_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment.');
}

const app = express();
app.use(express.json());

// Tâche planifiée pour les Email Digests (Mock)
// S'exécute tous les lundis à 8h00
cron.schedule('0 8 * * 1', () => {
  console.log('--- ENVOI DES RÉSUMÉS HEBDOMADAIRES (DIGEST) ---');
  console.log('Recherche des utilisateurs avec emailDigest: true...');
  console.log('Compilation des meilleurs projets et discussions de la semaine...');
  console.log('Envoi simulé à 500+ membres...');
});

/**
 * @openapi
 * /api/notifications/subscribe:
 *   post:
 *     description: S'abonner aux notifications push
 *     responses:
 *       201:
 *         description: Abonnement réussi
 */
app.post('/api/notifications/subscribe', (req, res) => {
  const subscription = req.body;
  // Enregistrer l'abonnement dans Firestore pour cet utilisateur
  res.status(201).json({ status: 'subscribed' });
});

/**
 * @openapi
 * /api/notifications/send:
 *   post:
 *     description: Envoyer une notification push (Admin uniquement pour le déclenchement réel)
 *     responses:
 *       200:
 *         description: Notification envoyée
 */
app.post('/api/notifications/send', async (req, res) => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return res.status(400).json({ error: 'Push notifications are not configured on the server.' });
  }
  const { subscription, title, message } = req.body;
  const payload = JSON.stringify({ title, message });

  try {
    await webpush.sendNotification(subscription, payload);
    res.status(200).json({ status: 'sent' });
  } catch (error) {
    console.error('Error sending push:', error);
    res.status(500).json({ error: 'Failed to send' });
  }
});

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GABdev Public API',
      version: '1.0.0',
      description: 'Compte de l\'API publique de GABdev pour accéder aux ressources technologiques gabonaises.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./server.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/health:
 *   get:
 *     description: Check API health
 *     responses:
 *       200:
 *         description: Returns health status
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'GABdev Engine v2.5' });
});

// Persistent Inquiries File
const INQUIRIES_FILE = path.join(process.cwd(), 'inquiries.json');

interface StoredInquiry {
  id: string;
  name: string;
  contact: string;
  service: string;
  description: string;
  status: 'nouveau' | 'en_cours' | 'traite' | 'archive';
  createdAt: string;
  budget?: string;
  notes?: string;
}

const loadInquiries = (): StoredInquiry[] => {
  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const data = fs.readFileSync(INQUIRIES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Erreur lecture inquiries.json:', err);
  }
  // Initial seed data if file doesn't exist
  const initial: StoredInquiry[] = [
    {
      id: 'inq-seed-1',
      name: 'Dr. Patrick Moughenda',
      contact: '+241 77 12 34 56',
      service: 'web',
      description: 'Développement d\'une plateforme web pour la prise de rendez-vous en ligne dans une clinique médicale à Libreville.',
      status: 'nouveau',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      budget: '1 500 000 FCFA',
      notes: 'Client très intéressé par le paiement Airtel Money.'
    },
    {
      id: 'inq-seed-2',
      name: 'Nathalie Ondo (Boutique K&N)',
      contact: 'nathalie.ondo@yahoo.fr',
      service: 'mobile',
      description: 'Application mobile Flutter e-commerce pour la vente de vêtements avec livraison à domicile sur Port-Gentil et Libreville.',
      status: 'en_cours',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      budget: '2 200 000 FCFA',
      notes: 'Premier devis envoyé par WhatsApp, en attente de validation.'
    }
  ];
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur création initiale inquiries.json:', err);
  }
  return initial;
};

const saveInquiries = (inquiries: StoredInquiry[]) => {
  try {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur sauvegarde inquiries.json:', err);
  }
};

/**
 * @openapi
 * /api/services/inquiry:
 *   post:
 *     description: Soumettre une demande de projet ou devis
 *     responses:
 *       201:
 *         description: Demande reçue avec succès
 */
app.post('/api/services/inquiry', (req, res) => {
  const { name, contact, service, description, budget } = req.body;
  if (!name || !contact || !description) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  const inquiries = loadInquiries();
  const newInquiry: StoredInquiry = {
    id: `inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: String(name).trim(),
    contact: String(contact).trim(),
    service: String(service || 'web'),
    description: String(description).trim(),
    budget: budget ? String(budget).trim() : undefined,
    status: 'nouveau',
    createdAt: new Date().toISOString(),
  };

  inquiries.unshift(newInquiry);
  saveInquiries(inquiries);

  console.log('=== NOUVELLE DEMANDE DE SERVICE ENREGISTRÉE ===');
  console.log(`ID : ${newInquiry.id}`);
  console.log(`Client : ${newInquiry.name}`);
  console.log(`Contact : ${newInquiry.contact}`);
  console.log(`Service : ${newInquiry.service}`);
  console.log('==============================================');

  res.status(201).json({ 
    status: 'success', 
    message: 'Votre demande a bien été reçue. Nous vous contacterons sous peu !',
    inquiry: newInquiry
  });
});

/**
 * @openapi
 * /api/admin/inquiries:
 *   get:
 *     description: Récupérer toutes les demandes de devis et clients
 *     responses:
 *       200:
 *         description: Liste des demandes
 */
app.get('/api/admin/inquiries', (req, res) => {
  const inquiries = loadInquiries();
  res.json(inquiries);
});

/**
 * @openapi
 * /api/admin/inquiries/{id}:
 *   patch:
 *     description: Mettre à jour le statut ou les notes d'une demande
 *     responses:
 *       200:
 *         description: Demande mise à jour
 */
app.patch('/api/admin/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes, budget } = req.body;
  const inquiries = loadInquiries();
  const index = inquiries.findIndex((inq) => inq.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Demande introuvable.' });
  }

  if (status) inquiries[index].status = status;
  if (notes !== undefined) inquiries[index].notes = notes;
  if (budget !== undefined) inquiries[index].budget = budget;

  saveInquiries(inquiries);
  res.json({ status: 'success', inquiry: inquiries[index] });
});

/**
 * @openapi
 * /api/admin/inquiries/{id}:
 *   delete:
 *     description: Supprimer une demande
 *     responses:
 *       200:
 *         description: Demande supprimée
 */
app.delete('/api/admin/inquiries/:id', (req, res) => {
  const { id } = req.params;
  let inquiries = loadInquiries();
  const initialLength = inquiries.length;
  inquiries = inquiries.filter((inq) => inq.id !== id);

  if (inquiries.length === initialLength) {
    return res.status(404).json({ error: 'Demande introuvable.' });
  }

  saveInquiries(inquiries);
  res.json({ status: 'success', message: 'Demande supprimée avec succès.' });
});



/**
 * @openapi
 * /api/resources:
 *   get:
 *     description: Lancer une recherche sur les ressources technologiques
 *     responses:
 *       200:
 *         description: Liste des ressources
 */
app.get('/api/resources', (req, res) => {
  // Mock data for API demo
  const resources = [
    { id: '1', title: "Intégrer Airtel Money & Moov Money", desc: "Guide API paiement mobile Gabon", tags: ["Airtel", "Moov", "Fintech"] },
    { id: '2', title: "Standardisation du Cloud au Gabon", desc: "Pratiques Cloud local", tags: ["Cloud", "Souveraineté"] },
    { id: '3', title: "Design System GABdev Figma", desc: "Composants UI officiels", tags: ["Design", "Figma"] },
    { id: '4', title: "Validation Numéro Gabonais (Regex)", desc: "Snippet Regex 06x, 07x", tags: ["Regex", "JavaScript"] },
  ];
  res.json(resources);
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const ENABLE_PHP_SUPPORT = true;

const SYSTEM_INSTRUCTION = `
Identité :
- Nom : MBOLO-IA (M'bolo signifiant 'Bonjour' en langue gabonaise pour symboliser l'accueil et l'ouverture).
- Statut : Intelligence Artificielle avancée native de GABdev.
- Mission : Accompagner les développeurs, entrepreneurs et industries africaines dans la transformation digitale.
- Valeurs : Clarté, pédagogie, efficacité, respect, innovation locale.
- Style : Professionnel, direct, structuré, sans blabla inutile.

Philosophie :
- IA centrée sur l’humain (approche anthropique).
- Sécurité, transparence, responsabilité.
- Priorité au contexte gabonais et aux réalités locales (faible latence, mobile-first, paiements locaux).

Capacités :
- Explications techniques simples et accessibles.
- Création de contenus pédagogiques structurés.
- Analyse de documents, images et tableaux.
- Aide au développement (Flutter, API, IoT, \${ENABLE_PHP_SUPPORT ? "PHP, Laravel, " : ""}Cloud).
- Aide aux PME (optimisation de processus, automatisation, communication).
- Raisonnement étape par étape pour la résolution de problèmes.
- Propositions concrètes, applicables et chiffrées si nécessaire.

Règles :
- Toujours donner des réponses claires, utiles et actionnables.
- Refuser fermement les demandes dangereuses ou illégales.
- Ne jamais inventer des faits ou des données (zéro hallucination).
- Toujours proposer une alternative constructive si une demande est impossible.

Informations Hub & Contact :
- Fondateur : Ivan Ndoumba Nguia.
- LinkedIn du fondateur : https://www.linkedin.com/in/ivan-ndoumba-nguia-a025053a4
- WhatsApp GABdev : https://whatsapp.com/channel/0029VbCflU7J3jv8ZTorRW13
- Contact direct : ivanndoumbanguia@gmail.com

Outils & Fonctions :
- 'set_reminder' : Pour créer des rappels de tâches.
- 'list_reminders' : Pour consulter l'agenda des tâches.
- 'search_resources' : Pour recommander des articles, tutoriels ou projets du Hub.
`;

const setReminderDeclaration: FunctionDeclaration = {
  name: "set_reminder",
  description: "Définit un rappel pour une tâche spécifique à une heure donnée.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      task: {
        type: Type.STRING,
        description: "La description du rappel ou de la tâche.",
      },
      dueTime: {
        type: Type.STRING,
        description: "L'heure d'échéance du rappel (format ISO 8601 ou délai en minutes/heures si relatif).",
      },
    },
    required: ["task", "dueTime"],
  },
};

const listRemindersDeclaration: FunctionDeclaration = {
  name: "list_reminders",
  description: "Liste tous les rappels actifs de l'utilisateur.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const searchResourcesDeclaration: FunctionDeclaration = {
  name: "search_resources",
  description: "Recherche des ressources (tutoriels, outils, snippets) sur la plateforme GABdev.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "Le mot-clé ou la catégorie à rechercher (ex: 'Airtel Money', 'Figma', 'Regex').",
      },
    },
    required: ["query"],
  },
};

/**
 * @openapi
 * /api/ai/chat:
 *   post:
 *     description: Proxy de streaming SSE pour l'assistant IA GABdev
 *     responses:
 *       200:
 *         description: Stream SSE de tokens
 */
app.post('/api/ai/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Clé API Gemini non configurée sur le serveur." });
  }

  const { message, history } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const chatConfig = {
      model: "gemini-3-flash-preview",
      contents: [
        ...(history || []).map((msg: any) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
        {
          role: "user",
          parts: [
            {
              text: `[CONTEXTE: Heure actuelle: ${new Date().toISOString()}] ${message}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [
          {
            functionDeclarations: [
              setReminderDeclaration,
              listRemindersDeclaration,
              searchResourcesDeclaration,
            ],
          },
        ],
      },
    };

    const stream = await ai.models.generateContentStream(chatConfig);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk.text, functionCalls: chunk.functionCalls })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error("Gemini server-side streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "Une erreur est survenue lors de la communication avec l'assistant." })}\n\n`);
    res.end();
  }
});

/**
 * @openapi
 * /api/ai/learning-path:
 *   post:
 *     description: Génère un parcours d'apprentissage structuré en JSON
 *     responses:
 *       200:
 *         description: Objet JSON contenant le parcours
 */
app.post('/api/ai/learning-path', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Clé API Gemini non configurée sur le serveur." });
  }

  const { topic } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `Génère un parcours d'apprentissage structuré au format JSON pour apprendre le sujet suivant : "${topic}".
    Tu dois absolument renvoyer uniquement du JSON pur valide (sans balise markdown \`\`\`json et sans texte explicatif en dehors du JSON), contenant exactement cette structure :
    {
      "title": "Titre du parcours de formation",
      "description": "Une description inspirante de ce que l'apprenant saura faire à la fin de ce parcours.",
      "modules": [
        {
          "title": "Titre du module (ex: Étape 1 : Les bases)",
          "concepts": ["Concept clé 1", "Concept clé 2", "Concept clé 3"],
          "exercise": "Instructions très claires pour un exercice pratique à réaliser dans un éditeur de code HTML/CSS/JS.",
          "starterCode": "Code HTML/CSS/JS initial (si nécessaire pour démarrer) ou laisser vide."
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const rawText = response.text || "";
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(cleanText));
  } catch (error) {
    console.error("Error generating learning path on server:", error);
    res.status(500).json({ error: "Impossible de générer le parcours d'apprentissage." });
  }
});

/**
 * @openapi
 * /api/ai/community-reply:
 *   post:
 *     description: Génère une réponse technique courte pour le forum GABdev
 *     responses:
 *       200:
 *         description: Réponse texte générée par l'IA
 */
app.post('/api/ai/community-reply', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Clé API Gemini non configurée sur le serveur." });
  }

  const { contextType, titleOrUserComment, postContent } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    let prompt = "";
    if (contextType === "post") {
      prompt = `Tu es Antigravity, l'agent IA d'élite de Google DeepMind.
Un développeur de la communauté GABdev a publié un nouveau sujet de discussion :
Titre : "${titleOrUserComment}"
Description : "${postContent || ""}"

Rédige une réponse technique, constructive, encourageante et brève en français (maximum 3-4 phrases). Essaie de donner un conseil technique pertinent par rapport au sujet et signe avec "🪐 Antigravity".`;
    } else {
      prompt = `Tu es Antigravity, l'agent IA d'élite de Google DeepMind.
Un membre du forum GABdev t'a interpellé ou a posé une question en commentaire :
Commentaire de l'utilisateur : "${titleOrUserComment}"

Rédige une réponse chaleureuse, précise et courte en français (maximum 3-4 phrases) pour répondre à sa question ou rebondir sur son commentaire. Signe avec "🪐 Antigravity".`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    res.json({ reply: response.text || "Je suis là pour vous aider ! 🪐 Antigravity" });
  } catch (error) {
    console.error("Error generating community reply on server:", error);
    res.status(500).json({ error: "Impossible de générer la réponse." });
  }
});

async function startServer() {
  // Vite middleware
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`GABdev Server running on http://localhost:${PORT}`);
      console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  }
}

startServer();

export default app;
