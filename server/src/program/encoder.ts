import { ChangePixelRequestDto } from "../dto/changePixelRequestDto";
import { Buffer } from "buffer";

// 5 consecutive bytes: <row 2><column 2><color 1>
const CHANGE_COLOR_ENCODING_LENGTH = 5;

const MAX_CHANGES_PER_TRANSACTION = 150;

export function encodeChangePixelColorRequests(
  requests: ChangePixelRequestDto[]
): Buffer {
  if (requests.length === 0) {
    throw new Error("Empty changes");
  }
  if (requests.length > MAX_CHANGES_PER_TRANSACTION) {
    throw new Error(
      `Too many ${requests.length} > ${MAX_CHANGES_PER_TRANSACTION} changes for a single transaction`
    );
  }
  const encodedChanges = Buffer.alloc(
    requests.length * CHANGE_COLOR_ENCODING_LENGTH
  );
  requests.map(({ row, column, newColor }, index) => {
    const startIndex = index * CHANGE_COLOR_ENCODING_LENGTH;
    encodedChanges.writeUint16BE(row, startIndex);
    encodedChanges.writeUint16BE(column, startIndex + 2);
    encodedChanges.writeUInt8(newColor, startIndex + 4);
  });
  return encodedChanges;
}
