import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerRole, PlayerView, RoomView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { MiniDrawingCanvas } from "./MiniDrawingCanvas";

function roleLabel(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "Undercover";
  if (role === "mr_white") return "Mr White";
  return "Civil";
}

function roleTone(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "border-[rgba(196,62,46,0.26)] bg-tertiary-light text-tertiary";
  if (role === "mr_white") return "border-[rgba(139,105,20,0.26)] bg-primary-light text-primary-dark";
  return "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700";
}

function pageAngle(seed: string) {
  const sum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ((sum % 7) - 3) * 0.7;
}

export function ResolutionShowcase({
  round,
  room,
  playersById,
  suspectPlayer,
  selfPlayer,
  onSubmitGuess
}: {
  round: RoundView;
  room: RoomView;
  playersById: Record<string, PlayerView>;
  suspectPlayer: PlayerView | null;
  selfPlayer: PlayerView;
  onSubmitGuess: (guess: string) => void;
}) {
  const [guess, setGuess] = useState("");

  if (!round.resolution) return null;

  const suspectRole = suspectPlayer ? round.resolution.revealedRoles[suspectPlayer.id] : null;
  const isCaught = suspectRole === "undercover" || suspectRole === "mr_white";

  const { votesByTarget, blankVoters } = useMemo(() => {
    const nextVotesByTarget: Record<string, PlayerView[]> = {};
    const nextBlankVoters: PlayerView[] = [];
    for (const [fromId, toId] of Object.entries(round.resolution!.votes)) {
      const voter = playersById[fromId];
      if (!voter) continue;
      if (toId) {
        if (!nextVotesByTarget[toId]) nextVotesByTarget[toId] = [];
        nextVotesByTarget[toId].push(voter);
      } else {
        nextBlankVoters.push(voter);
      }
    }
    return { votesByTarget: nextVotesByTarget, blankVoters: nextBlankVoters };
  }, [playersById, round.resolution]);

  const allPlayers = useMemo(() => room.players.filter((player) => player.connected), [room.players]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <div className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -1.2 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6 }}
          className="paper-sheet desk-shadow relative overflow-hidden px-5 py-5"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-none absolute inset-0 ${
              isCaught
                ? "bg-[radial-gradient(circle_at_center,rgba(196,62,46,0.26),transparent_58%)]"
                : "bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.2),transparent_58%)]"
            }`}
          />

          <div className="relative">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-500">Verdict</div>
            <div className="mt-1 font-sketch text-5xl font-bold text-ink-950 md:text-6xl">
              {isCaught ? "Pris dans l'encre" : "Fausse piste"}
            </div>
            <p className="mt-2 text-sm text-ink-700">
              {suspectPlayer
                ? `${suspectPlayer.profile.name} etait au centre des soupcons.`
                : "Le tour est termine."}
            </p>

            {suspectPlayer ? (
              <motion.div
                initial={{ opacity: 0, y: 14, rotate: 4 }}
                animate={{ opacity: 1, y: 0, rotate: 1.6 }}
                transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 24 }}
                className="paper-sheet relative mt-5 overflow-hidden px-4 py-4"
              >
                <motion.div
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: isCaught ? 0.32 : 0.2 }}
                  transition={{ delay: 0.06, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className={`pointer-events-none absolute inset-[-18%] rounded-full ${
                    isCaught
                      ? "bg-[radial-gradient(circle_at_center,rgba(196,62,46,0.7),rgba(196,62,46,0.16)_34%,transparent_64%)]"
                      : "bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.58),rgba(212,160,23,0.14)_34%,transparent_64%)]"
                  }`}
                  style={{ filter: "blur(1px)" }}
                />
                <motion.div
                  initial={{ scale: 0.12, opacity: 0, rotate: -25 }}
                  animate={{ scale: 1, opacity: 0.18, rotate: 0 }}
                  transition={{ delay: 0.12, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute -left-12 -top-10 h-28 w-28 rounded-full bg-ink-950"
                  style={{ filter: "blur(2px)" }}
                />
                <motion.div
                  initial={{ scale: 0.12, opacity: 0, rotate: 25 }}
                  animate={{ scale: 1, opacity: 0.12, rotate: 0 }}
                  transition={{ delay: 0.16, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute -bottom-10 -right-6 h-20 w-20 rounded-full bg-ink-950"
                />
                <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-ink-950/8" />
                <MiniDrawingCanvas
                  strokes={round.drawings[suspectPlayer.id]?.strokes ?? []}
                  size={220}
                  className="rounded-[1rem] bg-[#fbf7f0]"
                />
                <div className="mt-3 text-center">
                  <div className="font-sketch text-4xl font-semibold leading-none text-ink-950">
                    {suspectPlayer.profile.name}
                  </div>
                  <div className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${roleTone(suspectRole)}`}>
                    {roleLabel(suspectRole)}
                  </div>
                  <div className="mt-3 flex justify-center gap-2 text-xs">
                    <span className="ink-chip text-ink-700">{round.resolution.civilWord}</span>
                    <span className="ink-chip text-ink-700">{round.resolution.undercoverWord}</span>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {round.resolution.mrWhiteGuess.pending &&
            round.resolution.mrWhiteGuess.playerId === selfPlayer.id ? (
              <form
                className="mt-5 rounded-[1.5rem] border border-[rgba(139,105,20,0.22)] bg-primary-light/55 px-4 py-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!guess.trim()) return;
                  onSubmitGuess(guess.trim());
                  setGuess("");
                }}
              >
                <div className="font-sketch text-3xl font-semibold text-primary-dark">
                  Derniere chance
                </div>
                <div className="mt-1 text-sm text-ink-700">
                  Devine le mot civil pour revenir dans la partie.
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="min-h-11 flex-1 rounded-[1.15rem] px-4 text-sm text-ink-950 outline-none"
                    placeholder="Mot civil"
                    autoFocus
                  />
                  <Button type="submit">Deviner</Button>
                </div>
              </form>
            ) : null}
          </div>
        </motion.div>

        <div className="paper-sheet min-h-0 overflow-hidden px-4 py-4 md:px-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-sketch text-4xl font-semibold leading-none text-ink-950">
                Qui a vote pour qui
              </div>
              <div className="mt-1 text-sm text-ink-500">Le seul moment ou toute l&apos;histoire se lit d&apos;un coup.</div>
            </div>
            {blankVoters.length ? (
              <div className="ink-chip text-xs text-ink-700">
                Blanc : {blankVoters.map((voter) => voter.profile.name).join(", ")}
              </div>
            ) : null}
          </div>

          <div className="scrollbar-thin grid max-h-[58vh] gap-3 overflow-y-auto pr-1 md:grid-cols-2 2xl:grid-cols-3">
            {allPlayers.map((player, index) => {
              const revealedRole = round.resolution!.revealedRoles[player.id];
              const voters = votesByTarget[player.id] ?? [];
              const pts = round.resolution!.pointsAwarded[player.id] ?? 0;
              const tilt = pageAngle(player.id);
              const isSuspect = player.id === suspectPlayer?.id;

              return (
                <motion.article
                  key={player.id}
                  initial={{ opacity: 0, y: 18, rotate: tilt - 2 }}
                  animate={{ opacity: 1, y: 0, rotate: tilt }}
                  transition={{ delay: index * 0.04, type: "spring", stiffness: 250, damping: 22 }}
                  className={`paper-sheet overflow-hidden px-3 py-3 ${isSuspect ? "ring-2 ring-tertiary/25" : ""}`}
                >
                  {isSuspect ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.15 }}
                      animate={{ opacity: 0.2, scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="pointer-events-none absolute inset-[-10%] rounded-full bg-[radial-gradient(circle_at_center,rgba(196,62,46,0.65),rgba(196,62,46,0.14)_30%,transparent_58%)]"
                    />
                  ) : null}
                  <MiniDrawingCanvas
                    strokes={round.drawings[player.id]?.strokes ?? []}
                    size={180}
                    className="rounded-[1rem] bg-[#fbf7f0]"
                  />

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-sketch text-3xl font-semibold leading-none text-ink-950">
                        {player.profile.name}
                      </div>
                      <div className="mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-700">
                        {roleLabel(revealedRole)}
                      </div>
                    </div>
                    <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pts > 0 ? "bg-primary-light text-primary-dark" : "bg-paper text-ink-500"}`}>
                      {pts > 0 ? `+${pts}` : pts} pts
                    </div>
                  </div>

                  <div className="mt-3 rounded-[1.2rem] border border-[rgba(74,60,46,0.1)] bg-paper/70 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-ink-500">Votes recus</div>
                    {voters.length ? (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {voters.map((voter) => (
                          <div key={voter.id} className="flex items-center gap-2 text-sm text-ink-900">
                            <span className="text-base">{voter.profile.emoji}</span>
                            <span>{voter.profile.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-ink-500">Aucun vote</div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
