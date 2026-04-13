import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerRole, PlayerView, RoomView, RoundView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { MiniDrawingCanvas } from "./MiniDrawingCanvas";
import { CountdownPill } from "@/components/ui/CountdownPill";
import { InkBleed } from "@/components/ui/InkBleed";
import { useI18n } from "@/i18n";

function roleLabel(role: PlayerRole | null | undefined, t: (key: string) => string) {
  if (role === "undercover") return t("role.undercover");
  if (role === "mr_white") return t("role.mrWhite");
  return t("role.civil");
}

function roleBadgeClass(role: PlayerRole | null | undefined) {
  if (role === "undercover") return "border-[rgba(196,62,46,0.35)] bg-tertiary-light text-tertiary";
  if (role === "mr_white") return "border-[rgba(139,105,20,0.35)] bg-primary-light text-primary-dark";
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
  const t = useI18n((s) => s.t);
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

  const suspectWord =
    suspectRole === "civil"
      ? resolution.civilWord
      : suspectRole === "undercover"
        ? resolution.undercoverWord
        : "???";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto md:gap-3 lg:overflow-hidden">
      {/* Verdict banner — big & dramatic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="paper-sheet desk-shadow shrink-0 rounded-[1.6rem] px-5 py-4 md:px-6 md:py-5"
      >
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
          {/* Left: verdict */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              {room.phaseEndsAt ? <CountdownPill endsAt={room.phaseEndsAt} /> : null}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-sketch text-3xl font-bold text-ink-950 md:text-4xl"
              >
                {isCaught ? t("resolution.caught") : suspectPlayer ? t("resolution.innocent") : t("resolution.noSuspect")}
              </motion.div>
            </div>
            {suspectPlayer ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-1 flex items-center justify-center gap-2 md:justify-start"
              >
                <span className="text-2xl">{suspectPlayer.profile.emoji}</span>
                <span className="font-sketch text-xl font-semibold text-ink-800">
                  {suspectPlayer.profile.name}
                </span>
                <span className={`rounded-full border-2 border-dashed px-3 py-1 font-sketch text-sm font-bold uppercase tracking-wider ${roleBadgeClass(suspectRole)}`}>
                  {roleLabel(suspectRole, t)}
                </span>
              </motion.div>
            ) : null}
          </div>

          {/* Right: words revealed */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 22 }}
            className="flex flex-col gap-2"
          >
            <div className="rounded-[1.1rem] border border-[rgba(74,60,46,0.15)] bg-paper px-4 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400">{t("resolution.civilWord")}</div>
              <div className="font-sketch text-2xl font-bold text-ink-950">
                <InkBleed>{resolution.civilWord}</InkBleed>
              </div>
            </div>
            <div className="rounded-[1.1rem] border border-[rgba(196,62,46,0.2)] bg-tertiary-light/50 px-4 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-tertiary/60">{t("resolution.undercoverWord")}</div>
              <div className="font-sketch text-2xl font-bold text-tertiary">
                <InkBleed intensity={1.3}>{resolution.undercoverWord}</InkBleed>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mr White guess form */}
      {resolution.mrWhiteGuess.pending &&
      resolution.mrWhiteGuess.playerId === selfPlayer.id ? (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="paper-sheet desk-shadow shrink-0 rounded-[1.4rem] px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!guess.trim()) return;
            onSubmitGuess(guess.trim());
            setGuess("");
          }}
        >
          <div className="font-sketch text-xl font-semibold text-primary-dark">
            {t("resolution.lastChance")}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              className="min-h-11 flex-1 rounded-[1.15rem] border border-[rgba(74,60,46,0.12)] px-4 text-sm text-ink-950 outline-none"
              placeholder={t("resolution.civilWordPlaceholder")}
              autoFocus
            />
            <Button type="submit">{t("resolution.guess")}</Button>
          </div>
        </motion.form>
      ) : null}

      {/* All players — scrollable grid */}
      <div className="paper-sheet notebook-page min-h-0 flex-1 overflow-y-auto rounded-[1.6rem] p-3 md:p-4 lg:overflow-hidden">
        <div className="scrollbar-thin flex h-full items-start justify-center overflow-y-auto pl-6 md:pl-8">
          <div
            className={`grid w-full place-items-center gap-3 ${
              allPlayers.length <= 3
                ? "sm:grid-cols-2 md:grid-cols-3"
                : allPlayers.length <= 5
                  ? "sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
                  : "sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
            }`}
          >
            {allPlayers.map((player, index) => {
              const role = resolution.revealedRoles[player.id];
              const isImpostor = role === "undercover" || role === "mr_white";
              const isSuspect = player.id === suspectPlayer?.id;
              const points = resolution.pointsAwarded[player.id] ?? 0;
              const word =
                role === "civil"
                  ? resolution.civilWord
                  : role === "undercover"
                    ? resolution.undercoverWord
                    : "???";
              const tilt = pageAngle(player.id);
              const previewSize = allPlayers.length <= 4 ? 160 : allPlayers.length <= 6 ? 130 : 110;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20, rotate: tilt - 2 }}
                  animate={{ opacity: 1, y: 0, rotate: tilt }}
                  transition={{ delay: 0.3 + index * 0.06, type: "spring", stiffness: 240, damping: 22 }}
                  className={`paper-sheet flex w-full flex-col items-center gap-1.5 overflow-hidden px-2.5 py-2.5 shadow-card ${
                    isImpostor ? "ring-2 ring-tertiary/40" : ""
                  } ${isSuspect ? "border-[rgba(196,62,46,0.25)]" : ""}`}
                >
                  <MiniDrawingCanvas
                    strokes={round.drawings[player.id]?.strokes ?? []}
                    size={previewSize}
                    className="rounded-[0.7rem]"
                  />

                  {/* Name + emoji */}
                  <div className="flex w-full items-center justify-center gap-1.5">
                    <span className="text-lg">{player.profile.emoji}</span>
                    <span className="truncate font-sketch text-base font-semibold leading-tight text-ink-950">
                      {player.profile.name}
                    </span>
                  </div>

                  {/* Role stamp */}
                  <div className={`rounded-full border-2 border-dashed px-3 py-1 text-xs font-bold uppercase tracking-wider ${roleBadgeClass(role)}`}>
                    {roleLabel(role, t)}
                  </div>

                  {/* Word */}
                  <div className="font-sketch text-sm font-medium text-ink-500">
                    <InkBleed intensity={0.8}>{word}</InkBleed>
                  </div>

                  {/* Points */}
                  {points !== 0 ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.06, type: "spring", stiffness: 300 }}
                      className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${
                        points > 0
                          ? "bg-[#e8f2d8] text-[#4a7a20]"
                          : "bg-tertiary-light text-tertiary"
                      }`}
                    >
                      {points > 0 ? `+${points}` : points} pt{Math.abs(points) > 1 ? "s" : ""}
                    </motion.div>
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
