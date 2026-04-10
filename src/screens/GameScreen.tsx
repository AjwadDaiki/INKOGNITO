import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/store/useGameStore";
import type { DrawingStroke, PlayerView, ReactionEmoji, RoomView } from "@shared/protocol";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { DrawingPhase } from "@/components/game/DrawingPhase";
import { ResolutionShowcase } from "@/components/game/ResolutionShowcase";
import { PhaseSplash } from "@/components/game/PhaseSplash";
import { fullCols, previewSize } from "@/components/game/gameHelpers";
import { useIsMobile } from "@/lib/useIsMobile";
import { Button } from "@/components/ui/Button";
import { CountdownPill } from "@/components/ui/CountdownPill";

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
  const isMobile = useIsMobile();
  const livePreviews = useGameStore((state) => state.livePreviews);

  const round = room.round;
  if (!round) return null;
  void onReaction;
  void onReadyForNextPhase;

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

  const suspectPlayer =
    round.resolution?.suspectPlayerId ? playersById[round.resolution.suspectPlayerId] : null;
  const cols = room.phase === "vote"
    ? isMobile
      ? 1
      : allConnected.length >= 8
        ? 4
        : allConnected.length >= 5
          ? 3
          : 2
    : Math.max(1, fullCols(allConnected.length, isMobile));
  const smallSize = previewSize(otherPlayers.length);
  const fullSize = previewSize(allConnected.length);

  const voteMarkersByTarget = useMemo(() => {
    const map: Record<string, PlayerView[]> = {};
    for (const [voterId, targetId] of Object.entries(round.liveVotes)) {
      if (!targetId) continue;
      const voter = playersById[voterId];
      if (!voter) continue;
      if (!map[targetId]) map[targetId] = [];
      map[targetId].push(voter);
    }
    if (room.phase === "vote" && round.selfVote === null && pendingVote) {
      if (!map[pendingVote]) map[pendingVote] = [];
      if (!map[pendingVote].some((entry) => entry.id === selfPlayer.id)) {
        map[pendingVote] = [...map[pendingVote], selfPlayer];
      }
    }
    return map;
  }, [pendingVote, playersById, room.phase, round.liveVotes, round.selfVote, selfPlayer]);

  useEffect(() => {
    setShowSplash(true);
    setPendingVote(null);
    const t = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(t);
  }, [room.phase]);

  function makeCard(player: PlayerView, size: number) {
    const isSelf = player.id === selfPlayer.id;
    const displayVote = round.selfVote ?? pendingVote;

    return (
      <PlayerBoardCard
        key={player.id}
        phase={room.phase}
        player={player}
        strokes={round.drawings[player.id]?.strokes ?? []}
        drawingUpdatedAt={round.drawings[player.id]?.lastUpdatedAt ?? null}
        previewStroke={livePreviews[player.id]}
        previewSize={size}
        isSelf={isSelf}
        selectedVoteTargetId={displayVote}
        hasVoted={round.votedPlayerIds.includes(player.id)}
        voters={[]}
        revealedRole={round.resolution?.revealedRoles[player.id]}
        pointsAwarded={round.resolution?.pointsAwarded[player.id]}
        voteMarkers={room.phase === "vote" ? voteMarkersByTarget[player.id] ?? [] : []}
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

  function renderVoteBar() {
    if (room.phase !== "vote") return null;

    const hasVoted = round.selfVote !== null;
    const voteCount = round.votedPlayerIds.length;
    const selectedPlayer = pendingVote ? playersById[pendingVote] : null;
    const castPlayer = round.selfVote ? playersById[round.selfVote] : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-sheet desk-shadow shrink-0 rounded-[1.6rem] px-4 py-3"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-sketch text-3xl font-semibold leading-none text-ink-950">
              Vote
            </span>
            {room.phaseEndsAt ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
            <span className="ink-chip text-xs font-semibold text-ink-700">
              {voteCount}/{allConnected.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasVoted ? (
              <span className="font-sketch text-2xl text-ink-700">
                Vote pose sur {castPlayer?.profile.name ?? "blanc"}
              </span>
            ) : selectedPlayer ? (
              <>
                <span className="font-sketch text-2xl text-ink-700">
                  Voter pour {selectedPlayer.profile.name} ?
                </span>
                <Button onClick={() => onVote(pendingVote)}>Confirmer</Button>
                <Button tone="ghost" onClick={() => setPendingVote(null)}>
                  Annuler
                </Button>
              </>
            ) : (
              <span className="font-sketch text-2xl text-ink-700">
                Choisis un dessin
              </span>
            )}

            {!hasVoted ? (
              <Button tone="secondary" onClick={() => onVote(null)}>
                Vote blanc
              </Button>
            ) : null}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative mx-auto flex h-[100svh] max-h-[100svh] w-full max-w-[1720px] flex-col gap-3 overflow-hidden p-3 md:p-4">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={room.phase}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex min-h-0 flex-1 flex-col gap-3"
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
              renderCard={(p) => makeCard(p, smallSize)}
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
              <div className="paper-sheet min-h-0 flex-1 overflow-auto rounded-[1.9rem] px-3 py-4 md:px-4">
                <div
                  className="grid gap-4 place-items-center"
                  style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                >
                  {allConnected.map((player) => makeCard(player, fullSize))}
                </div>
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
