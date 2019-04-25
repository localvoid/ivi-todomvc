import {
  _, component, invalidate, KeyCode, Events, TrackByKey, key,
  AUTOFOCUS,
  onKeyDown, onInput, onClick, onChange, onDoubleClick, onBlur, UpdateFlags,
} from "ivi";
import {
  header, h1, input, a, li, footer, ul, span, strong, button, div, label, section, VALUE, CHECKED,
} from "ivi-html";
import { lazy } from "ivi-state";
import {
  RouteLocation, addEntry, removeCompleted, removeEntry, toggleCompleted, editEntry, toggleAll, useLocation,
  useEntries, useCompletedEntries, Entry, useEntry, useEntriesByFilterType,
} from "./state";

const Header = component((c) => {
  let _inputValue = "";

  const inputEvents = [
    onKeyDown((ev) => {
      if (ev.keyCode === KeyCode.Enter) {
        addEntry(_inputValue);
        _inputValue = "";
        invalidate(c, UpdateFlags.RequestSyncUpdate);
      }
    }),
    onInput((ev) => {
      _inputValue = (ev.target as HTMLInputElement).value;
    }),
  ];

  return () => (
    header("header", _, [
      h1(_, _, "todos"),
      Events(inputEvents,
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
  const clearEvents = onClick(() => { removeCompleted(); });

  return () => {
    const filter = getFilter();
    const listedCount = getEntries().result.length;
    const completedCount = getCompletedEntries().result.length;
    const activeCount = listedCount - completedCount;

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
        Events(clearEvents,
          button("clear-completed", _, `Clear completed (${completedCount})`),
        ) :
        null,
    ]);
  };
});

const EntryField = component<Entry>((c) => {
  let _entry: Entry;
  let _editText: string | null = null;

  const dirtyCheckEntry = useEntry(c);
  const destroyEvents = onClick(() => { removeEntry(_entry); });
  const toggleEvents = onChange(() => { toggleCompleted(_entry); });

  const labelEvents = onDoubleClick(() => {
    _editText = _entry.text;
    invalidate(c);
  });

  const editEvents = lazy(() => [
    onInput((ev) => {
      _editText = (ev.target as HTMLInputElement).value;
    }),
    onBlur(() => {
      _editText = null;
      invalidate(c);
    }),
    onKeyDown((ev) => {
      switch (ev.keyCode) {
        case (KeyCode.Enter): {
          editEntry(_entry, _editText as string);
          _editText = null;
          invalidate(c);
          break;
        }
        case (KeyCode.Escape):
          _editText = null;
          invalidate(c);
          break;
      }
    }),
  ]);

  return (entry) => (
    dirtyCheckEntry(entry),
    _entry = entry,

    li(_editText !== null ?
      (entry.isCompleted ? "editing completed" : "editing") :
      (entry.isCompleted ? "completed" : ""), _, [
        div("view", _, [
          Events(toggleEvents,
            input("toggle", { type: "checkbox", checked: CHECKED(entry.isCompleted) }),
          ),
          Events(labelEvents,
            label(_, _, entry.text),
          ),
          Events(destroyEvents,
            button("destroy"),
          ),
        ]),
        _editText !== null ?
          Events(editEvents(),
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
  const inputEvents = onChange((ev) => {
    ev.preventDefault();
    toggleAll();
  });

  return () => [
    Events(inputEvents,
      input("toggle-all", {
        id: "toggle-all",
        type: "checkbox",
        checked: CHECKED(getEntries().result.length === getCompletedEntries().result.length),
      }),
    ),
    label(_, { for: "toggle-all" }, "Mark all as complete"),
  ];
});

const Main = (
  section("main", _, [
    ToggleAllView(),
    EntryList(),
  ])
);

export const App = component((c) => {
  const getEntries = useEntries(c);
  return () => [
    Header(),
    getEntries().result.length ? [
      Main,
      Footer(),
    ] : null,
  ];
});
