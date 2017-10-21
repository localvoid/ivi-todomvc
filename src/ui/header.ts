import { Component, componentFactory, KeyCode } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { addTodo } from "../actions";

export class Header extends Component {
  private inputValue = "";

  private onKeyDown = Events.onKeyDown((ev) => {
    if (ev.keyCode === KeyCode.Enter) {
      addTodo(this.inputValue);
      this.inputValue = "";
      this.invalidate();
    }
  });

  private onInput = Events.onInput((ev) => {
    this.inputValue = (ev.target as HTMLInputElement).value;
    this.invalidate();
  });

  render() {
    return h.header().children(
      h.h1().children("todos"),
      h.input()
        .attrs({
          "id": "new-todo",
          "placeholder": "What needs to be done",
        })
        .events([
          this.onKeyDown,
          this.onInput,
        ])
        .value(this.inputValue)
        .autofocus(true),
    );
  }
}
export const header = componentFactory(Header);
