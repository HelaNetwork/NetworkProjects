import { createPublicClient, getAddress, http, isAddress, zeroAddress, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import vaultFactoryArtifact from "@/abi/VaultFactory.json";

export const VAULT_FACTORY_ADDRESS = (
  process.env.NEXT_PUBLIC_VAULT_FACTORY_ADDRESS ??
  "0x2d3b410d40b9A28D07119163CB7369a776BA2A34"
) as Address;

const BASE_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";

const vaultFactoryClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC_URL),
});

export async function resolveVaultAddress(ownerAddress: string): Promise<Address | null> {
  if (!isAddress(ownerAddress)) {
    return null;
  }

  try {
    const vaultAddress = await vaultFactoryClient.readContract({
      address: VAULT_FACTORY_ADDRESS,
      abi: vaultFactoryArtifact.abi,
      functionName: "getVault",
      args: [ownerAddress as Address],
    });

    if (
      typeof vaultAddress !== "string" ||
      vaultAddress === zeroAddress ||
      !isAddress(vaultAddress)
    ) {
      return null;
    }

    return getAddress(vaultAddress);
  } catch {
    return null;
  }
}