// socket.js
// WebSocket server — pure broadcast, clients are passive receivers

import { WebSocketServer } from "ws";

let wss = null;

export function init(server) {
  wss = new WebSocketServer({ server });
  wss.on("connection", (ws) => {
    ws.on("error", (err) => console.error("ws client error:", err.message));
  });
  console.log("socket: WebSocket server ready");
}

export function broadcast(clusterDescriptor) {
  if (!wss) return;
  const payload = JSON.stringify({ type: "transmission", cluster: clusterDescriptor });
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(payload);
  });
}

export function clientCount() {
  return wss ? wss.clients.size : 0;
}
