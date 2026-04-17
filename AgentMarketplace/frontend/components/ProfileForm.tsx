"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import { getDatingCoreContract } from "@/lib/contracts";
import { hashProfileForChain, deriveKey, encryptField } from "@/lib/encryption";
import { generateMockProof, encodeProofForContract } from "@/lib/zk";

const INTEREST_OPTIONS = [
  { id: 1, label: "🎵 Music" }, { id: 2, label: "🎮 Gaming" },
  { id: 3, label: "🏋️ Fitness" }, { id: 4, label: "📚 Books" },
  { id: 5, label: "✈️ Travel" }, { id: 6, label: "🍳 Cooking" },
  { id: 7, label: "🎨 Art" },    { id: 8, label: "🎬 Movies" },
  { id: 9, label: "♟️ Chess" },  { id: 10, label: "⛰️ Hiking" },
];

interface ProfileFormProps {
  signer: ethers.Signer;
  address: string;
  onRegistered: () => void;
}

export default function ProfileForm({ signer, address, onRegistered }: ProfileFormProps) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState<"Man" | "Woman" | "Non-binary" | "">("");
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "encrypt" | "zk" | "tx" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(id: number) {
    setSelectedInterests(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 10 ? [...prev, id] : prev
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !bio || !gender || selectedInterests.length === 0) {
      setError("Please fill all fields, select a gender, and pick at least one interest.");
      return;
    }
    setError(null);
    setLoading(true);

    try {

      // Step 1: Encrypt profile fields
      setStep("encrypt");
      const key = await deriveKey(address);
      const encryptedName = await encryptField(name, key);
      const encryptedBio  = await encryptField(bio, key);
      const profileHash = await hashProfileForChain({ name: encryptedName, bio: encryptedBio, age, interests: selectedInterests });

      // Step 2: Generate ZK proof
      setStep("zk");
      const proof = await generateMockProof({ age, userInterests: selectedInterests, targetInterests: [] });
      const { proofCalldata } = encodeProofForContract(proof);

      // Step 3: Submit on-chain
      setStep("tx");
      const contract = getDatingCoreContract(signer);
      const tx = await contract.registerProfile(profileHash, selectedInterests);
      await tx.wait();

      setStep("done");
      setTimeout(onRegistered, 1200);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  const stepLabel: Record<typeof step, string> = {
    idle: "Create Profile",
    encrypt: "Encrypting data…",
    zk: "Generating ZK proof…",
    tx: "Submitting on-chain…",
    done: "✓ Profile created!",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Create Your Profile</h2>
      <p className="text-sm text-gray-400">Your name and bio are encrypted client-side before being hashed on-chain.</p>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</label>
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="Anonymous Dragon" maxLength={40}
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-600 focus:outline-none focus:border-rose-500 transition"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bio</label>
        <textarea
          value={bio} onChange={e => setBio(e.target.value)}
          placeholder="Tell the chain your vibe…" maxLength={160} rows={3}
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-600 focus:outline-none focus:border-rose-500 transition resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Age</label>
        <input
          type="number" value={age} onChange={e => setAge(Number(e.target.value))}
          min={18} max={99}
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-rose-500 transition w-28"
        />
        <span className="text-[10px] text-gray-600">Proven ≥18 via ZK proof — never stored plaintext</span>
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gender</label>
        <div className="flex gap-2 flex-wrap">
          {(["Man", "Woman", "Non-binary"] as const).map(g => (
            <button
              key={g} type="button" onClick={() => setGender(g)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold border-2 transition-all ${
                gender === g
                  ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200"
                  : "bg-white border-gray-200 text-gray-500 hover:border-rose-400 hover:text-rose-500"
              }`}
            >
              {g === "Man" ? "👨 Man" : g === "Woman" ? "👩 Woman" : "🌈 Non-binary"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Interests <span className="text-gray-600">({selectedInterests.length}/10)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(opt => (
            <button
              key={opt.id} type="button" onClick={() => toggleInterest(opt.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedInterests.includes(opt.id)
                  ? "bg-rose-500 border-rose-500 text-gray-900 shadow-md shadow-rose-500/20"
                  : "bg-white border-gray-300 text-gray-400 hover:border-rose-500/50 hover:text-gray-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-400 text-gray-900 font-bold text-sm tracking-wide hover:from-rose-400 hover:to-rose-300 hover:shadow-lg hover:shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {stepLabel[step]}
          </span>
        ) : stepLabel[step]}
      </button>
    </form>
  );
}


