import { useEffect, useRef } from "react";
import type { YoutubeAnalysis } from "../../../pages/VideoAnalysisPage"; // Sesuaikan path

export function useAnalysisWebSocket(
  user: any,
  setAnalyses: React.Dispatch<React.SetStateAction<YoutubeAnalysis[]>>
) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = API_URL.startsWith("http")
        ? API_URL.replace(/^http(s?)/, wsProtocol) + "/ws"
        : `${wsProtocol}://${window.location.host}/ws`;

      console.log("[WS] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] Connected. Sending authentication token...");
        ws.send(JSON.stringify({ type: "auth", token }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "auth_success") {
            console.log("[WS] Authentication successful!");
            return;
          }

          if (message.type === "progress") {
            const { analysisId, status, progress, progressMessage, summary, improvementSuggestions, errorMessage } = message;
            
            setAnalyses((prevAnalyses) =>
              prevAnalyses.map((item) => {
                if (item.id === analysisId) {
                  return {
                    ...item,
                    status,
                    progress,
                    progressMessage,
                    summary: summary || item.summary,
                    improvementSuggestions: improvementSuggestions || item.improvementSuggestions,
                    errorMessage: errorMessage || item.errorMessage,
                    updatedAt: Date.now(),
                  };
                }
                return item;
              })
            );
          }
        } catch (err) {
          console.error("[WS] Error parsing message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log("[WS] Connection closed. Code:", event.code, "Reason:", event.reason);
        setTimeout(() => {
          if (localStorage.getItem("auth_token")) {
            console.log("[WS] Reconnecting...");
            connectWebSocket();
          }
        }, 5000);
      };

      ws.onerror = (err) => {
        console.error("[WS] Socket encountered error:", err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user, setAnalyses]);
}