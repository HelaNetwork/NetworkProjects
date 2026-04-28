import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form";
import { setWalletConnected, setUserProfile } from "../store/slices/authSlice";
import { connectMetaMask } from "../lib/ethers";
import { ethers } from "ethers";
import { mockContract } from "../lib/contracts";
import api from "../lib/axios";
import MonkeyLogo from "../components/ui/MonkeyLogo";

// ── Step types ─────────────────────────────────────────────────────────────
interface PersonalForm {
  fullName: string;
  dateOfBirth: string;
}
interface EducationForm {
  degree: string;
  institution: string;
  year: number;
  fieldOfStudy: string;
}
interface WorkForm {
  companyName: string;
  jobTitle: string;
  yearsOfExperience: number;
}

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

const DEGREES = [
  "Bachelor's",
  "Master's",
  "PhD",
  "Diploma",
  "Associate",
  "Bootcamp",
  "Self-Taught",
];

// ── Sub-steps ──────────────────────────────────────────────────────────────
const StepConnect: React.FC<{
  onConnect: (addr: string) => void;
  loading: boolean;
}> = ({ onConnect, loading }) => (
  <div className="flex flex-col items-center gap-6 animate-slide-up">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2 mint-gradient-text">
        Welcome to helaconntect
      </h1>
      <p className="text-white/50 text-sm max-w-xs">
        Your Web3 professional network on the Hela blockchain
      </p>
    </div>
    <button
      id="connect-wallet-btn"
      onClick={() => onConnect("")}
      disabled={loading}
      className="btn-mint flex items-center gap-3 px-8 py-4 text-base animate-pulse-mint"
    >
      {loading ? (
        <>
          <span className="animate-spin">⟳</span> Connecting…
        </>
      ) : (
        <>
          <span>🦊</span> Connect MetaMask Wallet
        </>
      )}
    </button>
    <p className="text-white/25 text-xs">Powered by Hela Blockchain Testnet</p>
  </div>
);

const StepPersonal: React.FC<{ onNext: (d: PersonalForm) => void }> = ({
  onNext,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalForm>();
  const dob = watch("dateOfBirth");
  return (
    <form
      onSubmit={handleSubmit(onNext)}
      className="flex flex-col gap-4 w-full max-w-sm animate-slide-up"
    >
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Personal Details</h2>
        <p className="text-white/40 text-sm">Tell us a bit about yourself</p>
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
          Full Name
        </label>
        <input
          id="input-fullname"
          placeholder="e.g. Alex Johnson"
          className="input-field"
          {...register("fullName", { required: "Full name is required" })}
        />
        {errors.fullName && (
          <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>
        )}
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
          Date of Birth
        </label>
        <input
          id="input-dob"
          type="date"
          className="input-field"
          {...register("dateOfBirth", {
            required: "Date of birth is required",
          })}
        />
        {errors.dateOfBirth && (
          <p className="text-red-400 text-xs mt-1">
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>
      <button id="personal-next-btn" type="submit" className="btn-mint mt-2">
        Next →
      </button>
    </form>
  );
};

const StepEducation: React.FC<{
  onNext: (d: EducationForm) => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EducationForm>();
  return (
    <form
      onSubmit={handleSubmit(onNext)}
      className="flex flex-col gap-4 w-full max-w-sm animate-slide-up"
    >
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Education</h2>
        <p className="text-white/40 text-sm">Your academic background</p>
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
          Degree
        </label>
        <select
          id="input-degree"
          className="input-field"
          {...register("degree", { required: true })}
        >
          <option className="text-white bg-mint-950" value="">
            Select degree…
          </option>
          {DEGREES.map((d) => (
            <option key={d} className="text-white bg-mint-950" value={d}>
              {d}
            </option>
          ))}
        </select>
        {errors.degree && <p className="text-red-400 text-xs mt-1">Required</p>}
      </div>
      <div>
        <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
          Institution
        </label>
        <input
          id="input-institution"
          placeholder="e.g. MIT"
          className="input-field"
          {...register("institution", { required: "Institution is required" })}
        />
        {errors.institution && (
          <p className="text-red-400 text-xs mt-1">
            {errors.institution.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
            Year
          </label>
          <input
            id="input-year"
            type="number"
            placeholder="2023"
            className="input-field"
            {...register("year", { required: true, min: 1950, max: 2030 })}
          />
          {errors.year && (
            <p className="text-red-400 text-xs mt-1">Valid year required</p>
          )}
        </div>
        <div>
          <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
            Field of Study
          </label>
          <input
            id="input-field-of-study"
            placeholder="Computer Science"
            className="input-field"
            {...register("fieldOfStudy", { required: true })}
          />
          {errors.fieldOfStudy && (
            <p className="text-red-400 text-xs mt-1">Required</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onBack} className="btn-ghost flex-1">
          ← Back
        </button>
        <button
          id="education-next-btn"
          type="submit"
          className="btn-mint flex-1"
        >
          Next →
        </button>
      </div>
    </form>
  );
};

const StepWork: React.FC<{
  onNext: (isWorking: boolean, work?: WorkForm) => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const [isWorking, setIsWorking] = useState<boolean | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkForm>();

  const onSubmitWork: SubmitHandler<WorkForm> = (data) => onNext(true, data);

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm animate-slide-up">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Work Status</h2>
        <p className="text-white/40 text-sm">Are you currently employed?</p>
      </div>

      {isWorking === null && (
        <div className="flex gap-4 justify-center">
          <button
            id="work-yes-btn"
            onClick={() => setIsWorking(true)}
            className="btn-mint px-10 py-3"
          >
            Yes 👔
          </button>
          <button
            id="work-no-btn"
            onClick={() => onNext(false)}
            className="btn-ghost px-10 py-3"
          >
            No 🎓
          </button>
        </div>
      )}

      {isWorking === true && (
        <form
          onSubmit={handleSubmit(onSubmitWork)}
          className="flex flex-col gap-3"
        >
          <div>
            <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
              Company Name
            </label>
            <input
              id="input-company"
              placeholder="e.g. HelaLabs"
              className="input-field"
              {...register("companyName", { required: "Required" })}
            />
            {errors.companyName && (
              <p className="text-red-400 text-xs mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
              Job Title
            </label>
            <input
              id="input-jobtitle"
              placeholder="e.g. Senior Developer"
              className="input-field"
              {...register("jobTitle", { required: "Required" })}
            />
            {errors.jobTitle && (
              <p className="text-red-400 text-xs mt-1">
                {errors.jobTitle.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wide">
              Years of Experience
            </label>
            <input
              id="input-years-exp"
              type="number"
              placeholder="3"
              className="input-field"
              {...register("yearsOfExperience", { required: true, min: 0 })}
            />
            {errors.yearsOfExperience && (
              <p className="text-red-400 text-xs mt-1">Required</p>
            )}
          </div>
          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={() => setIsWorking(null)}
              className="btn-ghost flex-1"
            >
              ← Back
            </button>
            <button
              id="work-next-btn"
              type="submit"
              className="btn-mint flex-1"
            >
              Next →
            </button>
          </div>
        </form>
      )}

      {isWorking === null && (
        <button type="button" onClick={onBack} className="btn-ghost text-sm">
          ← Back
        </button>
      )}
    </div>
  );
};

const StepSkills: React.FC<{
  onFinish: (skills: string[]) => void;
  onBack: () => void;
  loading: boolean;
}> = ({ onFinish, onBack, loading }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");

  const toggle = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const addCustom = () => {
    const v = custom.trim();
    if (v && !selected.includes(v)) {
      setSelected((p) => [...p, v]);
      setCustom("");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md animate-slide-up">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-white mb-1">Your Skills</h2>
        <p className="text-white/40 text-sm">
          Select skills that define you ({selected.length} selected)
        </p>
      </div>

      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
        {ALL_SKILLS.map((skill) => (
          <button
            key={skill}
            id={`skill-${skill.replace(/[^a-zA-Z0-9]/g, "-")}`}
            onClick={() => toggle(skill)}
            className={`skill-tag ${selected.includes(skill) ? "selected" : ""}`}
          >
            {skill}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          id="custom-skill-input"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustom()}
          placeholder="Add custom skill…"
          className="input-field flex-1 text-sm py-2"
        />
        <button onClick={addCustom} className="btn-ghost px-4 py-2 text-sm">
          + Add
        </button>
      </div>

      <div className="flex gap-3 mt-1">
        <button onClick={onBack} className="btn-ghost flex-1">
          ← Back
        </button>
        <button
          id="finish-onboarding-btn"
          onClick={() => onFinish(selected)}
          disabled={selected.length === 0 || loading}
          className="btn-mint flex-1 disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin">⟳</span>
          ) : (
            "🚀 Finish Setup"
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main Onboarding Page ───────────────────────────────────────────────────
const OnboardingPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [walletAddress, setWalletAddress] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Accumulated form data
  const [personal, setPersonal] = useState<PersonalForm | null>(null);
  const [education, setEducation] = useState<EducationForm | null>(null);
  const [work, setWork] = useState<{
    isWorking: boolean;
    work?: WorkForm;
  } | null>(null);

  const TOTAL_STEPS = 4; // steps 1–4 (after connect)

  const handleConnect = async () => {
    setConnectLoading(true);
    setError("");
    try {
      const addr = await connectMetaMask();
      setWalletAddress(addr);
      dispatch(setWalletConnected(addr));

      let isRegistered = false;
      try {
        isRegistered = await mockContract.checkUserStatus(addr);
      } catch (e) {
        console.warn("Contract error, falling back to mock", e);
        isRegistered = await mockContract.checkUserStatus(addr);
      }

      if (isRegistered) {
        try {
          const res = await api.get(`/users/profile/${addr}`);
          dispatch(setUserProfile(res.data.data));
          navigate("/home");
          return;
        } catch (e) {
          console.warn(
            "Profile not found in backend despite being registered on-chain",
          );
        }
      }

      setIsConnected(true);
      setStep(1);
    } catch (err: unknown) {
      const e = err as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      setError(
        e?.response?.data?.message || e?.message || "Failed to connect wallet",
      );
    } finally {
      setConnectLoading(false);
    }
  };

  const handlePersonal = (data: PersonalForm) => {
    setPersonal(data);
    setStep(2);
  };
  const handleEducation = (data: EducationForm) => {
    setEducation(data);
    setStep(3);
  };
  const handleWork = (isWorking: boolean, workData?: WorkForm) => {
    setWork({ isWorking, work: workData });
    setStep(4);
  };

  const handleFinish = async (skills: string[]) => {
    setSubmitLoading(true);
    setError("");
    try {
      const payload = {
        walletAddress,
        fullName: personal!.fullName,
        dateOfBirth: personal!.dateOfBirth,
        education: education!,
        isWorking: work!.isWorking,
        work: work!.work,
        skills,
      };

      try {
        if (!window.ethereum) throw new Error("No ethereum provider");
        const tx = await mockContract.registerUser(walletAddress);
        await tx.wait();
      } catch (e) {
        console.warn("Contract register failed, using mock", e);
        await mockContract.registerUser(walletAddress);
      }

      // 2. Save profile to backend
      const res = await api.post("/users/profile", payload);
      dispatch(setUserProfile(res.data.data));
      navigate("/home");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e?.response?.data?.message || "Onboarding failed. Please try again.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="onboarding-bg min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-3">
        <MonkeyLogo size={100} animated={isConnected} />
        {isConnected && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
            <span className="text-xs font-mono text-mint-400">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </span>
          </div>
        )}
      </div>
      {/* Step progress dots */}
      {isConnected && (
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`step-dot ${i + 1 === step ? "active" : i + 1 < step ? "done" : ""}`}
            />
          ))}
        </div>
      )}
      {/* Content area */}
      <div className="w-full flex flex-col items-center">
        {step === 0 && (
          <StepConnect onConnect={handleConnect} loading={connectLoading} />
        )}
        {step === 1 && <StepPersonal onNext={handlePersonal} />}
        {step === 2 && (
          <StepEducation onNext={handleEducation} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <StepWork onNext={handleWork} onBack={() => setStep(2)} />
        )}
        {step === 4 && (
          <StepSkills
            onFinish={handleFinish}
            onBack={() => setStep(3)}
            loading={submitLoading}
          />
        )}
      </div>
      {error && (
        <div
          className="mt-6 px-4 py-3 rounded-xl text-sm text-red-300 animate-fade-in"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default OnboardingPage;
