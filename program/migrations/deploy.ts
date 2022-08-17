import {Program} from "@project-serum/anchor";
import {IDL as SolanaPlaceGameIDL, SolanaPlace} from "../target/types/solana_place";
import solanaPlaceProgramKeypair from "../target/deploy/solana_place-keypair.json";
import {createGameAccount} from "./game-account-util";
import copyPicture from "./copy-picture";
import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as fs from "fs";

const GAME_ACCOUNT_KEYPAIR_PATH = "../target/deploy/game_account_keypair.json";
const GAME_HEIGHT = 128;
const GAME_WIDTH = 196;

module.exports = async function (provider) {
  copyPicture(provider);
  return;

  // Configure client to use the provider.
  anchor.setProvider(provider);

  const programKeypair = web3.Keypair.fromSecretKey(Uint8Array.from(solanaPlaceProgramKeypair));
  const programId = programKeypair.publicKey;

  const program = new Program<SolanaPlace>(SolanaPlaceGameIDL, programId, provider);
  const gameAccountKeypair = await createGameAccount(program, provider, GAME_HEIGHT, GAME_WIDTH);
  fs.writeFileSync(GAME_ACCOUNT_KEYPAIR_PATH, JSON.stringify(Array.from(gameAccountKeypair.secretKey)));

  console.log("Game program account", gameAccountKeypair.publicKey.toBase58());
};
