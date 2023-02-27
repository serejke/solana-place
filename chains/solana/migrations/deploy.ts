import {AnchorProvider, Program} from "@project-serum/anchor";
import {IDL as SolanaPlaceGameIDL, SolanaPlace} from "../target/types/solana_place";
import solanaPlaceProgramKeypair from "../target/deploy/solana_place-keypair.json";
import gameAccountKeypairFile from "../target/deploy/game_account_keypair.json";
import {createGameAccount} from "./game-account-util";
import copyPicture from "./copy-picture";
import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";

const GAME_HEIGHT = 300;
const GAME_WIDTH = 500;
const CHANGE_COST = 1000; // 1000 micro-lamports = 1/1000 SOL.

module.exports = async function (provider) {
  // copyPicture(provider);
  // return;

  // Configure client to use the provider.
  anchor.setProvider(provider);

  const programKeypair = web3.Keypair.fromSecretKey(Uint8Array.from(solanaPlaceProgramKeypair));
  const programId = programKeypair.publicKey;
  console.log(`Program ID ${programId.toBase58()}`);

  const program = new Program<SolanaPlace>(SolanaPlaceGameIDL, programId, provider);
  const gameKeypair = web3.Keypair.fromSecretKey(Uint8Array.from(gameAccountKeypairFile));

  const gameAuthority = (program.provider as AnchorProvider).wallet.publicKey;
  await createGameAccount(program, provider, gameAuthority, GAME_HEIGHT, GAME_WIDTH, CHANGE_COST, gameKeypair);
  console.log(`Initialized a game account ${gameKeypair.publicKey.toBase58()}`);
  console.log(`Authority of the game account ${gameAuthority.toBase58()}`);
};
