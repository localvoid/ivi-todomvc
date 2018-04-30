import { Component, componentFactory, connect, statelessComponentFactory } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { QueryResult, Box } from "ivi-state";
import { TodoEntry, query, toggleAll } from "../state";
import { entryListConnector } from "./entry_list";

interface ToggleAllProps {
  listedCount: number;
  completedCount: number;
}

class ToggleAllView extends Component<ToggleAllProps> {
  private onChange = Events.onChange((ev) => {
    ev.preventDefault();
    toggleAll();
  });

  render() {
    return h.inputCheckbox()
      .a({ "id": "toggle-all" })
      .e(this.onChange)
      .checked(this.props.completedCount === this.props.listedCount);
  }
}
const toggleAllView = componentFactory(ToggleAllView);

const toggleAllConnector = connect<
  {
    entries: QueryResult<Box<TodoEntry>[]>,
    completedEntries: QueryResult<Box<TodoEntry>[]>,
    props: ToggleAllProps,
  }
  >(
    (prev) => {
      const entries = query().allEntries.get();
      const completedEntries = query().completedEntries.get();

      if (prev !== null && prev.entries === entries && prev.completedEntries === completedEntries) {
        return prev;
      }

      return {
        entries,
        completedEntries,
        props: {
          listedCount: entries.result.length,
          completedCount: completedEntries.result.length,
        },
      };
    },
    ({ props }) => toggleAllView(props),
);

function Main() {
  return h.section().a({ "id": "main" }).c(
    toggleAllConnector(),
    entryListConnector(),
  );
}
export const main = statelessComponentFactory(Main);
