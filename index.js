const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.KEY || 'MONCODESECRET123';

const wss = new WebSocket.Server({ port: PORT });

console.log(`[Serveur] Démarré sur le port ${PORT}`);

wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const key = urlParams.get('key');

    if (key !== SECRET_KEY) {
        ws.close(1008, 'Unauthorized');
        return;
    }

    console.log('[Serveur] ✅ Client connecté');
    ws.send(JSON.stringify({ type: 'connected' }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[Serveur]  Type: ${data.type} | Joueur: ${data.data?.username} | Animal: ${data.data?.animal}`);
            
            // Broadcast à TOUS les clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } catch (error) {
            console.error('[Serveur] Erreur:', error);
        }
    });

    ws.on('close', () => {
        console.log('[Serveur] 🔴 Client déconnecté');
    });
});
