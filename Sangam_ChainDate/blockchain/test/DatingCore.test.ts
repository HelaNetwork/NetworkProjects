import { expect } from "chai";
import { ethers } from "hardhat";
import { DatingCore, EscrowContent, MockZKVerifier } from "../typechain-types";

describe("Sangam — Smart Contracts", () => {
  let zkVerifier: MockZKVerifier;
  let datingCore: DatingCore;
  let escrow: EscrowContent;
  let owner: any, alice: any, bob: any, carol: any;

  const SWIPE_FEE = ethers.parseEther("0.001");
  const MSG_FEE   = ethers.parseEther("0.0005");

  // Mock ZK proof data
  const validProof   = ethers.toUtf8Bytes("valid_proof_data");
  const invalidProof = new Uint8Array(0); // empty
  const validSignals = [1n, 3n]; // ageValid=1, interestOverlap=3
  const badSignals   = [0n, 0n]; // ageValid=0 (underage)

  before(async () => {
    [owner, alice, bob, carol] = await ethers.getSigners();

    const ZKFactory = await ethers.getContractFactory("MockZKVerifier");
    zkVerifier = await ZKFactory.deploy();

    const CoreFactory = await ethers.getContractFactory("DatingCore");
    datingCore = await CoreFactory.deploy(await zkVerifier.getAddress());

    const EscrowFactory = await ethers.getContractFactory("EscrowContent");
    escrow = await EscrowFactory.deploy();
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe("MockZKVerifier", () => {
    it("returns true for valid proof + signals", async () => {
      const result = await zkVerifier.verifyProofView(validProof, validSignals);
      expect(result).to.be.true;
    });

    it("returns false for empty proof", async () => {
      const result = await zkVerifier.verifyProofView(invalidProof, validSignals);
      expect(result).to.be.false;
    });

    it("returns false for invalid signals (underage)", async () => {
      const result = await zkVerifier.verifyProofView(validProof, badSignals);
      expect(result).to.be.false;
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe("DatingCore — Profile Registration", () => {
    it("allows profile registration with interests", async () => {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("alice_profile_v1"));
      await expect(
        datingCore.connect(alice).registerProfile(hash, [1, 2, 3])
      ).to.emit(datingCore, "ProfileRegistered").withArgs(alice.address, hash);

      const profile = await datingCore.profiles(alice.address);
      expect(profile.active).to.be.true;
      expect(profile.encryptedHash).to.equal(hash);
    });

    it("allows overwriting an existing profile", async () => {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("alice_profile_v2"));
      await datingCore.connect(alice).registerProfile(hash, [1, 5]);
      const profile = await datingCore.profiles(alice.address);
      expect(profile.encryptedHash).to.equal(hash);
    });

    it("reverts with more than 10 interests", async () => {
      const hash = ethers.keccak256(ethers.toUtf8Bytes("bad_profile"));
      await expect(
        datingCore.connect(alice).registerProfile(hash, [1,2,3,4,5,6,7,8,9,10,11])
      ).to.be.revertedWith("DatingCore: max 10 interests");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe("DatingCore — Swiping", () => {
    before(async () => {
      // Register Bob's profile
      const bobHash = ethers.keccak256(ethers.toUtf8Bytes("bob_profile"));
      await datingCore.connect(bob).registerProfile(bobHash, [1, 2, 5]);
    });

    it("reverts when swipe fee is too low", async () => {
      await expect(
        datingCore.connect(alice).swipe(bob.address, true, validProof, validSignals, {
          value: ethers.parseEther("0.0001"),
        })
      ).to.be.revertedWith("DatingCore: insufficient swipe fee");
    });

    it("reverts when ZK proof is invalid", async () => {
      await expect(
        datingCore.connect(alice).swipe(bob.address, true, invalidProof, badSignals, {
          value: SWIPE_FEE,
        })
      ).to.be.revertedWith("DatingCore: ZK proof invalid");
    });

    it("accepts a valid swipe (alice likes bob)", async () => {
      await expect(
        datingCore.connect(alice).swipe(bob.address, true, validProof, validSignals, {
          value: SWIPE_FEE,
        })
      ).to.emit(datingCore, "SwipeRecorded").withArgs(alice.address, bob.address, true);
    });

    it("reverts on duplicate swipe", async () => {
      await expect(
        datingCore.connect(alice).swipe(bob.address, true, validProof, validSignals, {
          value: SWIPE_FEE,
        })
      ).to.be.revertedWith("DatingCore: already swiped");
    });

    it("emits MatchFound when mutual like occurs (bob likes alice back)", async () => {
      const bobHash = ethers.keccak256(ethers.toUtf8Bytes("bob_profile"));
      // re-register to ensure profile active
      await datingCore.connect(bob).registerProfile(bobHash, [1, 2, 5]);
      await expect(
        datingCore.connect(bob).swipe(alice.address, true, validProof, validSignals, {
          value: SWIPE_FEE,
        })
      ).to.emit(datingCore, "MatchFound");

      expect(await datingCore.isMatched(alice.address, bob.address)).to.be.true;
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe("DatingCore — Messaging", () => {
    it("allows matched users to send messages", async () => {
      const bobBefore = await ethers.provider.getBalance(bob.address);
      await expect(
        datingCore.connect(alice).sendMessage(bob.address, { value: MSG_FEE })
      ).to.emit(datingCore, "MessageSent");
    });

    it("reverts if users are not matched", async () => {
      const carolHash = ethers.keccak256(ethers.toUtf8Bytes("carol_profile"));
      await datingCore.connect(carol).registerProfile(carolHash, [7, 8]);
      await expect(
        datingCore.connect(alice).sendMessage(carol.address, { value: MSG_FEE })
      ).to.be.revertedWith("DatingCore: not matched");
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe("EscrowContent", () => {
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes("exclusive_video_cid"));
    const price = ethers.parseEther("0.01");
    let listingId: bigint;

    it("creator can list content", async () => {
      const tx = await escrow.connect(alice).listContent(contentHash, price);
      const receipt = await tx.wait();
      const event = receipt?.logs
        .map((l) => escrow.interface.parseLog(l))
        .find((e) => e?.name === "ContentListed");
      expect(event).to.not.be.undefined;
      listingId = event!.args.listingId;
    });

    it("buyer can unlock content with correct payment", async () => {
      await expect(
        escrow.connect(bob).unlockContent(listingId, { value: price })
      ).to.emit(escrow, "ContentUnlocked");

      expect(await escrow.hasUnlocked(listingId, bob.address)).to.be.true;
    });

    it("reverts on double unlock", async () => {
      await expect(
        escrow.connect(bob).unlockContent(listingId, { value: price })
      ).to.be.revertedWith("EscrowContent: already unlocked");
    });

    it("reverts with insufficient payment", async () => {
      await expect(
        escrow.connect(carol).unlockContent(listingId, { value: ethers.parseEther("0.001") })
      ).to.be.revertedWith("EscrowContent: insufficient payment");
    });
  });
});

