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

type UpdatePixels = {
  type: "updatePixels",
  updatedPixels: {
    coordinates: PixelCoordinates,
    newColor: number
  }[]
}

export type BoardStateAction = InitialBoardStateAction
  | ChangePixelAction
  | DeleteChangedPixelAction
  | UpdatePixels;

export type BoardStateDispatch = (action: BoardStateAction) => void;

export function boardStateReducer(state: BoardState, action: BoardStateAction): BoardState {
  switch (action.type) {
    case "initialState": {
      return action.newState;
    }
    case "updatePixels":
      const updatedPixels = action.updatedPixels;
      const updatedColors = JSON.parse(JSON.stringify(state.colors));
      updatedPixels.forEach(({coordinates, newColor}) => {
        updatedColors[coordinates.row][coordinates.column] = newColor;
      });
      const updatedChanged = state.changed.filter(changedPixel =>
        !updatedPixels.some(({coordinates}) => areEqual(coordinates, changedPixel.coordinates))
      )
      return {
        ...state,
        changed: updatedChanged,
        colors: updatedColors
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
  }
}
