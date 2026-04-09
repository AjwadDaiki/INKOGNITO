import { useMemo } from "react";
import { motion } from "framer-motion";
import { MIN_PLAYERS } from "@shared/constants";
import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { ChatPanel } from "@/components/ui/ChatPanel";

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
  onChange: (value: T) => void;
  disabled?: boolean;
  format?: (value: T) => string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const active = option === value;
        return (
          <motion.button
            key={String(option)}
            type="button"
            whileTap={disabled ? {} : { scale: 0.95 }}
            disabled={disabled}
            onClick={() => onChange(option)}
            className={`rounded-2xl px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
              active
                ? "bg-gradient-to-br from-primary to-[#FFD700] text-ink-950 shadow-primary"
                : "bg-surface-low text-ink-700 hover:bg-surface-high"
            } disabled:opacity-40`}
          >
            {format ? format(option) : String(option)}
          </motion.button>
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
  const isHost = selfPlayer.isHost;
  const connectedPlayers = useMemo(() => room.players.filter((player) => player.connected), [room.players]);
  const readyCount = useMemo(
    () => connectedPlayers.filter((player) => player.ready).length,
    [connectedPlayers]
  );
  const canLaunch = isHost && connectedPlayers.length >= MIN_PLAYERS && readyCount >= MIN_PLAYERS;

  async function copyRoomLink() {
    await navigator.clipboard.writeText(roomLink(room.roomCode));
  }

  async function copyRoomCode() {
    await navigator.clipboard.writeText(room.roomCode);
  }

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden p-3 md:p-4">
      <div className="bento-card flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-5">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-[28px] bg-surface-low/70 px-4 py-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-400">
              Salle
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="font-mono text-3xl font-extrabold tracking-[0.24em] text-ink-950">
                {room.roomCode}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-600 shadow-card">
                {connectedPlayers.length} joueur{connectedPlayers.length > 1 ? "s" : ""} connecte
                {connectedPlayers.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button tone="secondary" onClick={copyRoomCode} className="min-h-9 px-3 py-1.5 text-xs">
              Copier code
            </Button>
            <Button tone="secondary" onClick={copyRoomLink} className="min-h-9 px-3 py-1.5 text-xs">
              Copier lien
            </Button>
          </div>
        </div>

        <div className="mt-4 grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-0 flex-col gap-4">
            <div className="rounded-[28px] bg-surface-low/55 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                    Equipe
                  </div>
                  <div className="mt-1 text-lg font-extrabold text-ink-950">
                    Tout le monde est reuni ici
                  </div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-ink-600 shadow-card">
                  {readyCount}/{connectedPlayers.length} prets
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {room.players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.24 }}
                    className={`rounded-[24px] border p-3 ${
                      player.id === selfPlayer.id
                        ? "border-[rgba(240,192,0,0.34)] bg-primary-light"
                        : player.ready
                          ? "border-[rgba(34,197,94,0.22)] bg-[#ecfdf5]"
                          : "border-[rgba(15,23,42,0.07)] bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl shadow-card"
                        style={{
                          background: `linear-gradient(160deg,${player.profile.color}44,${player.profile.color}18)`,
                          boxShadow: `0 4px 14px ${player.profile.color}40`
                        }}
                      >
                        {player.profile.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-ink-950">
                          {player.profile.name}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {player.isHost ? (
                            <span className="rounded-full bg-ink-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                              Host
                            </span>
                          ) : null}
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
                              player.ready
                                ? "bg-[#dcfce7] text-[#15803d]"
                                : "bg-surface-low text-ink-500"
                            }`}
                          >
                            {player.ready ? "Pret" : "En attente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-surface-low/55 p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                Regles rapides
              </div>
              <div className="grid gap-2 text-sm text-ink-700 md:grid-cols-2">
                <div>1. Tout le monde recoit un mot.</div>
                <div>2. Chacun le dessine sans parler.</div>
                <div>3. L&apos;Undercover a un mot proche.</div>
                <div>4. On observe, on discute, puis on vote.</div>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 gap-4 lg:grid-rows-[auto_auto_minmax(0,1fr)]">
            <div className="rounded-[28px] bg-surface-low/55 p-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-400">
                Reglages
              </div>
              <div className="grid gap-4">
                <div>
                  <div className="mb-2 text-sm font-bold text-ink-700">Mode</div>
                  <PillGroup
                    options={["classic", "mr_white"] as const}
                    value={room.settings.mode}
                    onChange={(value) => onUpdateSettings({ mode: value })}
                    disabled={!isHost}
                    format={(value) => (value === "classic" ? "Classique" : "Mr White")}
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-bold text-ink-700">Temps de dessin</div>
                  <PillGroup
                    options={[30, 45, 60] as const}
                    value={room.settings.drawingSeconds}
                    onChange={(value) => onUpdateSettings({ drawingSeconds: value })}
                    disabled={!isHost}
                    format={(value) => `${value}s`}
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-bold text-ink-700">Rounds</div>
                  <PillGroup
                    options={[3, 4, 5] as const}
                    value={room.settings.rounds}
                    onChange={(value) => onUpdateSettings({ rounds: value })}
                    disabled={!isHost}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-ink-950 px-4 py-4 text-white">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                Pret au lancement
              </div>
              <div className="mb-4 text-2xl font-extrabold">
                {readyCount}/{Math.max(connectedPlayers.length, MIN_PLAYERS)}
              </div>
              <div className="mb-4 text-sm text-white/70">
                Il faut au moins {MIN_PLAYERS} joueurs prets pour lancer la partie.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  tone={selfPlayer.ready ? "secondary" : "primary"}
                  onClick={onToggleReady}
                  fullWidth
                >
                  {selfPlayer.ready ? "Je ne suis plus pret" : "Je suis pret"}
                </Button>
                {isHost ? (
                  <Button fullWidth onClick={onStartGame} disabled={!canLaunch}>
                    Lancer la partie
                  </Button>
                ) : (
                  <div className="flex items-center justify-center rounded-2xl bg-white/8 px-4 py-3 text-sm text-white/70">
                    Le host lance la partie
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-0 rounded-[28px] bg-surface-low/55 p-4">
              <ChatPanel
                title="Chat de la salle"
                players={room.players}
                messages={room.roomChat}
                onSend={onSendChat}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
