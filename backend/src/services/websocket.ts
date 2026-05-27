import { WebSocketServer, WebSocket } from "ws";
import { verify } from "hono/jwt";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

interface AuthenticatedSocket {
  ws: WebSocket;
  userId: string;
}

const activeSockets = new Set<AuthenticatedSocket>();

export function initWebSocket(wss: WebSocketServer) {
  wss.on("connection", (ws) => {
    let isAuthenticated = false;
    let userId: string | null = null;
    let socketInfo: AuthenticatedSocket | null = null;

    ws.on("message", async (message) => {
      try {
        const parsed = JSON.parse(message.toString());

        // Authenticate the connection via JWT token
        if (parsed.type === "auth" && parsed.token) {
          const payload = await verify(parsed.token, JWT_SECRET, { alg: "HS256" });
          userId = payload.sub as string;
          isAuthenticated = true;

          // Store the socket
          socketInfo = { ws, userId };
          activeSockets.add(socketInfo);

          ws.send(JSON.stringify({ type: "auth_success" }));
          console.log(`[WS] User ${userId} authenticated successfully.`);
          return;
        }

        if (!isAuthenticated) {
          ws.send(JSON.stringify({ type: "error", message: "Unauthorized. Please authenticate first." }));
          ws.close();
          return;
        }

        // Keepalive / Ping-pong
        if (parsed.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
          return;
        }
      } catch (err) {
        console.error("[WS] Error handling message:", err);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      if (socketInfo) {
        activeSockets.delete(socketInfo);
        console.log(`[WS] Connection closed for user ${userId}`);
      }
    });
  });

  console.log("[WS] WebSocket service initialized.");
}

// Function to broadcast a message to a specific user (since analyses are private!)
export function sendToUser(userId: string, data: any) {
  const payload = JSON.stringify(data);
  for (const socket of activeSockets) {
    if (socket.userId === userId && socket.ws.readyState === WebSocket.OPEN) {
      socket.ws.send(payload);
    }
  }
}

// Function to broadcast progress of a video analysis
export function broadcastProgress(
  userId: string,
  analysisId: string,
  status: "pending" | "processing" | "completed" | "failed",
  progress: number,
  progressMessage: string,
  extraData: any = {}
) {
  sendToUser(userId, {
    type: "progress",
    analysisId,
    status,
    progress,
    progressMessage,
    ...extraData,
  });
}
