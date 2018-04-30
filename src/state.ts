import { Box, box, cachedQuery } from "ivi-state";
import { updateNextFrame } from "ivi";

export const enum FilterType {
  ShowAll = 0,
  ShowCompleted = 1,
  ShowActive = 2,
}

export class TodoEntry {
  constructor(public id: number, public text: string, public isCompleted: boolean) {
    this.id = id;
    this.text = text;
    this.isCompleted = isCompleted;
  }

  clone(): TodoEntry {
    return new TodoEntry(this.id, this.text, this.isCompleted);
  }
}

export class TodoCollection {
  byId = new Map<number, Box<TodoEntry>>();
  sortedByDate: Box<TodoEntry>[] = [];
}

export class AppState {
  todos = new TodoCollection();
  filter = FilterType.ShowAll;
}

export class AppStateQueries {
  allEntries = cachedQuery<Box<TodoEntry>[]>(
    () => this.state.todos.sortedByDate,
  );

  activeEntries = cachedQuery<Box<TodoEntry>[]>(
    () => this.state.todos.sortedByDate.filter((entry) => !entry.ref.isCompleted)
  );

  completedEntries = cachedQuery<Box<TodoEntry>[]>(
    () => this.state.todos.sortedByDate.filter((entry) => entry.ref.isCompleted),
  );

  constructor(private state: AppState) {
    this.state = state;
  }

  filter(): FilterType {
    return this.state.filter;
  }
}

const state = new AppState();
const queries = new AppStateQueries(state);

export function query(): AppStateQueries {
  return queries;
}

let _nextEntryId = 0;
export function createEntry(text: string) {
  const id = _nextEntryId++;
  const entry = box(new TodoEntry(id, text, false));
  state.todos.byId.set(id, entry);
  state.todos.sortedByDate.push(entry);

  queries.allEntries.reset();
  queries.activeEntries.reset();

  updateNextFrame();
}

export function removeEntry(entry: Box<TodoEntry>) {
  state.todos.sortedByDate.splice(state.todos.sortedByDate.indexOf(entry), 1)
  state.todos.byId.delete(entry.ref.id);

  queries.allEntries.reset();
  if (entry.ref.isCompleted) {
    queries.completedEntries.reset();
  } else {
    queries.activeEntries.reset();
  }

  updateNextFrame();
}

export function editEntry(entry: Box<TodoEntry>, text: string) {
  const v = entry.ref = entry.ref.clone();
  v.text = text;

  updateNextFrame();
}

export function toggleEntryCompleted(entry: Box<TodoEntry>) {
  const v = entry.ref = entry.ref.clone();
  v.isCompleted = !v.isCompleted;

  queries.activeEntries.reset();
  queries.completedEntries.reset();

  updateNextFrame();
}

export function removeCompleted() {
  state.todos.sortedByDate = state.todos.sortedByDate.filter((entry) => {
    if (entry.ref.isCompleted) {
      state.todos.byId.delete(entry.ref.id);
      return false;
    }
    return true;
  });

  queries.allEntries.reset();
  queries.completedEntries.reset();

  updateNextFrame();
}

export function toggleAll() {
  const areSomeActive = state.todos.sortedByDate.some((entry) => !entry.ref.isCompleted);
  let invalidateQueries = false;
  for (const entry of state.todos.sortedByDate) {
    if (entry.ref.isCompleted !== areSomeActive) {
      const v = entry.ref = entry.ref.clone();
      v.isCompleted = areSomeActive;
      invalidateQueries = true;
    }
  }
  if (invalidateQueries) {
    queries.activeEntries.reset();
    queries.completedEntries.reset();
  }

  updateNextFrame();
}

export function setFilter(filter: FilterType) {
  state.filter = filter;

  updateNextFrame();
}
