import { Component, KeyCode, connect, map } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { TodoEntry } from "../state";
import { selectTodoById, selectVisibleTodoIds } from "../selectors";
import { deleteTodo, editTodo, completeTodo } from "../actions";

class Entry extends Component<TodoEntry> {
  private editText = "";
  private editing = false;

  private onClickDestroy = Events.onClick((ev) => {
    deleteTodo(this.props.id);
    ev.preventDefault();
  });

  private onChangeToggle = Events.onChange((ev) => {
    completeTodo(this.props.id);
    ev.preventDefault();
  });

  private onLabelDoubleClick = Events.onDoubleClick((ev) => {
    this.editText = this.props.text;
    this.editing = true;
    this.invalidate();
  });

  private onTitleChange = Events.onInput((ev) => {
    this.editText = (ev.target as HTMLInputElement).value;
  });

  private onBlur = Events.onBlur((ev) => {
    this.editText = "";
    this.editing = false;
    this.invalidate();
  });

  private onKeyDown = Events.onKeyDown((ev) => {
    switch (ev.keyCode) {
      case (KeyCode.Enter):
        editTodo(this.props.id, this.editText);
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
  });

  render() {
    const entry = this.props;
    const view = h.div("view").children(
      h.inputCheckbox("toggle").events(this.onChangeToggle).checked(entry.isCompleted),
      h.label().events(this.onLabelDoubleClick).children(entry.text),
      h.button("destroy").events(this.onClickDestroy),
    );
    if (this.editing) {
      return h.li(entry.isCompleted ? "editing completed" : "editing").children(
        view,
        h.inputText("edit")
          .events([
            this.onTitleChange,
            this.onBlur,
            this.onKeyDown,
          ])
          .value(this.editText)
          .autofocus(true),
      );
    }

    return h.li(entry.isCompleted ? "completed" : undefined).children(view);
  }
}

const entry = connect(
  selectTodoById,
  Entry,
);

function EntryList(visibleIds: number[]) {
  return h.ul()
    .props({ "id": "todo-list" })
    .children(map(visibleIds, (id) => entry(id).key(id)));
}

export const entryList = connect(
  selectVisibleTodoIds,
  EntryList,
);
