import type { ReactNode } from "react";
import { V3 } from "./ui";
// Stillframe 3 (by Claude): a long group of controls folds into one button that opens it as a
// menu. The classic studio keeps the controls laid out in place.
export function V3Popover({ label, help, icon, className = "", children }: {
  label: string;
  help: string;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  if (!V3) return <>{children}</>;
  return (
    <details className={"v3-popover " + className} data-v3-popover="">
      <summary data-help={help}>
        {icon}
        {label}
      </summary>
      <div className="v3-popover-menu">{children}</div>
    </details>
  );
}
