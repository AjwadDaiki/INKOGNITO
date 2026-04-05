import { AVATAR_COLORS, AVATAR_EMOJIS } from "@shared/constants";
import type { PlayerProfile } from "@shared/protocol";

export function ProfileEditor({
  profile,
  onChange,
  compact = false
}: {
  profile: PlayerProfile;
  onChange: (patch: Partial<PlayerProfile>) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-[1.7fr_1fr]"}`}>
      <label className="block text-sm text-ink-300">
        Pseudo
        <input
          value={profile.name}
          onChange={(event) => onChange({ name: event.target.value })}
          className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-neon-cyan/40 focus:bg-white/10"
        />
      </label>
      <label className="block text-sm text-ink-300">
        Emoji
        <select
          value={profile.emoji}
          onChange={(event) => onChange({ emoji: event.target.value as PlayerProfile["emoji"] })}
          className="mt-2 min-h-11 w-full rounded-2xl border border-white/10 bg-ink-900 px-4 text-white outline-none transition focus:border-neon-cyan/40"
        >
          {AVATAR_EMOJIS.map((emoji) => (
            <option key={emoji} value={emoji}>
              {emoji}
            </option>
          ))}
        </select>
      </label>
      <div className="md:col-span-full">
        <div className="mb-2 text-sm text-ink-300">Couleur</div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange({ color })}
              className={`h-10 w-10 rounded-full border-2 transition ${
                profile.color === color ? "scale-110 border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Couleur ${color}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
