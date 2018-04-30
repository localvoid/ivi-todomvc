import { Component, connect, componentFactory } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { FilterType, TodoEntry, query, removeCompleted } from "../state";
import { QueryResult, Box } from "ivi-state";

interface FooterProps {
  filter: FilterType;
  listedCount: number;
  completedCount: number;
}

class Footer extends Component<FooterProps> {
  onClickClearCompleted = Events.onClick((ev) => {
    ev.preventDefault();
    removeCompleted();
  });

  render() {
    const { filter, listedCount, completedCount } = this.props;
    const activeCount = listedCount - completedCount;

    return h.footer().a({ id: "footer" }).c(
      h.ul().a({ "id": "filters" }).c(
        h.li().c(
          h.a(filter === FilterType.ShowAll ? "selected" : undefined)
            .a({ "href": "#/" })
            .c("All"),
        ),
        " ",
        h.li().c(
          h.a(filter === FilterType.ShowActive ? "selected" : undefined)
            .a({ "href": "#/active" })
            .c("Active"),
        ),
        " ",
        h.li().c(
          h.a(filter === FilterType.ShowCompleted ? "selected" : undefined)
            .a({ "href": "#/completed" })
            .c("Completed"),
        ),
      ),
      h.span().a({ "id": "todo-count" }).c(
        h.strong().c(activeCount ? activeCount : "No"),
        (activeCount === 1) ? " item left" : " items left",
      ),
      (completedCount > 0) ?
        h.button()
          .a({ "id": "clear-completed" })
          .e(this.onClickClearCompleted)
          .c(`Clear completed (${completedCount})`) :
        null,
    );
  }
}

export const footer = componentFactory(Footer);

export const footerConnector = connect<
  {
    filter: FilterType,
    entries: QueryResult<Box<TodoEntry>[]>,
    completedEntries: QueryResult<Box<TodoEntry>[]>,
    props: FooterProps,
  }
  >(
    (prev) => {
      const filter = query().filter();
      const entries = query().allEntries.get();
      const completedEntries = query().completedEntries.get();

      if (
        prev !== null &&
        prev.filter === filter &&
        prev.entries === entries &&
        prev.completedEntries === completedEntries
      ) {
        return prev;
      }

      return {
        filter,
        entries,
        completedEntries,
        props: {
          filter,
          listedCount: entries.result.length,
          completedCount: completedEntries.result.length,
        },
      };
    },
    ({ props }) => footer(props),
);
