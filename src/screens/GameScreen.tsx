import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type {
  DrawingStroke,
  PlayerRole,
  PlayerView,
  ReactionEmoji,
  RoomView
} from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { Button } from "@/components/ui/Button";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { GlassPanel } from "@/components/ui/GlassPanel";

const EMPTY_REACTIONS: Array<[ReactionEmoji, number]> = [];

function phaseLabel(phase: RoomView["phase"]) {
  switch (phase) {
    case "drawing":
      return "Dessin";
    case "gallery":
      return "Galerie";
    case "discussion":
      return "Discussion";
    case "vote":
      return "Vote";
    case "resolution":
      return "Reveal";
    default:
      return phase;
  }
}

function roleLabel(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "UNDERCOVER";
  if (role === "mr_white") return "MR.WHITE";
  if (role === "civil") return "CIVIL";
  return "...";
}

function phaseShortText(room: RoomView, selfPlayer: PlayerView) {
  const ownRole = room.round?.role.ownRole;
  const ownWord = room.round?.role.ownWord;

  if (room.phase === "drawing") {
    if (ownRole === "mr_white") {
      return "Pas de mot. Dessine credible sans te trahir.";
    }
    return ownWord ? `Ton mot: ${ownWord}` : "Le mot arrive.";
  }

  if (room.phase === "gallery") {
    return "Observe les dessins avant la discussion.";
  }

  if (room.phase === "discussion") {
    return "Accuse depuis la table sans changer d'ecran.";
  }

  if (room.phase === "vote") {
    return `Vote: ${
      room.round?.selfVote
        ? room.players.find((player) => player.id === room.round?.selfVote)?.profile.name ?? "?"
        : "blanc"
    }`;
  }

  if (room.phase === "resolution") {
    return `${selfPlayer.profile.name}, regarde qui etait vraiment l'imposteur.`;
  }

  return room.systemNotice ?? "La table joue.";
}

function getBoardColumns(playerCount: number) {
  if (playerCount <= 3) return playerCount;
  if (playerCount <= 4) return 2;
  if (playerCount <= 6) return 3;
  if (playerCount <= 8) return 4;
  return 4;
}

function getPreviewSize(playerCount: number) {
  if (playerCount <= 3) return 210;
  if (playerCount <= 4) return 190;
  if (playerCount <= 6) return 165;
  if (playerCount <= 8) return 145;
  return 128;
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
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const round = room.round;
  if (!round) return null;

  const playersById = useMemo(
    () => Object.fromEntries(room.players.map((player) => [player.id, player])),
    [room.players]
  );
  const orderedPlayers = useMemo(() => {
    const players = [...room.players];
    players.sort((first, second) => {
      if (first.id === selfPlayer.id) return -1;
      if (second.id === selfPlayer.id) return 1;
      return first.profile.name.localeCompare(second.profile.name);
    });
    return players;
  }, [room.players, selfPlayer.id]);
  const reactionCountsByPlayer = useMemo(() => {
    const counts: Record<string, Array<[ReactionEmoji, number]>> = {};
    room.players.forEach((player) => {
      counts[player.id] = [];
    });
    const buckets = new Map<string, Map<ReactionEmoji, number>>();
    round.reactions.forEach((reaction) => {
      const targetBucket = buckets.get(reaction.targetPlayerId) ?? new Map<ReactionEmoji, number>();
      targetBucket.set(reaction.emoji, (targetBucket.get(reaction.emoji) ?? 0) + 1);
      buckets.set(reaction.targetPlayerId, targetBucket);
    });
    for (const [playerId, bucket] of buckets.entries()) {
      counts[playerId] = [...bucket.entries()].sort((first, second) => second[1] - first[1]);
    }
    return counts;
  }, [room.players, round.reactions]);
  const accuseCountsByPlayer = useMemo(() => {
    const counts: Record<string, number> = {};
    room.players.forEach((player) => {
      counts[player.id] = 0;
    });
    Object.values(round.pointers).forEach((targetPlayerId) => {
      if (!targetPlayerId) return;
      counts[targetPlayerId] = (counts[targetPlayerId] ?? 0) + 1;
    });
    return counts;
  }, [room.players, round.pointers]);
  const revealEntries = useMemo(
    () =>
      room.phase === "resolution" && round.resolution
        ? room.players.filter((player) => round.resolution?.revealedRoles[player.id] !== "civil")
        : [],
    [room.phase, room.players, round.resolution]
  );

  const connectedCount = room.players.filter((player) => player.connected).length;
  const boardColumns = getBoardColumns(room.players.length);
  const previewSize = getPreviewSize(room.players.length);
  const selfDrawing = round.drawings[selfPlayer.id];
  const selfPointerTargetId = round.pointers[selfPlayer.id] ?? null;
  const suspectPlayer =
    round.resolution?.suspectPlayerId ? playersById[round.resolution.suspectPlayerId] : null;
  const voteEntries = round.resolution?.votes ? Object.entries(round.resolution.votes) : [];

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}?room=${room.roomCode}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function renderStage() {
    if (room.phase === "drawing") {
      return (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Ton canvas</div>
              <div className="mt-1 font-display text-3xl text-white">
                {round.role.ownRole === "mr_white" ? "Improviser" : round.role.ownWord}
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
            <div className="mt-2 font-display text-4xl text-white">Observe la table</div>
            <p className="mt-3 max-w-xl text-sm text-ink-300">
              Tous les dessins sont figes. Regarde les styles et les hesitations avant de parler.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button tone="secondary" onClick={onReadyForNextPhase}>
              Pret
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
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Discussion</div>
            <div className="mt-2 font-display text-4xl text-white">Qui bluffe ?</div>
            <p className="mt-3 max-w-xl text-sm text-ink-300">
              Choisis une carte dans la table pour l'accuser. Tu peux retirer ton choix a tout moment.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Cible actuelle</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {selfPointerTargetId ? playersById[selfPointerTargetId]?.profile.name ?? "?" : "Aucune"}
            </div>
            {selfPointerTargetId ? (
              <div className="mt-3">
                <Button tone="ghost" onClick={() => onPointFinger(null)}>
                  Retirer
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (room.phase === "vote") {
      return (
        <div className="flex h-full flex-col justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Vote secret</div>
            <div className="mt-2 font-display text-4xl text-white">Vote depuis la table</div>
            <p className="mt-3 max-w-xl text-sm text-ink-300">
              Clique une carte joueur. Le vote blanc reste possible si tu n'es pas sur.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink-300">
              Vote:{" "}
              <span className="font-semibold text-white">
                {round.selfVote ? playersById[round.selfVote]?.profile.name ?? "?" : "blanc"}
              </span>
            </div>
            <Button tone="secondary" onClick={() => onVote(null)}>
              Vote blanc
            </Button>
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
              {suspectPlayer ? `${suspectPlayer.profile.name} etait vise` : "Aucune majorite"}
            </div>
          </div>
          <CountdownPill endsAt={room.phaseEndsAt} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Imposteurs du round</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {revealEntries.length > 0 ? (
                revealEntries.map((player) => {
                  const role = round.resolution?.revealedRoles[player.id];
                  return (
                    <div
                      key={player.id}
                      className={role === "mr_white"
                        ? "rounded-[20px] border border-amber-300/30 bg-amber-300/10 px-4 py-3"
                        : "rounded-[20px] border border-neon-rose/30 bg-neon-rose/10 px-4 py-3"}
                    >
                      <div className="text-sm font-semibold text-white">
                        {player.profile.emoji} {player.profile.name}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-200">
                        {roleLabel(role)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-ink-300">Aucun role special sur ce round.</div>
              )}
            </div>

            <div className="mt-4 rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-ink-300">
              Mot civil: <span className="font-semibold text-white">{round.resolution?.civilWord}</span>
              <span className="mx-2 text-ink-300">/</span>
              Mot undercover:{" "}
              <span className="font-semibold text-white">{round.resolution?.undercoverWord}</span>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
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
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-[1760px] flex-col gap-3 overflow-hidden px-3 py-3 md:px-4">
      <GlassPanel className="shrink-0 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-white">
              Round {room.currentRound}/{room.totalRounds} · {phaseLabel(room.phase)}
            </div>
            <div className="text-sm text-ink-200">{phaseShortText(room, selfPlayer)}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-ink-200">
              {roleLabel(round.role.ownRole)}
              {round.role.ownRole !== "mr_white" && round.role.ownWord ? ` · ${round.role.ownWord}` : ""}
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
              {selfPlayer.points} pts
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
              {room.roomCode}
            </div>
            <CountdownPill endsAt={room.phaseEndsAt} />
            <Button tone="ghost" onClick={() => setChatOpen((value) => !value)}>
              Chat {round.chat.length > 0 ? `(${round.chat.length})` : ""}
            </Button>
            <Button tone="secondary" onClick={copyRoomLink}>
              {copied ? "Lien copie" : "Partager"}
            </Button>
          </div>
        </div>
      </GlassPanel>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,0.98fr)_minmax(0,1.22fr)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={room.phase}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="h-full min-h-0"
          >
            <GlassPanel className="h-full min-h-0 p-4">{renderStage()}</GlassPanel>
          </motion.div>
        </AnimatePresence>

        <GlassPanel className="flex h-full min-h-0 flex-col gap-3 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Table</div>
              <div className="text-sm text-ink-200">
                {connectedCount}/{room.players.length} connectes
              </div>
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-ink-300">
              {room.phase === "drawing" ? "Live" : room.phase === "resolution" ? "Roles reveles" : "Tous visibles"}
            </div>
          </div>

          <div
            className="grid min-h-0 flex-1 auto-rows-fr gap-3 overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${boardColumns}, minmax(0, 1fr))` }}
          >
            {orderedPlayers.map((player) => (
              <div key={player.id} className="min-h-0">
                <PlayerBoardCard
                  phase={room.phase}
                  player={player}
                  strokes={round.drawings[player.id]?.strokes ?? []}
                  previewStroke={livePreviews[player.id]}
                  previewSize={previewSize}
                  isSelf={player.id === selfPlayer.id}
                  isSuspect={player.id === round.resolution?.suspectPlayerId}
                  accuseCount={accuseCountsByPlayer[player.id] ?? 0}
                  selfPointerTargetId={selfPointerTargetId}
                  selectedVoteTargetId={round.selfVote}
                  revealedRole={round.resolution?.revealedRoles[player.id]}
                  pointsAwarded={round.resolution?.pointsAwarded[player.id]}
                  reactionCounts={reactionCountsByPlayer[player.id] ?? EMPTY_REACTIONS}
                  onReact={onReaction}
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
            className="pointer-events-none fixed bottom-4 right-4 z-40 w-[360px] max-w-[calc(100vw-2rem)]"
          >
            <GlassPanel className="pointer-events-auto h-[420px] p-4">
              <ChatPanel title="Chat" players={room.players} messages={round.chat} onSend={onSendChat} />
            </GlassPanel>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
