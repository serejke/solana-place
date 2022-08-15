import { Keypair, PublicKey } from "@solana/web3.js";
import path from "path";
import fs from "fs";

const DEPLOYED_PROGRAM_ADDRESS = process.env.DEPLOYED_PROGRAM_ADDRESS;
const DEPLOYED_GAME_PROGRAM_ACCOUNT = process.env.DEPLOYED_GAME_PROGRAM_ACCOUNT;

const PROGRAM_KEYPAIR_PATH = path.resolve(
  "..",
  "program",
  "target",
  "deploy",
  "solana_place-keypair.json"
);
const GAME_PROGRAM_KEYPAIR_PATH = path.resolve(
  "..",
  "program",
  "target",
  "deploy",
  "game_account_keypair.json"
);

export const PROGRAM_ID: PublicKey = (() => {
  if (DEPLOYED_PROGRAM_ADDRESS) {
    return new PublicKey(DEPLOYED_PROGRAM_ADDRESS);
  } else {
    return readKeypairFromFile(PROGRAM_KEYPAIR_PATH).publicKey;
  }
})();

export const GAME_PROGRAM_ACCOUNT: PublicKey = (() => {
  if (DEPLOYED_GAME_PROGRAM_ACCOUNT) {
    return new PublicKey(DEPLOYED_GAME_PROGRAM_ACCOUNT);
  } else {
    return readKeypairFromFile(GAME_PROGRAM_KEYPAIR_PATH).publicKey;
  }
})();

/**
 * Create a Keypair from a keypair file
 */
function readKeypairFromFile(filePath: string): Keypair {
  const keypairString = fs.readFileSync(filePath, { encoding: "utf8" });
  const keypairBuffer = Buffer.from(JSON.parse(keypairString));
  return Keypair.fromSecretKey(keypairBuffer);
}
