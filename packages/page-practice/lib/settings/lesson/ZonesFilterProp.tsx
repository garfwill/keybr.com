import { ZonesFilter } from "@keybr/keyboard-ui";
import { lessonProps } from "@keybr/lesson";
import { useSettings } from "@keybr/settings";
import { type ReactNode } from "react";

export function ZonesFilterProp(): ReactNode {
  const { settings, updateSettings } = useSettings();
  return (
    <ZonesFilter
      filter={settings.get(lessonProps.zones)}
      onChange={(filter) => {
        updateSettings(settings.set(lessonProps.zones, filter));
      }}
    />
  );
}
