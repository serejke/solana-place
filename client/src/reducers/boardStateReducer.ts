import {areEqual, BoardState} from "../model/boardState";
import {PixelCoordinates} from "../model/pixelCoordinates";

type InitialBoardStateAction = {
  type: "initialState",
  newState: BoardState
};

type ChangePixelAction = {
  type: "changePixel",
  coordinates: PixelCoordinates,
  newColor: number
};

type DeleteChangedPixelAction = {
  type: "deleteChangedPixel",
  coordinates: PixelCoordinates
};

type ClearChangedPixelsAction = {
  type: "clearChangedPixels"
};

type UpdateSinglePixel = {
  type: "updateSinglePixel",
  coordinates: PixelCoordinates,
  newColor: number
}

export type BoardStateAction = InitialBoardStateAction
  | ChangePixelAction
  | DeleteChangedPixelAction
  | ClearChangedPixelsAction
  | UpdateSinglePixel;

export type BoardStateDispatch = (action: BoardStateAction) => void;

export function boardStateReducer(state: BoardState, action: BoardStateAction): BoardState {
  switch (action.type) {
    case "initialState": {
      return action.newState;
    }
    case "updateSinglePixel":
      const coordinates = action.coordinates;
      const newColors = JSON.parse(JSON.stringify(state.colors));
      newColors[coordinates.row][coordinates.column] = action.newColor;
      const newChanged = state.changed.filter(changedPixel => !areEqual(changedPixel.coordinates, coordinates))
      return {
        ...state,
        changed: newChanged,
        colors: newColors
      }
    case "changePixel": {
      const coordinates = action.coordinates;
      const newColor = action.newColor;
      const index = state.changed.findIndex((pixel) => areEqual(coordinates, pixel.coordinates))
      const changedPixel = {coordinates, newColor};
      let newChangedPixels;
      if (index < 0) {
        newChangedPixels = [...state.changed, changedPixel]
      } else {
        newChangedPixels = state.changed.map((pixel) =>
          areEqual(pixel.coordinates, coordinates) ? changedPixel : pixel
        );
      }
      return {
        ...state,
        changed: newChangedPixels
      };
    }
    case "deleteChangedPixel": {
      const newChangedPixels = state.changed.filter(pixel => !areEqual(pixel.coordinates, action.coordinates));
      return {...state, changed: newChangedPixels}
    }
    case "clearChangedPixels": {
      return {...state, changed: []}
    }
  }
}
