import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

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
- Aide au développement (Flutter, API, IoT, ${ENABLE_PHP_SUPPORT ? "PHP, Laravel, " : ""}Cloud).
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
  description:
    "Définit un rappel pour une tâche spécifique à une heure donnée.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      task: {
        type: Type.STRING,
        description: "La description du rappel ou de la tâche.",
      },
      dueTime: {
        type: Type.STRING,
        description:
          "L'heure d'échéance du rappel (format ISO 8601 ou délai en minutes/heures si relatif).",
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
  description:
    "Recherche des ressources (tutoriels, outils, snippets) sur la plateforme GABdev.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description:
          "Le mot-clé ou la catégorie à rechercher (ex: 'Airtel Money', 'Figma', 'Regex').",
      },
    },
    required: ["query"],
  },
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: "user" | "model"; text: string }[],
) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Clé API de l'assistant non configurée. Vérifiez .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const chatConfig = {
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map((msg) => ({
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

    return await ai.models.generateContentStream(chatConfig);
  } catch (error) {
    console.error("Assistant AI Error:", error);
    throw error;
  }
};

export const generateLearningPath = async (topic: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Clé API de l'assistant non configurée. Vérifiez .env.local");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
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
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating learning path:", error);
    throw error;
  }
};
