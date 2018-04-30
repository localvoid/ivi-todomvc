import { Builder, HttpMethod, jsEmitter } from "routekit";
import { FilterType } from "../src/state";

const routes = new Builder();

function r(name: string, path: string, data: FilterType) {
  routes.add(name, path, HttpMethod.GET, JSON.stringify(data));
}

r("home", "/", FilterType.ShowAll);
r("completed", "/completed", FilterType.ShowCompleted);
r("active", "/active", FilterType.ShowActive);

process.stdout.write(jsEmitter({
  target: "ts",
  reverseFunctions: false,
  reverseMap: false,
})(routes));
