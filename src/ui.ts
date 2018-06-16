import {
  Component, KeyCode, statefulComponent, statelessComponent, connect, map, autofocus,
  onKeyDown, onInput, onClick, onChange, onDoubleClick, onBlur, EventFlags,
} from "ivi";
import {
  header, h1, input, a, li, footer, ul, span, strong, button, div, label, section, VALUE, CHECKED,
} from "ivi-html";
import { QueryResult, Box, BoxSnapshot, createBoxSnapshot, lazy } from "ivi-state";
import {
  FilterType, TodoEntry, query, createEntry, removeCompleted, removeEntry, toggleEntryCompleted, editEntry, toggleAll,
} from "./state";

const Header = statefulComponent(class extends Component {
  private inputValue = "";

  private inputEvents = [
    onKeyDown((ev) => {
      if (ev.native.keyCode === KeyCode.Enter) {
        createEntry(this.inputValue);
        this.inputValue = "";

        this.invalidate();
      }
    }),
    onInput((ev) => {
      this.inputValue = (ev.target as HTMLInputElement).value;
      this.invalidate();
    }),
  ];

  render() {
    return header().c(
      h1().c("todos"),
      autofocus(
        input("", {
          id: "new-todo",
          placeholder: "What needs to be done",
          value: VALUE(this.inputValue),
        }).e(this.inputEvents),
      ),
    );
  }
});

function footerButton(selected: boolean, href: string, text: string) {
  return li().c(
    a(selected ? "selected" : "", { href }).c(text),
  );
}

interface FooterProps {
  filter: FilterType;
  listedCount: number;
  completedCount: number;
}

const Footer = statefulComponent(class extends Component<FooterProps> {
  private clearCompletedEvents = onClick((ev) => (removeCompleted(), EventFlags.PreventDefault));

  render() {
    const { filter, listedCount, completedCount } = this.props;
    const activeCount = listedCount - completedCount;

    return footer("", { id: "footer" }).c(
      ul("", { id: "filters" }).c(
        footerButton(filter === FilterType.All, "#/", "All"),
        " ",
        footerButton(filter === FilterType.Active, "#/active", "Active"),
        " ",
        footerButton(filter === FilterType.Completed, "#/completed", "Completed"),
      ),
      span("", { id: "todo-count" }).c(
        strong().c(activeCount > 0 ? activeCount : "No"),
        activeCount === 1 ? " item left" : " items left",
      ),
      When((completedCount > 0),
        button("", { id: "clear-completed" })
          .e(this.clearCompletedEvents)
          .c(`Clear completed (${completedCount})`),
      ),
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

const EntryField = statefulComponent(class extends Component<BoxSnapshot<TodoEntry>> {
  private editText = "";
  private editing = false;

  private destroyEvents = onClick((ev) => (removeEntry(this.props.box), EventFlags.PreventDefault));
  private toggleEvents = onChange((ev) => (toggleEntryCompleted(this.props.box), EventFlags.PreventDefault));

  private labelEvents = onDoubleClick((ev) => {
    this.editText = this.props.value.text;
    this.editing = true;
    this.invalidate();
  });

  private editEvents = lazy(() => [
    onInput((ev) => {
      this.editText = (ev.target as HTMLInputElement).value;
    }),
    onBlur((ev) => {
      this.editText = "";
      this.editing = false;
      this.invalidate();
    }, true),
    onKeyDown((ev) => {
      switch (ev.native.keyCode) {
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

    return li(editing ?
      (isCompleted ? "editing completed" : "editing") :
      (isCompleted ? "completed" : "")).c(
        div("view").c(
          input("toggle", { type: "checkbox", checked: CHECKED(isCompleted) }).e(this.toggleEvents),
          label().e(this.labelEvents).c(entry.text),
          button("destroy").e(this.destroyEvents),
        ),
        When(editing,
          autofocus(
            input("edit", { value: VALUE(this.editText) })
              .e(this.editEvents()),
          ),
        ),
    );
  }
});

const EntryFieldConnector = connect<BoxSnapshot<TodoEntry>, Box<TodoEntry>>(
  (prev, entry) => (
    (prev !== null && prev.value === entry.value) ?
      prev :
      createBoxSnapshot(entry)
  ),
  EntryField,
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
      ul("", { id: "todo-list" })
        .c(map(entries.result, (e) => EntryFieldConnector(e).k(e.value.id)))
    ),
);

const ToggleAllView = statefulComponent(class extends Component<boolean> {
  private onChange = onChange((ev) => (toggleAll(), EventFlags.PreventDefault));

  render() {
    return input("", {
      id: "toggle-all",
      type: "checkbox",
      checked: CHECKED(this.props),
    }).e(this.onChange);
  }
});

const ToggleAllConnector = connect<boolean>(
  (prev) => (query().allEntries.get().result.length === query().completedEntries.get().result.length),
  (checked) => ToggleAllView(checked),
);

const Main = statelessComponent(() => (
  section("", { id: "main" }).c(
    ToggleAllConnector(),
    EntryListConnector(),
  )
));

function When<T>(condition: boolean, result: T): T | null {
  return (condition === true) ? result : null;
}

export const app = connect<{ entries: QueryResult<Box<TodoEntry>[]>, count: number }>(
  (prev) => {
    const entries = query().allEntries.get();

    return (prev !== null && prev.entries === entries) ? prev :
      { entries, count: entries.result.length };
  },
  ({ count }) => (
    section().c(
      Header(),
      count ? Main() : null,
      count ? FooterConnector() : null,
    )
  ),
);
