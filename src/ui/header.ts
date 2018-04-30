import { Component, componentFactory, KeyCode } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { createEntry } from "../state";

const INPUT_ATTRS = {
  "id": "new-todo",
  "placeholder": "What needs to be done",
};

export class Header extends Component {
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
        .a(INPUT_ATTRS)
        .e(this.inputEvents)
        .value(this.inputValue)
        .autofocus(true),
    );
  }
}
export const header = componentFactory(Header);
