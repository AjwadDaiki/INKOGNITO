import { useMemo, useState } from "react";
import type { PlayerView, RoomView } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { ProfileEditor } from "@/components/ui/ProfileEditor";

function roomLink(roomCode: string) {
  return `${window.location.origin}?room=${roomCode}`;
}

export function LobbyScreen({
  room,
  selfPlayer,
  onProfileChange,
  onUpdateSettings,
  onToggleReady,
  onStartGame,
  onSendChat
}: {
  room: RoomView;
  selfPlayer: PlayerView;
  onProfileChange: (patch: Partial<PlayerView["profile"]>) => void;
  onUpdateSettings: (settings: Partial<RoomView["settings"]>) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onSendChat: (message: string) => void;
}) {
  const isHost = selfPlayer.isHost;
  const connectedPlayers = useMemo(
    () => room.players.filter((player) => player.connected),
    [room.players]
  );
  const readyCount = useMemo(
    () => connectedPlayers.filter((player) => player.ready).length,
    [connectedPlayers]
  );
  const canLaunch = isHost && connectedPlayers.length >= 4 && readyCount >= 4;
  const [civilWord, setCivilWord] = useState("");
  const [undercoverWord, setUndercoverWord] = useState("");

  const customPairs = room.settings.customWordPairs;

  async function copyRoomLink() {
    await navigator.clipboard.writeText(roomLink(room.roomCode));
  }

  async function copyRoomCode() {
    await navigator.clipboard.writeText(room.roomCode);
  }

  function addCustomPair() {
    if (!civilWord.trim() || !undercoverWord.trim()) return;
    onUpdateSettings({
      customWordPairs: [
        ...room.settings.customWordPairs,
        {
          id: `${civilWord}-${undercoverWord}`.toLowerCase(),
          civilWord,
          undercoverWord,
          category: "Custom",
          difficulty: "normal",
          custom: true
        }
      ]
    });
    setCivilWord("");
    setUndercoverWord("");
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.85fr]">
        <GlassPanel className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Salon</div>
              <div className="font-mono text-4xl font-semibold tracking-[0.2em] text-white">
                {room.roomCode}
              </div>
              <div className="mt-2 text-sm text-ink-300">Sans friction. Juste un lien et du chaos.</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button tone="secondary" onClick={copyRoomCode}>
                📋 Copier le code
              </Button>
              <Button tone="secondary" onClick={copyRoomLink}>
                🔗 Partager
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">Joueurs ({room.players.length}/12)</h2>
              <span className="text-sm text-ink-300">
                {readyCount} prêts · {connectedPlayers.length} connectés
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {room.players.map((player) => (
                <div key={player.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <PlayerAvatar
                    player={player}
                    badge={player.isHost ? "HOST" : player.ready ? "PRÊT" : null}
                    highlighted={player.id === selfPlayer.id}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm uppercase tracking-[0.18em] text-ink-300">Ton avatar</div>
            <ProfileEditor profile={selfPlayer.profile} onChange={onProfileChange} compact />
          </div>
        </GlassPanel>

        <div className="grid gap-6">
          <GlassPanel className="space-y-5">
            <div>
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Paramètres</div>
              <h2 className="font-display text-2xl text-white">Choisis ton chaos</h2>
            </div>

            <div className="grid gap-3">
              <label className="text-sm text-ink-300">
                Mode
                <select
                  disabled={!isHost}
                  value={room.settings.mode}
                  onChange={(event) =>
                    onUpdateSettings({ mode: event.target.value as RoomView["settings"]["mode"] })
                  }
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 text-white disabled:opacity-60"
                >
                  <option value="classic">Classique</option>
                  <option value="mr_white">Mr. White</option>
                </select>
              </label>

              <label className="text-sm text-ink-300">
                Temps de dessin
                <select
                  disabled={!isHost}
                  value={room.settings.drawingSeconds}
                  onChange={(event) => onUpdateSettings({ drawingSeconds: Number(event.target.value) })}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 text-white disabled:opacity-60"
                >
                  {[30, 45, 60, 90].map((value) => (
                    <option key={value} value={value}>
                      {value} secondes
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-ink-300">
                Rounds
                <select
                  disabled={!isHost}
                  value={room.settings.rounds}
                  onChange={(event) => onUpdateSettings({ rounds: Number(event.target.value) })}
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 text-white disabled:opacity-60"
                >
                  {[3, 4, 5].map((value) => (
                    <option key={value} value={value}>
                      {value} rounds
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-ink-300">
                Difficulté
                <select
                  disabled={!isHost}
                  value={room.settings.difficulty}
                  onChange={(event) =>
                    onUpdateSettings({
                      difficulty: event.target.value as RoomView["settings"]["difficulty"]
                    })
                  }
                  className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 text-white disabled:opacity-60"
                >
                  <option value="random">Aléatoire</option>
                  <option value="easy">Facile</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Difficile</option>
                </select>
              </label>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">Mots custom</div>
                <span className="text-xs text-ink-300">{customPairs.length} paire(s)</span>
              </div>
              <div className="grid gap-2">
                {customPairs.slice(0, 5).map((pair) => (
                  <div key={pair.id} className="rounded-2xl bg-white/[0.04] px-3 py-2 text-sm text-ink-200">
                    {pair.civilWord} vs {pair.undercoverWord}
                  </div>
                ))}
              </div>
              {isHost ? (
                <div className="mt-3 grid gap-2">
                  <input
                    value={civilWord}
                    onChange={(event) => setCivilWord(event.target.value)}
                    placeholder="Mot principal"
                    className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white"
                  />
                  <input
                    value={undercoverWord}
                    onChange={(event) => setUndercoverWord(event.target.value)}
                    placeholder="Mot piège"
                    className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-white"
                  />
                  <Button tone="secondary" onClick={addCustomPair}>
                    + Ajouter la paire
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Button tone={selfPlayer.ready ? "secondary" : "primary"} onClick={onToggleReady} fullWidth>
                {selfPlayer.ready ? "✓ Prêt" : "Se marquer prêt"}
              </Button>
              {isHost ? (
                <Button fullWidth onClick={onStartGame} disabled={!canLaunch}>
                  🚀 Lancer la partie
                </Button>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
                  L’hôte déclenchera la partie quand 4 joueurs seront prêts.
                </div>
              )}
              {isHost && !canLaunch ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-300">
                  Conditions de lancement: minimum 4 joueurs connectés et 4 prêts.
                  Actuel: {readyCount}/{connectedPlayers.length}.
                </div>
              ) : null}
            </div>
          </GlassPanel>

          <GlassPanel className="min-h-[320px]">
            <ChatPanel title="Mini-chat" players={room.players} messages={room.roomChat} onSend={onSendChat} />
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
