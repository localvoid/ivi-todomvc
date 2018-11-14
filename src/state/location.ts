import { requestDirtyCheck, selector } from "ivi";
import { setupHashRouter } from "ivi-router";

export const enum RouteLocation { All, Completed, Active }

// routekit:emit("routes")
const ROUTES = {
  f: [67, 7, 7],
  p: ["completed", "active"],
  s: [RouteLocation.All, RouteLocation.Completed, RouteLocation.Active],
};
// routekit:end

const router = setupHashRouter<RouteLocation>(ROUTES, RouteLocation.All, () => { requestDirtyCheck(); });

export const useLocation = selector(() => router.state);
