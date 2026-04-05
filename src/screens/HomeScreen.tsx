import { useState } from "react";
import type { PlayerProfile } from "@shared/protocol";
import { MIN_PLAYERS } from "@shared/constants";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProfileEditor } from "@/components/ui/ProfileEditor";

export function HomeScreen({
  profile,
  loading,
  error,
  onProfileChange,
  onCreate,
  onJoin
}: {
  profile: PlayerProfile;
  loading: boolean;
  error: string | null;
  onProfileChange: (patch: Partial<PlayerProfile>) => void;
  onCreate: () => void;
  onJoin: (roomCode: string) => void;
}) {
  const [accessValue, setAccessValue] = useState("");

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
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-10 md:px-8">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-neon-cyan/20 bg-neon-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-neon-cyan">
          Party game dessin et deduction
        </div>
        <h1 className="font-display text-5xl font-semibold tracking-[-0.03em] text-white md:text-7xl">
          INKOGNITO
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-300 md:text-lg">
          Cree une room, partage le lien, et commence une partie en quelques secondes.
        </p>
      </div>

      <GlassPanel className="mx-auto w-full max-w-4xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div>
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Profil</div>
              <h2 className="font-display text-3xl text-white">Entre vite dans la partie</h2>
              <p className="mt-2 text-sm text-ink-300">
                Choisis un pseudo, un emoji, puis cree ou rejoins un salon.
              </p>
            </div>

            <ProfileEditor profile={profile} onChange={onProfileChange} compact />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm text-ink-200">
              <div className="font-semibold text-white">{MIN_PLAYERS} joueurs minimum</div>
              <div className="mt-1 text-ink-300">
                Tout le monde dessine en direct sur la meme table avant la discussion et le vote.
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-ink-300">Acces</div>
              <h2 className="font-display text-3xl text-white">Un seul champ suffit</h2>
              <p className="mt-2 text-sm text-ink-300">
                Colle un code ou un lien de room. Si tu n'as rien, cree simplement une partie.
              </p>
            </div>

            <label className="block text-sm text-ink-300">
              Code ou lien
              <input
                value={accessValue}
                onChange={(event) => setAccessValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && normalizedRoomCode.length === 6 && !loading) {
                    onJoin(normalizedRoomCode);
                  }
                }}
                placeholder="Ex: A1B2C3 ou lien d'invitation"
                className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-neon-cyan/40 focus:bg-white/10"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button fullWidth onClick={onCreate} disabled={loading}>
                Creer une partie
              </Button>
              <Button
                fullWidth
                tone="secondary"
                onClick={() => onJoin(normalizedRoomCode)}
                disabled={normalizedRoomCode.length < 6 || loading}
              >
                Rejoindre
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["1", "Creer", "L'hote ouvre une room."],
                ["2", "Dessiner", "Tout le monde voit les traits en live."],
                ["3", "Voter", "La table discute puis accuse."]
              ].map(([step, title, body]) => (
                <div key={step} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-2 text-xs uppercase tracking-[0.2em] text-ink-300">Etape {step}</div>
                  <div className="font-semibold text-white">{title}</div>
                  <div className="mt-1 text-sm text-ink-300">{body}</div>
                </div>
              ))}
            </div>

            {error ? (
              <div className="rounded-2xl border border-neon-rose/25 bg-neon-rose/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
