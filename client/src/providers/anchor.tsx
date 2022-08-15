import React, {useState} from "react";
import * as anchor from '@project-serum/anchor';
import {useConnection} from "./connection";
import {IDL as SolanaPlaceIDL} from "../types/solana_place";
import {useClusterConfig} from "./server/cluster";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import {Program} from "@project-serum/anchor";

export type SolanaPlaceProgram = anchor.Program<typeof SolanaPlaceIDL>;

interface State {
  anchorProvider: anchor.AnchorProvider;
  solanaPlaceProgram: SolanaPlaceProgram;
}

interface AnchorState {
  state?: State;
}

const StateContext = React.createContext<AnchorState | undefined>(undefined);

type Props = { children: React.ReactNode };

export function AnchorStateProvider({children}: Props) {
  const wallet = useAnchorWallet();
  const connection = useConnection();
  const programId = useClusterConfig()?.programId;

  const [anchorState, setAnchorState] = useState<AnchorState>({state: undefined});

  React.useEffect(() => {
    if (!connection) return;
    if (!wallet) return;
    if (!programId) return;
    let anchorProvider = new anchor.AnchorProvider(
      connection,
      wallet,
      anchor.AnchorProvider.defaultOptions()
    );
    Program.at(programId, anchorProvider)
      .then(rawProgram => {
        const anyProgram: any = rawProgram;
        const solanaPlaceProgram = anyProgram as SolanaPlaceProgram;
        setAnchorState({
            state: {
              anchorProvider,
              solanaPlaceProgram
            }
          }
        )
      });
  }, [connection, wallet, programId])

  return (
    <StateContext.Provider value={anchorState}>{children}</StateContext.Provider>
  );
}

export function useAnchorState(): State | undefined {
  const anchorState = React.useContext(StateContext);
  if (anchorState === undefined) {
    throw new Error(`useAnchorState must be used within a AnchorProvider`);
  }
  return anchorState.state;
}