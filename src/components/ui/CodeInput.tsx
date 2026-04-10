import { useMemo } from "react";

export function CodeInput({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const chars = useMemo(() => Array.from({ length: 6 }, (_, index) => value[index] ?? ""), [value]);

  return (
    <div className="grid grid-cols-6 gap-2">
      {chars.map((char, index) => (
        <input
          key={index}
          value={char}
          maxLength={1}
          inputMode="text"
          onChange={(event) => {
            const next = value.padEnd(6).split("");
            next[index] = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 1);
            onChange(next.join("").trim());
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData
              .getData("text")
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, 6);
            onChange(pasted);
          }}
          className="h-14 rounded-[1.2rem] border border-[rgba(74,60,46,0.14)] bg-paper text-center font-mono text-xl uppercase text-ink-950 outline-none transition focus:bg-paper-warm"
        />
      ))}
    </div>
  );
}
