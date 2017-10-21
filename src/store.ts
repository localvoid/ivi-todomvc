import { updateNextFrame } from "ivi";
import { createStore, mut } from "ivi-state";
import { FilterType } from "./constants";
import { TodoEntry, State } from "./state";
import { appState } from "./reducers";

function initAppState(): State {
  return {
    todos: {
      byId: mut(new Map<number, TodoEntry>()),
      listedIds: [],
    },
    filter: FilterType.ShowAll,
  };
}

const _store = createStore(
  initAppState(),
  appState,
  updateNextFrame,
);

export function getStore() {
  return _store;
}
