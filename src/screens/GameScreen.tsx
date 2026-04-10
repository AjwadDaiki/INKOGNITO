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
import { CountdownPill } from "@/components/ui/CountdownPill";
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

  /* ── Compute voters per target from liveVotes ── */
  const votersByTarget = useMemo(() => {
    const map: Record<string, PlayerView[]> = {};
    for (const [voterId, targetId] of Object.entries(round.liveVotes)) {
      if (targetId) {
        if (!map[targetId]) map[targetId] = [];
        const voter = playersById[voterId];
        if (voter) map[targetId].push(voter);
      }
    }
    return map;
  }, [round.liveVotes, playersById]);

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
        voters={votersByTarget[player.id] ?? []}
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

  /* ── Vote bar (bottom) — includes timer + round info ── */
  function renderVoteBar() {
    if (room.phase !== "vote") return null;
    const hasVoted = round.selfVote !== null;
    const voteCount = round.votedPlayerIds.length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="shrink-0 rounded-[18px] bg-surface-card/90 px-3 py-2 shadow-[0_-4px_20px_rgba(26,20,16,0.08)] backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          {/* Round + Timer */}
          <span className="shrink-0 text-[10px] font-bold text-ink-400">R{round.roundNumber}/{room.totalRounds}</span>
          {room.phaseEndsAt && <CountdownPill endsAt={room.phaseEndsAt} />}

          {/* Vote progress */}
          <motion.div
            key={voteCount}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            className="shrink-0 rounded-full bg-surface-low px-2.5 py-1 text-xs font-extrabold text-ink-950"
          >
            {voteCount}/{connectedCount}
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
                  className="flex items-center gap-1.5"
                >
                  <span className="text-xs font-bold text-ink-950">
                    {playersById[round.selfVote!]?.profile.emoji}{" "}
                    {playersById[round.selfVote!]?.profile.name ?? "Blanc"} ✓
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
                  <span className="text-xs text-ink-700">
                    <strong className="text-ink-950">
                      {playersById[pendingVote]?.profile.emoji} {playersById[pendingVote]?.profile.name}
                    </strong>{" "}?
                  </span>
                  <Button onClick={() => onVote(pendingVote)} className="min-h-7 px-3 text-[11px]">
                    OK
                  </Button>
                  <Button tone="ghost" onClick={() => setPendingVote(null)} className="min-h-7 px-2 text-[11px]">
                    ✕
                  </Button>
                </motion.div>
              ) : (
                <motion.span
                  key="prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-ink-500"
                >
                  Clique sur un joueur
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Blank vote */}
          {!hasVoted && (
            <Button tone="ghost" onClick={() => onVote(null)} className="shrink-0 min-h-7 px-2 text-[10px] text-ink-400">
              Blanc
            </Button>
          )}
        </div>
      </motion.div>
    );
  }


  return (
    <div className="relative mx-auto flex h-[100svh] max-h-[100svh] w-full max-w-[1720px] flex-col gap-2 overflow-hidden p-2.5 md:p-3">

      {/* Top bar — only during drawing phase (vote has its own bar, resolution has its own layout) */}
      {room.phase === "drawing" && (
        <GameTopBar
          room={room}
          round={round}
          selfPlayer={selfPlayer}
          chatOpen={chatOpen}
          copied={copied}
          onToggleChat={() => setChatOpen((v) => !v)}
          onCopyLink={copyLink}
        />
      )}

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
              {/* Player grid — vote phase */}
              <GlassPanel className="min-h-0 flex-1 overflow-auto p-2">
                <div
                  className="grid gap-2 place-items-center"
                  style={{
                    gridTemplateColumns: `repeat(${fCols}, minmax(0, 1fr))`
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
