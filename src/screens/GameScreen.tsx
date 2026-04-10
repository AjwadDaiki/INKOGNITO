import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DrawingStroke, PlayerView, ReactionEmoji, RoomView } from "@shared/protocol";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { GameTopBar } from "@/components/game/GameTopBar";
import { DrawingPhase } from "@/components/game/DrawingPhase";
import { ResolutionShowcase } from "@/components/game/ResolutionShowcase";
import { PhaseSplash } from "@/components/game/PhaseSplash";
import { fullCols, previewSize } from "@/components/game/gameHelpers";
import { useIsMobile } from "@/lib/useIsMobile";
import { Button } from "@/components/ui/Button";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { GlassPanel } from "@/components/ui/GlassPanel";

export function GameScreen({
  room,
  selfPlayer,
  livePreviews,
  onPreview,
  onCommit,
  onUndo,
  onClear,
  onReadyForNextPhase,
  onReaction,
  onSendChat,
  onVote,
  onSubmitGuess
}: {
  room: RoomView;
  selfPlayer: PlayerView;
  livePreviews: Record<string, DrawingStroke | null>;
  onPreview: (stroke: DrawingStroke) => void;
  onCommit: (stroke: DrawingStroke, snapshot: string | null) => void;
  onUndo: () => void;
  onClear: () => void;
  onReadyForNextPhase: () => void;
  onReaction: (targetPlayerId: string, emoji: ReactionEmoji) => void;
  onSendChat: (text: string) => void;
  onVote: (targetPlayerId: string | null) => void;
  onSubmitGuess: (guess: string) => void;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const isMobile = useIsMobile();

  const round = room.round;
  if (!round) return null;
  void onReaction;

  const playersById = useMemo(
    () => Object.fromEntries(room.players.map((p) => [p.id, p])),
    [room.players]
  );
  const otherPlayers = useMemo(
    () => room.players.filter((p) => p.id !== selfPlayer.id),
    [room.players, selfPlayer.id]
  );
  const allConnected = useMemo(
    () => room.players.filter((p) => p.connected),
    [room.players]
  );

  const connectedCount = allConnected.length;
  const suspectPlayer =
    round.resolution?.suspectPlayerId ? playersById[round.resolution.suspectPlayerId] : null;

  const fCols = Math.max(1, fullCols(allConnected.length, isMobile));
  const fRows = Math.max(1, Math.ceil(allConnected.length / fCols));
  const sSize = previewSize(otherPlayers.length);
  const bSize = previewSize(allConnected.length);

  useEffect(() => {
    setShowSplash(true);
    setPendingVote(null);
    const t = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(t);
  }, [room.phase]);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}?room=${room.roomCode}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  /* ── Card factory ── */
  function makeCard(player: PlayerView, size: number) {
    const isSelf = player.id === selfPlayer.id;
    const displayVote = round.selfVote ?? pendingVote;
    return (
      <PlayerBoardCard
        key={player.id}
        phase={room.phase}
        player={player}
        strokes={round.drawings[player.id]?.strokes ?? []}
        previewStroke={livePreviews[player.id]}
        previewSize={size}
        dense={room.players.length >= 7}
        isSelf={isSelf}
        selectedVoteTargetId={displayVote}
        hasVoted={round.votedPlayerIds.includes(player.id)}
        revealedRole={round.resolution?.revealedRoles[player.id]}
        pointsAwarded={round.resolution?.pointsAwarded[player.id]}
        onVote={
          isSelf
            ? () => {}
            : room.phase === "vote" && round.selfVote === null
              ? (id) => setPendingVote(id)
              : onVote
        }
      />
    );
  }

  /* ── Vote bar (bottom) ── */
  function renderVoteBar() {
    if (room.phase !== "vote") return null;
    const hasVoted = round.selfVote !== null;
    const voteCount = round.votedPlayerIds.length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="shrink-0 rounded-[20px] bg-surface-card/90 px-4 py-3 shadow-[0_-4px_20px_rgba(26,20,16,0.08)] backdrop-blur-md"
      >
        <div className="flex items-center gap-3">
          {/* Vote progress */}
          <motion.div
            key={voteCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-low px-3 py-1.5"
          >
            <span className="text-sm font-extrabold text-ink-950">{voteCount}/{connectedCount}</span>
            <span className="text-[10px] text-ink-400">votes</span>
          </motion.div>

          {/* Vote status */}
          <div className="flex flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              {hasVoted ? (
                <motion.div
                  key="voted"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">✅</span>
                  <span className="text-sm font-bold text-ink-950">
                    {playersById[round.selfVote!]?.profile.emoji}{" "}
                    {playersById[round.selfVote!]?.profile.name ?? "Blanc"}
                  </span>
                </motion.div>
              ) : pendingVote ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-sm text-ink-600">
                    <strong className="text-ink-950">
                      {playersById[pendingVote]?.profile.emoji} {playersById[pendingVote]?.profile.name}
                    </strong>{" "}
                    ?
                  </span>
                  <Button onClick={() => onVote(pendingVote)} className="min-h-8 px-4 text-xs">
                    Confirmer
                  </Button>
                  <Button tone="ghost" onClick={() => setPendingVote(null)} className="min-h-8 px-2 text-xs">
                    ✕
                  </Button>
                </motion.div>
              ) : (
                <motion.span
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-ink-500"
                >
                  Clique sur un joueur
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Blank vote */}
          {!hasVoted && (
            <Button tone="ghost" onClick={() => onVote(null)} className="shrink-0 min-h-8 px-3 text-xs text-ink-400">
              Blanc
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  /* ── Gallery bar ── */
  function renderGalleryBar() {
    if (room.phase !== "gallery") return null;
    return (
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-[20px] bg-surface-card/80 px-4 py-2.5 backdrop-blur-md">
        <span className="text-sm text-ink-500">Observe les dessins</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">
            {round.readyForPhaseAdvance.length}/{connectedCount}
          </span>
          <Button tone="secondary" onClick={onReadyForNextPhase} className="min-h-9 px-4 text-xs">
            Passer au vote
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[100svh] max-h-[100svh] w-full max-w-[1720px] flex-col gap-2 overflow-hidden p-2.5 md:p-3">

      <GameTopBar
        room={room}
        round={round}
        selfPlayer={selfPlayer}
        chatOpen={chatOpen}
        copied={copied}
        onToggleChat={() => setChatOpen((v) => !v)}
        onCopyLink={copyLink}
      />

      {/* Main content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={room.phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex min-h-0 flex-1 flex-col gap-2"
        >
          {room.phase === "drawing" ? (
            <DrawingPhase
              room={room}
              round={round}
              selfPlayer={selfPlayer}
              otherPlayers={otherPlayers}
              onPreview={onPreview}
              onCommit={onCommit}
              onUndo={onUndo}
              onClear={onClear}
              renderCard={(p) => makeCard(p, sSize)}
            />
          ) : room.phase === "resolution" ? (
            <ResolutionShowcase
              round={round}
              room={room}
              playersById={playersById}
              suspectPlayer={suspectPlayer}
              selfPlayer={selfPlayer}
              onSubmitGuess={onSubmitGuess}
            />
          ) : (
            <>
              {/* Gallery bar */}
              {renderGalleryBar()}

              {/* Player grid */}
              <GlassPanel className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
                <div
                  className="grid min-h-0 flex-1 gap-2 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${fCols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${fRows}, minmax(0, 1fr))`
                  }}
                >
                  {allConnected.map((p) => makeCard(p, bSize))}
                </div>
              </GlassPanel>

              {/* Vote bar */}
              {renderVoteBar()}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Chat overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed bottom-3 left-3 right-3 z-40 md:bottom-4 md:left-auto md:right-4 md:w-[340px]"
          >
            <div className="pointer-events-auto bento-card h-[320px] p-3 md:h-[360px] md:p-4">
              <ChatPanel title="Chat" players={room.players} messages={round.chat} onSend={onSendChat} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PhaseSplash show={showSplash} phase={room.phase} />
    </div>
  );
}
