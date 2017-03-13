import { FilterType } from "./constants";
import { getStore } from "./store";

export const enum ActionType {
    AddTodo = 0,
    DeleteTodo = 1,
    EditTodo = 2,
    CompleteTodo = 3,
    CompleteAll = 4,
    ClearCompleted = 5,
    SetFilter = 6,
}

export interface AddTodoAction {
    type: ActionType.AddTodo;
    payload: {
        id: number,
        text: string,
    };
}

export interface DeleteTodoAction {
    type: ActionType.DeleteTodo;
    payload: {
        id: number,
    };
}

export interface EditTodoAction {
    type: ActionType.EditTodo;
    payload: {
        id: number,
        text: string,
    };
}

export interface CompleteTodoAction {
    type: ActionType.CompleteTodo;
    payload: {
        id: number,
    };
}

export interface CompleteAllAction {
    type: ActionType.CompleteAll;
    payload: null;
}

export interface ClearCompletedAction {
    type: ActionType.ClearCompleted;
    payload: null;
}

export interface SetFilterAction {
    type: ActionType.SetFilter;
    payload: {
        filter: FilterType;
    };
}

export type Action =
    AddTodoAction |
    DeleteTodoAction |
    EditTodoAction |
    CompleteTodoAction |
    CompleteAllAction |
    ClearCompletedAction |
    SetFilterAction;

let nextTodoId = 0;
export function addTodo(text: string): void {
    getStore().dispatch({
        type: ActionType.AddTodo,
        payload: {
            id: nextTodoId++,
            text,
        },
    });
}

export function deleteTodo(id: number): void {
    getStore().dispatch({
        type: ActionType.DeleteTodo,
        payload: {
            id,
        },
    });
}

export function editTodo(id: number, text: string): void {
    getStore().dispatch({
        type: ActionType.EditTodo,
        payload: {
            id,
            text,
        },
    });
}

export function completeTodo(id: number): void {
    getStore().dispatch({
        type: ActionType.CompleteTodo,
        payload: {
            id,
        },
    });
}

export function completeAll(): void {
    getStore().dispatch({
        type: ActionType.CompleteAll,
        payload: null,
    });
}

export function clearCompleted(): void {
    getStore().dispatch({
        type: ActionType.ClearCompleted,
        payload: null,
    });
}

export function setFilter(filter: FilterType): void {
    getStore().dispatch({
        type: ActionType.SetFilter,
        payload: {
            filter,
        },
    });
}
