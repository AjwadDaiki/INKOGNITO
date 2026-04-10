import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MIN_PLAYERS } from "@shared/constants";
import type { PlayerView, RoomView } from "@shared/protocol";
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
    <div className="flex gap-1.5">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <motion.button
            key={String(opt)}
            type="button"
            whileTap={disabled ? {} : { scale: 0.93 }}
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-2xl py-2 text-xs font-bold transition ${
              active
                ? "bg-gradient-to-br from-primary to-[#C49000] text-ink-950 shadow-primary"
                : "bg-surface-low text-ink-700 hover:bg-surface-high"
            } disabled:opacity-40`}
          >
            {format ? format(opt) : String(opt)}
          </motion.button>
        );
      })}
    </div>
  );
}

type MobileTab = "players" | "settings" | "chat";

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
  const isHost = selfPlayer.isHost;
  const [mobileTab, setMobileTab] = useState<MobileTab>("settings");
  const connectedPlayers = useMemo(
    () => room.players.filter((p) => p.connected),
    [room.players]
  );
  const readyCount = useMemo(
    () => connectedPlayers.filter((p) => p.ready).length,
    [connectedPlayers]
  );
  const canLaunch =
    isHost && connectedPlayers.length >= MIN_PLAYERS && readyCount >= MIN_PLAYERS;

  async function copyRoomCode() {
    await navigator.clipboard.writeText(room.roomCode);
  }
  async function copyRoomLink() {
    await navigator.clipboard.writeText(roomLink(room.roomCode));
  }

  /* ── Shared sub-panels ── */

  const playersPanel = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
          Joueurs
        </span>
        <span className="rounded-full bg-surface-low px-2.5 py-1 text-[10px] font-bold text-ink-500">
          {readyCount}/{connectedPlayers.length} prets
        </span>
      </div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto">
        {room.players.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className={`flex items-center gap-3 rounded-[20px] border p-3 ${
              player.id === selfPlayer.id
                ? "border-[rgba(240,192,0,0.3)] bg-primary-light"
                : player.ready
                  ? "border-[rgba(93,138,74,0.2)] bg-[#edf5e8]"
                  : "border-[rgba(15,23,42,0.06)] bg-surface-low/60"
            }`}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{
                background: `linear-gradient(160deg,${player.profile.color}44,${player.profile.color}18)`
              }}
            >
              {player.profile.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-ink-950">
                {player.profile.name}
              </div>
              <div className="mt-0.5 flex gap-1.5">
                {player.isHost && (
                  <span className="rounded-full bg-ink-950 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                    Host
                  </span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                    player.ready
                      ? "bg-[#e0eddb] text-[#3d6b30]"
                      : "bg-surface-low text-ink-500"
                  }`}
                >
                  {player.ready ? "Pret" : "..."}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {room.players.length < 8 && (
          <div className="flex items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-surface-high p-3 text-sm text-ink-300">
            + Inviter
          </div>
        )}
      </div>
    </div>
  );

  const settingsPanel = (
    <div className="flex min-h-0 flex-1 flex-col">
      <span className="mb-3 shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
        Reglages
      </span>
      <div className="flex flex-1 flex-col gap-4">
        {([
          { label: "Mode", node: (
            <PillGroup
              options={["classic", "mr_white"] as const}
              value={room.settings.mode}
              onChange={(v) => onUpdateSettings({ mode: v })}
              disabled={!isHost}
              format={(v) => (v === "classic" ? "Classique" : "Mr White")}
            />
          )},
          { label: "Temps dessin", node: (
            <PillGroup
              options={[30, 45, 60, 90] as const}
              value={room.settings.drawingSeconds}
              onChange={(v) => onUpdateSettings({ drawingSeconds: v })}
              disabled={!isHost}
              format={(v) => `${v}s`}
            />
          )},
          { label: "Rounds", node: (
            <PillGroup
              options={[3, 4, 5] as const}
              value={room.settings.rounds}
              onChange={(v) => onUpdateSettings({ rounds: v })}
              disabled={!isHost}
            />
          )},
          { label: "Difficulte", node: (
            <PillGroup
              options={["easy", "normal", "hard"] as const}
              value={room.settings.difficulty === "random" ? "normal" : room.settings.difficulty}
              onChange={(v) => onUpdateSettings({ difficulty: v })}
              disabled={!isHost}
              format={(v) => (v === "easy" ? "Facile" : v === "normal" ? "Normal" : "Hard")}
            />
          )}
        ] as const).map((setting, i) => (
          <motion.div
            key={setting.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 + i * 0.06, type: "spring", stiffness: 350, damping: 22 }}
          >
            <div className="mb-1.5 text-xs font-bold text-ink-700">{setting.label}</div>
            {setting.node}
          </motion.div>
        ))}

        {/* Launch zone */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.32, type: "spring", stiffness: 300, damping: 20 }}
          className="mt-auto flex flex-col gap-2 rounded-[20px] bg-ink-950 p-4 text-white"
        >
          <div className="text-center text-2xl font-extrabold">
            {readyCount}/{Math.max(connectedPlayers.length, MIN_PLAYERS)}
            <span className="ml-1 text-sm font-medium text-white/60">prets</span>
          </div>
          <Button
            tone={selfPlayer.ready ? "secondary" : "primary"}
            onClick={onToggleReady}
            fullWidth
          >
            {selfPlayer.ready ? "Plus pret" : "Je suis pret"}
          </Button>
          {isHost && (
            <Button fullWidth onClick={onStartGame} disabled={!canLaunch}>
              Lancer la partie
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );

  const chatPanel = (
    <ChatPanel
      title="Chat"
      players={room.players}
      messages={room.roomChat}
      onSend={onSendChat}
    />
  );

  const tabs: { key: MobileTab; label: string }[] = [
    { key: "players", label: `Joueurs (${connectedPlayers.length})` },
    { key: "settings", label: "Reglages" },
    { key: "chat", label: "Chat" }
  ];

  return (
    <div className="relative flex h-[100svh] flex-col gap-2.5 overflow-hidden p-3 md:p-4">

      {/* Ink splatters */}
      <InkSplatter variant={0} className="left-[3%] top-[15%]" size={180} opacity={0.04} />
      <InkSplatter variant={2} className="bottom-[8%] right-[5%]" size={150} opacity={0.05} />
      <InkSplatter variant={3} className="right-[30%] top-[5%]" size={100} opacity={0.03} />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="bento-card relative flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 18 }}
            className="font-mono text-xl font-extrabold tracking-[0.22em] text-ink-950 md:text-2xl"
          >
            {room.roomCode}
          </motion.span>
          <motion.span
            key={connectedPlayers.length}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 16 }}
            className="rounded-full bg-surface-low px-3 py-1 text-xs font-bold text-ink-500"
          >
            {connectedPlayers.length} joueur{connectedPlayers.length > 1 ? "s" : ""}
          </motion.span>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 350, damping: 22 }}
          className="flex gap-2"
        >
          <Button tone="secondary" onClick={copyRoomCode} className="min-h-9 px-3 text-xs">
            Code
          </Button>
          <Button tone="secondary" onClick={copyRoomLink} className="min-h-9 px-3 text-xs">
            Lien
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Mobile tabs (visible < lg) ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 350, damping: 22 }}
        className="flex shrink-0 gap-1.5 lg:hidden"
      >
        {tabs.map((tab, i) => (
          <motion.button
            key={tab.key}
            type="button"
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 400, damping: 22 }}
            onClick={() => setMobileTab(tab.key)}
            className={`flex-1 rounded-2xl py-2 text-xs font-bold transition ${
              mobileTab === tab.key
                ? "bg-gradient-to-br from-primary to-[#C49000] text-ink-950 shadow-primary"
                : "bg-surface-low text-ink-700 hover:bg-surface-high"
            }`}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Mobile: single panel (< lg) ── */}
      <div className="min-h-0 flex-1 lg:hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mobileTab}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.15 }}
            className="bento-card flex h-full min-h-0 flex-col p-4"
          >
            {mobileTab === "players" && playersPanel}
            {mobileTab === "settings" && settingsPanel}
            {mobileTab === "chat" && chatPanel}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Desktop: 3 columns (>= lg) ── */}
      <div className="hidden min-h-0 flex-1 gap-2.5 lg:grid lg:grid-cols-[1fr_0.85fr_0.85fr]">
        <div className="bento-card flex min-h-0 flex-col p-4">
          {playersPanel}
        </div>
        <div className="bento-card flex min-h-0 flex-col p-4">
          {settingsPanel}
        </div>
        <div className="bento-card flex min-h-0 flex-col p-4">
          {chatPanel}
        </div>
      </div>
    </div>
  );
}
