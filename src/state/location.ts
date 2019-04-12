import { requestDirtyCheck, selector } from "ivi";

export const enum RouteLocation { All, Completed, Active }

let state = RouteLocation.All;
addEventListener("hashchange", () => {
  const { hash } = location;
  state = RouteLocation.All;
  if (hash === "#/active") {
    state = RouteLocation.Active;
  } else if (hash === "#/completed") {
    state = RouteLocation.Completed;
  }
  requestDirtyCheck();
});

export const useLocation = selector(() => state);
