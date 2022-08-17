import {AnchorProvider, Program} from "@project-serum/anchor";
import {Keypair, SystemProgram, Transaction} from "@solana/web3.js";
import {SolanaPlace} from "../target/types/solana_place";

function calculateGameAccountSpace(height: number, width: number): number {
  return 8 + 4 + 2 + 2 + 4 + (4 + height * width);
}

export async function createGameAccount(
  program: Program<SolanaPlace>,
  programProvider: AnchorProvider,
  height: number,
  width: number,
  changeCost: number
) {
  let gameKeypair = Keypair.generate();

  const connection = programProvider.connection;
  const tx = new Transaction();
  const gameAccountSpace = calculateGameAccountSpace(height, width);
  const rentExempt = await connection.getMinimumBalanceForRentExemption(gameAccountSpace);

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
    .rpc({skipPreflight: true})
    .catch((e) => {
      console.log("Error initializing the game", e);
    });

  return gameKeypair;
}