"use client";

import { useState, useCallback, useRef } from "react";
import { ChatTurnItem } from "@/components/ChatBubble";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useStreamingChat() {
  const [turns, setTurns] = useState<ChatTurnItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopGenerating = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStatusMessage(null);
  }, []);

  const streamToBackend = async ({
    sessionId,
    prompt,
    targetTurnIndex,
    targetVersionIndex,
    enableSearch,
    enableMemory,
    temperature = 0.7,
  }: {
    sessionId: string;
    prompt: string;
    targetTurnIndex: number;
    targetVersionIndex: number;
    enableSearch: boolean;
    enableMemory: boolean;
    temperature?: number;
  }) => {
    // Abort any existing stream before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsStreaming(true);
    setStatusMessage("Thinking...");

    try {
      const response = await fetch(`${BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: prompt,
          enable_search: enableSearch,
          enable_memory: enableMemory,
          temperature,
        }),
        signal: controller.signal,
      });

      if (!response.body) throw new Error("No response body received");

      const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";
        let accumulatedThinking = "";
        let accumulatedSources: string | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          // Keep the last incomplete fragment in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.replace("data: ", "").trim();
              if (!jsonStr) continue;
              try {
                const parsed = JSON.parse(jsonStr);

              if (parsed.type === "status") {
                setStatusMessage(parsed.content);
              } else if (parsed.type === "sources") {
                accumulatedSources = JSON.stringify(parsed.content);
                setTurns((prev) =>
                  prev.map((t, tIdx) => {
                    if (tIdx !== targetTurnIndex) return t;
                    const updated = [...t.versions];
                    updated[targetVersionIndex] = {
                      ...updated[targetVersionIndex],
                      sources: accumulatedSources,
                    };
                    return { ...t, versions: updated };
                  })
                );
              } else if (parsed.type === "thinking") {
                accumulatedThinking += parsed.content;
                setTurns((prev) =>
                  prev.map((t, tIdx) => {
                    if (tIdx !== targetTurnIndex) return t;
                    const updated = [...t.versions];
                    updated[targetVersionIndex] = {
                      ...updated[targetVersionIndex],
                      thinking: accumulatedThinking,
                    };
                    return { ...t, versions: updated };
                  })
                );
              } else if (parsed.type === "token") {
                setStatusMessage(null);
                accumulatedText += parsed.content;
                setTurns((prev) =>
                  prev.map((t, tIdx) => {
                    if (tIdx !== targetTurnIndex) return t;
                    const updated = [...t.versions];
                    updated[targetVersionIndex] = {
                      ...updated[targetVersionIndex],
                      response: accumulatedText,
                    };
                    return { ...t, versions: updated };
                  })
                );
              } else if (parsed.type === "done") {
                setIsStreaming(false);
                setStatusMessage(null);
              } else if (parsed.type === "error") {
                console.error("Inference error:", parsed.content);
                setIsStreaming(false);
                setStatusMessage(null);
              }
            } catch (e) {
              console.error("Chunk parse error:", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Generation stopped by user.");
      } else {
        console.error("Stream transmission error:", error);
      }
    } finally {
      setIsStreaming(false);
      setStatusMessage(null);
      abortControllerRef.current = null;
    }
  };

  const sendNewMessage = useCallback(
    async ({
      sessionId,
      content,
      enableSearch,
      enableMemory,
      temperature = 0.7,
    }: {
      sessionId: string;
      content: string;
      enableSearch: boolean;
      enableMemory: boolean;
      temperature?: number;
    }) => {
      if (!content.trim()) return;

      const newTurn: ChatTurnItem = {
        id: crypto.randomUUID(),
        versions: [{ prompt: content, response: "", thinking: null, sources: null }],
        currentIndex: 0,
      };

      const targetTurnIndex = turns.length;
      setTurns((prev) => [...prev, newTurn]);

      await streamToBackend({
        sessionId,
        prompt: content,
        targetTurnIndex,
        targetVersionIndex: 0,
        enableSearch,
        enableMemory,
        temperature,
      });
    },
    [turns]
  );

  const editPromptTurn = useCallback(
    async ({
      sessionId,
      turnIndex,
      newPrompt,
      enableSearch,
      enableMemory,
      temperature = 0.7,
    }: {
      sessionId: string;
      turnIndex: number;
      newPrompt: string;
      enableSearch: boolean;
      enableMemory: boolean;
      temperature?: number;
    }) => {
      if (!newPrompt.trim()) return;

      const currentTurn = turns[turnIndex];
      const targetVersionIndex = currentTurn ? currentTurn.versions.length : 0;

      setTurns((prev) => {
        const truncated = prev.slice(0, turnIndex + 1);
        return truncated.map((t, idx) => {
          if (idx !== turnIndex) return t;
          return {
            ...t,
            versions: [
              ...t.versions,
              { prompt: newPrompt, response: "", thinking: null, sources: null },
            ],
            currentIndex: targetVersionIndex,
          };
        });
      });

      await streamToBackend({
        sessionId,
        prompt: newPrompt,
        targetTurnIndex: turnIndex,
        targetVersionIndex,
        enableSearch,
        enableMemory,
        temperature,
      });
    },
    [turns]
  );

  const navigateVersion = useCallback((turnIndex: number, newVersionIndex: number) => {
    setTurns((prev) =>
      prev.map((t, idx) => {
        if (idx !== turnIndex) return t;
        const validIndex = Math.max(0, Math.min(newVersionIndex, t.versions.length - 1));
        return { ...t, currentIndex: validIndex };
      })
    );
  }, []);

  return {
    turns,
    setTurns,
    isStreaming,
    statusMessage,
    sendNewMessage,
    editPromptTurn,
    navigateVersion,
    stopGenerating,
  };
}