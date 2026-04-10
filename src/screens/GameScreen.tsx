import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DrawingStroke, PlayerView, ReactionEmoji, RoomView } from "@shared/protocol";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { DrawingPhase } from "@/components/game/DrawingPhase";
import { ResolutionShowcase } from "@/components/game/ResolutionShowcase";
import { PhaseSplash } from "@/components/game/PhaseSplash";
import { previewSize } from "@/components/game/gameHelpers";
import { Button } from "@/components/ui/Button";
import { CountdownPill } from "@/components/ui/CountdownPill";

/**
 * Compute optimal grid cols so all items fit within given pixel bounds,
 * accounting for gap, name label, and vote marker space.
 */
function fitVoteGrid(
  count: number,
  availableWidth: number,
  availableHeight: number,
  gap: number,
  extraPerCard: number
) {
  let bestCols = 1;
  let bestSize = 0;

  for (let cols = 1; cols <= Math.min(count, 8); cols++) {
    const rows = Math.ceil(count / cols);
    const cellW = (availableWidth - gap * (cols - 1)) / cols;
    const cellH = (availableHeight - gap * (rows - 1)) / rows - extraPerCard;
    const size = Math.floor(Math.min(cellW, cellH));
    if (size > bestSize) {
      bestSize = size;
      bestCols = cols;
    }
  }

  return { cols: bestCols, cellSize: Math.max(48, bestSize) };
}

export function GameScreen({
  room,
  selfPlayer,
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
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  const round = room.round;
  if (!round) return null;
  const activeRound = round;
  void onReaction;
  void onReadyForNextPhase;
  void onSendChat;

  const playersById = useMemo(
    () => Object.fromEntries(room.players.map((player) => [player.id, player])),
    [room.players]
  );
  const roundPlayers = useMemo(
    () =>
      Object.keys(round.drawings)
        .map((playerId) => playersById[playerId])
        .filter((player): player is PlayerView => Boolean(player)),
    [playersById, activeRound.drawings]
  );
  const otherPlayers = useMemo(
    () => room.players.filter((player) => player.id !== selfPlayer.id),
    [room.players, selfPlayer.id]
  );
  const submittedVotePlayerIds = activeRound.votedPlayerIds;
  const selfHasSubmittedVote = submittedVotePlayerIds.includes(selfPlayer.id);

  const suspectPlayer =
    activeRound.resolution?.suspectPlayerId
      ? playersById[activeRound.resolution.suspectPlayerId]
      : null;

  const voteMarkersByTarget = useMemo(() => {
    const map: Record<string, PlayerView[]> = {};
    for (const [voterId, targetId] of Object.entries(activeRound.liveVotes)) {
      if (!targetId) continue;
      const voter = playersById[voterId];
      if (!voter) continue;
      if (!map[targetId]) map[targetId] = [];
      map[targetId].push(voter);
    }
    if (room.phase === "vote" && !selfHasSubmittedVote && pendingVote) {
      if (!map[pendingVote]) map[pendingVote] = [];
      if (!map[pendingVote].some((entry) => entry.id === selfPlayer.id)) {
        map[pendingVote] = [...map[pendingVote], selfPlayer];
      }
    }
    return map;
  }, [activeRound.liveVotes, pendingVote, playersById, room.phase, selfHasSubmittedVote, selfPlayer]);

  useEffect(() => {
    setShowSplash(true);
    setPendingVote(null);
    const timeoutId = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(timeoutId);
  }, [room.phase]);

  function makeCard(player: PlayerView, size: number) {
    const isSelf = player.id === selfPlayer.id;
    const displayVote = selfHasSubmittedVote ? activeRound.selfVote : pendingVote;

    return (
      <PlayerBoardCard
        key={player.id}
        phase={room.phase}
        player={player}
        strokes={activeRound.drawings[player.id]?.strokes ?? []}
        drawingUpdatedAt={activeRound.drawings[player.id]?.lastUpdatedAt ?? null}
        previewSize={size}
        isSelf={isSelf}
        selectedVoteTargetId={displayVote}
        hasVoted={submittedVotePlayerIds.includes(player.id)}
        voters={[]}
        revealedRole={activeRound.resolution?.revealedRoles[player.id]}
        pointsAwarded={activeRound.resolution?.pointsAwarded[player.id]}
        voteMarkers={room.phase === "vote" ? voteMarkersByTarget[player.id] ?? [] : []}
        onVote={
          isSelf
            ? () => {}
            : room.phase === "vote" && !selfHasSubmittedVote
              ? (targetId) => setPendingVote(targetId)
              : onVote
        }
      />
    );
  }

  /* ── Vote bar ── */
  function renderVoteBar() {
    if (room.phase !== "vote") return null;

    const hasVoted = selfHasSubmittedVote;
    const voteCount = submittedVotePlayerIds.length;
    const selectedPlayer = pendingVote ? playersById[pendingVote] : null;
    const castPlayer = activeRound.selfVote ? playersById[activeRound.selfVote] : null;
    const castVoteLabel =
      activeRound.selfVote === null ? "blanc" : castPlayer?.profile.name ?? "inconnu";

    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-sheet desk-shadow shrink-0 rounded-[1.4rem] px-3 py-2 md:px-4 md:py-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {room.phaseEndsAt ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
            <span className="ink-chip text-xs font-semibold text-ink-700">
              {voteCount}/{roundPlayers.length}
            </span>
            <span className="font-sketch text-lg font-semibold text-ink-950 md:text-xl">
              {hasVoted
                ? `Vote : ${castVoteLabel}`
                : selectedPlayer
                  ? `${selectedPlayer.profile.emoji} ${selectedPlayer.profile.name} ?`
                  : "Choisis un dessin"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasVoted ? (
              <span className="ink-chip text-xs font-semibold text-ink-700">Vote validé</span>
            ) : selectedPlayer ? (
              <>
                <Button onClick={() => onVote(pendingVote)} className="min-h-9 px-3 text-xs">Confirmer</Button>
                <Button tone="ghost" onClick={() => setPendingVote(null)} className="min-h-9 px-2 text-xs">Annuler</Button>
              </>
            ) : null}

            {!hasVoted ? (
              <Button tone="secondary" onClick={() => onVote(null)} className="min-h-9 px-3 text-xs">
                Blanc
              </Button>
            ) : null}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[100svh] max-h-[100svh] w-full max-w-[1720px] flex-col gap-2 overflow-hidden p-2 md:gap-3 md:p-3">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={room.phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex min-h-0 flex-1 flex-col gap-2 md:gap-3"
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
              {/* Vote grid — measured to fit without scroll */}
              <div className="paper-sheet notebook-page min-h-0 flex-1 overflow-hidden rounded-[1.6rem] p-2 md:p-3">
                <VoteGrid
                  players={roundPlayers}
                  renderCard={makeCard}
                />
              </div>
              {renderVoteBar()}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <PhaseSplash show={showSplash} phase={room.phase} />
    </div>
  );
}

/**
 * Grid that auto-measures its container and computes the optimal
 * cols / cell size so all player cards fit without scrolling.
 */
function VoteGrid({
  players,
  renderCard
}: {
  players: PlayerView[];
  renderCard: (player: PlayerView, size: number) => React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDims({
          w: Math.floor(entry.contentRect.width),
          h: Math.floor(entry.contentRect.height)
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = 8;
  // Extra height per card: name (20px) + vote markers (22px) + padding (12px)
  const extraPerCard = 54;
  const { cols, cellSize } = fitVoteGrid(players.length, dims.w, dims.h, gap, extraPerCard);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center">
      <div
        className="grid place-items-center"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: `${gap}px`
        }}
      >
        {players.map((player) => renderCard(player, cellSize))}
      </div>
    </div>
  );
}
