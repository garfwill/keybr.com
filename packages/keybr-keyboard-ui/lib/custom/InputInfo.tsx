import { type KeyId, type KeyModifier } from "@keybr/keyboard";
import { type CodePoint } from "@keybr/unicode";
import { NameValue, Value } from "@keybr/widget";
import { CharacterInfo } from "./CharacterInfo.tsx";
import { ModifierInfo } from "./ModifierInfo.tsx";

export type InputData = {
  readonly id: KeyId;
  readonly codePoint: CodePoint;
  readonly modifier: KeyModifier;
};

export function InputInfo({
  inputData: { id, codePoint, modifier },
}: {
  readonly inputData: InputData;
}) {
  return (
    <>
      <NameValue name="Id" value={id} />
      <NameValue
        name="Character"
        value={
          <Value>
            <CharacterInfo character={codePoint} />
          </Value>
        }
      />
      <NameValue
        name="Modifiers"
        value={
          <Value>
            <ModifierInfo modifier={modifier} />
          </Value>
        }
      />
    </>
  );
}
