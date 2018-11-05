import {
  component, invalidate, KeyCode, statelessComponent, map,
  onKeyDown, onInput, onClick, onChange, onDoubleClick, onBlur, EventFlags, InvalidateFlags,
} from "ivi";
import { AUTOFOCUS } from "ivi-scheduler";
import {
  header, h1, input, a, li, footer, ul, span, strong, button, div, label, section, VALUE, CHECKED,
} from "ivi-html";
import { lazy } from "ivi-state";
import {
  FilterType, update, addEntry, removeCompleted, removeEntry, toggleCompleted, editEntry, toggleAll, useFilter,
  useEntries, useCompletedEntries, Entry, useEntry, useEntriesByFilterType,
} from "./state";

const When = <T>(condition: boolean, result: T) => (condition === true) ? result : null;

const Header = component((c) => {
  let _inputValue = "";

  const inputEvents = [
    onKeyDown((ev) => {
      if (ev.native.keyCode === KeyCode.Enter) {
        const v = _inputValue;
        _inputValue = "";
        update((s) => { addEntry(s, v); });
        invalidate(c, InvalidateFlags.RequestSyncUpdate);
      }
    }),
    onInput((ev) => {
      _inputValue = (ev.target as HTMLInputElement).value;
      invalidate(c, InvalidateFlags.RequestSyncUpdate);
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
  const getFilter = useFilter(c);
  const getEntries = useEntries(c);
  const getCompletedEntries = useCompletedEntries(c);

  const clearEvents = onClick(() => (update((s) => { removeCompleted(s); }), EventFlags.PreventDefault));

  return () => {
    const filter = getFilter();
    const listedCount = getEntries().length;
    const completedCount = getCompletedEntries().length;
    const activeCount = listedCount - completedCount;

    return footer("", { id: "footer" }).c(
      ul("", { id: "filters" }).c(
        FooterButton(filter === FilterType.All, "#/", "All"), " ",
        FooterButton(filter === FilterType.Active, "#/active", "Active"), " ",
        FooterButton(filter === FilterType.Completed, "#/completed", "Completed"),
      ),
      span("", { id: "todo-count" }).c(
        strong().t(activeCount > 0 ? activeCount : "No"), activeCount === 1 ? " item left" : " items left",
      ),
      When((completedCount > 0),
        button("", { id: "clear-completed" }).e(clearEvents).t(`Clear completed (${completedCount})`),
      ),
    );
  };
});

const EntryField = component<Entry>((c) => {
  let _entry: Entry;
  let _editText = "";
  let _editing = false;

  const dirtyCheckEntry = useEntry(c);
  const destroyEvents = onClick(() => (update((s) => { removeEntry(s, _entry); }), EventFlags.PreventDefault));
  const toggleEvents = onChange(() => (update((s) => { toggleCompleted(s, _entry); }), EventFlags.PreventDefault));

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
          update((s) => { editEntry(s, _entry, v); });
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
        When(_editing,
          input("edit", { value: VALUE(_editText), autofocus: AUTOFOCUS(true) }).e(editEvents()),
        ),
      )
  );
});

const EntryList = component((c) => {
  const getFilter = useFilter(c);
  const getEntriesByFilterType = useEntriesByFilterType(c);

  return () => ul("", { id: "todo-list" }).c(
    map(getEntriesByFilterType(getFilter()), (e) => EntryField(e).k(e.id)),
  );
});

const ToggleAllView = component((c) => {
  const getEntries = useEntries(c);
  const getCompletedEntries = useCompletedEntries(c);
  const inputEvents = onChange(() => (
    update((s) => { toggleAll(s); }),
    EventFlags.PreventDefault
  ));

  return () => input("",
    {
      id: "toggle-all",
      type: "checkbox",
      checked: CHECKED(getEntries().length === getCompletedEntries().length),
    },
  ).e(inputEvents);
});

const Main = statelessComponent(() => section("", { id: "main" }).c(ToggleAllView(), EntryList()));

export const App = component((c) => {
  let _count: number;
  const getEntries = useEntries(c);

  return () => (
    _count = getEntries().length,

    section().c(
      Header(),
      _count ? Main() : null,
      _count ? Footer() : null,
    )
  );
});
