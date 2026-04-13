import { useState } from "react";
import { motion } from "framer-motion";
import type { GameMode, PlayerProfile } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { ProfileEditor } from "@/components/ui/ProfileEditor";
import { InkSplatter } from "@/components/ui/InkSplatter";
import { CoffeeStain } from "@/components/ui/CoffeeStain";
import { StackedPages } from "@/components/ui/StackedPages";
import { WashiTape } from "@/components/ui/WashiTape";
import { SpiralBinding } from "@/components/ui/SpiralBinding";
import { useI18n, SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n";
import { useStreamerMode } from "@/lib/useStreamerMode";

export function HomeScreen({
  profile,
  loading,
  error,
  onProfileChange,
  onCreate,
  onJoin,
  onQuickPlay,
  onCancelQuickPlay
}: {
  profile: PlayerProfile;
  loading: boolean;
  error: string | null;
  onProfileChange: (patch: Partial<PlayerProfile>) => void;
  onCreate: () => void;
  onJoin: (roomCode: string) => void;
  onQuickPlay: (language: string, mode: GameMode) => void;
  onCancelQuickPlay: () => void;
}) {
  const [accessValue, setAccessValue] = useState("");
  const t = useI18n((s) => s.t);
  const locale = useI18n((s) => s.locale);
  const setLocale = useI18n((s) => s.setLocale);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [inQueue, setInQueue] = useState(false);
  const streamerEnabled = useStreamerMode((s) => s.enabled);
  const toggleStreamer = useStreamerMode((s) => s.toggle);

  function extractRoomCode(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    try {
      const url = new URL(trimmed);
      return url.searchParams.get("room")?.toUpperCase() ?? "";
    } catch {
      return trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    }
  }

  const normalizedRoomCode = extractRoomCode(accessValue);

  return (
    <div className="relative flex h-[100svh] items-center justify-center overflow-hidden p-4 md:p-6">
      <InkSplatter variant={0} className="left-[4%] top-[4%]" size={220} opacity={0.08} />
      <InkSplatter variant={1} className="bottom-[4%] right-[4%]" size={210} opacity={0.09} />
      <CoffeeStain className="right-[12%] top-[8%] rotate-[18deg]" size={140} opacity={0.06} />

      <StackedPages className="w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 28, rotate: -1.4 }}
        animate={{ opacity: 1, y: 0, rotate: -0.8 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="paper-sheet notebook-page desk-shadow animate-page-settle relative w-full overflow-hidden px-6 py-7 md:px-10 md:py-9"
      >
        <SpiralBinding />
        <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(90,68,47,0.08),transparent)]" />
        <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-ink-950/10" />
        <div className="absolute bottom-10 left-8 h-14 w-14 rounded-full bg-ink-950/6" />
        <WashiTape className="-right-3 -top-1" variant={0} rotate={-8} width={100} />
        <WashiTape className="-bottom-1 left-12" variant={1} rotate={4} width={90} />

        <div className="pl-7 md:pl-10">
          {/* Language selector - top right */}
          <div className="absolute right-5 top-5 z-20 md:right-8 md:top-7">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="flex items-center gap-1.5 rounded-full border border-[rgba(74,60,46,0.12)] bg-paper px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:bg-paper-warm"
              >
                {LOCALE_LABELS[locale].flag} {LOCALE_LABELS[locale].label}
              </button>
              {showLangPicker ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full z-30 mt-1 rounded-[1rem] border border-[rgba(74,60,46,0.12)] bg-paper py-1 shadow-card"
                >
                  {SUPPORTED_LOCALES.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setLocale(loc);
                        setShowLangPicker(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-medium transition hover:bg-paper-warm ${
                        loc === locale ? "text-ink-950" : "text-ink-600"
                      }`}
                    >
                      {LOCALE_LABELS[loc].flag} {LOCALE_LABELS[loc].label}
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </div>
          </div>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="font-sketch text-6xl font-bold leading-none text-ink-950 md:text-8xl"
            >
              Inkognito
            </motion.h1>
            <p className="mt-2 font-sketch text-2xl text-ink-700 md:text-3xl">
              {t("home.subtitle")}
            </p>
          </div>

          <div className="paper-divider my-6" />

          {inQueue ? (
            <div className="space-y-4 text-center">
              <div className="font-sketch text-2xl font-semibold text-ink-900">
                {t("matchmaking.searching")}
              </div>
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-ink-200 border-t-ink-800" />
              <Button
                tone="secondary"
                onClick={() => {
                  setInQueue(false);
                  onCancelQuickPlay();
                }}
                fullWidth
              >
                {t("matchmaking.cancel")}
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[1.6rem] border border-[rgba(74,60,46,0.12)] bg-paper/80 px-4 py-4">
                  <div className="mb-3 font-sketch text-2xl font-semibold text-ink-900">
                    {t("home.yourPage")}
                  </div>
                  <ProfileEditor profile={profile} onChange={onProfileChange} compact hideColor />
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 font-sketch text-2xl font-semibold text-ink-900">
                      {t("home.groupCode")}
                    </div>
                    <input
                      value={accessValue}
                      onChange={(e) => setAccessValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && normalizedRoomCode.length === 6 && !loading) {
                          onJoin(normalizedRoomCode);
                        }
                      }}
                      placeholder={t("home.codePlaceholder")}
                      className="min-h-12 w-full rounded-[1.2rem] px-4 text-sm text-ink-950 outline-none placeholder:text-ink-300"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button onClick={onCreate} disabled={loading} fullWidth>
                      {loading ? "..." : t("home.create")}
                    </Button>
                    <Button
                      tone="secondary"
                      onClick={() => onJoin(normalizedRoomCode)}
                      disabled={normalizedRoomCode.length < 6 || loading}
                      fullWidth
                    >
                      {t("home.join")}
                    </Button>
                  </div>

                  {/* Quick Play */}
                  <Button
                    tone="primary"
                    onClick={() => {
                      setInQueue(true);
                      onQuickPlay(locale, "classic");
                    }}
                    disabled={loading}
                    fullWidth
                  >
                    {t("home.quickPlay")} ⚡
                  </Button>

                  {/* Streamer mode toggle */}
                  <button
                    type="button"
                    onClick={toggleStreamer}
                    className={`flex items-center gap-2 rounded-[1.2rem] border px-4 py-2.5 text-left text-xs font-semibold transition ${
                      streamerEnabled
                        ? "border-ink-950 bg-ink-950 text-paper"
                        : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
                    }`}
                  >
                    <span>{streamerEnabled ? "📡" : "📡"}</span>
                    {t("streamer.mode")}
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                      streamerEnabled ? "bg-paper/20 text-paper" : "bg-ink-950/5 text-ink-400"
                    }`}>
                      {streamerEnabled ? "ON" : "OFF"}
                    </span>
                  </button>

                  {error ? (
                    <div className="rounded-[1.2rem] border border-[rgba(120,42,33,0.16)] bg-tertiary-light px-4 py-3 text-sm font-medium text-tertiary">
                      {error}
                    </div>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
      </StackedPages>

      <div className="absolute inset-x-0 bottom-3 text-center">
        <a
          href="https://hiddenlab.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-sketch text-sm text-ink-400 transition-colors hover:text-ink-600"
        >
          hiddenlab.com
        </a>
      </div>
    </div>
  );
}
