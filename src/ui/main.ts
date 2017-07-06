import { Component, componentFactory, selectorData, connect } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { completeAll } from "../actions";
import {
  selectListedCount, memoizedSelectCompletedCount, SelectListedCountState, SelectCompletedCountState,
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

const toggleAll = connect(
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
  return h.section().props({ "id": "main" }).children(
    toggleAll(),
    entryList(),
  );
}
export const main = componentFactory(Main);
