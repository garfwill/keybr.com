import { KeyCharacters, type KeyId } from "@keybr/keyboard";
import { useState } from "react";
import { KeyLayer } from "../KeyLayer.tsx";
import { VirtualKeyboard } from "../VirtualKeyboard.tsx";
import { DesignStateProvider, useDesignState } from "./context.tsx";
import { DesignLayer } from "./DesignLayer.tsx";
import { KeyDetails } from "./KeyDetails.tsx";
import { LiveUpdate } from "./LiveUpdate.tsx";

export function CustomLayoutDesigner() {
  return (
    <DesignStateProvider>
      <Root />
    </DesignStateProvider>
  );
}

function Root() {
  const { keyboard } = useDesignState();
  const [keyId, setKeyId] = useState<KeyId>("Space");
  return (
    <section>
      <LiveUpdate onChange={setKeyId} />
      <VirtualKeyboard keyboard={keyboard}>
        <DesignLayer onSelect={setKeyId}>
          <KeyLayer depressedKeys={[keyId]} />
        </DesignLayer>
      </VirtualKeyboard>
      <KeyDetails
        keyCharacters={
          keyboard.characters.get(keyId) ?? new KeyCharacters(keyId, 0, 0, 0, 0)
        }
      />
    </section>
  );
}
