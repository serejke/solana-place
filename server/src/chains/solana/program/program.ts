import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID: PublicKey = (() => {
  return new PublicKey(process.env.DEPLOYED_PROGRAM_ADDRESS as string);
})();

export const GAME_PROGRAM_ACCOUNT: PublicKey = (() => {
  return new PublicKey(process.env.DEPLOYED_GAME_PROGRAM_ACCOUNT as string);
})();
