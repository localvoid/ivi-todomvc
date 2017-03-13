import { update, createStore, mut } from "ivi";
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
    update,
);

export function getStore() {
    return _store;
}
