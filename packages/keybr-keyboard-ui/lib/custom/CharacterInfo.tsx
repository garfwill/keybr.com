import { type Character } from "@keybr/keyboard";
import * as styles from "./CharacterInfo.module.less";

export function CharacterInfo({
  character,
}: {
  readonly character: Character | null;
}) {
  if (character == null || character === 0x0000) {
    return <em>Unassigned</em>;
  }
  if (typeof character === "number") {
    let label;
    switch (character) {
      case 0x0009:
        label = "TAB";
        break;
      case 0x000a:
        label = "ENTER";
        break;
      case 0x0020:
        label = "SPACE";
        break;
      case 0x00a0:
        label = "NBSP";
        break;
      default:
        label = (
          <span className={styles.char}>{String.fromCodePoint(character)}</span>
        );
        break;
    }
    return (
      <>
        {label} U+{character.toString(16).padStart(4, "0")}
      </>
    );
  }
  if ("dead" in character) {
    return <em>Dead</em>;
  }
  if ("special" in character) {
    return <em>Special</em>;
  }
  if ("ligature" in character) {
    return <em>Ligature</em>;
  }
  throw new TypeError();
}
