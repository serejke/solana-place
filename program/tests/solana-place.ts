import * as anchor from "@project-serum/anchor";
import {AnchorError, Program} from "@project-serum/anchor";
import {SolanaPlace} from "../target/types/solana_place";
import {expect} from "chai";
import {changeColor, emptyBoard} from "./test-board-utils";
import {createGameAccount} from "../migrations/game-account-util";
import {waitUntil} from "./test-utils";

describe("solana-place", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaPlace as Program<SolanaPlace>;
  const programProvider = program.provider as anchor.AnchorProvider;

  it("initialize game", async () => {
    const gameKeypair = await createGameAccount(program, programProvider, 1, 5);
    const gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    expect(gameState).to.eql(emptyBoard(1, 5));
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
    await waitUntil(() => events.length > 0);
    await program.removeEventListener(listenerId);
    return events;
  }

  it("change color", async () => {
    const gameKeypair = await createGameAccount(program, programProvider, 10, 15);

    let gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    let expectedBoard = emptyBoard(10, 15);
    expect(gameState).to.eql(expectedBoard);

    const [event] = await catchEvent(program, "PixelColorChangedEvent", async () => {
      await program.methods
        .changeColor(3, 4, 42)
        .accounts({
          gameAccount: gameKeypair.publicKey
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
  })

  it("error: pixel is not withing game's bounds", async () => {
      let gameKeypair = await createGameAccount(program, programProvider, 5, 5);
      try {
          await program.methods
              .changeColor(10, 10, 42)
              .accounts({
                  gameAccount: gameKeypair.publicKey
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
