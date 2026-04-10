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
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-[rgba(74,60,46,0.12)] bg-paper text-lg transition hover:bg-paper-warm"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
