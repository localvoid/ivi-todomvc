import { Builder, HttpMethod, jsEmitter } from "routekit";
import { FilterType } from "../src/state";

const routes = new Builder();

function r(name: string, path: string, data: FilterType) {
  routes.add(name, path, HttpMethod.GET, JSON.stringify(data));
}

r("home", "/", FilterType.All);
r("completed", "/completed", FilterType.Completed);
r("active", "/active", FilterType.Active);

process.stdout.write(jsEmitter({
  target: "ts",
  reverseFunctions: false,
  reverseMap: false,
})(routes));
