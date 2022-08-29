import {Program} from "@project-serum/anchor";
import {PublicKey, Connection} from "@solana/web3.js";
import BN = require("bn.js");

export function waitUntil(
  checkFn: () => boolean,
  timeout: number = 5000,
  checkDelay: number = 100,
): Promise<void> {
  const startTime = Date.now()

  function check(resolve: () => void, reject: (reason: string) => void) {
    if (checkFn()) {
      resolve()
    } else if (Date.now() - startTime > timeout) {
      reject("Timeout")
    } else {
      setTimeout(() => check(resolve, reject), checkDelay)
    }
  }

  return new Promise((resolve, reject) => {
    check(resolve, reject)
  })
}

export async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function catchEvent(
  program: Program<any>,
  eventName: string,
  eventsNumber: number = 1,
  code: () => Promise<void>
): Promise<any[]> {
  const events = [];
  const listenerId = program.addEventListener(eventName, (e) => {
    events.push(e)
  });
  await code();
  await waitUntil(() => events.length === eventsNumber, 30000);
  await program.removeEventListener(listenerId);
  return events;
}

export async function getBalance(connection: Connection, key: PublicKey): Promise<BN> {
  return new BN(await connection.getBalance(key) + "", 10);
}