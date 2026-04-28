import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { RootState } from "../store";
import { setUserProfile } from "../store/slices/authSlice";
import Navbar from "../components/layout/Navbar";
import OnChainModal from "../components/ui/OnChainModal";
import FollowersModal from "../components/profile/FollowersModal";
import api from "../lib/axios";
import { User } from "../types";

const ALL_SKILLS = [
  "Solidity",
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Rust",
  "Go",
  "Web3.js",
  "Ethers.js",
  "Smart Contracts",
  "DeFi",
  "NFT",
  "Docker",
  "AWS",
  "GraphQL",
  "MongoDB",
  "PostgreSQL",
  "Kubernetes",
  "Machine Learning",
  "UI/UX Design",
  "Product Management",
  "Blockchain",
  "Cryptography",
  "Zero Knowledge",
  "Layer 2",
];

interface ProfileForm {
  fullName: string;
  dateOfBirth: string;
  bio: string;
  educationDegree: string;
  educationInstitution: string;
  educationYear: number;
  educationField: string;
  isWorking: boolean;
  companyName: string;
  jobTitle: string;
  yearsOfExperience: number;
}

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const { user, walletAddress } = useSelector((s: RootState) => s.auth);

  const [profile, setProfile] = useState<User | null>(user);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user?.skills || [],
  );
  const [customSkill, setCustomSkill] = useState("");
  const [showOnChain, setShowOnChain] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [isWorking, setIsWorking] = useState(user?.isWorking || false);
  const [activeSection, setActiveSection] = useState<
    "profile" | "skills" | "education" | "work"
  >("profile");
  const [modalType, setModalType] = useState<"followers" | "following" | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>();

  useEffect(() => {
    if (!walletAddress) return;
    api
      .get(`/users/profile/${walletAddress}`)
      .then((res) => {
        const u: User = res.data.data;
        setProfile(u);
        setSelectedSkills(u.skills || []);
        setIsWorking(u.isWorking);
        reset({
          fullName: u.fullName || "",
          dateOfBirth: u.dateOfBirth || "",
          bio: u.bio || "",
          educationDegree: u.education?.degree || "",
          educationInstitution: u.education?.institution || "",
          educationYear: u.education?.year || new Date().getFullYear(),
          educationField: u.education?.fieldOfStudy || "",
          isWorking: u.isWorking,
          companyName: u.work?.companyName || "",
          jobTitle: u.work?.jobTitle || "",
          yearsOfExperience: u.work?.yearsOfExperience || 0,
        });
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSkill = (s: string) =>
    setSelectedSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const addCustomSkill = () => {
    const v = customSkill.trim();
    if (v && !selectedSkills.includes(v)) {
      setSelectedSkills((p) => [...p, v]);
      setCustomSkill("");
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        bio: data.bio,
        education: {
          degree: data.educationDegree,
          institution: data.educationInstitution,
          year: Number(data.educationYear),
          fieldOfStudy: data.educationField,
        },
        isWorking,
        work: isWorking
          ? {
              companyName: data.companyName,
              jobTitle: data.jobTitle,
              yearsOfExperience: Number(data.yearsOfExperience),
            }
          : undefined,
        skills: selectedSkills,
      };
      const res = await api.put(`/users/profile/${walletAddress}`, payload);
      dispatch(setUserProfile(res.data.data));
      setProfile(res.data.data);
      setSaveMsg("✅ Profile saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch {
      setSaveMsg("❌ Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const sectionTabs = [
    { id: "profile", label: "👤 Profile", icon: "👤" },
    { id: "skills", label: "⚡ Skills", icon: "⚡" },
    { id: "education", label: "🎓 Education", icon: "🎓" },
    { id: "work", label: "💼 Work", icon: "💼" },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: "#0d1117" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-12">
        {/* Header card */}
        <div
          className="glass-card p-6 rounded-2xl mb-6 animate-fade-in"
          style={{ border: "1px solid rgba(20,184,166,0.2)" }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #14b8a6, #0d9488)",
                  boxShadow: "0 0 20px rgba(20,184,166,0.3)",
                }}
              >
                {profile?.fullName?.[0]?.toUpperCase() || "🐒"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {profile?.fullName || "Your Profile"}
                </h1>
                {profile?.work?.jobTitle && (
                  <p className="text-sm text-mint-400 mt-0.5">
                    {profile.work.jobTitle}
                  </p>
                )}
                <p className="text-xs font-mono text-white/30 mt-1 max-w-xs truncate">
                  {walletAddress}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                id="view-onchain-profile-btn"
                onClick={() => setShowOnChain(true)}
                className="btn-mint text-sm px-5 py-2 flex items-center gap-2"
              >
                ⛓️ On-Chain Data
              </button>
              <div className="flex gap-4 text-sm font-medium justify-center mt-2">
                <div
                  className="cursor-pointer hover:text-mint-400 transition"
                  onClick={() => setModalType("followers")}
                >
                  <span className="text-white font-bold">
                    {profile?.followers?.length || 0}
                  </span>{" "}
                  <span className="text-white/50">Followers</span>
                </div>
                <div
                  className="cursor-pointer hover:text-mint-400 transition"
                  onClick={() => setModalType("following")}
                >
                  <span className="text-white font-bold">
                    {profile?.following?.length || 0}
                  </span>{" "}
                  <span className="text-white/50">Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              id={`profile-tab-${tab.id}`}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? "text-mint-400 bg-mint-500/15"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 animate-fade-in"
          key={activeSection}
        >
          {/* Profile section */}
          {activeSection === "profile" && (
            <div
              className="glass-card p-6 rounded-2xl space-y-4"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="font-bold text-white">Personal Details</h2>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  id="edit-fullname"
                  className="input-field"
                  placeholder="Your full name"
                  {...register("fullName", { required: "Required" })}
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                  Date of Birth
                </label>
                <input
                  id="edit-dob"
                  type="date"
                  className="input-field"
                  {...register("dateOfBirth")}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                  Bio / Introduction
                </label>
                <textarea
                  id="edit-bio"
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Tell the world about yourself…"
                  {...register("bio")}
                />
              </div>
            </div>
          )}

          {/* Skills section */}
          {activeSection === "skills" && (
            <div
              className="glass-card p-6 rounded-2xl space-y-4"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="font-bold text-white">
                Skills{" "}
                <span className="text-white/40 font-normal text-sm">
                  ({selectedSkills.length} selected)
                </span>
              </h2>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1">
                {[...new Set([...ALL_SKILLS, ...selectedSkills])].map(
                  (skill) => (
                    <button
                      key={skill}
                      type="button"
                      id={`edit-skill-${skill.replace(/[^a-zA-Z0-9]/g, "-")}`}
                      onClick={() => toggleSkill(skill)}
                      className={`skill-tag ${selectedSkills.includes(skill) ? "selected" : ""}`}
                    >
                      {skill}
                    </button>
                  ),
                )}
              </div>
              <div className="flex gap-2">
                <input
                  id="edit-custom-skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomSkill())
                  }
                  placeholder="Add custom skill…"
                  className="input-field flex-1 text-sm py-2"
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="btn-ghost px-4 py-2 text-sm"
                >
                  + Add
                </button>
              </div>
            </div>
          )}

          {/* Education section */}
          {activeSection === "education" && (
            <div
              className="glass-card p-6 rounded-2xl space-y-4"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="font-bold text-white">Education</h2>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                  Degree
                </label>
                <input
                  id="edit-degree"
                  className="input-field"
                  placeholder="e.g. Bachelor's"
                  {...register("educationDegree")}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                  Institution
                </label>
                <input
                  id="edit-institution"
                  className="input-field"
                  placeholder="e.g. MIT"
                  {...register("educationInstitution")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                    Year
                  </label>
                  <input
                    id="edit-year"
                    type="number"
                    className="input-field"
                    {...register("educationYear")}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                    Field of Study
                  </label>
                  <input
                    id="edit-field"
                    className="input-field"
                    placeholder="Computer Science"
                    {...register("educationField")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Work section */}
          {activeSection === "work" && (
            <div
              className="glass-card p-6 rounded-2xl space-y-4"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <h2 className="font-bold text-white">Work Status</h2>
              <div className="flex items-center gap-4">
                <span className="text-white/60 text-sm">
                  Currently employed?
                </span>
                <button
                  type="button"
                  id="toggle-working-btn"
                  onClick={() => setIsWorking(!isWorking)}
                  className={`relative w-12 h-6 rounded-full transition-all ${isWorking ? "" : "opacity-50"}`}
                  style={{
                    background: isWorking
                      ? "linear-gradient(135deg,#14b8a6,#0d9488)"
                      : "rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${isWorking ? "left-6" : "left-0.5"}`}
                  />
                </button>
                <span
                  className={`text-sm font-medium ${isWorking ? "text-mint-400" : "text-white/30"}`}
                >
                  {isWorking ? "Yes" : "No"}
                </span>
              </div>

              {isWorking && (
                <div className="space-y-4 animate-slide-up">
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                      Company Name
                    </label>
                    <input
                      id="edit-company"
                      className="input-field"
                      placeholder="e.g. HelaLabs"
                      {...register("companyName")}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                      Job Title
                    </label>
                    <input
                      id="edit-jobtitle"
                      className="input-field"
                      placeholder="e.g. Senior Developer"
                      {...register("jobTitle")}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
                      Years of Experience
                    </label>
                    <input
                      id="edit-experience"
                      type="number"
                      className="input-field"
                      {...register("yearsOfExperience")}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center gap-4">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="btn-mint px-10 py-3 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⟳</span> Saving…
                </>
              ) : (
                "💾 Save Changes"
              )}
            </button>
            {saveMsg && (
              <span
                className={`text-sm font-medium animate-fade-in ${saveMsg.startsWith("✅") ? "text-mint-400" : "text-red-400"}`}
              >
                {saveMsg}
              </span>
            )}
          </div>

          {/* Danger zone */}
          <div
            className="glass-card p-5 rounded-2xl mt-8"
            style={{ border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <h3 className="text-sm font-bold text-red-400 mb-3">Danger Zone</h3>
            <button
              type="button"
              id="delete-account-btn"
              onClick={async () => {
                if (
                  !window.confirm(
                    "Are you sure? This will permanently delete your account.",
                  )
                )
                  return;
                await api.delete(`/users/profile/${walletAddress}`);
                window.location.href = "/";
              }}
              className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-all"
            >
              🗑️ Delete Account
            </button>
          </div>
        </form>
      </main>

      {showOnChain && walletAddress && (
        <OnChainModal
          walletAddress={walletAddress}
          onClose={() => setShowOnChain(false)}
        />
      )}

      {modalType && profile && (
        <FollowersModal
          type={modalType}
          wallets={
            modalType === "followers"
              ? profile.followers || []
              : profile.following || []
          }
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
};

export default ProfilePage;
