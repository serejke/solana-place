import * as anchor from '@project-serum/anchor';
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import {IDL as SolanaPlaceIDL} from "../types/solana_place";
import {Program} from "@project-serum/anchor";
import {CloseableService} from "./CloseableService";

type SolanaPlaceProgram = anchor.Program<typeof SolanaPlaceIDL>;

export default class AnchorService implements CloseableService {

  constructor(
    public solanaPlaceProgram: SolanaPlaceProgram,
    public anchorProvider: anchor.AnchorProvider
  ) {}

  static async create(
    connection: Connection,
    programId: PublicKey
  ): Promise<AnchorService> {

    const wallet = new anchor.Wallet(Keypair.generate());

    const anchorProvider = new anchor.AnchorProvider(
      connection,
      wallet,
      {commitment: "confirmed", preflightCommitment: "confirmed"}
    );

    return Program.at(programId, anchorProvider)
      .then(rawProgram => {
        const anyProgram: unknown = rawProgram
        return anyProgram as SolanaPlaceProgram
      })
      .then(program => new AnchorService(program, anchorProvider))
  }

  async close(): Promise<void> {
    return;
  }
}