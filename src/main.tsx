import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

function StartupFallback({ message }: { message: string }) {
  return (
    <div className="relative flex h-[100svh] items-center justify-center overflow-hidden p-4 md:p-6">
      <div className="paper-sheet notebook-page desk-shadow relative w-full max-w-xl overflow-hidden px-6 py-7 md:px-10 md:py-9">
        <div className="pl-7 md:pl-10">
          <div className="font-sketch text-5xl font-bold leading-none text-ink-950 md:text-6xl">
            Inkognito
          </div>
          <div className="mt-2 font-sketch text-2xl text-ink-700">
            Le carnet n&apos;a pas reussi a s&apos;ouvrir
          </div>
          <div className="paper-divider my-5" />
          <div className="rounded-[1.2rem] border border-[rgba(120,42,33,0.16)] bg-tertiary-light px-4 py-3 text-sm text-tertiary whitespace-pre-wrap break-words">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}

if (!rootElement) {
  throw new Error("Root element #root introuvable.");
}

const root = ReactDOM.createRoot(rootElement);

function renderFallback(message: string) {
  root.render(
    <React.StrictMode>
      <StartupFallback message={message} />
    </React.StrictMode>
  );
}

window.addEventListener("error", (event) => {
  renderFallback(
    event.error?.stack ??
      event.error?.message ??
      event.message ??
      "Erreur de demarrage inconnue."
  );
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message =
    reason instanceof Error
      ? reason.stack ?? reason.message
      : typeof reason === "string"
        ? reason
        : "Promesse rejetee au demarrage.";
  renderFallback(message);
});

import("./App")
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    renderFallback(error instanceof Error ? error.message : "Impossible de charger l'application.");
  });
