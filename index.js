const WebSocket = require('ws');

// Utilisation des variables d'environnement (PORT est imposé par Render.com)
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.KEY || 'MONCODESECRET123'; // Doit correspondre à ton script Roblox

const wss = new WebSocket.Server({ port: PORT });

console.log(`[Serveur] Démarré avec succès sur le port ${PORT}`);

wss.on('connection', (ws, req) => {
    // 1. Vérification de la clé de sécurité (optionnelle mais recommandée)
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const key = urlParams.get('key');

    if (key !== SECRET_KEY) {
        console.log('[Serveur] Connexion rejetée : clé invalide');
        ws.close(1008, 'Unauthorized');
        return;
    }

    console.log('[Serveur] ✅ Nouveau client connecté');
    
    // 2. Confirmer la connexion au client Roblox
    ws.send(JSON.stringify({ type: 'connected' }));

    // 3. Réception des messages
    ws.on('message', (message) => {
        try {
            // On parse le message reçu du client Roblox
            const parsedData = JSON.parse(message);
            console.log(`[Serveur] 📩 Message reçu de type: ${parsedData.type}`);
            
            // DEBUG : Affiche les données reçues pour vérifier qu'elles ne sont pas vides
            if (parsedData.data) {
                console.log(`[Serveur] Données: Joueur=${parsedData.data.username}, Animal=${parsedData.data.animal}`);
            }

            // 4. Broadcast à TOUS les clients connectés (y compris l'expéditeur)
            // C'est CRUCIAL : on renvoie les données EXACTEMENT telles qu'elles ont été reçues
            const messageString = JSON.stringify(parsedData);
            
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageString);
                }
            });
        } catch (error) {
            console.error('[Serveur] ❌ Erreur lors du parsing JSON:', error);
        }
    });

    ws.on('close', () => {
        console.log('[Serveur] 🔴 Client déconnecté');
    });

    ws.on('error', (error) => {
        console.error('[Serveur] ⚠️ Erreur WebSocket:', error);
    });
});
