const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";

export function ipfsUrl(cid: string): string {
  if (!cid) return "";
  if (cid.startsWith("http")) return cid;
  const cleanCid = cid.replace("ipfs://", "");
  return `${PINATA_GATEWAY}/ipfs/${cleanCid}`;
}

export async function pinJSON(data: Record<string, unknown>): Promise<string> {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: data,
      pinataMetadata: { name: `helamatch-profile-${Date.now()}` },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS pin failed: ${err}`);
  }

  const result = await res.json();
  return result.IpfsHash as string;
}

export async function pinFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "pinataMetadata",
    JSON.stringify({ name: `helamatch-img-${Date.now()}` })
  );

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS file pin failed: ${err}`);
  }

  const result = await res.json();
  return result.IpfsHash as string;
}

export async function fetchFromIPFS<T>(cid: string): Promise<T> {
  const url = ipfsUrl(cid);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`IPFS fetch failed for CID: ${cid}`);
  return res.json() as Promise<T>;
}
