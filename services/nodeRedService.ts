
/**
 * Service pour interagir avec une instance Node-RED.
 */
export const sendToNodeRed = async (endpoint: string, data: any) => {
  // Dans Node-RED, l'UI est souvent sur le port 1880
  // On essaie de détecter dynamiquement l'URL de base
  const isDev = window.location.port === '5173';
  const NODE_RED_URL = isDev ? 'http://localhost:1880' : window.location.origin;
  
  try {
    const response = await fetch(`${NODE_RED_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Important pour le dev local
      body: JSON.stringify({
        ...data,
        source: 'GABdev_Platform',
        timestamp: new Date().toISOString()
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.warn("Lien Node-RED non établi. Vérifiez que le flux est déployé sur :", NODE_RED_URL + endpoint);
    return false;
  }
};
