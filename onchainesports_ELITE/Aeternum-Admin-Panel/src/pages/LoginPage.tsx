import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { adminLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap } from "lucide-react";
import { toast } from "sonner";

interface SolanaProvider {
  isPhantom?: boolean;
  publicKey?: { toBase58: () => string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>;
  signMessage: (message: Uint8Array, display?: "utf8" | "hex") => Promise<{ signature: Uint8Array }>;
}

declare global {
  interface Window {
    solana?: SolanaProvider;
  }
}

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export default function LoginPage() {
  const [walletAddress, setWalletAddress] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const provider = window.solana;
    if (provider?.publicKey) {
      setWalletAddress(provider.publicKey.toBase58());
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const provider = window.solana;
    if (!provider?.isPhantom || !provider.signMessage) {
      toast.error("Phantom wallet not found. Install or unlock Phantom to continue.");
      return;
    }

    setLoading(true);
    try {
      const connected = await provider.connect();
      const connectedWallet = connected.publicKey.toBase58();
      setWalletAddress(connectedWallet);

      const message = `Sign into mechanical turks`;
      const messageBytes = new TextEncoder().encode(message);
      const signed = await provider.signMessage(messageBytes, "utf8");
      const signature = encodeBase64(signed.signature);

      const res = await adminLogin(connectedWallet, signature);
      login(res.token, res.user, adminApiKey.trim() || undefined);
      toast.success("Authenticated as admin");
      navigate("/admin");
    } catch (err: any) {
      if (err?.code === 4001) {
        toast.error("Wallet signature request was rejected");
      } else {
        toast.error(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Zap className="h-10 w-10 text-primary" />
            <h1 className="font-display text-4xl font-bold text-primary neon-text">NEXUS</h1>
          </div>
          <p className="text-muted-foreground">Esports Betting Exchange — Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Wallet</label>
            <Input
              value={walletAddress}
              readOnly
              placeholder="Not connected"
              className="bg-secondary border-border"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Connect your Phantom wallet and sign to authenticate.
            </p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Admin API Key <span className="text-muted-foreground/50">(optional)</span></label>
            <Input
              value={adminApiKey}
              onChange={(e) => setAdminApiKey(e.target.value)}
              placeholder="x-admin-key header value"
              className="bg-secondary border-border"
              type="password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full neon-glow">
            {loading ? "Authenticating..." : "Connect & Authenticate"}
          </Button>
        </form>
      </div>
    </div>
  );
}
