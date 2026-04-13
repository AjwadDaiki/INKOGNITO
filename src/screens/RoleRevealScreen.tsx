import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { InkSplatter } from "@/components/ui/InkSplatter";
import { StackedPages } from "@/components/ui/StackedPages";
import { WashiTape } from "@/components/ui/WashiTape";
import { SpiralBinding } from "@/components/ui/SpiralBinding";
import { useI18n } from "@/i18n";
import { StreamerWordGuard } from "@/components/ui/StreamerWordGuard";

function roleTone(room: RoomView, t: (key: string, params?: Record<string, string | number>) => string) {
  const role = room.round?.role.ownRole;
  if (role === "mr_white") {
    return {
      stamp: "border-[rgba(139,105,20,0.5)] text-primary-dark",
      title: t("role.mrWhite"),
      subtitle: t("role.mrWhiteSub")
    };
  }

  if (role === "undercover") {
    return {
      stamp: "border-[rgba(196,62,46,0.5)] text-tertiary",
      title: t("role.undercover"),
      subtitle: t("role.undercoverSub")
    };
  }

  return {
    stamp: "border-[rgba(74,60,46,0.4)] text-ink-800",
    title: t("role.civil"),
    subtitle: t("role.civilSub")
  };
}

export function RoleRevealScreen({
  room,
  selfPlayer,
  onConfirm
}: {
  room: RoomView;
  selfPlayer: PlayerView;
  onConfirm: () => void;
}) {
  const t = useI18n((s) => s.t);
  const ownWord = room.round?.role.ownWord ?? null;
  const ownRole = room.round?.role.ownRole;
  const confirmedCount = room.roleConfirmedPlayerIds.length;
  const tone = roleTone(room, t);
  const isMrWhite = ownRole === "mr_white";
  const hasConfirmed = room.roleConfirmedPlayerIds.includes(selfPlayer.id);

  // 30s countdown with auto-confirm
  const ROLE_REVEAL_SECONDS = 30;
  const [secondsLeft, setSecondsLeft] = useState(ROLE_REVEAL_SECONDS);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (hasConfirmed) {
      confirmedRef.current = true;
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!confirmedRef.current) {
            confirmedRef.current = true;
            onConfirm();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasConfirmed, onConfirm]);

  return (
    <div className="relative flex min-h-[100svh] items-start justify-center overflow-y-auto p-4 md:p-6 lg:h-[100svh] lg:min-h-0 lg:items-center lg:overflow-hidden">
      <InkSplatter variant={0} className="left-[8%] top-[10%]" size={220} opacity={0.08} />
      <InkSplatter variant={1} className="bottom-[10%] right-[8%]" size={220} opacity={0.09} />

      <StackedPages className="w-full max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: -0.8 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="paper-sheet notebook-page desk-shadow animate-page-settle w-full overflow-hidden px-6 py-7 md:px-10 md:py-8"
      >
        <SpiralBinding />
        <div className="absolute right-8 top-10 h-20 w-20 rounded-full bg-ink-950/8" />
        <WashiTape className="-right-2 -top-1" variant={0} rotate={-7} width={100} />
        <div className="pl-7 md:pl-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-ink-500">{t("role.secretCard")}</div>
              <div className="mt-1 font-sketch text-5xl font-bold leading-none text-ink-950 md:text-6xl">
                {selfPlayer.profile.name}
              </div>
            </div>
            {/* Stamp effect — only shown for Mr. White (others discover their role at the end) */}
            {isMrWhite ? (
              <motion.div
                initial={{ scale: 1.6, opacity: 0, filter: "blur(6px)", rotate: -8 }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)", rotate: -3 }}
                transition={{ delay: 0.35, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-[0.6rem] border-[3px] border-dashed px-5 py-2.5 font-sketch text-2xl font-bold uppercase tracking-[0.22em] ${tone.stamp}`}
                style={{ textShadow: "1px 1px 0 rgba(255,255,255,0.5)" }}
              >
                {tone.title}
              </motion.div>
            ) : (
              /* Countdown timer for non-Mr White players */
              <div className="flex items-center gap-2 rounded-full border border-[rgba(74,60,46,0.15)] bg-paper px-4 py-2 font-sketch text-xl font-bold text-ink-700">
                ⏱ {secondsLeft}s
              </div>
            )}
          </div>

          <div className="paper-divider my-5" />

          <StreamerWordGuard>
            <motion.div
              initial={{ opacity: 0, y: 18, rotate: 2.4 }}
              animate={{ opacity: 1, y: 0, rotate: 1.1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 240, damping: 24 }}
              className="paper-sheet mx-auto max-w-2xl px-6 py-8 text-center"
            >
              <div className="font-sketch text-3xl font-semibold text-ink-700">
                {ownWord ? t("role.yourWord") : t("role.noWord")}
              </div>
              <div className="mt-3 font-sketch text-6xl font-bold leading-none text-ink-950 md:text-7xl">
                {ownWord ?? "?"}
              </div>
              <div className="mt-4 text-base text-ink-700 md:text-lg">
                {isMrWhite ? tone.subtitle : t("role.drawThisWord")}
              </div>
            </motion.div>
          </StreamerWordGuard>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-[1.5rem] border border-[rgba(74,60,46,0.1)] bg-paper/80 px-4 py-4">
              <div className="font-sketch text-3xl font-semibold text-ink-900">{t("role.before")}</div>
              <div className="mt-2 space-y-1.5 text-sm text-ink-700">
                <div>{t("role.memorize")}</div>
                <div>{t("role.hide")}</div>
                <div>{t("role.clickReady")}</div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[rgba(74,60,46,0.1)] bg-ink-950 px-5 py-4 text-paper md:min-w-[220px]">
              <div className="text-xs uppercase tracking-[0.18em] text-paper/60">{t("role.confirmations")}</div>
              <div className="mt-2 font-sketch text-5xl font-bold leading-none">
                {confirmedCount}/{room.players.length}
              </div>
              <div className="mt-2 text-sm text-paper/70">{t("role.pagesClosed")}</div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onConfirm} fullWidth disabled={hasConfirmed}>
              {hasConfirmed ? t("role.waiting") : t("role.memorized")}
            </Button>
            {isMrWhite && !hasConfirmed ? (
              <div className="shrink-0 rounded-full border border-[rgba(74,60,46,0.15)] bg-paper px-4 py-2 font-sketch text-xl font-bold text-ink-700">
                ⏱ {secondsLeft}s
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
      </StackedPages>
    </div>
  );
}
