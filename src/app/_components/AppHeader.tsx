import { useState } from "react";

import { SettingsButton, SettingsModal } from "./SettingsModal";

export function AppHeader() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="flex w-full items-center justify-between">
      <a
        className="font-serif text-lg font-extralight text-gray-500"
        href="https://github.com/langmanus/langmanus"
        target="_blank"
      >
        LangManus
      </a>
      <SettingsButton onClick={() => setIsSettingsModalOpen(true)} />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
