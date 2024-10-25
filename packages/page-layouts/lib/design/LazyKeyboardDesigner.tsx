import { CustomLayoutDesigner } from "@keybr/keyboard-ui";

export default function LazyCustomLayoutDesigner() {
  if (process.env.NODE_ENV === "development") {
    return (
      <section>
        <h1>Design your own keyboard layout</h1>
        <CustomLayoutDesigner />
      </section>
    );
  } else {
    return null;
  }
}
