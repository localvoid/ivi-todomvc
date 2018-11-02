import { Component, useSelect } from "ivi";

export function createSelector<T, P, C>(
  selector: (props: P, context: C, prev?: T | undefined) => T,
  shouldUpdate?: undefined extends P ? undefined : (prev: P, next: P) => boolean,
) {
  return (c: Component) => useSelect(c, selector, shouldUpdate);
}
