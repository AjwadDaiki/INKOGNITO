import { useMemo, useState } from "react";
import type { ChatMessage, PlayerView } from "@shared/protocol";
import { Button } from "./Button";

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
      <div className="mb-3 font-sketch text-2xl font-semibold text-ink-900">{title}</div>
      <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-1">
        {messages.map((msg) => {
          const player = playersById[msg.playerId];
          return (
            <div key={msg.id} className="rounded-[1.2rem] border border-[rgba(74,60,46,0.1)] bg-paper/80 px-3 py-2">
              <div className="mb-1 flex items-center gap-2 text-xs text-ink-500">
                <span>{player?.profile.emoji ?? "?"}</span>
                <span className="font-semibold text-ink-950">{player?.profile.name ?? "?"}</span>
              </div>
              <div className="break-words text-sm text-ink-900">{msg.text}</div>
            </div>
          );
        })}
      </div>
      <form
        className="mt-3 flex gap-2"
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
          placeholder="Un mot..."
          className="min-h-11 flex-1 rounded-[1.15rem] px-4 text-sm text-ink-950 outline-none placeholder:text-ink-300"
        />
        <Button type="submit" className="px-4">
          Envoyer
        </Button>
      </form>
    </div>
  );
}
