import { VNode, context } from "ivi";
import { cachedQuery } from "./query";
import { createSelector } from "./selector";
import { Entry, createEntry } from "./entry";

export const enum FilterType { All, Completed, Active }

const CONTEXT = Symbol();
interface Context { [CONTEXT]: AppState; }
const getAppState = (ctx: Context) => ctx[CONTEXT];

export function appStateContext(state: AppState, c: VNode) {
  return context({ [CONTEXT]: state }, c);
}

export type AppState = ReturnType<typeof createAppState>;

export function createAppState() {
  const entriesById = new Map<Number, Entry>();
  const entries = cachedQuery(() => Array.from(entriesById.values()));
  const activeEntries = cachedQuery(() => entries.get().filter((entry) => !entry.isCompleted));
  const completedEntries = cachedQuery(() => entries.get().filter((entry) => entry.isCompleted));

  return { filter: FilterType.All, entriesById, entries, activeEntries, completedEntries };
}

export const useFilter = createSelector((_: void, ctx: Context) => getAppState(ctx).filter);
export const useEntries = createSelector((_: void, ctx: Context) => getAppState(ctx).entries.get());
export const useCompletedEntries = createSelector((_: void, ctx: Context) => getAppState(ctx).completedEntries.get());
export const useActiveEntries = createSelector((_: void, ctx: Context) => getAppState(ctx).activeEntries.get());
export const useEntriesByFilterType = createSelector((filter: FilterType, ctx: Context) => {
  const s = getAppState(ctx);
  if (filter === FilterType.All) {
    return s.entries.get();
  }
  if (filter === FilterType.Completed) {
    return s.completedEntries.get();
  }
  return s.activeEntries.get();
});

function resetCompletedQueries(s: AppState) {
  s.activeEntries.reset();
  s.completedEntries.reset();
}

function resetQueries(s: AppState, completed?: boolean) {
  s.entries.reset();
  resetCompletedQueries(s);
}

export function addEntry(s: AppState, text: string) {
  const e = createEntry(text);
  s.entriesById.set(e.id, e);
  resetQueries(s);
}

export function removeEntry(s: AppState, entry: Entry) {
  s.entriesById.delete(entry.id);
  resetQueries(s);
}

export function editEntry(s: AppState, entry: Entry, text: string) {
  entry.text = text;
}

export function toggleCompleted(s: AppState, entry: Entry) {
  entry.isCompleted = !entry.isCompleted;
  resetCompletedQueries(s);
}

export function removeCompleted(s: AppState) {
  const byId = s.entriesById;
  byId.forEach((e) => {
    if (e.isCompleted) {
      byId.delete(e.id);
    }
  });
  resetQueries(s);
}

export function toggleAll(s: AppState) {
  const entries = Array.from(s.entriesById.values());
  const areSomeActive = entries.some((e) => !e.isCompleted);
  let invalidateQueries = false;
  entries.forEach((e) => {
    const c = e.isCompleted;
    if (c !== areSomeActive) {
      e.isCompleted = !c;
      invalidateQueries = true;
    }
  });
  if (invalidateQueries) {
    resetQueries(s);
  }
}

export function setFilter(s: AppState, filter: FilterType) {
  s.filter = filter;
}
