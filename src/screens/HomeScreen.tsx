import { useState } from "react";
import type { PlayerProfile } from "@shared/protocol";
import { Button } from "@/components/ui/Button";
import { CodeInput } from "@/components/ui/CodeInput";
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
  const [joinCode, setJoinCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showHowItWorks, setShowHowItWorks] = useState(false);

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

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-4 py-10 md:px-8">
      <div className="mb-10 max-w-3xl">
        <div className="mb-4 inline-flex items-center rounded-full border border-neon-cyan/20 bg-neon-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-neon-cyan">
          Draw. Suspect. Betray.
        </div>
        <h1 className="font-display text-5xl font-semibold tracking-[-0.03em] text-white md:text-7xl">
          INKOGNITO
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-300 md:text-xl">
          Un party game multijoueur de déduction sociale par le dessin. Un lien, des potes,
          un canvas, et assez de bluff pour survivre au vote.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
        <GlassPanel className="space-y-6">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.2em] text-ink-300">Identité</div>
            <h2 className="font-display text-2xl text-white">Prépare ton avatar</h2>
          </div>
          <ProfileEditor profile={profile} onChange={onProfileChange} />
          <div className="grid gap-3 md:grid-cols-2">
            <Button fullWidth onClick={onCreate} disabled={loading}>
              ▶ Créer une partie
            </Button>
            <Button fullWidth tone="secondary" onClick={() => setShowHowItWorks(true)}>
              Comment jouer ?
            </Button>
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-6">
          <div>
            <div className="mb-2 text-sm uppercase tracking-[0.2em] text-ink-300">Rejoindre</div>
            <h2 className="font-display text-2xl text-white">Un code à 6 caractères</h2>
            <p className="mt-2 text-sm text-ink-300">
              Colle le code de room ou ouvre directement le lien partagé.
            </p>
          </div>
          <CodeInput value={joinCode} onChange={setJoinCode} />
          <input
            value={inviteLink}
            onChange={(event) => setInviteLink(event.target.value)}
            placeholder="Ou colle le lien de la partie"
            className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-neon-cyan/40 focus:bg-white/10"
          />
          <div className="flex gap-2">
            <Button
              fullWidth
              tone="ghost"
              onClick={() => {
                const extracted = extractRoomCode(inviteLink);
                if (extracted) setJoinCode(extracted);
              }}
              disabled={!inviteLink.trim()}
            >
              Extraire le code
            </Button>
          </div>
          <Button fullWidth tone="secondary" onClick={() => onJoin(joinCode)} disabled={joinCode.length < 6 || loading}>
            Rejoindre ▶
          </Button>
          {error ? (
            <div className="rounded-2xl border border-neon-rose/25 bg-neon-rose/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </GlassPanel>
      </div>

      {showHowItWorks ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <GlassPanel className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="mb-2 text-sm uppercase tracking-[0.2em] text-ink-300">Tutoriel</div>
                <h3 className="font-display text-3xl text-white">Le flow en 4 temps</h3>
              </div>
              <Button tone="ghost" onClick={() => setShowHowItWorks(false)}>
                Fermer
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["1", "Reçois un mot", "Les civils ont le mot principal, l’Undercover un mot voisin, Mr. White rien du tout."],
                ["2", "Dessine en live", "Tout le monde dessine en même temps, avec les mini-canvases des autres visibles en direct."],
                ["3", "Discute et pointe", "Regarde la galerie, accuse, bluffe, et mets la pression avec le point du doigt."],
                ["4", "Vote et score", "Le suspect majoritaire est révélé, les points tombent, puis le round suivant repart."]
              ].map(([step, title, body]) => (
                <div key={step} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-neon-violet/15 font-mono text-sm text-neon-violet">
                    {step}
                  </div>
                  <div className="text-lg font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm text-ink-300">{body}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      ) : null}
    </div>
  );
}
