import { Component, Events, $h, $i, $c, KeyCode } from "ivi";
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
        return $h("header")
            .children([
                $h("h1").children("todos"),
                $i("text")
                    .props({
                        "id": "new-todo",
                        "placeholder": "What needs to be done",
                    })
                    .events({
                        keyDown: this.onKeyDown,
                        input: this.onInput,
                    })
                    .value(this.inputValue)
                    .autofocus(true),
            ]);
    }
}

export function $Header() {
    return $c(Header);
}
