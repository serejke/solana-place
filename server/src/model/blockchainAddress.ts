import { PublicKey } from "@solana/web3.js";

export type BlockchainAddressString = string;

export const SOLANA_CHAIN = "solana";
const SOLANA_PREFIX = `${SOLANA_CHAIN}:`;

/**
 * Blockchain address in <blockchain>:<address> format, for example:
 * `solana:zygn8poyETDVSS8YTaMZQtNDmoHZN7MCdxupGgNN1Xz`
 * `ethereum:0x329c54289ff5d6b7b7dae13592c6b1eda1543ed4`
 */
export class BlockchainAddress {
  constructor(private solanaAddress: PublicKey) {}

  static from(string: BlockchainAddressString): BlockchainAddress;
  static from(address: PublicKey): BlockchainAddress;
  static from(string: BlockchainAddressString | PublicKey): BlockchainAddress {
    if (typeof string === "string") {
      if (string.startsWith(SOLANA_PREFIX)) {
        const accountAddress = string.substring(SOLANA_PREFIX.length);
        return new BlockchainAddress(new PublicKey(accountAddress));
      }
      throw new Error(
        `Unknown format of blockchain address ${string}, should be solana:[public key], like solana:9MqMpF8ghs9xfq1sknyrPSq4FFAqbGFVxQwA9NjdNrmS`
      );
    }
    return new BlockchainAddress(string as PublicKey);
  }

  type(): typeof SOLANA_CHAIN {
    // Only the solana addresses are supported for now.
    return SOLANA_CHAIN;
  }

  asSolanaAddress(): PublicKey {
    return this.solanaAddress;
  }

  toString(): string {
    return SOLANA_PREFIX + this.solanaAddress.toBase58();
  }
}
