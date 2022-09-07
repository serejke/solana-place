import {BoardState} from "../model/boardState";
import {PixelCoordinates} from "../model/pixelCoordinates";
import {TransactionDetails} from "../model/transactionDetails";

type InitialBoardStateAction = {
  type: "initialState",
  newState: BoardState
};

type UpdatePixelsAction = {
  type: "updatePixels",
  updatedPixels: {
    coordinates: PixelCoordinates,
    newColor: number
  }[],
  transactionDetails: TransactionDetails
}

export type BoardStateAction = InitialBoardStateAction | UpdatePixelsAction;

export type BoardStateDispatch = (action: BoardStateAction) => void;

export function boardStateReducer(state: BoardState, action: BoardStateAction): BoardState {
  switch (action.type) {
    case "initialState": {
      return action.newState;
    }
    case "updatePixels":
      const newColors = JSON.parse(JSON.stringify(state.colors));
      action.updatedPixels.forEach(({coordinates, newColor}) => {
        newColors[coordinates.row][coordinates.column] = newColor;
      });
      return {
        ...state,
        colors: newColors
      }
  }
}
