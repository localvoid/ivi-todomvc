import { Component, KeyCode, connect, map, componentFactory } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { QueryResult, Box } from "ivi-state";
import { TodoEntry, query, FilterType, removeEntry, toggleEntryCompleted, editEntry } from "../state";

interface EntryFieldProps {
  entry: Box<TodoEntry>,
  ref: TodoEntry,
}

class EntryField extends Component<EntryFieldProps> {
  private editText = "";
  private editing = false;

  private destroyEvents = Events.onClick((ev) => {
    removeEntry(this.props.entry);
    ev.preventDefault();
  });

  private toggleEvents = Events.onChange((ev) => {
    toggleEntryCompleted(this.props.entry);
    ev.preventDefault();
  });

  private labelEvents = Events.onDoubleClick((ev) => {
    this.editText = this.props.ref.text;
    this.editing = true;
    this.invalidate();
  });

  private editEvents = [
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
          editEntry(this.props.entry, this.editText);
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
  ];

  render() {
    const entry = this.props.ref;
    const view = h.div("view").c(
      h.inputCheckbox("toggle").e(this.toggleEvents).checked(entry.isCompleted),
      h.label().e(this.labelEvents).c(entry.text),
      h.button("destroy").e(this.destroyEvents),
    );
    if (this.editing) {
      return h.li(entry.isCompleted ? "editing completed" : "editing").c(
        view,
        h.input("edit")
          .e(this.editEvents)
          .value(this.editText)
          .autofocus(true),
      );
    }

    return h.li(entry.isCompleted ? "completed" : undefined).c(view);
  }
}

const entryField = componentFactory(EntryField);

const entryFieldConnector = connect<EntryFieldProps, Box<TodoEntry>>(
  (prev, entry) => {
    if (prev !== null && prev.ref === entry.ref) {
      return prev;
    }
    return { entry, ref: entry.ref };
  },
  (props) => entryField(props),
);

const ENTRY_LIST_ATTRS = { "id": "todo-list" };

export const entryListConnector = connect<
  {
    filter: FilterType,
    entries: QueryResult<Box<TodoEntry>[]>,
  }
  >(
    (prev) => {
      const filter = query().filter();
      let entries: QueryResult<Box<TodoEntry>[]>;
      if (filter === FilterType.ShowAll) {
        entries = query().allEntries.get();
      } else if (filter === FilterType.ShowActive) {
        entries = query().activeEntries.get();
      } else {
        entries = query().completedEntries.get();
      }

      if (prev !== null && prev.filter === filter && prev.entries === entries) {
        return prev;
      }

      return {
        filter,
        entries,
      };
    },
    ({ entries }) => {
      return h.ul().a(ENTRY_LIST_ATTRS)
        .c(map(entries.result, (e) => entryFieldConnector(e).k(e.ref.id)));
    },
);
