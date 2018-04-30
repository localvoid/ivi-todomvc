import { render } from "ivi";
import { RouteNode, ResolveResult, resolve } from "routekit-resolver";
import { ROUTES } from "./routes";
import { app } from "./ui/app";
import { setFilter } from "./state";

function initRouter<T>(
  extractPath: (location: Location) => string,
  routes: RouteNode<T>,
  mergeData: (a: T | undefined, b: T | undefined, node: RouteNode<T>) => T,
  onChange: (result: ResolveResult<T> | null) => void,
): void {
  const loc = window.location;
  let path = extractPath(loc);
  onChange(resolve<T>(routes, path, mergeData));

  window.addEventListener("hashchange", function () {
    const newPath = extractPath(loc);
    if (path !== newPath) {
      path = newPath;
      onChange(resolve<T>(routes, newPath, mergeData));
    }
  });
}

initRouter<number>(
  (location: Location) => {
    const path = decodeURIComponent(location.hash);
    if (path.length > 1) {
      return path.slice(1);
    }
    return "/";
  },
  ROUTES,
  (a, b) => b!,
  (result: ResolveResult<number> | null) => {
    if (result) {
      setFilter(result.data!);
    }
  },
);

render(
  app(),
  document.getElementById("todoapp")!,
);
