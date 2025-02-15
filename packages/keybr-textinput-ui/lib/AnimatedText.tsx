import {
  type Char,
  type TextDisplaySettings,
  TextInput,
} from "@keybr/textinput";
import { type ReactNode, useEffect, useState } from "react";
import { StaticText } from "./StaticText.tsx";
import { type TextLineSize } from "./TextLines.tsx";

export function AnimatedText({
  settings,
  text,
  wrap,
  size,
}: {
  readonly settings: TextDisplaySettings;
  readonly text: string;
  readonly wrap?: boolean;
  readonly size?: TextLineSize;
}): ReactNode {
  const chars = useAnimatedTextState(text);
  return (
    <StaticText
      settings={settings}
      lines={{ text, lines: [{ text, chars }] }}
      cursor={true}
      wrap={wrap}
      size={size}
    />
  );
}

function useAnimatedTextState(text: string): readonly Char[] {
  const [{ textInput, chars }, setState] = useState(() => makeState(text));
  if (textInput.text !== text) {
    setState(makeState(text));
  }
  useEffect(() => {
    const id = setInterval(() => {
      if (textInput.completed) {
        textInput.reset();
      } else {
        textInput.appendChar(textInput.at(textInput.pos).codePoint, 0);
      }
      const { chars } = textInput;
      setState({ textInput, chars });
    }, 500);
    return () => {
      clearInterval(id);
    };
  }, [textInput]);
  return chars;
}

function makeState(text: string) {
  const textInput = new TextInput(text, {
    stopOnError: false,
    forgiveErrors: false,
    spaceSkipsWords: false,
  });
  const { chars } = textInput;
  return { textInput, chars };
}
