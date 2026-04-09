import { useMemo, useState } from "react";
import type { ChatMessage, PlayerView } from "@shared/protocol";
import { Button } from "./Button";

function flairLabel(message: ChatMessage) {
  if (message.flair === "gg") return "GG";
  if (message.flair === "sus") return "SUS";
  if (message.flair === "rip") return "RIP";
  return null;
}

export function ChatPanel({
  title,
  players,
  messages,
  onSend
}: {
  title: string;
  players: PlayerView[];
  messages: ChatMessage[];
  onSend: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const playersById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-ink-500">{title}</div>
      <div className="scrollbar-thin flex-1 space-y-1.5 overflow-y-auto">
        {messages.map((msg) => {
          const player = playersById[msg.playerId];
          const flair = flairLabel(msg);
          return (
            <div key={msg.id} className="rounded-2xl bg-surface-low px-3 py-2">
              <div className="mb-0.5 flex items-center gap-1.5 text-xs text-ink-500">
                <span>{player?.profile.emoji ?? "?"}</span>
                <span className="font-semibold text-ink-950">{player?.profile.name ?? "?"}</span>
                {flair ? (
                  <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark">
                    {flair}
                  </span>
                ) : null}
              </div>
              <div className="break-words text-sm text-ink-950">{msg.text}</div>
            </div>
          );
        })}
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!value.trim()) return;
          onSend(value.trim());
          setValue("");
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, 100))}
          placeholder="Message..."
          className="min-h-11 flex-1 rounded-2xl bg-surface-low px-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-300 focus:bg-surface-high"
        />
        <Button type="submit" tone="primary" className="shrink-0 px-4">
          →
        </Button>
      </form>
    </div>
  );
}
