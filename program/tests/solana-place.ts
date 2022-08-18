import * as anchor from "@project-serum/anchor";
import {AnchorError, Program} from "@project-serum/anchor";
import {SolanaPlace} from "../target/types/solana_place";
import {expect} from "chai";
import {changeColor, emptyBoard} from "./test-board-utils";
import {createGameAccount} from "../migrations/game-account-util";
import {sleep, waitUntil} from "./test-utils";
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
    code: () => Promise<void>
  ): Promise<any[]> {
    const events = [];
    const listenerId = program.addEventListener("PixelColorChangedEvent", (e) => {
      events.push(e)
    });
    await code();
    await waitUntil(() => events.length > 0, 30000);
    await program.removeEventListener(listenerId);
    return events;
  }

  async function getBalance(key: PublicKey): Promise<BN> {
    return new BN(await programProvider.connection.getBalance(key) + "", 10);
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
        .rpc()
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
    const transactionFee = new BN(5000);
    const expectedChange = transactionFee.add(new BN(changeCost * 1000));
    const actualChange = balanceBefore.sub(balanceAfter);

    // TODO[tests]: use a dedicated (not root) wallet to create the game, to have predictable balance changes.
    //  The root wallet is used for voting and is being withdrawn during the test, leading to instability.
    expect(actualChange.sub(expectedChange).lte(new BN(10000)));
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
