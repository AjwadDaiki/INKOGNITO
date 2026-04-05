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
    () => Object.fromEntries(players.map((player) => [player.id, player])),
    [players]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink-300">{title}</div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.map((message) => {
          const player = playersById[message.playerId];
          return (
            <div key={message.id} className="rounded-2xl border border-white/6 bg-white/[0.04] px-3 py-2">
              <div className="mb-1 flex items-center gap-2 text-xs text-ink-300">
                <span>{player?.profile.emoji ?? "?"}</span>
                <span className="font-semibold text-white">{player?.profile.name ?? "?"}</span>
                {flairLabel(message) ? (
                  <span className="rounded-full bg-neon-violet/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-neon-violet">
                    {flairLabel(message)}
                  </span>
                ) : null}
              </div>
              <div className="break-words text-sm text-white">{message.text}</div>
            </div>
          );
        })}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.trim()) return;
          onSend(value.trim());
          setValue("");
        }}
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value.slice(0, 100))}
          placeholder="Message"
          className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition focus:border-neon-cyan/40 focus:bg-white/10"
        />
        <Button type="submit" tone="secondary">
          OK
        </Button>
      </form>
    </div>
  );
}
