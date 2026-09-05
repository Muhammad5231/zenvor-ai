"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Globe, Brain, Send, Sliders, PanelLeftOpen, Plus, Square } from "lucide-react";
import {
  fetchModels,
  loadModel,
  fetchSessions,
  deleteSession,
  batchDeleteSessions,
  updateSession,
  fetchMessages,
  ModelInfo,
  SessionItem,
} from "@/lib/api";
import { SidebarHistory } from "@/components/SidebarHistory";
import { ModelSelector } from "@/components/ModelSelector";
import { SettingsModal } from "@/components/SettingsModal";
import { ChatTurnBubble } from "@/components/ChatBubble";
import { HomeHero } from "@/components/HomeHero";
import { useStreamingChat } from "@/hooks/useStreamingChat";

interface WorkspaceProps {
  initialChatId?: string;
}

export const Workspace: React.FC<WorkspaceProps> = ({ initialChatId }) => {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(initialChatId || "");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [activeModel, setActiveModel] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [enableMemory, setEnableMemory] = useState(true);
  const [temperature, setTemperature] = useState(0.7);
  const [gpuLayers, setGpuLayers] = useState(-1);
  const [contextSize, setContextSize] = useState(4096);
  const [inputPrompt, setInputPrompt] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    turns,
    setTurns,
    isStreaming,
    statusMessage,
    sendNewMessage,
    editPromptTurn,
    navigateVersion,
    stopGenerating,
  } = useStreamingChat();

  useEffect(() => {
    initApp();
  }, []);

  useEffect(() => {
    if (initialChatId) {
      loadSessionMessages(initialChatId);
    } else {
      setActiveSessionId("");
      setTurns([]);
    }
  }, [initialChatId]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, statusMessage]);

  const initApp = async () => {
    try {
      const [modelsData, sessionsData] = await Promise.all([
        fetchModels(),
        fetchSessions(),
      ]);
      setModels(modelsData.models);
      if (modelsData.active_model) {
        setActiveModel(modelsData.active_model);
      } else if (modelsData.models && modelsData.models.length > 0) {
        const first = modelsData.models[0].filename;
        setActiveModel(first);
        await loadModel(first, gpuLayers, contextSize);
      }
      setSessions(sessionsData);
      if (initialChatId) {
        loadSessionMessages(initialChatId);
      }
    } catch (e) {
      console.error("Init error:", e);
    }
  };

  const loadSessionMessages = async (id: string) => {
    setActiveSessionId(id);
    try {
      const rawMsgs = await fetchMessages(id);
      const groupedTurns: any[] = [];
      let currentTurn: any = null;
      for (const m of rawMsgs) {
        if (m.role === "user") {
          currentTurn = {
            id: m.id,
            versions: [{ prompt: m.content, response: "", thinking: null, sources: null }],
            currentIndex: 0,
          };
          groupedTurns.push(currentTurn);
        } else if (m.role === "assistant" && groupedTurns.length > 0) {
          const last = groupedTurns[groupedTurns.length - 1];
          last.versions[0].response = m.content;
          last.versions[0].thinking = m.thinking;
          last.versions[0].sources = m.sources;
        }
      }
      setTurns(groupedTurns);
    } catch (e) {
      console.error("Messages fetch error:", e);
    }
  };

  const handleSelectSession = (id: string) => {
    router.push(`/c/${id}`);
  };

  const handleNewChatClick = () => {
    setActiveSessionId("");
    setTurns([]);
    setInputPrompt("");
    router.push("/");
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      const remaining = sessions.filter((s) => s.id !== id);
      setSessions(remaining);
      if (activeSessionId === id) handleNewChatClick();
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchDelete = async (ids: string[]) => {
    try {
      await batchDeleteSessions(ids);
      const remaining = sessions.filter((s) => !ids.includes(s.id));
      setSessions(remaining);
      if (ids.includes(activeSessionId)) handleNewChatClick();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSession = async (id: string, data: { title?: string; is_pinned?: boolean }) => {
    try {
      await updateSession(id, data);
      const updated = await fetchSessions();
      setSessions(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const handleModelSwitch = async (filename: string) => {
    await loadModel(filename, gpuLayers, contextSize);
    setActiveModel(filename);
    const updated = await fetchModels();
    setModels(updated.models);
  };

  const handleSend = async () => {
    if (!inputPrompt.trim() || isStreaming) return;
    let targetId = activeSessionId;
    if (!targetId) {
      targetId = crypto.randomUUID();
      setActiveSessionId(targetId);
      window.history.pushState(null, "", `/c/${targetId}`);
    }
    const text = inputPrompt;
    setInputPrompt("");
    await sendNewMessage({
      sessionId: targetId,
      content: text,
      enableSearch,
      enableMemory,
      temperature,
    });
    setTimeout(async () => {
      try {
        const updated = await fetchSessions();
        setSessions(updated);
      } catch (e) {
        console.error(e);
      }
    }, 2500);
  };

  const handleApplySettings = async () => {
    if (activeModel) {
      try {
        await loadModel(activeModel, gpuLayers, contextSize);
      } catch (e) {
        console.error("Failed to apply model settings:", e);
      }
    }
  };

  const handleRegenerate = (turnIndex: number) => {
    const targetTurn = turns[turnIndex];
    if (!targetTurn) return;
    const promptToRetry = targetTurn.versions[targetTurn.currentIndex].prompt;
    editPromptTurn({
      sessionId: activeSessionId,
      turnIndex,
      newPrompt: promptToRetry,
      enableSearch,
      enableMemory,
      temperature,
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ffffff] dark:bg-[#18181a] text-[#18181b] dark:text-[#d1d2d6] transition-colors">
      <SidebarHistory
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChatClick={handleNewChatClick}
        onDeleteSession={handleDeleteSession}
        onBatchDelete={handleBatchDelete}
        onUpdateSession={handleUpdateSession}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-12 border-b border-[#e5e5e7] dark:border-[#222325] px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1 rounded text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] transition-colors"
                  title="Open sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNewChatClick}
                  className="p-1 rounded text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] transition-colors"
                  title="New chat"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </>
            )}
            <ModelSelector
              models={models}
              activeModel={activeModel}
              onSelectModel={handleModelSwitch}
            />
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-lg border border-[#e5e5e7] dark:border-[#28292d] text-[#71717a] dark:text-[#9b9da1] hover:text-[#18181b] dark:hover:text-[#ffffff] transition-colors"
            title="Model Hyperparameters"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          {!activeSessionId || turns.length === 0 ? (
            <HomeHero
              inputPrompt={inputPrompt}
              setInputPrompt={setInputPrompt}
              onSend={handleSend}
              enableSearch={enableSearch}
              setEnableSearch={setEnableSearch}
              enableMemory={enableMemory}
              setEnableMemory={setEnableMemory}
              isStreaming={isStreaming}
              onStop={stopGenerating}
            />
          ) : (
            turns.map((turn, idx) => (
              <ChatTurnBubble
                key={turn.id}
                turn={turn}
                turnIndex={idx}
                onEditPrompt={(tIdx, newPrompt) =>
                  editPromptTurn({
                    sessionId: activeSessionId,
                    turnIndex: tIdx,
                    newPrompt,
                    enableSearch,
                    enableMemory,
                    temperature,
                  })
                }
                onNavigateVersion={navigateVersion}
                onRegenerate={handleRegenerate}
                isStreaming={isStreaming}
                isLastTurn={idx === turns.length - 1}
              />
            ))
          )}
          <div ref={chatScrollRef} />
        </main>

        {activeSessionId && turns.length > 0 && (
          <footer className="p-4 relative">
            <div className="max-w-3xl mx-auto space-y-2">
              {isStreaming && (
                <div className="flex justify-center">
                  <button
                    onClick={stopGenerating}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2f3f5] dark:bg-[#26272b] border border-[#e5e5e7] dark:border-[#33353a] text-xs font-medium text-[#18181b] dark:text-[#ffffff] shadow-md hover:bg-[#e5e5e7] dark:hover:bg-[#33353a] transition-all"
                  >
                    <Square className="w-3 h-3 fill-current text-rose-500" />
                    <span>Stop generating</span>
                  </button>
                </div>
              )}

              <div className="rounded-2xl bg-[#f2f3f5] dark:bg-[#212224] border border-[#e5e5e7] dark:border-[#2d2e33] p-3 shadow-lg focus-within:border-[#4d6bfe] transition-all">
                <textarea
                  rows={2}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Message ZENVOR AI..."
                  className="w-full resize-none bg-transparent outline-none text-[15px] text-[#18181b] dark:text-[#ffffff] placeholder-[#73757d] font-sans"
                />

                <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e7] dark:border-[#2a2b2f]">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEnableSearch(!enableSearch)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        enableSearch
                          ? "bg-[#4d6bfe]/15 text-[#4d6bfe] border-[#4d6bfe]/40"
                          : "bg-transparent text-[#71717a] dark:text-[#9b9da1] border-[#d4d4d8] dark:border-[#36383e] hover:border-[#4d6bfe]"
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Search</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnableMemory(!enableMemory)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        enableMemory
                          ? "bg-[#4d6bfe]/15 text-[#4d6bfe] border-[#4d6bfe]/40"
                          : "bg-transparent text-[#71717a] dark:text-[#9b9da1] border-[#d4d4d8] dark:border-[#36383e] hover:border-[#4d6bfe]"
                      }`}
                    >
                      <Brain className="w-3 h-3" />
                      <span>Memory</span>
                    </button>
                  </div>

                  {isStreaming ? (
                    <button
                      onClick={stopGenerating}
                      className="p-1.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-sm"
                      title="Stop generating"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={!inputPrompt.trim()}
                      className="p-1.5 rounded-xl bg-[#4d6bfe] text-white hover:bg-[#3f5be0] disabled:opacity-30 transition-all shadow-sm"
                      title="Send prompt"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onApply={handleApplySettings}
        temperature={temperature}
        setTemperature={setTemperature}
        gpuLayers={gpuLayers}
        setGpuLayers={setGpuLayers}
        contextSize={contextSize}
        setContextSize={setContextSize}
      />
    </div>
  );
};