import {BOARD_HISTORY_MAX_LENGTH, BoardHistory, GameEventWithTransactionDetails} from "../model/model";

type InitialBoardHistoryAction = {
  type: "initialHistory",
  history: BoardHistory
};

type AddHistoryEntriesAction = {
  type: "addHistoryEntries",
  gameEventsWithTransactionDetails: GameEventWithTransactionDetails[]
};

export type BoardHistoryAction = InitialBoardHistoryAction | AddHistoryEntriesAction;

export type BoardHistoryDispatch = (action: BoardHistoryAction) => void;

export function boardHistoryReducer(state: BoardHistory, action: BoardHistoryAction): BoardHistory {
  switch (action.type) {
    case "initialHistory": {
      return {
        events: action.history.events.slice(0, BOARD_HISTORY_MAX_LENGTH)
      };
    }
    case "addHistoryEntries":
      const events: GameEventWithTransactionDetails[] = [];
      events.push(...action.gameEventsWithTransactionDetails);
      events.reverse();
      const remainingSpace = BOARD_HISTORY_MAX_LENGTH - events.length;
      if (remainingSpace > 0) {
        events.push(...state.events.slice(0, remainingSpace));
      }
      return { events };
  }
}
