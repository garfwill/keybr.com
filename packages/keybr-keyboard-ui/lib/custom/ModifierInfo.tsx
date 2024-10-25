import { KeyModifier } from "@keybr/keyboard";

export function ModifierInfo({ modifier }: { readonly modifier: KeyModifier }) {
  if (modifier === KeyModifier.None) {
    return <span>Default</span>;
  }
  if (modifier === KeyModifier.Shift) {
    return <span>Shift</span>;
  }
  if (modifier === KeyModifier.Alt) {
    return <span>AltGr</span>;
  }
  if (modifier === KeyModifier.ShiftAlt) {
    return <span>Shift AltGr</span>;
  }
  return null;
}
