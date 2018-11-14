import { r, injector } from "routekit";
import { writeFileSync, readFileSync } from "fs";

const path = "./src/state/location.ts";

writeFileSync(
  path,
  injector(readFileSync(path).toString())(
    r("/", "RouteLocation.All"),
    r("/completed", "RouteLocation.Completed"),
    r("/active", "RouteLocation.Active"),
  ),
);
