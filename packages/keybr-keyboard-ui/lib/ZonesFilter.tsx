import {
  type ZoneFilter as ZoneFilterType,
  type ZoneId,
} from "@keybr/keyboard";
import {
  CheckBox,
  Explainer,
  Field,
  FieldList,
  FieldSet,
  Legend,
  styleWidth10,
} from "@keybr/widget";
import { type ReactNode } from "react";

export function ZonesFilter({
  filter,
  onChange,
}: {
  readonly filter: ZoneFilterType;
  readonly onChange: (filter: ZoneFilterType) => void;
}): ReactNode {
  const options = [
    ["Tab row", "top"],
    ["Caps Lock row", "home"],
    ["Shift row", "bottom"],
    ["Left hand", "left"],
    ["Right hand", "right"],
  ] as [string, ZoneId][];
  return (
    <FieldSet>
      <Legend>Filter characters</Legend>
      <FieldList>
        <Field className={styleWidth10}>Keyboard zone:</Field>
        {options.map(([label, id]) => {
          return (
            <Field key={id}>
              <CheckBox
                label={label}
                checked={filter.zones.includes(id)}
                onChange={(checked) => {
                  const set = new Set(filter.zones);
                  if (checked) {
                    set.add(id);
                  } else {
                    set.delete(id);
                  }
                  onChange({
                    ...filter,
                    zones: [...set],
                  });
                }}
              />
            </Field>
          );
        })}
      </FieldList>
      <FieldList>
        <Field className={styleWidth10}>Key modifier:</Field>
        <Field>
          <CheckBox
            label="Shift modifier"
            checked={filter.shift}
            onChange={(checked) => {
              onChange({
                ...filter,
                shift: checked,
              });
            }}
          />
        </Field>
        <Field>
          <CheckBox
            label="Alt modifier"
            checked={filter.alt}
            onChange={(checked) => {
              onChange({
                ...filter,
                alt: checked,
              });
            }}
          />
        </Field>
        <Field>
          <CheckBox
            label="Dead keys"
            checked={filter.dead}
            onChange={(checked) => {
              onChange({
                ...filter,
                dead: checked,
              });
            }}
          />
        </Field>
      </FieldList>
      <Explainer>
        The lessons will include only those words that can be made from the
        selected characters. For example, you can generate lessons for either
        the left hand or the right hand only, or for the home row only, and so
        on.
      </Explainer>
    </FieldSet>
  );
}
