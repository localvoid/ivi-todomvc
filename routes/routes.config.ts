import { Builder, HttpMethod } from "routekit";
import { inject } from "routekit-js";
import { FilterType } from "../src/state";
import { writeFileSync, readFileSync } from "fs";

const routes = new Builder();

function r(name: string, path: string, data: FilterType) {
  routes.add(name, path, HttpMethod.GET, JSON.stringify(data));
}

r("home", "/", FilterType.All);
r("completed", "/completed", FilterType.Completed);
r("active", "/active", FilterType.Active);

const path = "./src/routes.ts";

writeFileSync(
  path,
  inject(
    routes,
    readFileSync(path).toString(),
    { target: "ts" },
  ),
);
