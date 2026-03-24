// server.js
// Entry point — wires all backend modules
// No memory import — stateless transmission

import "dotenv/config";
import http    from "http";
import express from "express";
import path    from "path";
import { fileURLToPath } from "url";

import { transmit }            from "./wintermute.js";
import { sculpt }              from "./sculptor.js";
import { start as startPulse } from "./pulse.js";
import { init as initSocket, broadcast } from "./socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT      = process.env.PORT || 3000;

const app    = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "../public")));
app.get("/health", (_, res) => res.json({ status: "transmitting" }));

initSocket(server);

async function doTransmit(mode = "voice") {
  try {
    const raw = await transmit(mode);
    if (!raw) return;

    const cluster = sculpt(raw, mode);
    if (!cluster) return;

    broadcast(cluster);
    console.log(`[${mode}] ${raw.replace(/\n/g, " / ")}`);
  } catch (err) {
    console.error("transmission error:", err.message);
  }
}

startPulse(doTransmit);

server.listen(PORT, () => {
  console.log(`wintermute: listening on port ${PORT}`);
});
