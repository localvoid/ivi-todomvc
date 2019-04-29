import {
  _, component, invalidate, KeyCode, Events, TrackByKey, key,
  AUTOFOCUS,
  onKeyDown, onInput, onClick, onChange, onDoubleClick, onBlur, UpdateFlags,
} from "ivi";
import {
  header, h1, input, a, li, footer, ul, span, strong, button, div, label, section, VALUE, CHECKED,
} from "ivi-html";
import {
  RouteLocation, addEntry, removeCompleted, removeEntry, toggleCompleted, editEntry, toggleAll, useLocation,
  useEntries, useCompletedEntries, Entry, useEntry, useEntriesByFilterType,
} from "./state";

const Header = component((c) => {
  let _inputValue = "";

  return () => (
    header("header", _, [
      h1(_, _, "todos"),
      Events([
        onKeyDown((ev) => {
          if (ev.keyCode === KeyCode.Enter) {
            addEntry(_inputValue);
            _inputValue = "";
            invalidate(c, UpdateFlags.RequestSyncUpdate);
          }
        }),
        onInput((ev) => {
          _inputValue = (ev.target as HTMLInputElement).value;
        })],
        input("new-todo", {
          placeholder: "What needs to be done?",
          value: VALUE(_inputValue),
          autofocus: AUTOFOCUS(true),
        }),
      ),
    ])
  );
});

const FooterButton = (selected: boolean, href: string, text: string) => (
  li(_, _,
    a(selected ? "selected" : _, { href }, text),
  )
);

const Footer = component((c) => {
  const getFilter = useLocation(c);
  const getEntries = useEntries(c);
  const getCompletedEntries = useCompletedEntries(c);

  return () => {
    const filter = getFilter();
    const completedCount = getCompletedEntries().result.length;
    const activeCount = getEntries().result.length - completedCount;

    return footer("footer", _, [
      ul("filters", _, [
        FooterButton(filter === RouteLocation.All, "#/", "All"),
        FooterButton(filter === RouteLocation.Active, "#/active", "Active"),
        FooterButton(filter === RouteLocation.Completed, "#/completed", "Completed"),
      ]),
      span("todo-count", _, [
        strong(_, _, activeCount > 0 ? activeCount : "No"),
        activeCount === 1 ? " item left" : " items left",
      ]),
      (completedCount > 0) ?
        Events(onClick(() => { removeCompleted(); }),
          button("clear-completed", _, `Clear completed (${completedCount})`),
        ) :
        null,
    ]);
  };
});

const EntryField = component<Entry>((c) => {
  let _editText: string | null = null;
  const dirtyCheckEntry = useEntry(c);
  const stopEditing = () => {
    _editText = null;
    invalidate(c);
  };

  return (entry) => (
    dirtyCheckEntry(entry),

    li(_editText !== null ?
      (entry.isCompleted ? "editing completed" : "editing") :
      (entry.isCompleted ? "completed" : ""), _, [
        div("view", _, [
          Events(onChange(() => { toggleCompleted(entry); }),
            input("toggle", { type: "checkbox", checked: CHECKED(entry.isCompleted) }),
          ),
          Events(
            onDoubleClick(() => {
              _editText = entry.text;
              invalidate(c);
            }),
            label(_, _, entry.text),
          ),
          Events(onClick(() => { removeEntry(entry); }),
            button("destroy"),
          ),
        ]),
        _editText !== null ?
          Events([
            onInput((ev) => {
              _editText = (ev.target as HTMLInputElement).value;
            }),
            onBlur(stopEditing),
            onKeyDown(({ keyCode }) => {
              if (keyCode === KeyCode.Enter || keyCode === KeyCode.Escape) {
                if (keyCode === KeyCode.Enter) {
                  editEntry(entry, _editText!);
                }
                stopEditing();
              }
            })],
            input("edit", { value: VALUE(_editText), autofocus: AUTOFOCUS(true) }),
          ) :
          null,
      ])
  );
});

const EntryList = component((c) => {
  const getFilter = useLocation(c);
  const getEntriesByFilterType = useEntriesByFilterType(c);

  return () => ul("todo-list", _,
    TrackByKey(getEntriesByFilterType(getFilter()).result.map((e) => key(e.id, EntryField(e)))),
  );
});

const ToggleAllView = component((c) => {
  const getEntries = useEntries(c);
  const getCompletedEntries = useCompletedEntries(c);

  return () => [
    Events(
      onChange((ev) => {
        ev.preventDefault();
        toggleAll();
      }),
      input(_, {
        id: "toggle-all",
        type: "checkbox",
        checked: CHECKED(getEntries().result.length === getCompletedEntries().result.length),
      }),
    ),
    label(_, { for: "toggle-all" }, "Mark all as complete"),
  ];
});

export const App = component((c) => {
  const getEntries = useEntries(c);
  return () => [
    Header(),
    getEntries().result.length ? [
      section("main", _, [
        ToggleAllView(),
        EntryList(),
      ]),
      Footer(),
    ] : null,
  ];
});
