import React from "react";

export interface ClientConfig {
  useTpu: boolean;
  rpcUrl?: string;
}

const DEFAULT_CONFIG: ClientConfig = {
  useTpu: false,
};

type SetConfig = React.Dispatch<React.SetStateAction<ClientConfig>>;
const ConfigContext = React.createContext<
  [ClientConfig, SetConfig] | undefined
>(undefined);

type Props = { children: React.ReactNode };
export function ClientConfigProvider({ children }: Props) {
  const stateHook = React.useState<ClientConfig>(DEFAULT_CONFIG);
  return (
    <ConfigContext.Provider value={stateHook}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useClientConfig(): ClientConfig {
  const context = React.useContext(ConfigContext);
  if (!context) {
    throw new Error(`useClientConfig must be used within a ClientConfigProvider`);
  }
  return context[0];
}
