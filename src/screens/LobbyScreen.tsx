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
  disabled,
  format
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
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
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "border-ink-950 bg-ink-950 text-paper"
                : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
            } disabled:opacity-45`}
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
    () => room.players.filter((p) => p.connected),
    [room.players]
  );
  const readyCount = useMemo(
    () => connectedPlayers.filter((p) => p.ready).length,
    [connectedPlayers]
  );
  const everyoneReady =
    connectedPlayers.length >= MIN_PLAYERS && readyCount === connectedPlayers.length;
  const canLaunch = connectedPlayers.length >= MIN_PLAYERS;
  const selectedCategories = room.settings.selectedCategories?.length
    ? room.settings.selectedCategories
    : ["Tout"];

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

        <div className="pl-7 md:pl-10">
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
              <Button onClick={onStartGame} disabled={!canLaunch}>
                Lancer
              </Button>
            </div>
          </div>

          <div className="paper-divider my-5" />

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex min-h-0 flex-col gap-4">
              <div className="rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/88 px-4 py-4 md:px-5">
                <div className="mb-3 font-sketch text-3xl font-semibold text-ink-900">Lobby</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {room.players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, y: 12, rotate: index % 2 === 0 ? -1.2 : 1.1 }}
                      animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -1.2 : 1.1 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 22 }}
                      className={`rounded-[1.45rem] border px-4 py-3 shadow-card ${
                        player.id === selfPlayer.id
                          ? "border-[rgba(212,160,23,0.22)] bg-primary-light/50"
                          : "border-[rgba(74,60,46,0.1)] bg-paper"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(74,60,46,0.12)] bg-paper text-2xl"
                          style={{ boxShadow: "0 8px 18px rgba(90,68,47,0.12)" }}
                        >
                          {player.profile.emoji}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-sketch text-2xl font-semibold text-ink-950">
                            {player.profile.name}
                          </div>
                          <div className="text-xs text-ink-500">
                            {player.isHost ? "hote" : "joueur"} - {player.ready ? "pret" : "attend"}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/84 px-4 py-4 md:px-5">
                <div className="mb-3 font-sketch text-3xl font-semibold text-ink-900">Regles de la manche</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">Mode</div>
                    <PillGroup
                      options={["classic", "mr_white"] as const}
                      value={room.settings.mode}
                      onChange={(v) => onUpdateSettings({ mode: v })}
                      format={(v) => (v === "classic" ? "Classique" : "Mr White")}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">Temps</div>
                    <PillGroup
                      options={[30, 45, 60, 90] as const}
                      value={room.settings.drawingSeconds}
                      onChange={(v) => onUpdateSettings({ drawingSeconds: v })}
                      format={(v) => `${v}s`}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">Rounds</div>
                    <PillGroup
                      options={[3, 4, 5] as const}
                      value={room.settings.rounds}
                      onChange={(v) => onUpdateSettings({ rounds: v })}
                    />
                  </div>
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-ink-500">Difficulte</div>
                    <PillGroup
                      options={["easy", "normal", "hard"] as const}
                      value={room.settings.difficulty === "random" ? "normal" : room.settings.difficulty}
                      onChange={(v) => onUpdateSettings({ difficulty: v })}
                      format={(v) => (v === "easy" ? "Facile" : v === "normal" ? "Normal" : "Difficile")}
                    />
                  </div>
                </div>

                <div className="paper-divider my-4" />

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs uppercase tracking-[0.18em] text-ink-500">
                      Modes de mots
                    </div>
                    <span className="ink-chip text-xs font-semibold text-ink-700">
                      {selectedCategories.includes("Tout")
                        ? "Tout"
                        : `${selectedCategories.length} catégorie${selectedCategories.length > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="mb-3 text-sm text-ink-600">
                    Coche une ou plusieurs catégories. Par défaut, tout le carnet est mélangé.
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Tout", ...WORD_CATEGORIES].map((category) => {
                      const active =
                        category === "Tout"
                          ? selectedCategories.includes("Tout")
                          : !selectedCategories.includes("Tout") && selectedCategories.includes(category);

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? "border-ink-950 bg-ink-950 text-paper"
                              : "border-[rgba(74,60,46,0.12)] bg-paper text-ink-700"
                          } disabled:opacity-45`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-0 rounded-[1.7rem] border border-[rgba(74,60,46,0.12)] bg-paper/82 px-4 py-4 md:px-5">
              <ChatPanel title="Chat" players={room.players} messages={room.roomChat} onSend={onSendChat} />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
