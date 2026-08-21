import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const server = http.createServer();
const wss = new WebSocketServer({ server });

const SECRET_KEY = "MONCODESECRET123";

wss.on("connection", function connection(ws, req) {
  const urlParams = new URLSearchParams(req.url.split("?")[1]);
  const clientKey = urlParams.get("key");

  if (clientKey !== SECRET_KEY) {
    console.log("Connexion rejetee (mauvaise cle)");
    ws.close();
    return;
  }

  console.log("Membre connecte");

  ws.on("message", function incoming(message) {
    // On envoie le message à TOUS les clients, Y COMPRIS l'expéditeur
    // pour que celui qui poste l'offre la voie apparaître immédiatement sur son écran.
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Serveur WebSocket demarre sur le port " + PORT);
});
