import { Mutable, mut } from "ivi-state";
import { Action, ActionType } from "./actions";
import { FilterType } from "./constants";
import { TodoEntry, Todos, State } from "./state";

function filter(state: FilterType = FilterType.ShowAll, action: Action) {
  switch (action.type) {
    case ActionType.SetFilter:
      return action.payload.filter;
    default:
      return state;
  }
}

function todo(state: TodoEntry, action: Action): TodoEntry {
  switch (action.type) {
    case ActionType.AddTodo:
      return {
        id: action.payload.id,
        text: action.payload.text,
        isCompleted: false,
      };
    case ActionType.EditTodo:
      return {
        ...state,
        text: action.payload.text,
      };
    case ActionType.CompleteTodo:
      return {
        ...state,
        isCompleted: !state.isCompleted,
      };
  }
  return state;
}

function byId(state: Mutable<Map<number, TodoEntry>>, action: Action, listedIds: number[]) {
  const items = state.ref;
  switch (action.type) {
    case ActionType.AddTodo:
    case ActionType.EditTodo:
    case ActionType.CompleteTodo:
      items.set(action.payload.id, todo(items.get(action.payload.id)!, action));
      return mut(items);
    case ActionType.CompleteAll: {
      const areSomeActive = listedIds.some((id) => !items.get(id)!.isCompleted);
      items.forEach(function (entry, id) {
        if (entry.isCompleted !== areSomeActive) {
          items.set(id, { ...entry, isCompleted: areSomeActive });
        }
      });
      return mut(items);
    }
  }
  return state;
}

function listedIds(state: number[], action: Action, byId: Map<number, TodoEntry>): number[] {
  switch (action.type) {
    case ActionType.AddTodo:
      return [action.payload.id, ...state];
    case ActionType.DeleteTodo:
      return state.filter(function (id) {
        return id !== action.payload.id;
      });
    case ActionType.ClearCompleted:
      return state.filter(function (id) {
        return !byId.get(id)!.isCompleted;
      });
  }
  return state;
}

function todos(state: Todos, action: Action): Todos {
  return {
    byId: byId(state.byId, action, state.listedIds),
    listedIds: listedIds(state.listedIds, action, state.byId.ref),
  };
}

export function appState(state: State, action: Action): State {
  return {
    todos: todos(state.todos, action),
    filter: filter(state.filter, action),
  };
}
