import { REACTION_EMOJIS } from "@shared/constants";
import type { ReactionEmoji } from "@shared/protocol";

export function EmojiReactionBar({
  onReact
}: {
  onReact: (emoji: ReactionEmoji) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onReact(emoji)}
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg transition hover:border-neon-cyan/40 hover:bg-white/10"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
