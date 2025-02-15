import { filterText } from "@keybr/keyboard";
import { type CodePoint } from "@keybr/unicode";
import { flattenStyledText, splitStyledText } from "./chars.ts";
import { type TextInputSettings } from "./settings.ts";
import {
  Attr,
  type Char,
  Feedback,
  type LineList,
  type Step,
  type StyledText,
} from "./types.ts";

export type StepListener = (step: Step) => void;

const recoverBufferLength = 3;
const garbageBufferLength = 10;

export class TextInput {
  readonly text: StyledText;
  readonly stopOnError: boolean;
  readonly forgiveErrors: boolean;
  readonly spaceSkipsWords: boolean;
  readonly onStep: StepListener;
  readonly #text: string;
  readonly #chars: readonly Char[];
  #steps: (Step & { readonly char: Char })[] = [];
  #garbage: (Step & { readonly char: Char })[] = [];
  #typo!: boolean;
  #output!: { chars: Char[]; lines: LineList; remaining: Char[] };

  constructor(
    text: StyledText,
    { stopOnError, forgiveErrors, spaceSkipsWords }: TextInputSettings,
    onStep: StepListener = () => {},
  ) {
    this.text = text;
    this.stopOnError = stopOnError;
    this.forgiveErrors = forgiveErrors;
    this.spaceSkipsWords = spaceSkipsWords;
    this.onStep = onStep;
    this.#text = flattenStyledText(text);
    this.#chars = splitStyledText(text);
    this.reset();
  }

  reset(): void {
    this.#steps = [];
    this.#garbage = [];
    this.#typo = false;
    this.#update();
  }

  get length(): number {
    return this.#chars.length;
  }

  at(index: number): Char {
    return this.#chars.at(index)!;
  }

  get pos(): number {
    return this.#steps.length;
  }

  get completed(): boolean {
    return this.pos === this.length;
  }

  get steps(): readonly Step[] {
    return this.#steps;
  }

  get chars(): readonly Char[] {
    return this.#output.chars;
  }

  get lines(): LineList {
    return this.#output.lines;
  }

  get remaining(): readonly Char[] {
    return this.#output.remaining;
  }

  #update() {
    const text = this.#text;
    const remaining = this.#chars.slice(this.pos);
    const chars = [];
    chars.push(...this.#steps.map(({ char }) => char));
    if (!this.stopOnError) {
      chars.push(...this.#garbage.map(({ char }) => char));
    }
    if (remaining.length > 0) {
      const [head, ...tail] = remaining;
      chars.push({ ...head, attrs: Attr.Cursor }, ...tail);
    }
    const lines = { text, lines: [{ text, chars }] };
    this.#output = { chars, lines, remaining };
  }

  onTextInput({
    timeStamp,
    inputType,
    codePoint,
  }: {
    readonly timeStamp: number;
    readonly inputType:
      | "appendChar"
      | "appendLineBreak"
      | "clearChar"
      | "clearWord";
    readonly codePoint: CodePoint;
  }): Feedback {
    switch (inputType) {
      case "appendChar":
        return this.appendChar(codePoint, timeStamp);
      case "appendLineBreak":
        return this.appendChar(0x0020, timeStamp);
      case "clearChar":
        return this.clearChar();
      case "clearWord":
        return this.clearWord();
    }
  }

  clearChar(): Feedback {
    this.#garbage.pop();
    this.#typo = true;
    this.#update();
    return Feedback.Succeeded;
  }

  clearWord(): Feedback {
    this.#garbage = [];
    while (this.pos > 0 && this.at(this.pos - 1).codePoint !== 0x0020) {
      this.#steps.pop();
    }
    this.#typo = true;
    this.#update();
    return Feedback.Succeeded;
  }

  appendChar(codePoint: CodePoint, timeStamp: number): Feedback {
    const feedback = this.#appendChar(codePoint, timeStamp);
    this.#update();
    return feedback;
  }

  #appendChar(codePoint: CodePoint, timeStamp: number): Feedback {
    if (this.completed) {
      // Cannot enter any more characters if already completed.
      throw new Error();
    }

    // Handle whitespace at the beginning of text.
    if (
      this.pos === 0 &&
      this.#garbage.length === 0 &&
      !this.#typo &&
      codePoint === 0x0020
    ) {
      return Feedback.Succeeded;
    }

    // Handle the space key.
    if (this.at(this.pos).codePoint !== 0x0020 && codePoint === 0x0020) {
      if (
        this.#garbage.length === 0 &&
        (this.pos === 0 || this.at(this.pos - 1).codePoint === 0x0020)
      ) {
        // At the beginning of a word.
        this.#typo = true;
        return Feedback.Failed;
      }
      if (this.spaceSkipsWords) {
        // Inside a word.
        this.#skipWord(timeStamp);
        return Feedback.Recovered;
      }
    }

    // Handle correct input.
    if (
      filterText.normalize(this.at(this.pos).codePoint) === codePoint &&
      (this.forgiveErrors || this.#garbage.length === 0)
    ) {
      const typo = this.#typo;
      this.#addStep({ codePoint, timeStamp, typo }, this.at(this.pos));
      this.#garbage = [];
      this.#typo = false;
      if (typo) {
        return Feedback.Recovered;
      } else {
        return Feedback.Succeeded;
      }
    }

    // Handle incorrect input.
    this.#typo = true;
    if (!this.stopOnError || this.forgiveErrors) {
      if (this.#garbage.length < garbageBufferLength) {
        this.#garbage.push({
          char: {
            codePoint,
            attrs: Attr.Garbage,
            cls: null,
          },
          codePoint,
          timeStamp,
          typo: false,
        });
      }
    }
    if (
      this.forgiveErrors &&
      (this.#handleReplacedCharacter() || this.#handleSkippedCharacter())
    ) {
      return Feedback.Recovered;
    } else {
      return Feedback.Failed;
    }
  }

  #addStep(step: Step, char: Char): void {
    const attrs = step.typo ? Attr.Miss : Attr.Hit;
    this.#steps.push({ ...step, char: { ...char, attrs } });
    this.onStep(step);
  }

  #skipWord(timeStamp: number): void {
    this.#addStep(
      {
        codePoint: this.at(this.pos).codePoint,
        timeStamp,
        typo: true,
      },
      this.at(this.pos),
    );
    // Skip the remaining non-space characters inside the word.
    while (this.pos < this.length && this.at(this.pos).codePoint !== 0x0020) {
      this.#addStep(
        {
          codePoint: this.at(this.pos).codePoint,
          timeStamp,
          typo: true,
        },
        this.at(this.pos),
      );
    }
    // Skip the space character to position at the beginning of the next word.
    if (this.pos < this.length && this.at(this.pos).codePoint === 0x0020) {
      this.#addStep(
        {
          codePoint: this.at(this.pos).codePoint,
          timeStamp,
          typo: false,
        },
        this.at(this.pos),
      );
    }
    this.#garbage = [];
    this.#typo = false;
  }

  #handleReplacedCharacter(): boolean {
    // text:    abcd
    // garbage: xbcd
    // offset:  0

    // Check if the buffer size is right.
    if (
      this.pos + recoverBufferLength + 1 > this.length ||
      this.#garbage.length < recoverBufferLength + 1
    ) {
      return false;
    }

    // Check whether we can recover.
    for (let i = 0; i < recoverBufferLength; i++) {
      const char = this.at(this.pos + i + 1);
      if (char.codePoint !== this.#garbage[i + 1].codePoint) {
        return false;
      }
    }

    // Append a step with an error.
    this.#addStep(
      {
        codePoint: this.at(this.pos).codePoint,
        timeStamp: this.#garbage[0].timeStamp,
        typo: true,
      },
      this.at(this.pos),
    );

    // Append successful steps.
    for (let i = 1; i < this.#garbage.length; i++) {
      this.#addStep(this.#garbage[i], this.#garbage[i].char);
    }

    this.#garbage = [];
    this.#typo = false;
    return true;
  }

  #handleSkippedCharacter(): boolean {
    // text:    abcd
    // garbage: bcd
    // offset:  0

    // Check if the buffer size is right.
    if (
      this.pos + recoverBufferLength + 1 > this.length ||
      this.#garbage.length < recoverBufferLength
    ) {
      return false;
    }

    // Check whether we can recover.
    for (let i = 0; i < recoverBufferLength; i++) {
      const char = this.at(this.pos + i + 1);
      if (char.codePoint !== this.#garbage[i].codePoint) {
        return false;
      }
    }

    // Append a step with an error.
    this.#addStep(
      {
        codePoint: this.at(this.pos).codePoint,
        timeStamp: this.#garbage[0].timeStamp,
        typo: true,
      },
      this.at(this.pos),
    );

    // Append successful steps.
    for (let i = 0; i < this.#garbage.length; i++) {
      this.#addStep(this.#garbage[i], this.#garbage[i].char);
    }

    this.#garbage = [];
    this.#typo = false;
    return true;
  }
}
