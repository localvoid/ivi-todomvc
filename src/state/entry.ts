import { Component, useSelect } from "ivi";

export type Entry = ReturnType<typeof createEntry>;

let nextId = 0;
export function createEntry(text: string) {
  return { id: nextId++, text, isCompleted: false };
}

const getText = (entry: Entry) => entry.text;
const isCompleted = (entry: Entry) => entry.isCompleted;

export const useEntryText = (c: Component) => useSelect(c, getText);
export const useEntryIsCompleted = (c: Component) => useSelect(c, isCompleted);
