import { Mutable, Box, createBox, cachedQuery } from "ivi-state";
import { updateNextFrame } from "ivi";

export const enum FilterType {
  All,
  Completed,
  Active,
}

export class TodoEntry {
  constructor(
    public readonly id: number,
    public readonly text: string,
    public readonly isCompleted: boolean,
  ) { }

  clone(): Mutable<TodoEntry> {
    return new TodoEntry(this.id, this.text, this.isCompleted);
  }
}

export class TodoCollection {
  byId = new Map<number, Box<TodoEntry>>();
  sortedByDate: Box<TodoEntry>[] = [];
}

export class AppState {
  todos = new TodoCollection();
  filter = FilterType.All;
}

export class AppStateQueries {
  allEntries = cachedQuery<Box<TodoEntry>[]>(
    () => this.state.todos.sortedByDate,
  );

  activeEntries = cachedQuery<Box<TodoEntry>[]>(
    () => this.state.todos.sortedByDate.filter((entry) => !entry.value.isCompleted),
  );

  completedEntries = cachedQuery<Box<TodoEntry>[]>(
    () => this.state.todos.sortedByDate.filter((entry) => entry.value.isCompleted),
  );

  constructor(private state: AppState) { }

  filter(): FilterType {
    return this.state.filter;
  }
}

const appState = new AppState();
const queries = new AppStateQueries(appState);

export function query(): AppStateQueries {
  return queries;
}

export function updateState(fn: () => void) {
  fn();
  updateNextFrame();
}

let _nextEntryId = 0;
export function createEntry(text: string) {
  if (text) {
    updateState(() => {
      const id = _nextEntryId++;
      const entry = createBox(new TodoEntry(id, text, false));
      appState.todos.byId.set(id, entry);
      appState.todos.sortedByDate.push(entry);

      queries.allEntries.reset();
      queries.activeEntries.reset();
    });
  }
}

export function removeEntry(entry: Box<TodoEntry>) {
  updateState(() => {
    appState.todos.sortedByDate.splice(appState.todos.sortedByDate.indexOf(entry), 1);
    appState.todos.byId.delete(entry.value.id);

    queries.allEntries.reset();
    if (entry.value.isCompleted) {
      queries.completedEntries.reset();
    } else {
      queries.activeEntries.reset();
    }
  });
}

export function editEntry(entry: Box<TodoEntry>, text: string) {
  updateState(() => {
    const v = entry.value = entry.value.clone();
    v.text = text;
  });
}

export function toggleEntryCompleted(entry: Box<TodoEntry>) {
  updateState(() => {
    const v = entry.value = entry.value.clone();
    v.isCompleted = !v.isCompleted;

    queries.activeEntries.reset();
    queries.completedEntries.reset();
  });
}

export function removeCompleted() {
  updateState(() => {
    appState.todos.sortedByDate = appState.todos.sortedByDate.filter((entry) => {
      if (entry.value.isCompleted) {
        appState.todos.byId.delete(entry.value.id);
        return false;
      }
      return true;
    });

    queries.allEntries.reset();
    queries.completedEntries.reset();
  });
}

export function toggleAll() {
  updateState(() => {
    const areSomeActive = appState.todos.sortedByDate.some((entry) => !entry.value.isCompleted);
    let invalidateQueries = false;
    for (const entry of appState.todos.sortedByDate) {
      if (entry.value.isCompleted !== areSomeActive) {
        const v = entry.value = entry.value.clone();
        v.isCompleted = areSomeActive;
        invalidateQueries = true;
      }
    }
    if (invalidateQueries) {
      queries.activeEntries.reset();
      queries.completedEntries.reset();
    }
  });
}

export function setFilter(filter: FilterType) {
  updateState(() => {
    appState.filter = filter;
  });
}
