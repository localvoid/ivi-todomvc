import { selector, mutation, dirtyCheckCounter } from "ivi";

export type Entry = ReturnType<typeof createEntry>;

let nextId = 0;
export const createEntry = (text: string) => ({ _dirty: 0, id: nextId++, text, isCompleted: false });
const m = mutation((e: Entry) => { console.log("AA"); e._dirty = dirtyCheckCounter(); });

export const useEntry = selector((entry: Entry) => entry._dirty);
export const entrySetText = m((entry: Entry, text: string) => { entry.text = text; });
export const entryToggleCompleted = m((entry: Entry) => { entry.isCompleted = !entry.isCompleted; });
