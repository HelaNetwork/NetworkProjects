import Link from "next/link";
import { PLATFORM_FEE_PERCENT } from "@/lib/platformFee";

interface AgentCardProps {
  id: number;
  name: string;
  description: string;
  type: string;
  image: string;
  price: number;
  activeCount: number;
  isLive: boolean;
  developer?: string;
}

function shortenAddress(address?: string): string | null {
  if (!address) {
    return null;
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function AgentCard({
  id,
  name,
  description,
  type,
  image,
  price,
  activeCount,
  isLive,
  developer
}: AgentCardProps) {
  const creatorLabel = shortenAddress(developer);

  return (
    <div className="group flex flex-col gap-6 border border-white/12 bg-surface-container-lowest p-6 transition-colors hover:border-white">
      <div className="flex items-start justify-between">
        <div className="font-headline text-3xl uppercase">{name}</div>
        <div
          className={`flex items-center gap-1 font-mono text-[10px] ${
            isLive ? "text-live-signal" : "text-white/20"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isLive ? "bg-live-signal" : "bg-white/20"
            }`}
          ></span>
          {isLive ? "LIVE" : "IDLE"}
        </div>
      </div>

      <div className="relative h-48 w-full overflow-hidden border border-white/5 bg-black">
        <img
          alt={description}
          className="h-full w-full object-cover grayscale opacity-50 transition-all group-hover:opacity-100 group-hover:grayscale-0"
          src={image}
        />
      </div>

      <div>
        <h3 className="mb-2 font-headline text-2xl uppercase">{type}</h3>
        <p className="font-body text-xs uppercase leading-relaxed text-white/60">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="border border-white/20 px-2 py-1 font-mono text-[10px]">
          [ {activeCount} ACTIVE ]
        </span>
        <span className="border border-white/20 px-2 py-1 font-mono text-[10px]">
          [ {price} HLUSD ]
        </span>
      </div>

      {creatorLabel && (
        <p className="font-mono text-[10px] uppercase text-white/50">
          Creator: {creatorLabel}
        </p>
      )}

      <p className="font-mono text-[10px] uppercase text-white/40">
        {PLATFORM_FEE_PERCENT}% platform fee included in activation price
      </p>

      <Link
        href={`/agent/${id}`}
        className="w-full border border-white py-3 text-center font-headline text-xl uppercase transition-colors hover:bg-white hover:text-black"
      >
        [ ACTIVATE ↗ ]
      </Link>
    </div>
  );
}
