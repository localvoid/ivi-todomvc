import { Context, SelectorDataRef, selectorData } from "ivi";
import { Mutable } from "ivi-state";
import { FilterType } from "./constants";
import { Store, TodoEntry } from "./state";

export interface SelectTodoById {
  in: TodoEntry;
  out: TodoEntry;
}

export function selectTodoById(
  prev: SelectTodoById | null,
  id: number,
  context: Context<{ store: Store }>,
): SelectTodoById {
  const state = context.store.getState();
  const todo = state.todos.byId.ref.get(id)!;

  if (prev && prev.in === todo) {
    return prev;
  }

  return selectorData(todo);
}

export interface SelectVisibleTodoIdsState {
  in: {
    listedIds: number[];
    byId: Mutable<Map<number, TodoEntry>>;
    filter: FilterType;
  };
  out: number[];
}

export function selectVisibleTodoIds(
  prev: SelectVisibleTodoIdsState | null,
  _props: null,
  context: Context<{ store: Store }>,
): SelectVisibleTodoIdsState {
  const state = context.store.getState();
  const listedIds = state.todos.listedIds;
  const byId = state.todos.byId;
  const filter = state.filter;

  if (prev &&
    prev.in.listedIds === listedIds &&
    prev.in.byId === byId &&
    prev.in.filter === filter
  ) {
    return prev;
  }

  let out;
  switch (filter) {
    case FilterType.ShowAll:
      out = listedIds;
      break;
    case FilterType.ShowCompleted:
      out = listedIds.filter(function (id) {
        return byId.ref.get(id)!.isCompleted;
      });
      break;
    default: // FilterType.ShowActive
      out = listedIds.filter(function (id) {
        return !byId.ref.get(id)!.isCompleted;
      });
      break;
  }

  return selectorData({ listedIds, byId, filter }, out);
}

export interface SelectListedCountState {
  in: number[];
  out: number;
}

export function selectListedCount(
  prev: SelectListedCountState | null,
  _props: null,
  context: Context<{ store: Store }>,
): SelectListedCountState {
  const state = context.store.getState();
  const listedIds = state.todos.listedIds;

  if (prev && prev.in === listedIds) {
    return prev;
  }

  return selectorData(listedIds, listedIds.length);
}

export interface SelectCompletedCountState {
  in: {
    listedIds: number[],
    byId: Mutable<Map<number, TodoEntry>>,
  };
  out: number;
}

export function selectCompletedCount(
  _prev: SelectCompletedCountState | null,
  _props: null,
  context: Context<{
    store: Store,
    completedCount: SelectorDataRef<SelectCompletedCountState>,
  }>,
): SelectCompletedCountState {
  const state = context.store.getState();
  const listedIds = state.todos.listedIds;
  const byId = state.todos.byId;
  const prev = context.completedCount.ref;
  if (prev && prev.in.listedIds === listedIds && prev.in.byId === byId) {
    return prev;
  }

  let c = 0;
  for (let i = 0; i < listedIds.length; i++) {
    const id = listedIds[i];
    if (byId.ref.get(id)!.isCompleted) {
      c++;
    }
  }

  return context.completedCount.ref = selectorData({ listedIds, byId }, c);
}
