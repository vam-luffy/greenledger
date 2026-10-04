"use client";

/**
 * Local-only test wallet for exercising signing flows without a browser
 * extension. Enabled only when the page is served from localhost AND
 * NEXT_PUBLIC_TEST_WALLET_SECRETS is set (never set that on a deployment).
 *
 * Format: "label:base58secret,label:base58secret"
 */
import {
  BaseSignerWalletAdapter,
  WalletNotConnectedError,
  WalletReadyState,
  type SupportedTransactionVersions,
  type WalletName,
} from "@solana/wallet-adapter-base";
import { Keypair, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58Decode(s: string): Uint8Array {
  let n = BigInt(0);
  for (const ch of s) {
    const i = ALPHABET.indexOf(ch);
    if (i < 0) throw new Error("bad base58");
    n = n * BigInt(58) + BigInt(i);
  }
  const bytes: number[] = [];
  while (n > 0) {
    bytes.unshift(Number(n % BigInt(256)));
    n /= BigInt(256);
  }
  let pad = 0;
  for (const ch of s) {
    if (ch === "1") pad++;
    else break;
  }
  return new Uint8Array([...new Array(pad).fill(0), ...bytes]);
}

export class LocalTestWalletAdapter extends BaseSignerWalletAdapter {
  name: WalletName;
  url = "http://localhost";
  icon =
    "data:image/svg+xml;base64," +
    btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#059669"/><text x="16" y="21" font-size="14" text-anchor="middle" fill="#fff" font-family="monospace">T</text></svg>');
  readonly supportedTransactionVersions: SupportedTransactionVersions = new Set(["legacy", 0]);

  private _keypair: Keypair;
  private _connecting = false;
  private _connected = false;

  constructor(label: string, secret: string) {
    super();
    this.name = `Test: ${label}` as WalletName;
    this._keypair = Keypair.fromSecretKey(base58Decode(secret));
  }

  get publicKey(): PublicKey | null {
    return this._connected ? this._keypair.publicKey : null;
  }
  get connecting() {
    return this._connecting;
  }
  get readyState() {
    return WalletReadyState.Installed;
  }

  async connect(): Promise<void> {
    this._connecting = true;
    this._connected = true;
    this._connecting = false;
    this.emit("connect", this._keypair.publicKey);
  }

  async disconnect(): Promise<void> {
    this._connected = false;
    this.emit("disconnect");
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (!this._connected) throw new WalletNotConnectedError();
    if (tx instanceof VersionedTransaction) tx.sign([this._keypair]);
    else tx.partialSign(this._keypair);
    return tx;
  }
}

export function localTestWallets(): LocalTestWalletAdapter[] {
  if (typeof window === "undefined") return [];
  const host = window.location.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") return [];
  const spec = process.env.NEXT_PUBLIC_TEST_WALLET_SECRETS;
  if (!spec) return [];
  return spec
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label, secret] = entry.split(":");
      return new LocalTestWalletAdapter(label, secret);
    });
}
