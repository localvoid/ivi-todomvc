import { Store as AbstractStore, Mutable } from "ivi";
import { FilterType } from "./constants";
import { Action } from "./actions";

export interface TodoEntry {
    id: number;
    text: string;
    isCompleted: boolean;
}

export interface Todos {
    byId: Mutable<Map<number, TodoEntry>>;
    listedIds: number[];
}

export interface State {
    todos: Todos;
    filter: FilterType;
}

export type Store = AbstractStore<State, Action>;
