import {Program} from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";
import * as fs from "fs";
import {PNG} from "pngjs";
import {IDL as SolanaPlaceGameIDL, SolanaPlace} from "../target/types/solana_place";
import solanaPlaceProgramKeypair from "../target/deploy/solana_place-keypair.json";
import gameAccountKeypair from "../target/deploy/game_account_keypair.json";

const PICTURE_PATH = "../target/pictures/img.png";

async function copyPicture(provider) {
  console.log("Copying picture");

  // Configure client to use the provider.
  anchor.setProvider(provider);

  const programKeypair = web3.Keypair.fromSecretKey(Uint8Array.from(solanaPlaceProgramKeypair));
  const programId = programKeypair.publicKey;

  const gameKeypair = web3.Keypair.fromSecretKey(Uint8Array.from(gameAccountKeypair));
  const gameAccount = gameKeypair.publicKey;

  const program = new Program<SolanaPlace>(SolanaPlaceGameIDL, programId, provider);

  const imageBuffer = fs.readFileSync(PICTURE_PATH)
  const png = PNG.sync.read(imageBuffer);
  let finished = 0;
  for (let row = 0; row < png.height; row++) {
    for (let column = 0; column < png.width; column++) {
      const index = (png.width * row + column) * 4;
      const r = png.data[index];
      const g = png.data[index + 1];
      const b = png.data[index + 2];

      const colorIndex = findBestColorIndex(r, g, b) + 1;
      const baseCoordinates = 20;
      program.methods
        .changeColor(baseCoordinates + row, baseCoordinates + column, colorIndex)
        .accounts({
          gameAccount
        })
        .rpc()
        .then(() => {
          finished++;
          if (finished % 100 === 0) {
            console.log("Finished change #" + finished);
          }
        })
        .catch(console.error);
    }
  }
}

function findBestColorIndex(r: number, g: number, b: number): number {
  const parsedColors = ALL_COLORS.map((hexString) => hexToRgb(hexString));

  const targetColor = {r, g, b};

  let bestIndex = 0;
  let bestDistance = distance(parsedColors[bestIndex], targetColor);
  for (let index = 1; index < parsedColors.length; index++) {
    const currentDistance = distance(parsedColors[index], targetColor)
    if (bestDistance > currentDistance) {
      bestDistance = currentDistance;
      bestIndex = index;
    }
  }
  return bestIndex;
}

function distance(color1: RgbColor, color2: RgbColor): number {
  return Math.pow(color1.r - color2.r, 2) +
    Math.pow(color1.g - color2.g, 2) +
    Math.pow(color1.b - color2.b, 2);
}

type RgbColor = { r: number, g: number, b: number }

/*
function parseRgb(rgb: string): { r: number, g: number, b: number } {
  const result = /rgb\((\d+),(\d+),(\d+\))/.exec(rgb)
  const r = parseInt(result[1])
  const g = parseInt(result[2])
  const b = parseInt(result[3])
  return {r, g, b};
}
*/

function hexToRgb(hex: string): { r: number, g: number, b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return {r, g, b}
}

const ALL_COLORS = [
  '#ffffff', //0
  '#999999',
  '#4d4d4d',
  '#f34c39',
  '#ff9100',
  '#fad900',
  '#dde000',
  '#a4db00',
  '#66ccca',
  '#75d8ff',
  '#afa3ff', // 10
  '#fda3ff',
  '#cccccc',
  '#808080',
  '#333333',
  '#d13115',
  '#e07400',
  '#fac400',
  '#b0bd00',
  '#68bd00',
  '#17a6a6', //20
  '#009de0',
  '#7d66ff',
  '#fb29ff',
  '#b3b3b3',
  '#666666',
  '#000000',
  '#9e0500',
  '#c25100',
  '#fa9e00',
  '#818a00', //30
  '#194d33',
  '#0c7a7d',
  '#0062b3',
  '#653394',
  '#a9149c'
];

export default copyPicture;
module.exports = copyPicture;



