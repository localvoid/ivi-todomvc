import { setupScheduler, render } from "ivi";
import { invalidateHandler } from "ivi-scheduler";
import { RouteMap, ResolveResult, resolve } from "routekit-resolver";
import { ROUTES } from "./routes";
import { app } from "./ui";
import { setFilter } from "./state";

function initRouter<A, T>(
  extractPath: (location: Location) => string,
  routes: RouteMap<T>,
  data: A,
  reducer: (a: A, b: T) => A,
  onChange: (result: ResolveResult<A> | null) => void,
): void {
  const loc = window.location;
  let path = extractPath(loc);
  onChange(resolve<A, T>(routes, reducer, path, data));

  window.addEventListener("hashchange", () => {
    const newPath = extractPath(loc);
    if (path !== newPath) {
      path = newPath;
      onChange(resolve<A, T>(routes, reducer, newPath, data));
    }
  });
}

setupScheduler(invalidateHandler);

initRouter<number, number>(
  (location) => {
    const path = decodeURIComponent(location.hash);
    return (path.length > 1) ? path.slice(1) : "/";
  },
  ROUTES,
  0,
  (a, b) => b,
  (result) => {
    if (result) {
      setFilter(result.data!);
    }
  },
);

render(app(), document.getElementById("todoapp")!);
