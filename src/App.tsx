import { useEffect, useMemo } from "react";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { useGameStore } from "@/store/useGameStore";
import { HomeScreen } from "@/screens/HomeScreen";
import { LobbyScreen } from "@/screens/LobbyScreen";
import { RoleRevealScreen } from "@/screens/RoleRevealScreen";
import { GameScreen } from "@/screens/GameScreen";
import { FinalScreen } from "@/screens/FinalScreen";
import { Button } from "@/components/ui/Button";

export default function App() {
  const {
    init,
    autoJoinFromUrl,
    room,
    profile,
    loading,
    error,
    socketConnected,
    livePreviews,
    updateProfile,
    createRoom,
    joinRoom,
    updateSettings,
    toggleReady,
    startGame,
    confirmRole,
    readyForNextPhase,
    sendDrawingPreview,
    commitStroke,
    undoStroke,
    clearDrawing,
    castVote,
    sendReaction,
    pointFinger,
    sendChatMessage,
    submitMrWhiteGuess,
    replayGame,
    returnToLobby,
    clearError
  } = useGameStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!room) {
      autoJoinFromUrl();
    }
  }, [autoJoinFromUrl, room]);

  const selfPlayer = useMemo(
    () => room?.players.find((player) => player.id === room.selfId) ?? null,
    [room]
  );

  return (
    <div className="relative min-h-screen">
      <MeshBackground />
      {!room || !selfPlayer ? (
        <HomeScreen
          profile={profile}
          loading={loading}
          error={error}
          onProfileChange={updateProfile}
          onCreate={createRoom}
          onJoin={joinRoom}
        />
      ) : room.phase === "lobby" ? (
        <LobbyScreen
          room={room}
          selfPlayer={selfPlayer}
          onProfileChange={updateProfile}
          onUpdateSettings={updateSettings}
          onToggleReady={toggleReady}
          onStartGame={startGame}
          onSendChat={sendChatMessage}
        />
      ) : room.phase === "role_reveal" ? (
        <RoleRevealScreen room={room} selfPlayer={selfPlayer} onConfirm={confirmRole} />
      ) : room.phase === "final" ? (
        <FinalScreen
          room={room}
          selfPlayer={selfPlayer}
          onReplay={replayGame}
          onReturnToLobby={returnToLobby}
        />
      ) : (
        <GameScreen
          room={room}
          selfPlayer={selfPlayer}
          livePreviews={livePreviews}
          onPreview={sendDrawingPreview}
          onCommit={commitStroke}
          onUndo={undoStroke}
          onClear={clearDrawing}
          onReadyForNextPhase={readyForNextPhase}
          onReaction={sendReaction}
          onPointFinger={pointFinger}
          onSendChat={sendChatMessage}
          onVote={castVote}
          onSubmitGuess={submitMrWhiteGuess}
        />
      )}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto flex flex-col items-center gap-2">
          {!socketConnected || !room ? (
            <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-ink-300 backdrop-blur">
              {socketConnected ? "Temps reel connecte" : "Reconnexion..."}
            </div>
          ) : null}
          {error ? (
            <div className="flex items-center gap-3 rounded-2xl border border-neon-rose/25 bg-neon-rose/10 px-4 py-3 text-sm text-rose-100 shadow-rose">
              <span>{error}</span>
              <Button tone="ghost" onClick={clearError}>
                Fermer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
