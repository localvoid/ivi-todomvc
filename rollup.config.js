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
        "process.env.NODE_ENV": `"production"`,
        "process.env.IVI_TARGET": `"evergreen"`,
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
