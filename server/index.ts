import cors from "cors";
import express from "express";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../shared/protocol.js";
import { RoomManager } from "./room-manager.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = process.cwd();
const distDir = path.resolve(rootDir, "dist");
const port = Number(process.env.PORT ?? 3001);

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // SPA handles its own CSP
    crossOriginEmbedderPolicy: false
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true, now: Date.now() });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get("/{*path}", (request, response, next) => {
    if (request.path.startsWith("/socket.io")) {
      next();
      return;
    }
    response.sendFile(path.resolve(distDir, "index.html"));
  });
}

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*"
  },
  maxHttpBufferSize: 2e6
});

const rooms = new RoomManager(io);

io.on("connection", (socket) => {
  socket.on("create_room", (payload, callback) => {
    callback(rooms.createRoom(socket.id, payload));
  });

  socket.on("join_room", (payload, callback) => {
    callback(rooms.joinRoom(socket.id, payload));
  });

  socket.on("update_profile", (payload) => rooms.updateProfile(payload));
  socket.on("update_settings", (payload) => rooms.updateSettings(payload));
  socket.on("toggle_ready", (payload) => rooms.toggleReady(payload));
  socket.on("start_game", (payload) => rooms.startGame(payload));
  socket.on("confirm_role", (payload) => rooms.confirmRole(payload));
  socket.on("ready_for_next_phase", (payload) => rooms.readyForNextPhase(payload));
  socket.on("drawing_stroke", (payload) => rooms.drawingStroke(payload));
  socket.on("commit_stroke", (payload) => rooms.commitStroke(payload));
  socket.on("undo_stroke", (payload) => rooms.undoStroke(payload));
  socket.on("clear_drawing", (payload) => rooms.clearDrawing(payload));
  socket.on("cast_vote", (payload) => rooms.castVote(payload));
  socket.on("send_reaction", (payload) => rooms.sendReaction(payload));
  socket.on("point_finger", (payload) => rooms.pointFinger(payload));
  socket.on("chat_message", (payload) => rooms.chatMessage(payload));
  socket.on("submit_mr_white_guess", (payload) => rooms.submitMrWhiteGuess(payload));
  socket.on("replay_game", (payload) => rooms.replayGame(payload));
  socket.on("return_to_lobby", (payload) => rooms.returnToLobby(payload));
  socket.on("kick_player", (payload) => rooms.kickPlayer(payload));
  socket.on("quick_play", (payload, callback) => {
    callback(rooms.quickPlay(socket.id, payload));
  });
  socket.on("cancel_quick_play", (payload) => rooms.cancelQuickPlay(payload));
  socket.on("list_public_rooms", (callback) => callback(rooms.listPublicRooms()));
  socket.on("disconnect", () => rooms.handleDisconnect(socket.id));
});

server.listen(port, () => {
  console.log(`[inkognito] server listening on http://localhost:${port}`);
});

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[inkognito] ${signal} received — shutting down`);
  io.close();
  server.close(() => {
    console.log("[inkognito] server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
