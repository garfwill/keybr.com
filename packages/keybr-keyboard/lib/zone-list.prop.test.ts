import test from "ava";
import { zoneListProp } from "./zone-list-prop.ts";

test("parse", (t) => {
  const prop = zoneListProp("key");

  t.deepEqual(prop.fromJson(null), {
    zones: ["top", "home", "bottom", "left", "right"],
    dead: true,
    shift: true,
    alt: true,
  });
  t.deepEqual(prop.fromJson({}), {
    zones: ["top", "home", "bottom", "left", "right"],
    dead: true,
    shift: true,
    alt: true,
  });
  t.deepEqual(prop.fromJson({ zones: ["x"], dead: true }), {
    zones: ["top", "home", "bottom", "left", "right"],
    dead: true,
    shift: true,
    alt: true,
  });
  t.deepEqual(
    prop.fromJson({
      zones: ["top"],
      dead: false,
      shift: false,
      alt: false,
    }),
    {
      zones: ["top"],
      dead: false,
      shift: false,
      alt: false,
    },
  );
});
