import { type AnyProp } from "@keybr/settings";
import { z } from "zod";
import { type ZoneFilter } from "./types.ts";

export type ZoneListProp = {
  readonly type: "zone-list";
} & AnyProp<ZoneFilter>;

export function zoneListProp(key: string): ZoneListProp {
  const schema = z.object({
    zones: z.array(z.enum(["top", "home", "bottom", "left", "right"])),
    dead: z.boolean(),
    shift: z.boolean(),
    alt: z.boolean(),
  });
  const defaultValue: z.infer<typeof schema> = {
    zones: ["top", "home", "bottom", "left", "right"],
    dead: true,
    shift: true,
    alt: true,
  };
  return {
    type: "zone-list",
    key,
    defaultValue,
    toJson(value: ZoneFilter): unknown {
      return value;
    },
    fromJson(value: unknown): ZoneFilter {
      try {
        return schema.parse(value);
      } catch {
        return defaultValue;
      }
    },
  };
}
