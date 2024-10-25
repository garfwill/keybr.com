import {
  Keyboard,
  type KeyCharacters,
  Layout,
  loadKeyboard,
} from "@keybr/keyboard";
import { createContext, type ReactNode, useContext, useState } from "react";

export type DesignStateValue = {
  readonly keyboard: Keyboard;
  readonly setKeyCharacters: (characters: KeyCharacters) => void;
};

export const DesignStateContext = createContext<DesignStateValue>(null!);

export function useDesignState() {
  const value = useContext(DesignStateContext);
  if (value == null) {
    throw new Error(
      process.env.NODE_ENV !== "production"
        ? "DesignStateContext is missing"
        : undefined,
    );
  }
  return value;
}

export function DesignStateProvider({
  children,
  layout = Layout.EN_US,
}: {
  readonly children: ReactNode;
  readonly layout?: Layout;
}) {
  const [keyboard, setKeyboard] = useState(() => {
    const proto = loadKeyboard(layout);
    return new Keyboard(
      Layout.custom(proto.layout.language),
      proto.geometry,
      {},
      proto.geometryDict,
    );
  });
  const setKeyCharacters = ({ id, a, b, c, d }: KeyCharacters) => {
    const { layout, geometry, characterDict, geometryDict } = keyboard;
    setKeyboard(
      new Keyboard(
        layout,
        geometry,
        { ...characterDict, [id]: [a, b, c, d] },
        geometryDict,
      ),
    );
  };
  return (
    <DesignStateContext.Provider value={{ keyboard, setKeyCharacters }}>
      {children}
    </DesignStateContext.Provider>
  );
}
