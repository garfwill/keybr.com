import { KeyCharacters, type KeyId, KeyModifier } from "@keybr/keyboard";
import { toCodePoints } from "@keybr/unicode";
import { Field, FieldList, TextField } from "@keybr/widget";
import { useRef, useState } from "react";
import { useDesignState } from "./context.tsx";
import { type InputData, InputInfo } from "./InputInfo.tsx";

export function LiveUpdate({
  onChange,
}: {
  readonly onChange: (id: KeyId) => void;
}) {
  const { keyboard, setKeyCharacters } = useDesignState();
  const ref = useRef<{
    code: string;
    shift: boolean;
    alt: boolean;
  } | null>(null);
  const [inputData, setInputData] = useState<InputData | null>(null);
  return (
    <FieldList>
      <Field>
        <TextField
          type="text"
          value={String.fromCodePoint(inputData?.codePoint ?? 0x0020)}
          onKeyDown={(event) => {
            const { code } = event;
            if (code === "Tab") {
              event.preventDefault();
            }
            const shift = event.getModifierState("Shift");
            const alt = event.getModifierState("AltGraph");
            ref.current = { code, shift, alt };
          }}
          onKeyUp={(event) => {
            ref.current = null;
          }}
          onInput={(event) => {
            const keyState = ref.current;
            if (keyState && event.inputType === "insertText" && event.data) {
              const { code, shift, alt } = keyState;
              const { id, a, b, c, d } =
                keyboard.getCharacters(code) ??
                new KeyCharacters(code, 0, 0, 0, 0);
              const [codePoint] = toCodePoints(event.data);
              if (!shift && !alt) {
                setKeyCharacters(new KeyCharacters(id, codePoint, b, c, d));
                setInputData({ id, codePoint, modifier: KeyModifier.None });
                onChange?.(id);
              } else if (shift && !alt) {
                setKeyCharacters(new KeyCharacters(id, a, codePoint, c, d));
                setInputData({ id, codePoint, modifier: KeyModifier.Shift });
                onChange?.(id);
              } else if (!shift && alt) {
                setKeyCharacters(new KeyCharacters(id, a, b, codePoint, d));
                setInputData({ id, codePoint, modifier: KeyModifier.Alt });
                onChange?.(id);
              } else if (shift && alt) {
                setKeyCharacters(new KeyCharacters(id, a, b, c, codePoint));
                setInputData({ id, codePoint, modifier: KeyModifier.ShiftAlt });
                onChange?.(id);
              }
            }
          }}
        />
      </Field>
      <Field>
        {(inputData && <InputInfo inputData={inputData} />) || <em>-</em>}
      </Field>
    </FieldList>
  );
}
