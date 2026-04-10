import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerRole, PlayerView, RoomView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { MiniDrawingCanvas } from "./MiniDrawingCanvas";
import { CountdownPill } from "@/components/ui/CountdownPill";

function roleLabel(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "UNDERCOVER";
  if (role === "mr_white") return "MR WHITE";
  return "CIVIL";
}

function roleBadgeClass(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "border-[rgba(196,62,46,0.3)] bg-tertiary-light text-tertiary";
  if (role === "mr_white") return "border-[rgba(139,105,20,0.3)] bg-primary-light text-primary-dark";
  return "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700";
}

function pageAngle(seed: string) {
  const sum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ((sum % 7) - 3) * 0.6;
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

  const resolution = round.resolution;
  const suspectRole = suspectPlayer ? resolution.revealedRoles[suspectPlayer.id] : null;
  const isCaught = suspectRole === "undercover" || suspectRole === "mr_white";

  const allPlayers = useMemo(
    () =>
      Object.keys(resolution.revealedRoles)
        .map((id) => playersById[id])
        .filter((p): p is PlayerView => Boolean(p)),
    [playersById, resolution.revealedRoles]
  );

  const dense = allPlayers.length >= 7;
  const previewSize = dense ? 120 : allPlayers.length >= 5 ? 140 : 160;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden md:gap-3">
      {/* Header — verdict + words */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="paper-sheet desk-shadow shrink-0 rounded-[1.4rem] px-4 py-3 text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          {room.phaseEndsAt ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
          <div className="font-sketch text-2xl font-bold text-ink-950 md:text-3xl">
            {isCaught ? "Pris dans l'encre !" : suspectPlayer ? "Innocent..." : "Pas de suspect"}
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="rounded-full border border-[rgba(74,60,46,0.12)] bg-paper px-3 py-1 font-semibold text-ink-800">
            Civil : {resolution.civilWord}
          </span>
          <span className="rounded-full border border-[rgba(196,62,46,0.2)] bg-tertiary-light px-3 py-1 font-semibold text-tertiary">
            Undercover : {resolution.undercoverWord}
          </span>
        </div>
      </motion.div>

      {/* Mr White guess form */}
      {resolution.mrWhiteGuess.pending &&
      resolution.mrWhiteGuess.playerId === selfPlayer.id ? (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="paper-sheet desk-shadow shrink-0 rounded-[1.4rem] px-4 py-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guess.trim()) return;
            onSubmitGuess(guess.trim());
            setGuess("");
          }}
        >
          <div className="font-sketch text-xl font-semibold text-primary-dark">
            Dernière chance — Devine le mot civil
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              className="min-h-11 flex-1 rounded-[1.15rem] border border-[rgba(74,60,46,0.12)] px-4 text-sm text-ink-950 outline-none"
              placeholder="Mot civil"
              autoFocus
            />
            <Button type="submit">Deviner</Button>
          </div>
        </motion.form>
      ) : null}

      {/* All players grid */}
      <div className="paper-sheet notebook-page min-h-0 flex-1 overflow-hidden rounded-[1.6rem] p-2 md:p-3">
        <div className="scrollbar-thin flex h-full items-start justify-center overflow-y-auto">
          <div
            className={`grid place-items-center gap-2 ${
              dense
                ? "sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
                : allPlayers.length <= 4
                  ? "sm:grid-cols-2 md:grid-cols-4"
                  : "sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
            }`}
          >
            {allPlayers.map((player, index) => {
              const role = resolution.revealedRoles[player.id];
              const isUndercover = role === "undercover" || role === "mr_white";
              const isSuspect = player.id === suspectPlayer?.id;
              const points = resolution.pointsAwarded[player.id] ?? 0;
              const word = role === "civil"
                ? resolution.civilWord
                : role === "undercover"
                  ? resolution.undercoverWord
                  : "???";
              const tilt = pageAngle(player.id);

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 16, rotate: tilt - 1.5 }}
                  animate={{ opacity: 1, y: 0, rotate: tilt }}
                  transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 22 }}
                  className={`paper-sheet flex w-full flex-col items-center gap-1 overflow-hidden px-2 py-2 shadow-card ${
                    isUndercover ? "ring-2 ring-tertiary/30" : ""
                  } ${isSuspect ? "border-[rgba(196,62,46,0.2)]" : ""}`}
                >
                  <MiniDrawingCanvas
                    strokes={round.drawings[player.id]?.strokes ?? []}
                    size={previewSize}
                    className="rounded-[0.6rem]"
                  />

                  {/* Name */}
                  <div className="w-full truncate text-center font-sketch text-sm font-semibold leading-tight text-ink-950">
                    {player.profile.emoji} {player.profile.name}
                  </div>

                  {/* Role badge */}
                  <div className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleBadgeClass(role)}`}>
                    {roleLabel(role)}
                  </div>

                  {/* Word */}
                  <div className="text-[10px] font-medium text-ink-500">
                    {word}
                  </div>

                  {/* Points */}
                  {points !== 0 ? (
                    <div className={`text-xs font-bold ${points > 0 ? "text-[#6a8a20]" : "text-tertiary"}`}>
                      {points > 0 ? `+${points}` : points} pt{Math.abs(points) > 1 ? "s" : ""}
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
