import * as React from "react";

type AboutConfig = {
  showAboutModal: boolean;
};

type SetState = React.Dispatch<React.SetStateAction<AboutConfig>>;
type State = [AboutConfig, SetState];
const Context = React.createContext<State | undefined>(undefined);

const EMPTY_CONFIG: AboutConfig = {
  showAboutModal: false,
};

export function AboutProvider({ children }: { children: React.ReactNode }) {
  const state: State = React.useState<AboutConfig>(EMPTY_CONFIG);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}

export function useAbout(): AboutConfig {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useAbout must be used within a AboutProvider`);
  }
  return state[0];
}

export function useSetAbout(): SetState {
  const state = React.useContext(Context);
  if (!state) {
    throw new Error(`useSetAbout must be used within a AboutProvider`);
  }
  return state[1];
}
