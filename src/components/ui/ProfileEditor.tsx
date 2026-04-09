import { motion, AnimatePresence } from "framer-motion";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "@shared/constants";
import type { PlayerProfile } from "@shared/protocol";

/* ── Emoji Carousel ── */
function EmojiCarousel({
  value,
  onChange
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const list = AVATAR_EMOJIS as readonly string[];
  const idx = list.indexOf(value);

  function move(dir: number) {
    const next = (idx + dir + list.length) % list.length;
    onChange(list[next]);
  }

  // 5 visible: [-2, -1, 0, +1, +2]
  const slots = [-2, -1, 0, 1, 2].map((offset) => ({
    emoji: list[(idx + offset + list.length) % list.length],
    offset
  }));

  const sizeMap: Record<number, string> = {
    [-2]: "text-xl opacity-25 scale-75",
    [-1]: "text-2xl opacity-55 scale-90",
    [0]: "text-4xl opacity-100 scale-100",
    [1]: "text-2xl opacity-55 scale-90",
    [2]: "text-xl opacity-25 scale-75"
  };

  return (
    <div className="flex items-center gap-2">
      {/* Arrow gauche */}
      <button
        type="button"
        onClick={() => move(-1)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-low text-lg font-bold text-ink-700 transition hover:bg-surface-high active:scale-90"
      >
        ‹
      </button>

      {/* Track */}
      <div className="relative flex h-14 flex-1 items-center justify-center overflow-hidden">
        <div className="flex items-center justify-center gap-1">
          <AnimatePresence mode="popLayout" initial={false}>
            {slots.map(({ emoji, offset }) => (
              <motion.button
                key={`${offset}-${emoji}`}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                onClick={() => onChange(emoji)}
                className={`flex items-center justify-center rounded-2xl transition ${sizeMap[offset]} ${
                  offset === 0
                    ? "h-12 w-12 bg-primary-light shadow-primary"
                    : "h-9 w-9"
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Arrow droite */}
      <button
        type="button"
        onClick={() => move(1)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-low text-lg font-bold text-ink-700 transition hover:bg-surface-high active:scale-90"
      >
        ›
      </button>
    </div>
  );
}

/* ── Color Dots ── */
function ColorDots({
  value,
  onChange
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {AVATAR_COLORS.map((color) => {
        const active = value === color;
        return (
          <motion.button
            key={color}
            type="button"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
            onClick={() => onChange(color)}
            className="h-9 w-9 rounded-full border-[3px] transition-all"
            style={{
              backgroundColor: color,
              borderColor: active ? "#0F172A" : "transparent",
              boxShadow: active
                ? `0 0 0 2px white, 0 0 0 4px ${color}, 0 4px 12px ${color}88`
                : `0 3px 8px ${color}55`
            }}
            aria-label={`Couleur ${color}`}
          />
        );
      })}
    </div>
  );
}

/* ── ProfileEditor ── */
export function ProfileEditor({
  profile,
  onChange,
  compact = false,
  hideColor = false
}: {
  profile: PlayerProfile;
  onChange: (patch: Partial<PlayerProfile>) => void;
  compact?: boolean;
  hideColor?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Nom + preview avatar */}
      <div className="flex items-center gap-3">
        {/* Avatar preview */}
        <motion.div
          layout
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-3xl shadow-card"
          style={{
            background: `linear-gradient(160deg,${profile.color}44,${profile.color}18)`,
            boxShadow: `0 4px 16px ${profile.color}55, 0 3px 0 ${profile.color}33`
          }}
        >
          {profile.emoji}
        </motion.div>
        {/* Nom */}
        <input
          value={profile.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ton pseudo..."
          className="min-h-11 flex-1 rounded-2xl bg-surface-low px-4 text-sm font-semibold text-ink-950 outline-none transition placeholder:font-normal placeholder:text-ink-300 focus:bg-surface-high"
        />
      </div>

      {/* Emoji carousel */}
      <div>
        {!compact && (
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
            Emoji
          </div>
        )}
        <EmojiCarousel
          value={profile.emoji}
          onChange={(emoji) => onChange({ emoji: emoji as typeof profile.emoji })}
        />
      </div>

      {/* Color dots */}
      {!hideColor && (
        <div>
          {!compact && (
            <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-ink-500">
              Couleur
            </div>
          )}
          <ColorDots value={profile.color} onChange={(color) => onChange({ color })} />
        </div>
      )}
    </div>
  );
}
