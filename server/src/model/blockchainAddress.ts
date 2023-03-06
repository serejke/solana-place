import { PublicKey } from "@solana/web3.js";

export type BlockchainAddressString = string;

export const SOLANA_CHAIN = "solana";
const SOLANA_PREFIX = `${SOLANA_CHAIN}:`;

export const ETHEREUM_CHAIN = "ethereum";
const ETHEREUM_PREFIX = `${ETHEREUM_CHAIN}:`;

/**
 * Blockchain address in <blockchain>:<address> format, for example:
 * `solana:zygn8poyETDVSS8YTaMZQtNDmoHZN7MCdxupGgNN1Xz`
 * `ethereum:0x329c54289ff5d6b7b7dae13592c6b1eda1543ed4`
 */
export class BlockchainAddress {
  constructor(private addressString: BlockchainAddressString) {}

  static from(string: BlockchainAddressString): BlockchainAddress;
  static from(address: PublicKey): BlockchainAddress;
  static from(string: BlockchainAddressString | PublicKey): BlockchainAddress {
    if (typeof string === "string") {
      if (
        !string.startsWith(SOLANA_PREFIX) &&
        !string.startsWith(ETHEREUM_PREFIX)
      ) {
        throw new Error(`Unknown format of blockchain address: ${string}`);
      }
      return new BlockchainAddress(string);
    }
    return new BlockchainAddress(
      SOLANA_PREFIX + (string as PublicKey).toBase58()
    );
  }

  type(): typeof SOLANA_CHAIN {
    // Only the solana addresses are supported for now.
    return SOLANA_CHAIN;
  }

  asSolanaAddress(): PublicKey {
    this.checkPrefix(SOLANA_PREFIX);
    const accountAddress = this.addressString.substring(SOLANA_PREFIX.length);
    return new PublicKey(accountAddress);
  }

  asEthereumAddress(): string {
    this.checkPrefix(ETHEREUM_PREFIX);
    return this.addressString.substring(ETHEREUM_PREFIX.length);
  }

  private checkPrefix(prefix: string) {
    if (!this.addressString.startsWith(prefix)) {
      throw new Error(`Incorrect address type: ${this.toString()}`);
    }
  }

  toString(): string {
    return this.addressString;
  }
}
