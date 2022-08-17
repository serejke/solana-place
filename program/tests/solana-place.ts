import * as anchor from "@project-serum/anchor";
import {AnchorError, Program} from "@project-serum/anchor";
import {SolanaPlace} from "../target/types/solana_place";
import {expect} from "chai";
import {changeColor, emptyBoard} from "./test-board-utils";
import {createGameAccount} from "../migrations/game-account-util";
import {waitUntil} from "./test-utils";
import {PublicKey, SystemProgram} from "@solana/web3.js";
import BN = require("bn.js");

describe("solana-place", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaPlace as Program<SolanaPlace>;
  const programProvider = program.provider as anchor.AnchorProvider;
  const changeCost = 12345;

  it("initialize game", async () => {
    const gameKeypair = await createGameAccount(program, programProvider, 1, 5, changeCost);
    const gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    expect(gameState).to.eql(emptyBoard(1, 5, changeCost));
  })

  async function catchEvent(
    program: Program<SolanaPlace>,
    eventName: string,
    code: () => void
  ): Promise<any[]> {
    const events = [];
    const listenerId = program.addEventListener("PixelColorChangedEvent", (e) => {
      events.push(e)
    });
    code();
    await waitUntil(() => events.length > 0, 10000);
    await program.removeEventListener(listenerId);
    return events;
  }

  async function getBalance(key: PublicKey): Promise<BN> {
    return new BN(await programProvider.connection.getBalance(key, {commitment: "confirmed"}) + "", 10);
  }

  async function getFee(transactionSignature: string): Promise<BN> {
    return new BN((await programProvider.connection.getTransaction(transactionSignature, {commitment: "confirmed"})).meta.fee);
  }

  it("change color", async () => {
    const gameKeypair = await createGameAccount(program, programProvider, 10, 15, changeCost);

    let gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    let expectedBoard = emptyBoard(10, 15, changeCost);
    expect(gameState).to.eql(expectedBoard);

    const balanceBefore = await getBalance(programProvider.wallet.publicKey);
    let transactionSignature;

    const [event] = await catchEvent(program, "PixelColorChangedEvent", async () => {
      transactionSignature = await program.methods
        .changeColor(3, 4, 42)
        .accounts({
          gameAccount: gameKeypair.publicKey,
          payer: programProvider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        })
        .rpc({commitment: "confirmed"})
    })

    expect(event).to.eql({
      state: 0,
      row: 3,
      column: 4,
      oldColor: 0,
      newColor: 42
    })

    gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    expectedBoard = changeColor(expectedBoard, 3, 4, 42);
    expect(gameState).to.eql(expectedBoard);

    const balanceAfter = await getBalance(programProvider.wallet.publicKey);
    const transactionFee = new BN(await getFee(transactionSignature));
    const expectedChange = transactionFee.add(new BN(changeCost * 1000));
    const actualChange = balanceBefore.sub(balanceAfter);
    expect(expectedChange).to.eql(actualChange);
  })

  it("error: pixel is not withing game's bounds", async () => {
    let gameKeypair = await createGameAccount(program, programProvider, 5, 5, changeCost);
    try {
      await program.methods
        .changeColor(10, 10, 42)
        .accounts({
          gameAccount: gameKeypair.publicKey,
          payer: programProvider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        })
        .rpc()
      chai.assert(false, "Must have failed.");
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.number).to.equal(6001);
      expect(err.error.errorCode.code).to.equal("PixelOutOfBounds");
    }
  });
});
