import * as React from "react";
import { PixelCoordinates } from "../../model/pixelCoordinates";
import { ClientPosition } from "../../model/ClientPosition";

type State = ColorPickerPosition | undefined;
type SetState = React.Dispatch<React.SetStateAction<State>>;
const Context = React.createContext<[State, SetState] | undefined>(undefined);

export type ColorPickerPosition = {
  pixelCoordinates: PixelCoordinates;
  popupPosition: ClientPosition;
};

export function ColorPickerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = React.useState<ColorPickerPosition | undefined>(undefined);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}

type ColorPickerProviderState = {
  colorPickerPosition: ColorPickerPosition | undefined;
  openColorPicker: (colorPickerPosition: ColorPickerPosition) => void;
  closeColorPicker: () => void;
};

export function useColorPickerStateAndActions(): ColorPickerProviderState {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(
      `useColorPickerState must be used within a ColorPickerProvider`
    );
  }
  const [colorPickerPosition, setColorPickerPosition] = state;
  const openColorPicker = React.useCallback(
    (colorPickerPosition: ColorPickerPosition) => {
      setColorPickerPosition(colorPickerPosition);
    },
    [setColorPickerPosition]
  );
  const closeColorPicker = React.useCallback(() => {
    setColorPickerPosition(undefined);
  }, [setColorPickerPosition]);
  return {
    colorPickerPosition,
    openColorPicker,
    closeColorPicker,
  };
}
