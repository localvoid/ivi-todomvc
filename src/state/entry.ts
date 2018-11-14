import { selector, dirty } from "ivi";
import { Mutable, mut } from "ivi-state";

export type Entry = Readonly<ReturnType<typeof createEntry>>;

let nextId = 0;
export const createEntry = (text: string) => ({ _v: 0, id: nextId++, text, isCompleted: false });
export const useEntry = selector((entry: Entry) => entry._v);

const m = (entry: Mutable<Entry>) => { entry._v = dirty(); };
export const entrySetText = mut(m, (entry, text: string) => { entry.text = text; });
export const entryToggleCompleted = mut(m, (entry) => { entry.isCompleted = !entry.isCompleted; });
