import { connect } from "ivi";
import * as h from "ivi-html";
import { selectListedCount } from "../selectors";
import { header } from "./header";
import { footer } from "./footer";
import { main } from "./main";

function App(listedCount: number) {
    return h.section().children(
        header(),
        listedCount ? main() : null,
        listedCount ? footer() : null,
    );
}

export const app = connect(selectListedCount, App);
