import { Fragment, type ReactNode } from "react";

/**
 * Places React nodes (links, emphasis, values) into a translated sentence.
 * The sentence comes from the dictionary with {name} placeholders, so word order
 * can differ per language while the markup stays in code.
 */
export function Rich({ text, values }: { text: string; values: Record<string, ReactNode> }) {
  return (
    <>
      {text.split(/(\{\w+\})/).map((part, index) => {
        const name = /^\{(\w+)\}$/.exec(part)?.[1];
        return name && name in values ? <Fragment key={index}>{values[name]}</Fragment> : part;
      })}
    </>
  );
}
