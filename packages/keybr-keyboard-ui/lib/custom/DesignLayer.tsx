import { type KeyId } from "@keybr/keyboard";
import { type ReactNode } from "react";

export function DesignLayer({
  children,
  onSelect,
}: {
  readonly children: ReactNode;
  readonly onSelect: (id: KeyId) => void;
}) {
  return (
    <svg
      onClick={(ev) => {
        let target = ev.target as any;
        while (target instanceof SVGElement) {
          const id = target.dataset["key"];
          if (id) {
            ev.preventDefault();
            onSelect(id);
            break;
          }
          target = target.parentNode;
        }
      }}
    >
      {children}
    </svg>
  );
}
