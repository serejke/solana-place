import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { SolanaPlace } from "../target/types/solana_place";

export const MAX_HEIGHT = 300;
export const MAX_WIDTH = 500;

function calculateGameAccountSpace(): number {
  return (
    8 + // Discriminator
    32 + // Authority
    4 + // State
    2 + // Height
    2 + // Width
    4 + // Change cost
    MAX_HEIGHT * MAX_WIDTH
  );
}

export async function createGameAccount(
  program: Program<SolanaPlace>,
  programProvider: AnchorProvider,
  gameAuthority: PublicKey,
  height: number,
  width: number,
  changeCost: number,
  gameKeypair0?: Keypair
): Promise<Keypair> {
  let gameKeypair = gameKeypair0 ?? Keypair.generate();

  const tx = new Transaction();
  const gameAccountSpace = calculateGameAccountSpace();
  const rentExempt =
    await programProvider.connection.getMinimumBalanceForRentExemption(
      gameAccountSpace
    );

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: programProvider.wallet.publicKey,
      programId: program.programId,
      space: gameAccountSpace,
      lamports: rentExempt,
      newAccountPubkey: gameKeypair.publicKey,
    })
  );

  await programProvider.sendAndConfirm(tx, [gameKeypair]);

  await program.methods
    .initializeOnly(height, width, changeCost)
    .accounts({
      gameAccount: gameKeypair.publicKey,
      authority: gameAuthority,
    })
    .signers([gameKeypair])
    .rpc({ skipPreflight: true });

  return gameKeypair;
}
