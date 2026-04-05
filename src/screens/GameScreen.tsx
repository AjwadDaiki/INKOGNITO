import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DrawingStroke, PlayerView, ReactionEmoji, RoomView } from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { Button } from "@/components/ui/Button";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { GlassPanel } from "@/components/ui/GlassPanel";

function phaseLabel(phase: RoomView["phase"]) {
  switch (phase) {
    case "drawing":
      return "Dessine";
    case "gallery":
      return "Observe";
    case "discussion":
      return "Suspect";
    case "vote":
      return "Vote";
    case "resolution":
      return "Reveal";
    default:
      return phase;
  }
}

function phaseText(room: RoomView) {
  if (room.phase === "drawing") {
    return room.round?.role.ownWord ?? "???";
  }
  if (room.phase === "gallery") {
    return "Regarde les dessins.";
  }
  if (room.phase === "discussion") {
    return "Clique un dessin pour designer ton suspect.";
  }
  if (room.phase === "vote") {
    return "Clique un dessin pour voter.";
  }
  return "L'imposteur est revele.";
}

function rightGridColumns(playerCount: number) {
  if (playerCount <= 2) return 1;
  if (playerCount <= 4) return 2;
  if (playerCount <= 6) return 2;
  if (playerCount <= 8) return 3;
  return 3;
}

function previewSize(playerCount: number) {
  if (playerCount <= 2) return 170;
  if (playerCount <= 4) return 150;
  if (playerCount <= 6) return 126;
  if (playerCount <= 8) return 112;
  return 102;
}

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
  const [guess, setGuess] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const round = room.round;
  if (!round) return null;

  void onReaction;

  const playersById = useMemo(
    () => Object.fromEntries(room.players.map((player) => [player.id, player])),
    [room.players]
  );
  const otherPlayers = useMemo(
    () => room.players.filter((player) => player.id !== selfPlayer.id),
    [room.players, selfPlayer.id]
  );
  const selfDrawing = round.drawings[selfPlayer.id];
  const selfPointerTargetId = round.pointers[selfPlayer.id] ?? null;
  const boardColumns = rightGridColumns(otherPlayers.length);
  const smallPreviewSize = previewSize(otherPlayers.length);
  const connectedCount = room.players.filter((player) => player.connected).length;
  const suspectPlayer =
    round.resolution?.suspectPlayerId ? playersById[round.resolution.suspectPlayerId] : null;
  const voteEntries = round.resolution?.votes ? Object.entries(round.resolution.votes) : [];
  const impostors = room.phase === "resolution" && round.resolution
    ? room.players.filter((player) => {
        const role = round.resolution?.revealedRoles[player.id];
        return role === "undercover" || role === "mr_white";
      })
    : [];

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}?room=${room.roomCode}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  function renderLeftStage() {
    if (room.phase === "drawing") {
      return (
        <div className="flex h-full min-h-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Ton mot</div>
              <div className="mt-1 font-display text-4xl text-white">
                {round.role.ownWord ?? "???"}
              </div>
            </div>
            <CountdownPill endsAt={room.phaseEndsAt} />
          </div>
          <div className="min-h-0 flex-1">
            <DrawingCanvas
              playerId={selfPlayer.id}
              strokes={selfDrawing?.strokes ?? []}
              onPreview={onPreview}
              onCommit={onCommit}
              onUndo={onUndo}
              onClear={onClear}
            />
          </div>
        </div>
      );
    }

    if (room.phase === "gallery") {
      return (
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Galerie</div>
            <div className="mt-2 font-display text-5xl text-white">Observe</div>
            <p className="mt-3 max-w-md text-sm text-ink-300">
              La table est figee. Quand tout le monde a vu, passez a la suite.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button tone="secondary" onClick={onReadyForNextPhase}>
              Skip
            </Button>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink-300">
              {round.readyForPhaseAdvance.length}/{connectedCount} prets
            </div>
          </div>
        </div>
      );
    }

    if (room.phase === "discussion") {
      return (
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Suspect</div>
            <div className="mt-2 font-display text-5xl text-white">
              {selfPointerTargetId ? playersById[selfPointerTargetId]?.profile.name ?? "?" : "Choisis"}
            </div>
            <p className="mt-3 max-w-md text-sm text-ink-300">
              Clique un dessin a droite. Des que tout le monde a choisi, on passe au vote.
            </p>
          </div>
          {selfPointerTargetId ? (
            <div>
              <Button tone="ghost" onClick={() => onPointFinger(null)}>
                Retirer
              </Button>
            </div>
          ) : <div />}
        </div>
      );
    }

    if (room.phase === "vote") {
      return (
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Vote</div>
            <div className="mt-2 font-display text-5xl text-white">
              {round.selfVote ? playersById[round.selfVote]?.profile.name ?? "?" : "Blanc"}
            </div>
            <p className="mt-3 max-w-md text-sm text-ink-300">
              Clique un dessin a droite pour voter. Tu peux aussi voter blanc.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button tone="secondary" onClick={() => onVote(null)}>
              Vote blanc
            </Button>
            <CountdownPill endsAt={room.phaseEndsAt} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Reveal</div>
            <div className="mt-2 font-display text-4xl text-white">
              {suspectPlayer ? `${suspectPlayer.profile.name} etait vise` : "Pas de majorite"}
            </div>
          </div>
          <CountdownPill endsAt={room.phaseEndsAt} />
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Imposteurs</div>
          <div className="mt-3 flex flex-wrap gap-3">
            {impostors.length > 0 ? (
              impostors.map((player) => (
                <div
                  key={player.id}
                  className={`rounded-[20px] border px-4 py-3 ${
                    round.resolution?.revealedRoles[player.id] === "mr_white"
                      ? "border-amber-300/30 bg-amber-300/10"
                      : "border-neon-rose/30 bg-neon-rose/10"
                  }`}
                >
                  <div className="text-sm font-semibold text-white">
                    {player.profile.emoji} {player.profile.name}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-200">
                    {round.resolution?.revealedRoles[player.id] === "mr_white" ? "MR.WHITE" : "UNDERCOVER"}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-ink-300">Aucun role special.</div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Mots</div>
          <div className="mt-2 text-lg font-semibold text-white">
            {round.resolution?.civilWord} <span className="text-ink-300">/</span> {round.resolution?.undercoverWord}
          </div>
        </div>

        {round.resolution?.mrWhiteGuess.pending &&
        round.resolution.mrWhiteGuess.playerId === selfPlayer.id ? (
          <form
            className="mt-auto flex flex-wrap items-center gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!guess.trim()) return;
              onSubmitGuess(guess.trim());
              setGuess("");
            }}
          >
            <input
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              className="min-h-11 min-w-[240px] flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-white"
              placeholder="Devine le mot civil"
            />
            <Button type="submit">Valider</Button>
          </form>
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Votes reveles</div>
            <div className="mt-3 space-y-2 text-sm">
              {voteEntries.map(([fromPlayerId, toPlayerId]) => (
                <div key={fromPlayerId} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2">
                  <span className="text-white">{playersById[fromPlayerId]?.profile.name}</span>
                  <span className="text-ink-300">
                    {toPlayerId ? playersById[toPlayerId]?.profile.name ?? "?" : "Blanc"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-[1680px] flex-col gap-3 overflow-hidden px-3 py-3 md:px-4">
      <GlassPanel className="shrink-0 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white">
              {phaseLabel(room.phase)}
            </div>
            <div className="text-sm text-ink-200">{phaseText(room)}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
              {selfPlayer.profile.emoji} {selfPlayer.profile.name}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
              {selfPlayer.points} pts
            </div>
            {room.phase !== "drawing" ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
            <Button tone="ghost" onClick={() => setChatOpen((value) => !value)}>
              Chat
            </Button>
            <Button tone="secondary" onClick={copyRoomLink}>
              {copied ? "Lien copie" : "Partager"}
            </Button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={room.phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full min-h-0"
          >
            <GlassPanel className="h-full min-h-0 p-4">{renderLeftStage()}</GlassPanel>
          </motion.div>
        </AnimatePresence>

        <GlassPanel className="flex h-full min-h-0 flex-col gap-3 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Autres joueurs</div>
              <div className="text-sm text-ink-200">{connectedCount - 1} visibles</div>
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">
              {room.phase === "discussion"
                ? "Cliquer = suspect"
                : room.phase === "vote"
                  ? "Cliquer = vote"
                  : room.phase === "drawing"
                    ? "Live"
                    : "Table"}
            </div>
          </div>

          <div
            className="grid min-h-0 flex-1 auto-rows-fr gap-3 overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${boardColumns}, minmax(0, 1fr))` }}
          >
            {otherPlayers.map((player) => (
              <div key={player.id} className="min-h-0">
                <PlayerBoardCard
                  phase={room.phase}
                  player={player}
                  strokes={round.drawings[player.id]?.strokes ?? []}
                  previewStroke={livePreviews[player.id]}
                  previewSize={smallPreviewSize}
                  isSuspect={selfPointerTargetId === player.id}
                  selectedVoteTargetId={round.selfVote}
                  revealedRole={round.resolution?.revealedRoles[player.id]}
                  pointsAwarded={round.resolution?.pointsAwarded[player.id]}
                  onPointFinger={onPointFinger}
                  onVote={onVote}
                />
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      <AnimatePresence>
        {chatOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="pointer-events-none fixed bottom-4 right-4 z-40 w-[340px] max-w-[calc(100vw-2rem)]"
          >
            <GlassPanel className="pointer-events-auto h-[400px] p-4">
              <ChatPanel title="Chat" players={room.players} messages={round.chat} onSend={onSendChat} />
            </GlassPanel>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
