import replace from "rollup-plugin-replace";
import nodeResolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "build/main.js",
  output: {
    file: "dist/bundle.js",
    format: "es",
  },
  plugins: [
    replace({
      values: {
        "__IVI_DEBUG__": false,
        "__IVI_TARGET__": JSON.stringify("evergreen"),
      },
    }),
    nodeResolve(),
    terser({
      "parse": {
        "ecma": 8
      },
      "compress": {
        "ecma": 5,
        "inline": true,
        "reduce_funcs": false,
        "passes": 3,
        "comparisons": false
      },
      "output": {
        "ecma": 5,
        "comments": false
      },
      "toplevel": true,
      "mangle": {
        "safari10": true
      }
    }),
  ],
};
