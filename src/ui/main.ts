import { Context, Component, SelectorDataRef, componentFactory, selectorData, connect } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { completeAll } from "../actions";
import { Store } from "../state";
import {
  selectListedCount, selectCompletedCount, SelectListedCountState, SelectCompletedCountState,
} from "../selectors";
import { entryList } from "./entry_list";

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
    return h.inputCheckbox()
      .attrs({ "id": "toggle-all" })
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

const toggleAll = connect(
  function (
    prev: ToggleAllSelect | null,
    _props: null,
    context: Context<{ store: Store, completedCount: SelectorDataRef<SelectCompletedCountState> }>,
  ) {
    const listedCount = selectListedCount(prev ? prev.in.listedCount : null, null, context);
    const completedCount = selectCompletedCount(null, null, context);

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
  return h.section().attrs({ "id": "main" }).children(
    toggleAll(),
    entryList(),
  );
}
export const main = componentFactory(Main);
