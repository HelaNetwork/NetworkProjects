"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/hooks/use-auth";
import { pinJSON, pinFile, ipfsUrl } from "@/lib/ipfs";
import type { UserProfile } from "@/lib/types";

const INTERESTS_OPTIONS = [
  "DeFi", "NFTs", "DAOs", "ZK Proofs", "Gaming", "Music",
  "Travel", "Photography", "Art", "Cooking", "Fitness", "Reading",
  "Blockchain", "Privacy", "Security", "Web3", "AI", "Design",
];

export function ProfileForm() {
  const { address, identityHash } = useAuth();
  const { profile, setProfile } = useAppStore();

  const [name, setName] = useState(profile?.name || "");
  const [age, setAge] = useState(profile?.age?.toString() || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(
    profile?.imageUrl || ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 6
        ? [...prev, interest]
        : prev
    );
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSave() {
    if (!address || !identityHash || !name || !age) return;

    setSaving(true);
    setError(null);

    try {
      // 1. Pin image to IPFS if selected
      let imageCid = "";
      if (imageFile) {
        imageCid = await pinFile(imageFile);
      }

      // 2. Build profile metadata
      const profileData = {
        name,
        age: parseInt(age),
        bio,
        interests,
        imageCid,
        address,
        identityHash,
        createdAt: profile?.createdAt || Date.now(),
      };

      // 3. Pin profile JSON to IPFS
      const profileCid = await pinJSON(profileData);

      // 4. Build local profile object
      const newProfile: UserProfile = {
        address,
        identityHash,
        name,
        age: parseInt(age),
        bio,
        interests,
        imageUrl: imageCid ? ipfsUrl(imageCid) : imagePreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`,
        ipfsCid: profileCid,
        createdAt: profile?.createdAt || Date.now(),
      };

      // 5. Save to local store (cache)
      setProfile(newProfile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save profile";
      setError(msg);
      console.error("Profile save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      className="max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="glass rounded-2xl p-6 card-glow">
        <h2 className="text-xl font-bold gradient-text mb-6">
          {profile ? "Edit Profile" : "Create Profile"}
        </h2>

        {/* Avatar preview with file upload */}
        <div className="flex justify-center mb-6">
          <label className="relative group cursor-pointer">
            <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-cyber-pink/40 group-hover:border-cyber-pink transition-all">
              <div
                className="w-full h-full bg-cover bg-center bg-dark-700"
                style={{
                  backgroundImage: imagePreview
                    ? `url(${imagePreview})`
                    : `url(https://api.dicebear.com/7.x/avataaars/svg?seed=${address || "default"})`,
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-cyber-pink flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Display Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Age *
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Your age"
              min={18}
              max={99}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={3}
              maxLength={200}
            />
            <span className="text-[10px] text-gray-600 mt-1 block text-right">
              {bio.length}/200
            </span>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">
              Interests (max 6)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    interests.includes(interest)
                      ? "bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/40"
                      : "bg-dark-700 text-gray-400 border border-glass-border hover:border-gray-500"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Identity hash display */}
          {identityHash && (
            <div className="glass rounded-lg p-3">
              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                Identity Hash (on-chain)
              </label>
              <p className="text-xs text-cyber-blue font-mono break-all">
                {identityHash}
              </p>
            </div>
          )}

          {/* IPFS CID display */}
          {profile?.ipfsCid && (
            <div className="glass rounded-lg p-3">
              <label className="block text-[10px] font-medium text-gray-500 mb-1">
                Profile IPFS CID
              </label>
              <p className="text-xs text-cyber-green font-mono break-all">
                {profile.ipfsCid}
              </p>
            </div>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || !name || !age}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Pinning to IPFS...
              </>
            ) : saved ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Stored on IPFS!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {profile ? "Update Profile" : "Create Profile"}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
