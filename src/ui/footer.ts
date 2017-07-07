import { Context, Component, SelectorDataRef, selectorData, connect } from "ivi";
import * as Events from "ivi-events";
import * as h from "ivi-html";
import { FilterType } from "../constants";
import { clearCompleted } from "../actions";
import { Store } from "../state";
import {
  selectListedCount, selectCompletedCount, SelectListedCountState, SelectCompletedCountState,
} from "../selectors";

interface FooterProps {
  filter: FilterType;
  listedCount: number;
  completedCount: number;
}

class Footer extends Component<FooterProps> {
  onClickClearCompleted = Events.onClick((ev) => {
    ev.preventDefault();
    clearCompleted();
  });

  render() {
    const { filter, listedCount, completedCount } = this.props;
    const activeCount = listedCount - completedCount;

    return h.footer().props({ id: "footer" }).children(
      h.ul().props({ "id": "filters" }).children(
        h.li().children(h.a(filter === FilterType.ShowAll ? "selected" : undefined)
          .props({ "href": "#/" }).children("All")),
        " ",
        h.li().children(h.a(filter === FilterType.ShowActive ? "selected" : undefined)
          .props({ "href": "#/active" }).children("Active")),
        " ",
        h.li().children(h.a(filter === FilterType.ShowCompleted ? "selected" : undefined)
          .props({ "href": "#/completed" }).children("Completed")),
      ),
      h.span().props({ "id": "todo-count" }).children(
        h.strong().children(activeCount ? activeCount : "No"),
        (activeCount === 1) ? " item left" : " items left",
      ),
      (completedCount > 0) ?
        h.button()
          .props({ "id": "clear-completed" })
          .events(this.onClickClearCompleted)
          .children(`Clear completed (${completedCount})`) :
        null,
    );
  }
}

interface FooterSelect {
  in: {
    filter: FilterType,
    listedCount: SelectListedCountState,
    completedCount: SelectCompletedCountState,
  };
  out: FooterProps;
}

export const footer = connect(
  function (
    prev: FooterSelect | null,
    _props: null,
    context: Context<{ store: Store, completedCount: SelectorDataRef<SelectCompletedCountState> }>,
  ) {
    const state = context.store.getState();
    const filter = state.filter;
    const listedCount = selectListedCount(prev ? prev.in.listedCount : null, null, context);
    const completedCount = selectCompletedCount(null, null, context);

    if (
      prev &&
      prev.in.filter === filter &&
      prev.in.listedCount === listedCount &&
      prev.in.completedCount === completedCount
    ) {
      return prev;
    }

    return selectorData(
      { filter, listedCount, completedCount },
      {
        filter,
        listedCount: listedCount.out,
        completedCount: completedCount.out,
      },
    );
  },
  Footer,
);
