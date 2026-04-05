import { useState } from "react";
import type { PlayerProfile } from "@shared/protocol";
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
    <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-10 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-5xl font-semibold tracking-[-0.03em] text-white md:text-7xl">
          INKOGNITO
        </h1>
      </div>

      <GlassPanel className="mx-auto w-full max-w-3xl">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <ProfileEditor profile={profile} onChange={onProfileChange} compact />

          <div className="space-y-4">
            <input
              value={accessValue}
              onChange={(event) => setAccessValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && normalizedRoomCode.length === 6 && !loading) {
                  onJoin(normalizedRoomCode);
                }
              }}
              placeholder="Code ou lien"
              className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-neon-cyan/40 focus:bg-white/10"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Button fullWidth onClick={onCreate} disabled={loading}>
                Creer
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
