import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // Fallback for standard .env

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
    const { name, email, whatsapp, service, description, budget } = req.body;
    console.log('=== NOUVELLE DEMANDE DE SERVICE RECEVUE ===');
    console.log(`Client : ${name}`);
    console.log(`Email : ${email}`);
    console.log(`WhatsApp : ${whatsapp}`);
    console.log(`Service demandé : ${service}`);
    console.log(`Budget estimé : ${budget}`);
    console.log(`Description : ${description}`);
    console.log('==========================================');
    res.status(201).json({ 
      status: 'success', 
      message: 'Votre demande a bien été reçue. Nous vous contacterons sous peu !' 
    });
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

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GABdev Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

startServer();
