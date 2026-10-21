import { RequireGame } from "@/components/game/RequireGame";
import { GameShell } from "@/components/game/shell/GameShell";

/** localStorage 依存のため instant navigation 検証対象外 */
export const instant = false;

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireGame>
      <GameShell>{children}</GameShell>
    </RequireGame>
  );
}
