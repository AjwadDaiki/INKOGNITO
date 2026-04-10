import { useMemo } from "react";
import { motion } from "framer-motion";
import { MIN_PLAYERS } from "@shared/constants";
import type { PlayerView, RoomView } from "@shared/protocol";
import { WORD_CATEGORIES } from "@shared/words";
import { Button } from "@/components/ui/Button";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { InkSplatter } from "@/components/ui/InkSplatter";

function roomLink(roomCode: string) {
  return `${window.location.origin}?room=${roomCode}`;
}

function PillGroup<T extends string | number>({
  options,
  value,
  onChange,
  format
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-ink-950 bg-ink-950 text-paper"
                : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
            }`}
          >
            {format ? format(opt) : String(opt)}
          </button>
        );
      })}
    </div>
  );
}

export function LobbyScreen({
  room,
  selfPlayer,
  onUpdateSettings,
  onToggleReady,
  onStartGame,
  onSendChat
}: {
  room: RoomView;
  selfPlayer: PlayerView;
  onUpdateSettings: (settings: Partial<RoomView["settings"]>) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onSendChat: (message: string) => void;
}) {
  const connectedPlayers = useMemo(
    () => room.players.filter((player) => player.connected),
    [room.players]
  );
  const readyCount = useMemo(
    () => connectedPlayers.filter((player) => player.ready).length,
    [connectedPlayers]
  );
  const everyoneReady =
    connectedPlayers.length >= MIN_PLAYERS && readyCount === connectedPlayers.length;
  const canLaunch = connectedPlayers.length >= MIN_PLAYERS;
  const selectedCategories = room.settings.selectedCategories?.length
    ? room.settings.selectedCategories
    : ["Tout"];
  const visibleCategories = useMemo(() => {
    return WORD_CATEGORIES.filter((category) => category !== "Tout").slice(0, 10);
  }, []);

  async function copyRoomCode() {
    await navigator.clipboard.writeText(room.roomCode);
  }

  async function copyRoomLink() {
    await navigator.clipboard.writeText(roomLink(room.roomCode));
  }

  function toggleCategory(category: string) {
    if (category === "Tout") {
      onUpdateSettings({ selectedCategories: ["Tout"] });
      return;
    }

    const current = selectedCategories.includes("Tout") ? [] : selectedCategories;
    const next = current.includes(category)
      ? current.filter((entry) => entry !== category)
      : [...current, category];

    onUpdateSettings({
      selectedCategories: next.length > 0 ? next : ["Tout"]
    });
  }

  return (
    <div className="relative flex h-[100svh] items-center justify-center overflow-hidden p-3 md:p-5">
      <InkSplatter variant={0} className="left-[3%] top-[9%]" size={210} opacity={0.08} />
      <InkSplatter variant={1} className="bottom-[5%] right-[4%]" size={230} opacity={0.08} />

      <motion.section
        initial={{ opacity: 0, y: 24, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: -0.4 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className="paper-sheet notebook-page desk-shadow animate-page-settle flex h-full w-full max-w-[1480px] flex-col overflow-hidden px-5 py-5 md:px-8"
      >
        <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-ink-950/8" />
        <div className="absolute bottom-8 left-10 h-16 w-16 rounded-full bg-ink-950/6" />

        <div className="flex min-h-0 flex-1 flex-col pl-7 md:pl-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="font-sketch text-4xl font-bold text-ink-950 md:text-5xl">
                Lobby {room.roomCode}
              </div>
              <div className="mt-1 text-sm text-ink-500">
                {connectedPlayers.length} joueur{connectedPlayers.length > 1 ? "s" : ""} dans le lobby
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="ink-chip text-xs font-semibold text-ink-700">
                {readyCount}/{connectedPlayers.length} prets
              </span>
              <span className="ink-chip text-xs font-semibold text-ink-700">
                {everyoneReady ? "tout le monde est pret" : "en attente"}
              </span>
              <Button tone="secondary" onClick={copyRoomCode} className="min-h-10 px-4 text-xs">
                Copier le code
              </Button>
              <Button tone="secondary" onClick={copyRoomLink} className="min-h-10 px-4 text-xs">
                Copier le lien
              </Button>
              <Button tone={selfPlayer.ready ? "secondary" : "primary"} onClick={onToggleReady}>
                {selfPlayer.ready ? "Annuler" : "Je suis pret"}
              </Button>
              {selfPlayer.isHost ? (
                <Button onClick={onStartGame} disabled={!everyoneReady}>
                  Lancer
                </Button>
              ) : null}
            </div>
          </div>

          <div className="paper-divider my-5" />

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.16fr_0.84fr]">
            <div className="min-h-0 rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/88 px-4 py-4 md:px-5">
              <div className="flex h-full min-h-0 flex-col">
                <div className="mb-3 font-sketch text-3xl font-semibold text-ink-900">Lobby</div>
                <div className="grid flex-1 auto-rows-min gap-2.5 overflow-hidden sm:grid-cols-2 xl:grid-cols-3">
                  {room.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 12, rotate: index % 2 === 0 ? -1.1 : 1 }}
                      animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1.1 : 1 }}
                      transition={{ delay: index * 0.04, type: "spring", stiffness: 240, damping: 22 }}
                      className={`rounded-[1.3rem] border px-3 py-2.5 shadow-card ${
                        player.id === selfPlayer.id
                          ? "border-[rgba(212,160,23,0.22)] bg-primary-light/50"
                          : "border-[rgba(74,60,46,0.1)] bg-paper"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,60,46,0.12)] bg-paper text-xl"
                          style={{ boxShadow: "0 8px 18px rgba(90,68,47,0.12)" }}
                        >
                          {player.profile.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-sketch text-[1.55rem] font-semibold leading-none text-ink-950">
                            {player.profile.name}
                          </div>
                          <div className="mt-1 text-[11px] text-ink-500">
                            {player.isHost ? "hote" : "joueur"} - {player.ready ? "pret" : "attend"}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid min-h-0 gap-4 lg:grid-rows-[auto_auto_minmax(0,1fr)]">
              <div className="rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/84 px-4 py-4 md:px-5">
                <div className="mb-3 font-sketch text-3xl font-semibold text-ink-900">
                  Regles de la manche
                </div>
                <div className={`grid gap-3 md:grid-cols-2${selfPlayer.isHost ? "" : " pointer-events-none opacity-50"}`}>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">Mode</div>
                    <PillGroup
                      options={["classic", "mr_white"] as const}
                      value={room.settings.mode}
                      onChange={(value) => onUpdateSettings({ mode: value })}
                      format={(value) => (value === "classic" ? "Classique" : "Mr White")}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">Temps</div>
                    <PillGroup
                      options={[30, 45, 60, 90] as const}
                      value={room.settings.drawingSeconds}
                      onChange={(value) => onUpdateSettings({ drawingSeconds: value })}
                      format={(value) => `${value}s`}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">Rounds</div>
                    <PillGroup
                      options={[3, 4, 5] as const}
                      value={room.settings.rounds}
                      onChange={(value) => onUpdateSettings({ rounds: value })}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">
                      Difficulte
                    </div>
                    <PillGroup
                      options={["easy", "normal", "hard"] as const}
                      value={room.settings.difficulty === "random" ? "normal" : room.settings.difficulty}
                      onChange={(value) => onUpdateSettings({ difficulty: value })}
                      format={(value) =>
                        value === "easy" ? "Facile" : value === "normal" ? "Normal" : "Difficile"
                      }
                    />
                  </div>
                </div>
                {!selfPlayer.isHost ? (
                  <div className="mt-2 text-[10px] text-ink-400">Seul l'hôte peut modifier les règles</div>
                ) : null}
              </div>

              <div className="rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/84 px-4 py-4 md:px-5">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="font-sketch text-3xl font-semibold text-ink-900">Categories</div>
                  <span className="ink-chip text-xs font-semibold text-ink-700">
                    {selectedCategories.includes("Tout")
                      ? "Tout"
                      : `${selectedCategories.length} choix`}
                  </span>
                </div>
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-ink-500">
                  Selection rapide
                </div>
                <div className={`grid gap-2 sm:grid-cols-2${selfPlayer.isHost ? "" : " pointer-events-none opacity-50"}`}>
                  <button
                    type="button"
                    aria-pressed={selectedCategories.includes("Tout")}
                    onClick={() => toggleCategory("Tout")}
                    className={`rounded-[1rem] border px-3 py-2 text-left text-xs font-semibold transition ${
                      selectedCategories.includes("Tout")
                        ? "border-ink-950 bg-ink-950 text-paper"
                        : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
                    }`}
                  >
                    Tout
                  </button>
                  {visibleCategories.map((category) => {
                    const active =
                      !selectedCategories.includes("Tout") && selectedCategories.includes(category);

                    return (
                      <button
                        key={category}
                        type="button"
                        aria-pressed={active}
                        onClick={() => toggleCategory(category)}
                        className={`rounded-[1rem] border px-3 py-2 text-left text-xs font-semibold transition ${
                          active
                            ? "border-ink-950 bg-ink-950 text-paper"
                            : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="min-h-0 rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/82 px-4 py-4 md:px-5">
                <ChatPanel title="Chat" players={room.players} messages={room.roomChat} onSend={onSendChat} />
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
