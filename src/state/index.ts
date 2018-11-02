export * from "./entry";
export * from "./app";

import { update as _update } from "ivi";
import { createAppState, AppState } from "./app";

export const STATE = createAppState();

export function update(fn: (state: AppState) => void) {
  fn(STATE);
  _update();
}
