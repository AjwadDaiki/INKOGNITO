import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { MeshBackground } from "@/components/ui/MeshBackground";
import { useGameStore } from "@/store/useGameStore";
import { useI18n } from "@/i18n";
import { HomeScreen } from "@/screens/HomeScreen";
import { InviteJoinScreen } from "@/screens/InviteJoinScreen";
import { LobbyScreen } from "@/screens/LobbyScreen";
import { RoleRevealScreen } from "@/screens/RoleRevealScreen";
import { GameScreen } from "@/screens/GameScreen";
import { FinalScreen } from "@/screens/FinalScreen";
import { Button } from "@/components/ui/Button";
import { getRoomCodeFromUrl } from "@/lib/session";

export default function App() {
  const initI18n = useI18n((s) => s.init);
  const t = useI18n((s) => s.t);

  const {
    init,
    room,
    profile,
    loading,
    error,
    socketConnected,
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
    kickPlayer,
    quickPlay,
    cancelQuickPlay,
    clearError,
    publicRooms,
    createPublicRoom,
    fetchPublicRooms
  } = useGameStore(
    useShallow((state) => ({
      init: state.init,
      room: state.room,
      profile: state.profile,
      loading: state.loading,
      error: state.error,
      socketConnected: state.socketConnected,
      updateProfile: state.updateProfile,
      createRoom: state.createRoom,
      createPublicRoom: state.createPublicRoom,
      fetchPublicRooms: state.fetchPublicRooms,
      publicRooms: state.publicRooms,
      joinRoom: state.joinRoom,
      updateSettings: state.updateSettings,
      toggleReady: state.toggleReady,
      startGame: state.startGame,
      confirmRole: state.confirmRole,
      readyForNextPhase: state.readyForNextPhase,
      sendDrawingPreview: state.sendDrawingPreview,
      commitStroke: state.commitStroke,
      undoStroke: state.undoStroke,
      clearDrawing: state.clearDrawing,
      castVote: state.castVote,
      sendReaction: state.sendReaction,
      pointFinger: state.pointFinger,
      sendChatMessage: state.sendChatMessage,
      submitMrWhiteGuess: state.submitMrWhiteGuess,
      replayGame: state.replayGame,
      returnToLobby: state.returnToLobby,
      kickPlayer: state.kickPlayer,
      quickPlay: state.quickPlay,
      cancelQuickPlay: state.cancelQuickPlay,
      clearError: state.clearError
    }))
  );

  useEffect(() => {
    initI18n();
    init();
  }, [init, initI18n]);

  const selfPlayer = useMemo(
    () => room?.players.find((player) => player.id === room.selfId) ?? null,
    [room]
  );
  const inviteRoomCode = useMemo(() => (!room ? getRoomCodeFromUrl() : null), [room]);

  const screen = useMemo(() => {
    if (!room && inviteRoomCode) {
      return {
        key: "invite",
        node: (
          <InviteJoinScreen
            roomCode={inviteRoomCode}
            profile={profile}
            loading={loading}
            error={error}
            onProfileChange={updateProfile}
            onJoin={() => joinRoom(inviteRoomCode)}
          />
        )
      };
    }

    if (!room || !selfPlayer) {
      return {
        key: "home",
        node: (
          <HomeScreen
            profile={profile}
            loading={loading}
            error={error}
            publicRooms={publicRooms}
            onProfileChange={updateProfile}
            onCreate={createRoom}
            onCreatePublic={createPublicRoom}
            onJoin={joinRoom}
            onFetchPublicRooms={fetchPublicRooms}
            onQuickPlay={quickPlay}
            onCancelQuickPlay={cancelQuickPlay}
          />
        )
      };
    }

    if (room.phase === "lobby") {
      return {
        key: "lobby",
        node: (
          <LobbyScreen
            room={room}
            selfPlayer={selfPlayer}
            onUpdateSettings={updateSettings}
            onToggleReady={toggleReady}
            onStartGame={startGame}
            onSendChat={sendChatMessage}
            onKickPlayer={kickPlayer}
          />
        )
      };
    }

    if (room.phase === "role_reveal") {
      return {
        key: "role_reveal",
        node: <RoleRevealScreen room={room} selfPlayer={selfPlayer} onConfirm={confirmRole} />
      };
    }

    if (room.phase === "final") {
      return {
        key: "final",
        node: (
          <FinalScreen
            room={room}
            selfPlayer={selfPlayer}
            onReplay={replayGame}
            onReturnToLobby={returnToLobby}
          />
        )
      };
    }

    return {
      key: `game-${room.phase}`,
      node: (
        <GameScreen
          room={room}
          selfPlayer={selfPlayer}
          onPreview={sendDrawingPreview}
          onCommit={commitStroke}
          onUndo={undoStroke}
          onClear={clearDrawing}
          onReadyForNextPhase={readyForNextPhase}
          onReaction={sendReaction}
          onSendChat={sendChatMessage}
          onVote={castVote}
          onPointFinger={pointFinger}
          onSubmitGuess={submitMrWhiteGuess}
        />
      )
    };
  }, [
    room,
    selfPlayer,
    inviteRoomCode,
    profile,
    loading,
    error,
    updateProfile,
    createRoom,
    createPublicRoom,
    fetchPublicRooms,
    publicRooms,
    joinRoom,
    updateSettings,
    toggleReady,
    startGame,
    sendChatMessage,
    confirmRole,
    replayGame,
    returnToLobby,
    kickPlayer,
    quickPlay,
    cancelQuickPlay,
    sendDrawingPreview,
    commitStroke,
    undoStroke,
    clearDrawing,
    readyForNextPhase,
    sendReaction,
    pointFinger,
    castVote,
    submitMrWhiteGuess
  ]);

  return (
    <div className="relative h-full min-h-screen overflow-hidden">
      <MeshBackground />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={screen.key}
          initial={{
            x: "60%",
            opacity: 0,
            rotate: 1.5
          }}
          animate={{
            x: "0%",
            opacity: 1,
            rotate: 0
          }}
          exit={{
            x: "-40%",
            opacity: 0,
            rotate: -1
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="relative z-10 h-full will-change-transform"
        >
          {screen.node}
        </motion.div>
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <AnimatePresence mode="popLayout">
          <div className="pointer-events-auto flex flex-col items-center gap-2">
            {!socketConnected || !room ? (
              socketConnected === false ? (
                <motion.div
                  key="reconnecting"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-full bg-surface-low px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-700 shadow-card"
                >
                  {t("reconnecting")}
                </motion.div>
              ) : null
            ) : null}

            {error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="flex items-center gap-3 rounded-2xl bg-tertiary-light px-4 py-3 text-sm font-medium text-tertiary shadow-card"
              >
                <span>{error}</span>
                <Button tone="ghost" onClick={clearError} className="text-tertiary hover:bg-tertiary/10">
                  x
                </Button>
              </motion.div>
            ) : null}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}
