export type ChainErrorCode =
  | "wallet_not_found"
  | "user_rejected"
  | "chain_not_added"
  | "wrong_network"
  | "insufficient_funds"
  | "rpc_error"
  | "missing_env"
  | "invalid_input"
  | "unknown";

export class ChainIntegrationError extends Error {
  code: ChainErrorCode;
  details?: string;

  constructor(code: ChainErrorCode, message: string, details?: string) {
    super(message);
    this.name = "ChainIntegrationError";
    this.code = code;
    this.details = details;
  }
}

export function normalizeChainError(error: unknown, fallbackMessage: string): ChainIntegrationError {
  if (error instanceof ChainIntegrationError) {
    return error;
  }

  const err = error as { code?: number; message?: string; shortMessage?: string };
  const message = err.shortMessage || err.message || fallbackMessage;
  const lowered = message.toLowerCase();

  if (err.code === 4001 || lowered.includes("user rejected") || lowered.includes("rejected")) {
    return new ChainIntegrationError("user_rejected", "User rejected the wallet request", message);
  }

  if (err.code === 4902) {
    return new ChainIntegrationError("chain_not_added", "HeLa network is not added in wallet", message);
  }

  if (lowered.includes("chain") && lowered.includes("not configured")) {
    return new ChainIntegrationError("wrong_network", "Wallet is connected to the wrong network", message);
  }

  if (lowered.includes("insufficient funds")) {
    return new ChainIntegrationError("insufficient_funds", "Insufficient funds for gas or transfer", message);
  }

  if (lowered.includes("network") || lowered.includes("rpc") || err.code === -32603) {
    return new ChainIntegrationError("rpc_error", "Blockchain network/RPC error", message);
  }

  return new ChainIntegrationError("unknown", fallbackMessage, message);
}
