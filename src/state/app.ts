import { selector, dirty } from "ivi";
import { cachedQuery } from "ivi-state";
import { RouteLocation } from "./location";
import { Entry, createEntry, entrySetText, entryToggleCompleted } from "./entry";

const entriesById = new Map<number, Entry>();
const entries = cachedQuery(() => Array.from(entriesById.values()));
const activeEntries = cachedQuery(() => entries.get().result.filter((entry) => !entry.isCompleted));
const completedEntries = cachedQuery(() => entries.get().result.filter((entry) => entry.isCompleted));

export const useEntries = selector(() => entries.get());
export const useCompletedEntries = selector(() => completedEntries.get());
export const useActiveEntries = selector(() => activeEntries.get());
export const useEntriesByFilterType = selector((f: RouteLocation) => {
  if (f === RouteLocation.All) {
    return entries.get();
  }
  if (f === RouteLocation.Completed) {
    return completedEntries.get();
  }
  return activeEntries.get();
});

function resetCompletedQueries() {
  activeEntries.reset();
  completedEntries.reset();
}

function resetQueries() {
  entries.reset();
  resetCompletedQueries();
}

const m = <T extends any[]>(fn: (...args: T) => void) => function () {
  dirty();
  fn.apply(void 0, arguments as any);
} as (...args: T) => void;

export const addEntry = m((text: string) => {
  const e = createEntry(text);
  entriesById.set(e.id, e);
  resetQueries();
});

export const removeEntry = m((entry: Entry) => {
  entriesById.delete(entry.id);
  resetQueries();
});

export const editEntry = m((entry: Entry, text: string) => {
  entrySetText(entry, text);
});

export const toggleCompleted = m((entry: Entry) => {
  entryToggleCompleted(entry);
  resetCompletedQueries();
});

export const removeCompleted = m(() => {
  entriesById.forEach((e) => {
    if (e.isCompleted) {
      entriesById.delete(e.id);
    }
  });
  resetQueries();
});

export const toggleAll = m(() => {
  const items = Array.from(entriesById.values());
  const areSomeActive = items.some((e) => !e.isCompleted);
  let invalidateQueries = false;
  items.forEach((e) => {
    if (e.isCompleted !== areSomeActive) {
      entryToggleCompleted(e);
      invalidateQueries = true;
    }
  });
  if (invalidateQueries) {
    resetQueries();
  }
});
