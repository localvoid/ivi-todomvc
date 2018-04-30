import { connect } from "ivi";
import * as h from "ivi-html";
import { QueryResult, Box } from "ivi-state";
import { query, TodoEntry } from "../state";
import { header } from "./header";
import { footerConnector } from "./footer";
import { main } from "./main";

export const app = connect<{ entries: QueryResult<Box<TodoEntry>[]>, count: number }>(
  (prev) => {
    const entries = query().allEntries.get();

    if (prev !== null && prev.entries === entries) {
      return prev;
    }

    return { entries, count: entries.result.length };
  },
  ({ count }) => (
    h.section().c(
      header(),
      count ? main() : null,
      count ? footerConnector() : null,
    )
  ),
);
