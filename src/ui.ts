import {
  component, invalidate, KeyCode, statelessComponent, map,
  AUTOFOCUS,
  onKeyDown, onInput, onClick, onChange, onDoubleClick, onBlur, EventFlags, UpdateFlags,
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
      if (ev.native.keyCode === KeyCode.Enter) {
        const v = _inputValue;
        _inputValue = "";
        addEntry(v);
        invalidate(c, UpdateFlags.RequestSyncUpdate);
      }
    }),
    onInput((ev) => {
      _inputValue = (ev.target as HTMLInputElement).value;
      invalidate(c, UpdateFlags.RequestSyncUpdate);
    }),
  ];

  return () => (
    header().c(
      h1().t("todos"),
      input("", {
        id: "new-todo",
        placeholder: "What needs to be done",
        value: VALUE(_inputValue),
        autofocus: AUTOFOCUS(true),
      }).e(inputEvents),
    )
  );
});

const FooterButton = (selected: boolean, href: string, text: string) => (
  li().c(a(selected ? "selected" : "", { href }).t(text))
);

const Footer = component((c) => {
  const getFilter = useLocation(c);
  const getEntries = useEntries(c);
  const getCompletedEntries = useCompletedEntries(c);

  const clearEvents = onClick(() => (removeCompleted(), EventFlags.PreventDefault));

  return () => {
    const filter = getFilter();
    const listedCount = getEntries().result.length;
    const completedCount = getCompletedEntries().result.length;
    const activeCount = listedCount - completedCount;

    return footer("", { id: "footer" }).c(
      ul("", { id: "filters" }).c(
        FooterButton(filter === RouteLocation.All, "#/", "All"), " ",
        FooterButton(filter === RouteLocation.Active, "#/active", "Active"), " ",
        FooterButton(filter === RouteLocation.Completed, "#/completed", "Completed"),
      ),
      span("", { id: "todo-count" }).c(
        strong().t(activeCount > 0 ? activeCount : "No"), activeCount === 1 ? " item left" : " items left",
      ),
      (completedCount > 0) ?
        button("", { id: "clear-completed" }).e(clearEvents).t(`Clear completed (${completedCount})`) :
        null,
    );
  };
});

const EntryField = component<Entry>((c) => {
  let _entry: Entry;
  let _editText = "";
  let _editing = false;

  const dirtyCheckEntry = useEntry(c);
  const destroyEvents = onClick(() => (removeEntry(_entry), EventFlags.PreventDefault));
  const toggleEvents = onChange(() => (toggleCompleted(_entry), EventFlags.PreventDefault));

  const labelEvents = onDoubleClick((ev) => {
    _editText = _entry.text;
    _editing = true;
    invalidate(c);
  });

  const editEvents = lazy(() => [
    onInput((ev) => {
      _editText = (ev.target as HTMLInputElement).value;
    }),
    onBlur((ev) => {
      _editText = "";
      _editing = false;
      invalidate(c);
    }, true),
    onKeyDown((ev) => {
      switch (ev.native.keyCode) {
        case (KeyCode.Enter): {
          const v = _editText;
          _editText = "";
          _editing = false;
          editEntry(_entry, v);
          invalidate(c);
          break;
        }
        case (KeyCode.Escape):
          _editText = "";
          _editing = false;
          invalidate(c);
          break;
      }
    }),
  ]);

  return (entry) => (
    dirtyCheckEntry(entry),
    _entry = entry,

    li(_editing ?
      (entry.isCompleted ? "editing completed" : "editing") :
      (entry.isCompleted ? "completed" : "")).c(
        div("view").c(
          input("toggle", { type: "checkbox", checked: CHECKED(entry.isCompleted) }).e(toggleEvents),
          label().e(labelEvents).t(entry.text),
          button("destroy").e(destroyEvents),
        ),
        _editing ? input("edit", { value: VALUE(_editText), autofocus: AUTOFOCUS(true) }).e(editEvents()) : null,
      )
  );
});

const EntryList = component((c) => {
  const getFilter = useLocation(c);
  const getEntriesByFilterType = useEntriesByFilterType(c);

  return () => ul("", { id: "todo-list" }).c(
    map(getEntriesByFilterType(getFilter()).result, (e) => EntryField(e).k(e.id)),
  );
});

const ToggleAllView = component((c) => {
  const getEntries = useEntries(c);
  const getCompletedEntries = useCompletedEntries(c);
  const inputEvents = onChange(() => (toggleAll(), EventFlags.PreventDefault));

  return () => input("",
    {
      id: "toggle-all",
      type: "checkbox",
      checked: CHECKED(getEntries().result.length === getCompletedEntries().result.length),
    },
  ).e(inputEvents);
});

const Main = statelessComponent(() => section("", { id: "main" }).c(ToggleAllView(), EntryList()));

export const App = component((c) => {
  let _count: number;
  const getEntries = useEntries(c);

  return () => (
    _count = getEntries().result.length,

    section().c(
      Header(),
      _count ? Main() : null,
      _count ? Footer() : null,
    )
  );
});
