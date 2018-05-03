import { Component, KeyCode, component, statelessComponent, connect, map } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { QueryResult, Box, BoxSnapshot, createBoxSnapshot, lazy } from "ivi-state";
import {
  FilterType, TodoEntry, query, createEntry, removeCompleted, removeEntry, toggleEntryCompleted, editEntry, toggleAll,
} from "./state";

const Header = component(class extends Component {
  private inputValue = "";

  private inputEvents = [
    Events.onKeyDown((ev) => {
      if (ev.keyCode === KeyCode.Enter) {
        createEntry(this.inputValue);
        this.inputValue = "";
        this.invalidate();
      }
    }),
    Events.onInput((ev) => {
      this.inputValue = (ev.target as HTMLInputElement).value;
      this.invalidate();
    })
  ];

  render() {
    return h.header().c(
      h.h1().c("todos"),
      h.input()
        .a({ "id": "new-todo", "placeholder": "What needs to be done" })
        .e(this.inputEvents)
        .value(this.inputValue)
        .autofocus(true),
    );
  }
});

function footerButton(selected: boolean, href: string, text: string) {
  return h.li().c(
    h.a(selected ? "selected" : undefined).a({ "href": href }).c(text),
  );
}

interface FooterProps {
  filter: FilterType;
  listedCount: number;
  completedCount: number;
}

const Footer = component(class extends Component<FooterProps> {
  private clearCompletedEvents = Events.onClick((ev) => {
    ev.preventDefault();
    removeCompleted();
  });

  render() {
    const { filter, listedCount, completedCount } = this.props;
    const activeCount = listedCount - completedCount;

    return h.footer().a({ id: "footer" }).c(
      h.ul().a({ "id": "filters" }).c(
        footerButton(filter === FilterType.All, "#/", "All"),
        " ",
        footerButton(filter === FilterType.Active, "#/active", "Active"),
        " ",
        footerButton(filter === FilterType.Completed, "#/completed", "Completed"),
      ),
      h.span().a({ "id": "todo-count" }).c(
        h.strong().c(activeCount ? activeCount : "No"),
        (activeCount === 1) ? " item left" : " items left",
      ),
      (completedCount > 0) ?
        h.button()
          .a({ "id": "clear-completed" })
          .e(this.clearCompletedEvents)
          .c(`Clear completed (${completedCount})`) :
        null,
    );
  }
});

const FooterConnector = connect<
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

      return (
        prev !== null &&
        prev.filter === filter &&
        prev.entries === entries &&
        prev.completedEntries === completedEntries
      ) ? prev :
        {
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
    ({ props }) => Footer(props),
);

const EntryField = component(class extends Component<BoxSnapshot<TodoEntry>> {
  private editText = "";
  private editing = false;

  private destroyEvents = Events.onClick((ev) => {
    removeEntry(this.props.box);
    ev.preventDefault();
  });

  private toggleEvents = Events.onChange((ev) => {
    toggleEntryCompleted(this.props.box);
    ev.preventDefault();
  });

  private labelEvents = Events.onDoubleClick((ev) => {
    this.editText = this.props.value.text;
    this.editing = true;
    this.invalidate();
  });

  private editEvents = lazy(() => [
    Events.onInput((ev) => {
      this.editText = (ev.target as HTMLInputElement).value;
    }),
    Events.onBlur((ev) => {
      this.editText = "";
      this.editing = false;
      this.invalidate();
    }, true),
    Events.onKeyDown((ev) => {
      switch (ev.keyCode) {
        case (KeyCode.Enter):
          editEntry(this.props.box, this.editText);
          this.editText = "";
          this.editing = false;
          this.invalidate();
          break;
        case (KeyCode.Escape):
          this.editText = "";
          this.editing = false;
          this.invalidate();
          break;
      }
    }),
  ]);

  render() {
    const editing = this.editing;
    const entry = this.props.value;
    const isCompleted = entry.isCompleted;

    return h.li(editing ?
      (isCompleted ? "editing completed" : "editing") :
      (isCompleted ? "completed" : undefined)).c(
        h.div("view").c(
          h.inputCheckbox("toggle").e(this.toggleEvents).checked(isCompleted),
          h.label().e(this.labelEvents).c(entry.text),
          h.button("destroy").e(this.destroyEvents),
        ),
        editing ?
          h.input("edit")
            .e(this.editEvents())
            .value(this.editText)
            .autofocus(true) :
          null,
    );
  }
});

const EntryFieldConnector = connect<BoxSnapshot<TodoEntry>, Box<TodoEntry>>(
  (prev, entry) => (
    (prev !== null && prev.value === entry.value) ?
      prev :
      createBoxSnapshot(entry)
  ),
  (props) => EntryField(props),
);

const EntryListConnector = connect<
  {
    filter: FilterType,
    entries: QueryResult<Box<TodoEntry>[]>,
  }
  >(
    (prev) => {
      const filter = query().filter();
      let entries: QueryResult<Box<TodoEntry>[]>;
      if (filter === FilterType.All) {
        entries = query().allEntries.get();
      } else if (filter === FilterType.Active) {
        entries = query().activeEntries.get();
      } else {
        entries = query().completedEntries.get();
      }

      return (prev !== null && prev.entries === entries) ? prev :
        { filter, entries };
    },
    ({ entries }) => (
      h.ul().a({ "id": "todo-list" })
        .c(map(entries.result, (e) => EntryFieldConnector(e).k(e.value.id)))
    ),
);

const ToggleAllView = component(class extends Component<boolean> {
  private onChange = Events.onChange((ev) => {
    ev.preventDefault();
    toggleAll();
  });

  render() {
    return h.inputCheckbox()
      .a({ "id": "toggle-all" })
      .e(this.onChange)
      .checked(this.props);
  }
});

const ToggleAllConnector = connect<boolean>(
  (prev) => query().allEntries.get().result.length === query().completedEntries.get().result.length,
  (checked) => ToggleAllView(checked),
);

const Main = statelessComponent(() => (
  h.section().a({ "id": "main" }).c(
    ToggleAllConnector(),
    EntryListConnector(),
  )
));

export const app = connect<{ entries: QueryResult<Box<TodoEntry>[]>, count: number }>(
  (prev) => {
    const entries = query().allEntries.get();

    return (prev !== null && prev.entries === entries) ? prev :
      { entries, count: entries.result.length };
  },
  ({ count }) => (
    h.section().c(
      Header(),
      count ? Main() : null,
      count ? FooterConnector() : null,
    )
  ),
);
