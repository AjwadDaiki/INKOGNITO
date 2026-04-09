import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DrawingStroke, PlayerRole, PlayerView, ReactionEmoji, RoomView } from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { Button } from "@/components/ui/Button";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { GlassPanel } from "@/components/ui/GlassPanel";

function phaseBg(phase: RoomView["phase"]) {
  switch (phase) {
    case "drawing":
      return "bg-primary-light text-ink-950";
    case "gallery":
      return "bg-surface-low text-ink-700";
    case "discussion":
      return "bg-surface-low text-ink-700";
    case "vote":
      return "bg-[#FEF3C7] text-[#92400e]";
    case "resolution":
      return "bg-tertiary-light text-tertiary";
    default:
      return "bg-surface-low text-ink-700";
  }
}

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
      return "Revelation";
    default:
      return phase;
  }
}

function phaseCopy(phase: RoomView["phase"]) {
  switch (phase) {
    case "drawing":
      return {
        title: "Dessine ton mot",
        subtitle: "Reste simple et lisible pour melanger tout le monde."
      };
    case "gallery":
      return {
        title: "Tout le monde observe",
        subtitle: "Compare les dessins avant de passer a la discussion."
      };
    case "discussion":
      return {
        title: "Designe ton suspect",
        subtitle: "Clique sur un dessin pour montrer la personne que tu accuses."
      };
    case "vote":
      return {
        title: "Vote final",
        subtitle: "Choisis un dessin, verifie le pseudo, puis confirme."
      };
    case "resolution":
      return {
        title: "Verdict",
        subtitle: "Le jeu revele qui a ete vise et quel role se cachait derriere."
      };
    default:
      return { title: phase, subtitle: "" };
  }
}

function roleCopy(role: PlayerRole | null) {
  if (role === "mr_white") {
    return {
      chip: "MR.WHITE",
      tone: "bg-[#FEF3C7] text-[#92400e]",
      message: "Le suspect n'avait aucun mot. Il pouvait encore deviner le mot civil."
    };
  }

  if (role === "undercover") {
    return {
      chip: "UNDERCOVER",
      tone: "bg-tertiary-light text-tertiary",
      message: "Le suspect jouait avec un mot proche. L'infiltration est revelee."
    };
  }

  return {
    chip: "CIVIL",
    tone: "bg-[#dcfce7] text-[#15803d]",
    message: "Le vote est tombe sur un civil. L'equipe s'est peut-etre trompee."
  };
}

function drawingRightCols(count: number) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 8) return 3;
  return 4;
}

function fullGridCols(count: number) {
  if (count <= 2) return count;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

function previewSize(count: number) {
  if (count <= 2) return 240;
  if (count <= 4) return 210;
  if (count <= 6) return 180;
  if (count <= 8) return 160;
  return 144;
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
  const [pendingVote, setPendingVote] = useState<string | null>(null);
  const [showPhaseSplash, setShowPhaseSplash] = useState(true);

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
  const allConnectedPlayers = useMemo(
    () => room.players.filter((player) => player.connected),
    [room.players]
  );

  const meta = phaseCopy(room.phase);
  const selfDrawing = round.drawings[selfPlayer.id];
  const selfPointerTargetId = round.pointers[selfPlayer.id] ?? null;
  const connectedCount = allConnectedPlayers.length;
  const suspectPlayer =
    round.resolution?.suspectPlayerId ? playersById[round.resolution.suspectPlayerId] : null;
  const suspectRole = suspectPlayer ? round.resolution?.revealedRoles[suspectPlayer.id] ?? null : null;
  const resolutionMeta = roleCopy(suspectRole);
  const impostors =
    room.phase === "resolution" && round.resolution
      ? room.players.filter((player) => {
          const role = round.resolution?.revealedRoles[player.id];
          return role === "undercover" || role === "mr_white";
        })
      : [];

  const rightCols = drawingRightCols(otherPlayers.length);
  const rightRows = Math.max(1, Math.ceil(otherPlayers.length / rightCols));
  const allCols = Math.max(1, fullGridCols(allConnectedPlayers.length));
  const allRows = Math.max(1, Math.ceil(allConnectedPlayers.length / allCols));
  const smallSize = previewSize(otherPlayers.length);
  const bigSize = previewSize(allConnectedPlayers.length);
  const denseBoards = room.players.length >= 7;

  useEffect(() => {
    setShowPhaseSplash(true);
    const timer = window.setTimeout(() => setShowPhaseSplash(false), 1100);
    return () => window.clearTimeout(timer);
  }, [room.phase]);

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}?room=${room.roomCode}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  function confirmVote() {
    onVote(pendingVote);
  }

  function renderPhaseDock() {
    if (room.phase === "gallery") {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              {meta.title}
            </div>
            <div className="mt-1 text-sm text-ink-700">{meta.subtitle}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-bold text-ink-600">
              {round.readyForPhaseAdvance.length}/{connectedCount} prets
            </span>
            <Button
              tone="secondary"
              onClick={onReadyForNextPhase}
              className="min-h-9 px-3 py-1.5 text-xs"
            >
              Continuer
            </Button>
          </div>
        </div>
      );
    }

    if (room.phase === "discussion") {
      return (
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              {meta.title}
            </div>
            <div className="mt-1 text-sm text-ink-700">{meta.subtitle}</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-low px-3 py-1 text-xs font-bold text-ink-600">
              Suspect : {selfPointerTargetId ? playersById[selfPointerTargetId]?.profile.name ?? "?" : "Aucun"}
            </span>
            {selfPointerTargetId ? (
              <Button
                tone="ghost"
                onClick={() => onPointFinger(null)}
                className="min-h-9 px-3 py-1.5 text-xs"
              >
                Retirer
              </Button>
            ) : null}
            <CountdownPill endsAt={room.phaseEndsAt} />
          </div>
        </div>
      );
    }

    if (room.phase === "vote") {
      const hasVoted = round.selfVote !== null;
      return (
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
              {meta.title}
            </div>
            <div className="mt-1 text-sm text-ink-700">{meta.subtitle}</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {hasVoted ? (
              <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#92400e]">
                Vote confirme : {playersById[round.selfVote!]?.profile.name ?? "Blanc"}
              </span>
            ) : pendingVote !== null ? (
              <>
                <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#92400e]">
                  Selection : {playersById[pendingVote]?.profile.name ?? "?"}
                </span>
                <Button onClick={confirmVote} className="min-h-9 px-3 py-1.5 text-xs">
                  Valider
                </Button>
                <Button
                  tone="secondary"
                  onClick={() => {
                    setPendingVote(null);
                    onVote(null);
                  }}
                  className="min-h-9 px-3 py-1.5 text-xs"
                >
                  Vote blanc
                </Button>
              </>
            ) : (
              <Button
                tone="secondary"
                onClick={() => onVote(null)}
                className="min-h-9 px-3 py-1.5 text-xs"
              >
                Vote blanc
              </Button>
            )}
            <CountdownPill endsAt={room.phaseEndsAt} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
            {meta.title}
          </div>
          <div className="mt-1 text-sm text-ink-700">{meta.subtitle}</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <CountdownPill endsAt={room.phaseEndsAt} />
        </div>
      </div>
    );
  }

  function renderResolutionShowcase() {
    if (room.phase !== "resolution" || !round.resolution) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlassPanel className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#fff4d6] via-[#fff8ea] to-[#ffe2dc] px-5 py-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="absolute -left-12 top-1/2 h-36 w-36 -translate-y-1/2 rounded-full bg-primary/25 blur-3xl"
              />
              <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
                  Reveal du vote
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <div
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-5xl shadow-card"
                    style={{
                      background: suspectPlayer
                        ? `linear-gradient(160deg,${suspectPlayer.profile.color}44,${suspectPlayer.profile.color}18)`
                        : "linear-gradient(160deg,#ffffff,#f5f5f5)"
                    }}
                  >
                    {suspectPlayer?.profile.emoji ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-500">
                      Joueur vise
                    </div>
                    <div className="truncate font-display text-4xl font-extrabold text-ink-950">
                      {suspectPlayer?.profile.name ?? "Vote blanc"}
                    </div>
                    <div className="mt-2 text-sm text-ink-700">{resolutionMeta.message}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 bg-white px-5 py-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${resolutionMeta.tone}`}>
                  {resolutionMeta.chip}
                </span>
                {round.resolution.civilWord ? (
                  <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-ink-950">
                    {round.resolution.civilWord} / {round.resolution.undercoverWord}
                  </span>
                ) : null}
              </div>

              {impostors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {impostors.map((player, index) => {
                    const role = round.resolution?.revealedRoles[player.id] ?? "undercover";
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 * index, duration: 0.25 }}
                        className={`rounded-[18px] px-4 py-3 text-sm font-bold ${roleCopy(role).tone}`}
                      >
                        {player.profile.emoji} {player.profile.name}
                      </motion.div>
                    );
                  })}
                </div>
              ) : null}

              {round.resolution.mrWhiteGuess.pending &&
              round.resolution.mrWhiteGuess.playerId === selfPlayer.id ? (
                <form
                  className="mt-auto flex flex-wrap items-center gap-2"
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
                    className="h-10 flex-1 rounded-2xl bg-surface-low px-3 text-sm text-ink-950 outline-none"
                    placeholder="Devine le mot civil..."
                  />
                  <Button type="submit" className="min-h-10 px-4 py-2 text-xs">
                    Envoyer
                  </Button>
                </form>
              ) : round.resolution.mrWhiteGuess.playerId ? (
                <div className="rounded-[20px] bg-surface-low px-4 py-3 text-sm text-ink-700">
                  Mr White tente sa derniere chance.
                </div>
              ) : null}
            </div>
          </div>
        </GlassPanel>
      </motion.div>
    );
  }

  function renderDrawingStage() {
    return (
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
        <div className="flex items-center justify-between gap-3 rounded-[24px] bg-surface-low/70 px-3 py-2">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-500">
              {meta.title}
            </div>
            <div className="mt-1 truncate font-display text-3xl font-extrabold leading-none text-ink-950 md:text-[2.25rem]">
              {round.role.ownWord ?? "???"}
            </div>
            <div className="mt-1 text-sm text-ink-600">{meta.subtitle}</div>
          </div>
          <CountdownPill endsAt={room.phaseEndsAt} />
        </div>
        <div className="min-h-0">
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
        dense={denseBoards}
        isSelf={isSelf}
        isSuspect={selfPointerTargetId === player.id}
        selectedVoteTargetId={displayVote}
        revealedRole={round.resolution?.revealedRoles[player.id]}
        pointsAwarded={round.resolution?.pointsAwarded[player.id]}
        onPointFinger={isSelf ? () => {} : onPointFinger}
        onVote={
          isSelf
            ? () => {}
            : room.phase === "vote" && round.selfVote === null
              ? (playerId) => setPendingVote(playerId)
              : onVote
        }
      />
    );
  }

  return (
    <div className="mx-auto flex h-[100svh] max-h-[100svh] w-full max-w-[1720px] flex-col gap-2 overflow-hidden p-2.5 md:p-3">
      <GlassPanel className="shrink-0 overflow-hidden px-3 py-2.5 md:px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${phaseBg(room.phase)}`}
            >
              {phaseLabel(room.phase)}
            </span>
            <span className="text-xs text-ink-400">R{round.roundNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {room.players.map((player) => (
              <span
                key={player.id}
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  player.id === selfPlayer.id
                    ? "bg-primary-light text-ink-950"
                    : "bg-surface-low text-ink-700"
                }`}
              >
                {player.profile.emoji} {player.points}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {room.phase !== "drawing" ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
            <Button
              tone="ghost"
              onClick={() => setChatOpen((value) => !value)}
              className="min-h-9 px-3 py-1.5 text-xs"
            >
              Chat
            </Button>
            <Button
              tone="secondary"
              onClick={copyRoomLink}
              className="min-h-9 px-3 py-1.5 text-xs"
            >
              {copied ? "Copie" : "Lien"}
            </Button>
          </div>
        </div>
      </GlassPanel>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={room.phase}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22 }}
          className="flex min-h-0 flex-1 flex-col gap-2"
        >
          {room.phase === "drawing" ? (
            <div className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
              <GlassPanel className="h-full min-h-0 overflow-hidden p-3 md:p-4">
                {renderDrawingStage()}
              </GlassPanel>

              <GlassPanel className="flex h-full min-h-0 flex-col gap-2 overflow-hidden p-2">
                <div className="flex items-center justify-between rounded-[20px] bg-surface-low/70 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                    {otherPlayers.length} joueur{otherPlayers.length > 1 ? "s" : ""} en direct
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-ink-400">
                    surveillance
                  </span>
                </div>
                <div
                  className="grid min-h-0 flex-1 gap-2 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${rightCols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${rightRows}, minmax(0, 1fr))`
                  }}
                >
                  {otherPlayers.map((player) => makeCard(player, smallSize))}
                </div>
              </GlassPanel>
            </div>
          ) : (
            <>
              <GlassPanel className="shrink-0 overflow-hidden px-3 py-2.5 md:px-4">
                {renderPhaseDock()}
              </GlassPanel>

              {renderResolutionShowcase()}

              <GlassPanel className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
                <div
                  className="grid min-h-0 flex-1 gap-2 overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${allCols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${allRows}, minmax(0, 1fr))`
                  }}
                >
                  {allConnectedPlayers.map((player) => makeCard(player, bigSize))}
                </div>
              </GlassPanel>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none fixed bottom-4 right-4 z-40 w-[340px] max-w-[calc(100vw-2rem)]"
          >
            <div className="pointer-events-auto bento-card h-[380px] p-4">
              <ChatPanel
                title="Chat"
                players={room.players}
                messages={round.chat}
                onSend={onSendChat}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showPhaseSplash ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.82),rgba(247,245,241,0.62),rgba(247,245,241,0.06))]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.86, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -20 }}
              transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-[32px] border border-white/60 bg-white/80 px-8 py-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur"
            >
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-ink-400">
                Nouvelle phase
              </div>
              <div className="font-display text-5xl font-extrabold tracking-[-0.04em] text-ink-950">
                {meta.title}
              </div>
              <div className="mt-3 max-w-xl text-sm text-ink-600">{meta.subtitle}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
