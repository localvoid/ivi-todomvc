import { Component, Events, $h, $i, $c, selectorData, connect } from "ivi";
import { completeAll } from "../actions";
import {
    selectListedCount, memoizedSelectCompletedCount, SelectListedCountState, SelectCompletedCountState,
} from "../selectors";
import { $EntryList } from "./entry_list";

interface ToggleAllProps {
    listedCount: number;
    completedCount: number;
}

class ToggleAll extends Component<ToggleAllProps> {
    private onChange = Events.onChange((ev) => {
        ev.preventDefault();
        completeAll();
    });

    render() {
        return $i("checkbox")
            .props({ "id": "toggle-all" })
            .events(this.onChange)
            .checked(this.props.completedCount === this.props.listedCount);
    }
}

interface ToggleAllSelect {
    in: {
        listedCount: SelectListedCountState,
        completedCount: SelectCompletedCountState,
    };
    out: ToggleAllProps;
}

const $ToggleAll = connect(
    function (prev: ToggleAllSelect | null) {
        const listedCount = selectListedCount(prev ? prev.in.listedCount : null);
        const completedCount = memoizedSelectCompletedCount(null);

        if (prev && prev.in.listedCount === listedCount && prev.in.completedCount === completedCount) {
            return prev;
        }

        return selectorData(
            { listedCount, completedCount },
            {
                listedCount: listedCount.out,
                completedCount: completedCount.out,
            },
        );
    },
    ToggleAll,
);

function Main() {
    return $h("section").props({ "id": "main" }).children(
        $ToggleAll(),
        $EntryList(),
    );
}

export function $Main() {
    return $c(Main);
}
