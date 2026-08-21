import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const server = http.createServer();
const wss = new WebSocketServer({ server });

// ⚠️ Change ce code par un mot de passe complexe que toi et tes amis connaissez
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
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Serveur WebSocket demarre sur le port " + PORT);
});
