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

  mutate(): Mutable<TodoEntry> {
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
    () => this.state.todos.sortedByDate.filter((entry) => !entry.value.isCompleted)
  );

  completedEntries = cachedQuery<Box<TodoEntry>[]>(
    () => this.state.todos.sortedByDate.filter((entry) => entry.value.isCompleted),
  );

  constructor(private state: AppState) { }

  filter(): FilterType {
    return this.state.filter;
  }
}

const state = new AppState();
const queries = new AppStateQueries(state);

export function query(): AppStateQueries {
  return queries;
}

export function updateState(fn: () => void) {
  fn();
  updateNextFrame();
}

let _nextEntryId = 0;
export function createEntry(text: string) {
  updateState(() => {
    const id = _nextEntryId++;
    const entry = createBox(new TodoEntry(id, text, false));
    state.todos.byId.set(id, entry);
    state.todos.sortedByDate.push(entry);

    queries.allEntries.reset();
    queries.activeEntries.reset();
  });
}

export function removeEntry(entry: Box<TodoEntry>) {
  updateState(() => {
    state.todos.sortedByDate.splice(state.todos.sortedByDate.indexOf(entry), 1)
    state.todos.byId.delete(entry.value.id);

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
    const v = entry.value = entry.value.mutate();
    v.text = text;
  });
}

export function toggleEntryCompleted(entry: Box<TodoEntry>) {
  updateState(() => {
    const v = entry.value = entry.value.mutate();
    v.isCompleted = !v.isCompleted;

    queries.activeEntries.reset();
    queries.completedEntries.reset();
  });
}

export function removeCompleted() {
  updateState(() => {
    state.todos.sortedByDate = state.todos.sortedByDate.filter((entry) => {
      if (entry.value.isCompleted) {
        state.todos.byId.delete(entry.value.id);
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
    const areSomeActive = state.todos.sortedByDate.some((entry) => !entry.value.isCompleted);
    let invalidateQueries = false;
    for (const entry of state.todos.sortedByDate) {
      if (entry.value.isCompleted !== areSomeActive) {
        const v = entry.value = entry.value.mutate();
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
    state.filter = filter;
  });
}
