import {AnchorProvider, Program} from "@project-serum/anchor";
import {Keypair, SystemProgram, Transaction} from "@solana/web3.js";
import {SolanaPlace} from "../target/types/solana_place";

function calculateGameAccountSpace(height: number, width: number): number {
  return 8 // Discriminator
    + 4 // State
    + 2 // Height
    + 2 // Width
    + 4 // Change cost
    + (4 + height * width) // Vec of colors ;
}

export async function createGameAccount(
  program: Program<SolanaPlace>,
  programProvider: AnchorProvider,
  height: number,
  width: number,
  changeCost: number
) {
  let gameKeypair = Keypair.generate();

  const tx = new Transaction();
  const gameAccountSpace = calculateGameAccountSpace(height, width);
  const rentExempt = await programProvider.connection.getMinimumBalanceForRentExemption(gameAccountSpace);

  tx.add(
    SystemProgram.createAccount({
      fromPubkey: programProvider.wallet.publicKey,
      programId: program.programId,
      space: gameAccountSpace,
      lamports: rentExempt,
      newAccountPubkey: gameKeypair.publicKey
    })
  )

  await programProvider.sendAndConfirm(tx, [gameKeypair]);

  await program.methods
    .initializeOnly(height, width, changeCost)
    .accounts({
      gameAccount: gameKeypair.publicKey
    })
    .signers([gameKeypair])
    .rpc()
    .catch((e) => {
      console.log("Error initializing the game", e);
    });

  return gameKeypair;
}