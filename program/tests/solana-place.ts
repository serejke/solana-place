import * as anchor from "@project-serum/anchor";
import {AnchorError, Program} from "@project-serum/anchor";
import {SolanaPlace} from "../target/types/solana_place";
import {expect} from "chai";
import {changeColor, ChangeColorRequest, emptyBoard, encodeChangeColorRequests} from "./test-board-utils";
import {createGameAccount} from "../migrations/game-account-util";
import {catchEvent, getBalance} from "./test-utils";
import {Keypair, SystemProgram, LAMPORTS_PER_SOL, Transaction} from "@solana/web3.js";
import BN = require("bn.js");

describe("solana-place", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaPlace as Program<SolanaPlace>;
  const programProvider = program.provider as anchor.AnchorProvider;

  const gameAuthorityKeypair = Keypair.generate();
  const gameAuthority = gameAuthorityKeypair.publicKey; // Random address.

  const changeCost = 12345;

  before(() => {
    const transaction = new Transaction();
    const transferIx = SystemProgram.transfer({
      fromPubkey: programProvider.wallet.publicKey,
      toPubkey: gameAuthority,
      lamports: LAMPORTS_PER_SOL
    })
    transaction.add(transferIx);
    programProvider.sendAndConfirm(transaction, [], {skipPreflight: true, commitment: "finalized"});
  })

  it("initialize game", async () => {
    const gameKeypair = await createGameAccount(program, programProvider, gameAuthority, 1, 5, changeCost);
    const gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
    expect(gameState).to.eql(emptyBoard(gameAuthority, 1, 5, changeCost));
  })

  // When the game authority changes the colors, it must not pay service fees.
  const changeColorsParams = ([false, true])
  changeColorsParams.forEach((payerIsGameAuthority) => {
    const testName = "change colors" + (payerIsGameAuthority ? " with game authority payer" : "");
    it(testName, async () => {
      const boardHeight = 300;
      const boardWidth = 500;

      const gameKeypair = await createGameAccount(program, programProvider, gameAuthority, boardHeight, boardWidth, changeCost);

      let gameState = await program.account.gameAccount.fetch(gameKeypair.publicKey);
      let expectedBoard = emptyBoard(gameAuthority, boardHeight, boardWidth, changeCost);
      expect(gameState).to.eql(expectedBoard);

      const balanceBefore = await getBalance(programProvider.connection, programProvider.wallet.publicKey);

      const changeColorRequests: ChangeColorRequest[] = new Array(150).fill(0).map((_, index) => (
        {row: index, column: index, color: index}
      ));

      const [event] = await catchEvent(program, "PixelColorsChangedEvent", 1, async () => {
        await program.methods
          .changeColors(encodeChangeColorRequests(changeColorRequests))
          .accounts({
            gameAccount: gameKeypair.publicKey,
            payer: payerIsGameAuthority ? gameAuthorityKeypair.publicKey : programProvider.wallet.publicKey,
            systemProgram: SystemProgram.programId
          })
          .signers(payerIsGameAuthority ? [gameAuthorityKeypair] : [])
          .rpc({skipPreflight: true});
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

      const balanceAfter = await getBalance(programProvider.connection, programProvider.wallet.publicKey);
      const transactionFee = new BN(5000);
      const expectedChange = payerIsGameAuthority
        ? transactionFee
        : transactionFee.add(new BN(changeCost * 1000 * changeColorRequests.length));
      const actualChange = balanceBefore.sub(balanceAfter);

      // TODO[tests]: use a dedicated (not root) wallet to create the game, to have predictable balance changes.
      //  The root wallet is used for voting and is being withdrawn during the test, leading to instability.
      expect(actualChange.sub(expectedChange).abs().lte(new BN(10000))).to.be.true;
    })
  });

  it("error: pixel is not withing game's bounds", async () => {
    let gameKeypair = await createGameAccount(program, programProvider, gameAuthority, 5, 5, changeCost);
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
