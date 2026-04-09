import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DrawingStroke, PlayerView, ReactionEmoji, RoomView } from "@shared/protocol";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { GameTopBar } from "@/components/game/GameTopBar";
import { DrawingPhase } from "@/components/game/DrawingPhase";
import { ResolutionShowcase } from "@/components/game/ResolutionShowcase";
import { PhaseSplash } from "@/components/game/PhaseSplash";
import { phaseSubtitle, fullCols, previewSize } from "@/components/game/gameHelpers";
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
  onPointFinger,
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
  onPointFinger: (targetPlayerId: string | null) => void;
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

  const selfPointer = round.pointers[selfPlayer.id] ?? null;
  const connectedCount = allConnected.length;
  const suspectPlayer =
    round.resolution?.suspectPlayerId ? playersById[round.resolution.suspectPlayerId] : null;
  const impostors =
    room.phase === "resolution" && round.resolution
      ? room.players.filter((p) => {
          const r = round.resolution?.revealedRoles[p.id];
          return r === "undercover" || r === "mr_white";
        })
      : [];

  // Grid dimensions for non-drawing phases
  const fCols = Math.max(1, fullCols(allConnected.length, isMobile));
  const fRows = Math.max(1, Math.ceil(allConnected.length / fCols));
  const sSize = previewSize(otherPlayers.length);
  const bSize = previewSize(allConnected.length);

  // Phase splash
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
        isSuspect={selfPointer === player.id}
        selectedVoteTargetId={displayVote}
        revealedRole={round.resolution?.revealedRoles[player.id]}
        pointsAwarded={round.resolution?.pointsAwarded[player.id]}
        onPointFinger={isSelf ? () => {} : onPointFinger}
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

  /* ── Phase dock (non-drawing) ── */
  function renderDock() {
    if (room.phase === "gallery") {
      return (
        <>
          <span className="text-sm text-ink-600">Observe les dessins de tout le monde</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-ink-400">
              {round.readyForPhaseAdvance.length}/{connectedCount}
            </span>
            <Button tone="secondary" onClick={onReadyForNextPhase} className="min-h-9 px-3 text-xs">
              Continuer
            </Button>
          </div>
        </>
      );
    }

    if (room.phase === "discussion") {
      return (
        <>
          <span className="text-sm text-ink-600">
            Suspect : <strong>{selfPointer ? playersById[selfPointer]?.profile.name ?? "?" : "Aucun"}</strong>
          </span>
          {selfPointer && (
            <Button tone="ghost" onClick={() => onPointFinger(null)} className="min-h-9 px-3 text-xs">
              Retirer
            </Button>
          )}
        </>
      );
    }

    if (room.phase === "vote") {
      const hasVoted = round.selfVote !== null;
      return (
        <>
          <AnimatePresence mode="wait">
          {hasVoted ? (
            <motion.span
              key="voted"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#92400e]"
            >
              Vote : {playersById[round.selfVote!]?.profile.name ?? "Blanc"}
            </motion.span>
          ) : pendingVote ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-2"
            >
              <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#92400e]">
                {playersById[pendingVote]?.profile.name}
              </span>
              <Button onClick={() => onVote(pendingVote)} className="min-h-9 px-4 text-xs">
                Valider mon vote
              </Button>
              <Button tone="ghost" onClick={() => setPendingVote(null)} className="min-h-9 px-3 text-xs">
                Annuler
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
              Clique sur un dessin pour voter
            </motion.span>
          )}
          </AnimatePresence>
          <Button tone="secondary" onClick={() => onVote(null)} className="min-h-9 px-3 text-xs">
            Vote blanc
          </Button>
        </>
      );
    }

    return null;
  }

  /* ── Render ── */
  return (
    <div className="mx-auto flex h-[100svh] max-h-[100svh] w-full max-w-[1720px] flex-col gap-2 overflow-hidden p-2.5 md:p-3">

      <GameTopBar
        room={room}
        round={round}
        selfPlayer={selfPlayer}
        chatOpen={chatOpen}
        copied={copied}
        onToggleChat={() => setChatOpen((v) => !v)}
        onCopyLink={copyLink}
      />

      {/* Main */}
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
          ) : (
            <>
              {/* Action dock */}
              {room.phase !== "resolution" && (
                <GlassPanel className="shrink-0 px-3 py-2.5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-ink-700">
                      {phaseSubtitle(room.phase)}
                    </span>
                    {renderDock()}
                  </div>
                </GlassPanel>
              )}

              {/* Resolution showcase */}
              {room.phase === "resolution" && (
                <ResolutionShowcase
                  round={round}
                  playersById={playersById}
                  suspectPlayer={suspectPlayer}
                  impostors={impostors}
                  selfPlayer={selfPlayer}
                  onSubmitGuess={onSubmitGuess}
                />
              )}

              {/* Full-width player grid */}
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
