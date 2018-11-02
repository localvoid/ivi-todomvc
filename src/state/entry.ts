import { createSelector } from "./selector";

export type Entry = ReturnType<typeof createEntry>;

let nextId = 0;
export const createEntry = (text: string) => ({ id: nextId++, text, isCompleted: false });
export const useEntryText = createSelector((entry: Entry) => entry.text);
export const useEntryIsCompleted = createSelector((entry: Entry) => entry.isCompleted);
