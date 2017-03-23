import { $h, connect } from "ivi";
import { selectListedCount } from "../selectors";
import { $Header } from "./header";
import { $Footer } from "./footer";
import { $Main } from "./main";

function App(listedCount: number) {
    return $h("section").children(
        $Header(),
        listedCount ? $Main() : null,
        listedCount ? $Footer() : null,
    );
}

export const $App = connect(selectListedCount, App);
