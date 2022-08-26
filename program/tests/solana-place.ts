import * as anchor from "@project-serum/anchor";
import {AnchorError, Program} from "@project-serum/anchor";
import {SolanaPlace} from "../target/types/solana_place";
import {expect} from "chai";
import {
  changeColor,
  ChangeColorRequest,
  emptyBoard,
  encodeChangeColorRequests
} from "./test-board-utils";
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

  async function getBalance(key: PublicKey): Promise<BN> {
    return new BN(await programProvider.connection.getBalance(key) + "", 10);
  }

  it("change colors", async () => {
    const boardHeight = 150;
    const boardWidth = 150;

    const gameKeypair = await createGameAccount(program, programProvider, boardHeight, boardWidth, changeCost);

    let gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    let expectedBoard = emptyBoard(boardHeight, boardWidth, changeCost);
    expect(gameState).to.eql(expectedBoard);

    const balanceBefore = await getBalance(programProvider.wallet.publicKey);
    let transactionSignature;

    const changeColorRequests: ChangeColorRequest[] = new Array(boardHeight).fill(0).map((_, index) => (
      {row: index, column: index, color: index}
    ));

    const [event] = await catchEvent(program, "PixelColorsChangedEvent", 1, async () => {
      transactionSignature = await program.methods
        .changeColors(encodeChangeColorRequests(changeColorRequests))
        .accounts({
          gameAccount: gameKeypair.publicKey,
          payer: programProvider.wallet.publicKey,
          systemProgram: SystemProgram.programId
        })
        .rpc()
    })

    const expectedEvent = {
      state: 0,
      newState: changeColorRequests.length,
      changes: changeColorRequests.map((change) => ({
        row: change.row,
        column: change.column,
        oldColor: 0,
        newColor: change.color
      }))
    };

    expect(event).to.eql(expectedEvent);

    gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    expectedBoard = changeColorRequests.reduce(
      (board, request) => changeColor(board, request.row, request.column, request.color),
      expectedBoard
    );

    expect(gameState).to.eql(expectedBoard);

    const balanceAfter = await getBalance(programProvider.wallet.publicKey);
    const transactionFee = new BN(5000);
    const expectedChange = transactionFee.add(new BN(changeCost * 1000 * changeColorRequests.length));
    const actualChange = balanceBefore.sub(balanceAfter);

    // TODO[tests]: use a dedicated (not root) wallet to create the game, to have predictable balance changes.
    //  The root wallet is used for voting and is being withdrawn during the test, leading to instability.
    expect(actualChange.sub(expectedChange).lte(new BN(10000)));
  })

  it("error: pixel is not withing game's bounds", async () => {
    let gameKeypair = await createGameAccount(program, programProvider, 5, 5, changeCost);
    try {
      await program.methods
        .changeColors(encodeChangeColorRequests([{row: 10, column: 10, color: 42}]))
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
