import { useMemo, useState } from "react";
import type {
  DrawingStroke,
  PlayerView,
  ReactionEmoji,
  RoomView
} from "@shared/protocol";
import { DrawingCanvas } from "@/components/game/DrawingCanvas";
import { PlayerBoardCard } from "@/components/game/PlayerBoardCard";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { Button } from "@/components/ui/Button";

function reactionCountsForPlayer(room: RoomView, playerId: string) {
  const counts = new Map<ReactionEmoji, number>();
  room.round?.reactions
    .filter((reaction) => reaction.targetPlayerId === playerId)
    .forEach((reaction) => counts.set(reaction.emoji, (counts.get(reaction.emoji) ?? 0) + 1));
  return [...counts.entries()];
}

function accuseCountForPlayer(room: RoomView, playerId: string) {
  return Object.values(room.round?.pointers ?? {}).filter((targetId) => targetId === playerId).length;
}

function phaseLabel(phase: RoomView["phase"]) {
  switch (phase) {
    case "drawing":
      return "Dessin live";
    case "gallery":
      return "Galerie";
    case "discussion":
      return "Discussion";
    case "vote":
      return "Vote secret";
    case "resolution":
      return "Resolution";
    default:
      return phase;
  }
}

function phaseTitle(room: RoomView) {
  switch (room.phase) {
    case "drawing":
      return "Tout le monde dessine en direct.";
    case "gallery":
      return "Les dessins sont figes, observez la table.";
    case "discussion":
      return "Debattez et pointez le suspect.";
    case "vote":
      return "Choisissez un suspect sans vous reveler.";
    case "resolution":
      return "Le round devoile les roles et les points.";
    default:
      return "La table est en jeu.";
  }
}

function phaseLead(room: RoomView, selfPlayer: PlayerView) {
  const ownRole = room.round?.role.ownRole;
  const ownWord = room.round?.role.ownWord;

  if (room.phase === "drawing") {
    if (ownRole === "mr_white") {
      return "Tu n'as pas de mot. Improvise un dessin plausible sans te trahir.";
    }
    return ownWord
      ? `Ton mot du round: ${ownWord}. Dessine vite, les autres te voient en live.`
      : "Le mot arrive. Prepare ton trait.";
  }

  if (room.phase === "vote") {
    return `Ton vote actuel: ${
      room.round?.selfVote
        ? room.players.find((player) => player.id === room.round?.selfVote)?.profile.name ?? "?"
        : "vote blanc"
    }.`;
  }

  if (room.phase === "resolution") {
    return `${selfPlayer.profile.name}, tu es a ${selfPlayer.points} points. Verifie qui a marque sur ce round.`;
  }

  return room.systemNotice ?? "Le round suit son cours.";
}

function readyCount(room: RoomView) {
  return room.round?.readyForPhaseAdvance.length ?? 0;
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
  const playersById = useMemo(
    () => Object.fromEntries(room.players.map((player) => [player.id, player])),
    [room.players]
  );
  const orderedPlayers = useMemo(() => {
    const players = [...room.players];
    players.sort((first, second) => {
      if (first.id === selfPlayer.id) return -1;
      if (second.id === selfPlayer.id) return 1;
      return 0;
    });
    return players;
  }, [room.players, selfPlayer.id]);
  const leaderboard = useMemo(
    () =>
      [...room.players].sort(
        (first, second) => second.points - first.points || first.profile.name.localeCompare(second.profile.name)
      ),
    [room.players]
  );

  const round = room.round;
  if (!round) return null;

  const selfDrawing = round.drawings[selfPlayer.id];
  const selfPointerTargetId = round.pointers[selfPlayer.id] ?? null;
  const suspectPlayer =
    round.resolution?.suspectPlayerId ? playersById[round.resolution.suspectPlayerId] : null;
  const voteEntries = round.resolution?.votes ? Object.entries(round.resolution.votes) : [];
  const connectedCount = room.players.filter((player) => player.connected).length;
  const previewSize = room.players.length <= 4 ? 300 : room.players.length <= 8 ? 248 : 224;

  async function copyRoomLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}?room=${room.roomCode}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function renderMainSpotlight() {
    if (room.phase === "drawing") {
      return (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Zone perso</div>
              <div className="font-display text-3xl text-white md:text-4xl">
                {round.role.ownRole === "mr_white" ? "Improviser sans filet" : round.role.ownWord}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-ink-300">
                Ton canvas reste large pour garder un bon feeling, mais toute la table reste visible juste en dessous.
              </p>
            </div>
            <CountdownPill endsAt={room.phaseEndsAt} />
          </div>
          <DrawingCanvas
            playerId={selfPlayer.id}
            strokes={selfDrawing?.strokes ?? []}
            onPreview={onPreview}
            onCommit={onCommit}
            onUndo={onUndo}
            onClear={onClear}
          />
        </div>
      );
    }

    if (room.phase === "resolution") {
      return (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Resolution</div>
              <div className="font-display text-3xl text-white md:text-4xl">
                {suspectPlayer
                  ? `${suspectPlayer.profile.name} a pris la majorite`
                  : "Pas de majorite sur ce round"}
              </div>
            </div>
            <CountdownPill endsAt={room.phaseEndsAt} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
              <div className="mb-3 text-sm font-semibold text-white">Votes reveles</div>
              <div className="space-y-2 text-sm text-ink-200">
                {voteEntries.map(([fromPlayerId, toPlayerId]) => (
                  <div
                    key={fromPlayerId}
                    className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2"
                  >
                    <span>{playersById[fromPlayerId]?.profile.name}</span>
                    <span className="text-ink-300">
                      {toPlayerId ? playersById[toPlayerId]?.profile.name ?? "?" : "Vote blanc"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 text-sm font-semibold text-white">Mots</div>
              <div className="font-display text-2xl text-white">{round.resolution?.civilWord}</div>
              <div className="mt-2 text-sm text-ink-300">face a {round.resolution?.undercoverWord}</div>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 text-sm font-semibold text-white">Points du round</div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {room.players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2 text-sm text-ink-200"
                >
                  <span>{player.profile.name}</span>
                  <span className="font-semibold text-white">
                    +{round.resolution?.pointsAwarded[player.id] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Phase en cours</div>
            <div className="font-display text-3xl text-white md:text-4xl">{phaseLabel(room.phase)}</div>
            <p className="mt-2 max-w-2xl text-sm text-ink-300">{phaseLead(room, selfPlayer)}</p>
          </div>
          <CountdownPill endsAt={room.phaseEndsAt} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold text-white">Etat de la table</div>
            <p className="mt-2 text-sm text-ink-300">
              {room.phase === "gallery"
                ? `${readyCount(room)}/${connectedCount} joueurs connectes ont valide la galerie.`
                : room.phase === "discussion"
                  ? `${Object.values(round.pointers).filter(Boolean).length} accusations visuelles sont actives.`
                  : room.phase === "vote"
                    ? "Clique une carte dans la table pour voter. Ton choix reste secret jusqu'a la resolution."
                    : room.systemNotice ?? "Le round suit son cours."}
            </p>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold text-white">Live</div>
            <p className="mt-2 text-sm text-ink-300">
              Tu vois tous les dessins sur une seule table. Les apercus des autres restent visibles sans changer d'ecran.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold text-white">Focus</div>
            <p className="mt-2 text-sm text-ink-300">
              {room.phase === "gallery"
                ? "Reagis vite aux dessins qui te semblent suspects."
                : room.phase === "discussion"
                  ? "Les pointeurs te permettent d'indiquer ta cible sans couper le rythme."
                  : "Observe les styles, les hesitations et les zones remplies trop proprement."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderActionPanel() {
    if (room.phase === "gallery") {
      return (
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Action</div>
            <div className="font-display text-2xl text-white">Valider la galerie</div>
            <p className="mt-2 text-sm text-ink-300">
              Passe a la suite des que tu as observe la table.
            </p>
          </div>
          <Button tone="secondary" onClick={onReadyForNextPhase} fullWidth>
            Pret pour la discussion
          </Button>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
            {readyCount(room)}/{connectedCount} joueurs connectes ont deja valide.
          </div>
        </div>
      );
    }

    if (room.phase === "discussion") {
      return (
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Action</div>
            <div className="font-display text-2xl text-white">Pointe ton suspect</div>
            <p className="mt-2 text-sm text-ink-300">
              Choisis une carte dans la table. Tu peux retirer ton accusation a tout moment.
            </p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
            Accusation actuelle:{" "}
            <span className="font-semibold text-white">
              {selfPointerTargetId ? playersById[selfPointerTargetId]?.profile.name ?? "?" : "aucune"}
            </span>
          </div>
          {selfPointerTargetId ? (
            <Button tone="ghost" onClick={() => onPointFinger(null)} fullWidth>
              Retirer mon accusation
            </Button>
          ) : null}
        </div>
      );
    }

    if (room.phase === "vote") {
      return (
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Action</div>
            <div className="font-display text-2xl text-white">Vote secret</div>
            <p className="mt-2 text-sm text-ink-300">
              Clique une carte joueur ou pose un vote blanc si tu refuses de trancher.
            </p>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
            Vote actuel:{" "}
            <span className="font-semibold text-white">
              {round.selfVote ? playersById[round.selfVote]?.profile.name ?? "?" : "vote blanc"}
            </span>
          </div>
          <Button tone="secondary" onClick={() => onVote(null)} fullWidth>
            Envoyer un vote blanc
          </Button>
        </div>
      );
    }

    if (
      room.phase === "resolution" &&
      round.resolution?.mrWhiteGuess.pending &&
      round.resolution.mrWhiteGuess.playerId === selfPlayer.id
    ) {
      return (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guess.trim()) return;
            onSubmitGuess(guess.trim());
            setGuess("");
          }}
        >
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Derniere chance</div>
            <div className="font-display text-2xl text-white">Devine le mot civil</div>
            <p className="mt-2 text-sm text-ink-300">
              Si tu trouves le mot exact, Mr. White peut encore renverser le round.
            </p>
          </div>
          <input
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white"
            placeholder="Quel etait le mot ?"
          />
          <Button type="submit" fullWidth>
            Valider ma reponse
          </Button>
        </form>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Action</div>
          <div className="font-display text-2xl text-white">Trait agreable</div>
          <p className="mt-2 text-sm text-ink-300">
            Pen, brush, pot de peinture et gomme. Rien de superflu, juste les outils utiles pour ce soir.
          </p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
          Les autres cartes restent visibles pendant toute la partie pour garder la lecture de table.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col gap-6 px-4 py-5 md:px-6 xl:px-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_340px]">
        <GlassPanel className="overflow-hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="mb-2 text-sm uppercase tracking-[0.2em] text-ink-300">
                Round {room.currentRound}/{room.totalRounds} · {phaseLabel(room.phase)}
              </div>
              <h1 className="font-display text-4xl text-white md:text-5xl">{phaseTitle(room)}</h1>
              <p className="mt-3 text-base text-ink-200">{phaseLead(room, selfPlayer)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-white">
                room {room.roomCode}
              </div>
              <CountdownPill endsAt={room.phaseEndsAt} />
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="flex h-full flex-col justify-between gap-4">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Room</div>
            <div className="font-display text-3xl text-white">{room.roomCode}</div>
            <div className="mt-2 text-sm text-ink-300">
              {connectedCount}/{room.players.length} connectes
            </div>
          </div>
          <Button tone="secondary" onClick={copyRoomLink} fullWidth>
            {copied ? "Lien copie" : "Copier le lien"}
          </Button>
        </GlassPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        <GlassPanel>{renderMainSpotlight()}</GlassPanel>

        <GlassPanel className="space-y-4">
          <div className="text-sm uppercase tracking-[0.18em] text-ink-300">Ton role</div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="font-display text-3xl text-white">{round.role.ownRole ?? "..."}</div>
              <div className="mt-2 text-sm text-ink-300">
                Mot: {round.role.ownRole === "mr_white" ? "mystere" : round.role.ownWord ?? "-"}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-300">Score</div>
              <div className="font-display text-2xl text-white">{selfPlayer.points}</div>
            </div>
          </div>
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm text-ink-200">
            {room.systemNotice ?? "Le round est en cours."}
          </div>
        </GlassPanel>

        <div className="grid gap-4">
          <GlassPanel className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm uppercase tracking-[0.18em] text-ink-300">Classement</div>
              <div className="text-xs text-ink-300">points</div>
            </div>
            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                >
                  <div className="min-w-0 text-white">
                    <span className="mr-2 text-ink-300">#{index + 1}</span>
                    <span className="truncate">{player.profile.name}</span>
                  </div>
                  <span className="font-semibold text-white">{player.points}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel>{renderActionPanel()}</GlassPanel>
        </div>
      </div>

      <GlassPanel className="space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Table unique</div>
            <div className="font-display text-3xl text-white">Tous les joueurs restent visibles</div>
          </div>
          <div className="text-sm text-ink-300">
            {room.phase === "drawing"
              ? "Les apercus live montent en direct sur chaque carte."
              : "Toutes les cartes restent accessibles sur un seul ecran."}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
          {orderedPlayers.map((player) => (
            <PlayerBoardCard
              key={player.id}
              phase={room.phase}
              player={player}
              strokes={round.drawings[player.id]?.strokes ?? []}
              previewStroke={livePreviews[player.id]}
              reactionCounts={reactionCountsForPlayer(room, player.id)}
              previewSize={previewSize}
              isSelf={player.id === selfPlayer.id}
              isSuspect={player.id === round.resolution?.suspectPlayerId}
              accuseCount={accuseCountForPlayer(room, player.id)}
              selfPointerTargetId={selfPointerTargetId}
              selectedVoteTargetId={round.selfVote}
              revealedRole={round.resolution?.revealedRoles[player.id]}
              pointsAwarded={round.resolution?.pointsAwarded[player.id]}
              onReact={onReaction}
              onPointFinger={onPointFinger}
              onVote={onVote}
            />
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="min-h-[320px]">
        <ChatPanel title="Chat de partie" players={room.players} messages={round.chat} onSend={onSendChat} />
      </GlassPanel>
    </div>
  );
}
