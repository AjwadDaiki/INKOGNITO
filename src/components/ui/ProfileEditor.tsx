import { motion, AnimatePresence } from "framer-motion";
import { AVATAR_COLORS, AVATAR_EMOJIS } from "@shared/constants";
import type { PlayerProfile } from "@shared/protocol";

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

  const slots = [-1, 0, 1].map((offset) => ({
    emoji: list[(idx + offset + list.length) % list.length],
    offset
  }));

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => move(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,60,46,0.16)] bg-paper text-lg text-ink-700 transition hover:bg-paper-warm"
      >
        ‹
      </button>
      <div className="flex flex-1 items-center justify-center gap-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {slots.map(({ emoji, offset }) => (
            <motion.button
              key={`${offset}-${emoji}`}
              type="button"
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: offset === 0 ? 1 : 0.5, scale: offset === 0 ? 1 : 0.82 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              onClick={() => onChange(emoji)}
              className={`flex items-center justify-center rounded-full ${
                offset === 0
                  ? "h-12 w-12 border border-[rgba(74,60,46,0.16)] bg-paper shadow-card"
                  : "h-10 w-10"
              } text-2xl`}
            >
              {emoji}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={() => move(1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,60,46,0.16)] bg-paper text-lg text-ink-700 transition hover:bg-paper-warm"
      >
        ›
      </button>
    </div>
  );
}

function ColorDots({
  value,
  onChange
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVATAR_COLORS.map((color) => {
        const active = value === color;
        return (
          <motion.button
            key={color}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(color)}
            className="h-8 w-8 rounded-full border-2 transition-all"
            style={{
              backgroundColor: color,
              borderColor: active ? "#1a1410" : "rgba(255,255,255,0.55)",
              boxShadow: active ? "0 0 0 2px rgba(26,20,16,0.12)" : "none"
            }}
            aria-label={`Couleur ${color}`}
          />
        );
      })}
    </div>
  );
}

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
      <div className="flex items-center gap-3">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 340, damping: 20 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[rgba(74,60,46,0.14)] bg-paper text-3xl shadow-card"
          style={{ boxShadow: `0 2px 0 rgba(90,68,47,0.18), 0 10px 22px ${profile.color}18` }}
        >
          {profile.emoji}
        </motion.div>
        <input
          value={profile.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Ton pseudo..."
          className="min-h-11 flex-1 rounded-[1.15rem] px-4 text-sm font-medium text-ink-950 outline-none placeholder:text-ink-300"
        />
      </div>

      <div>
        {!compact ? (
          <div className="mb-2 font-sketch text-lg font-semibold text-ink-700">Avatar</div>
        ) : null}
        <EmojiCarousel
          value={profile.emoji}
          onChange={(emoji) => onChange({ emoji: emoji as typeof profile.emoji })}
        />
      </div>

      {!hideColor ? (
        <div>
          {!compact ? (
            <div className="mb-2 font-sketch text-lg font-semibold text-ink-700">Encre</div>
          ) : null}
          <ColorDots value={profile.color} onChange={(color) => onChange({ color })} />
        </div>
      ) : null}
    </div>
  );
}
