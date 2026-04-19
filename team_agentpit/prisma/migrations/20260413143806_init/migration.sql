-- CreateEnum
CREATE TYPE "public"."AgentType" AS ENUM ('strategy', 'user');

-- CreateEnum
CREATE TYPE "public"."ProposalStatus" AS ENUM ('pending', 'executed', 'rejected');

-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('relayed', 'simulated');

-- CreateTable
CREATE TABLE "public"."Agent" (
    "id" TEXT NOT NULL,
    "type" "public"."AgentType" NOT NULL,
    "address" TEXT NOT NULL,
    "registryAgentId" TEXT,
    "agentUri" TEXT,
    "identityCid" TEXT,
    "identityGatewayUrl" TEXT,
    "identityUploadSource" TEXT,
    "identityDocument" JSONB,
    "verifiedWallet" TEXT,
    "identityTxHash" TEXT,
    "skills" JSONB NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "registeredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Proposal" (
    "id" TEXT NOT NULL,
    "vault" TEXT NOT NULL,
    "proposerAgentId" TEXT NOT NULL,
    "proposerAddress" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "expectedApyBps" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "marketSnapshot" JSONB NOT NULL,
    "protocolPlan" JSONB NOT NULL,
    "calls" JSONB NOT NULL,
    "status" "public"."ProposalStatus" NOT NULL DEFAULT 'pending',
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Execution" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "vault" TEXT NOT NULL,
    "userAgentId" TEXT NOT NULL,
    "approval" JSONB NOT NULL,
    "status" "public"."ExecutionStatus" NOT NULL,
    "txHash" TEXT NOT NULL,
    "executionMode" TEXT NOT NULL,
    "amountDeployed" TEXT,
    "notes" JSONB NOT NULL,
    "relayNotes" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "registryAgentId" TEXT NOT NULL,
    "reviewerAgentId" TEXT,
    "reviewerAddress" TEXT,
    "score" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "comment" TEXT,
    "txHash" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VaultSignal" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "vaultAddress" TEXT NOT NULL,
    "assetAddress" TEXT NOT NULL,
    "assetSymbol" TEXT NOT NULL,
    "fundedAmount" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userAgentId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultSignal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_registryAgentId_key" ON "public"."Agent"("registryAgentId");

-- CreateIndex
CREATE INDEX "Agent_address_idx" ON "public"."Agent"("address");

-- CreateIndex
CREATE INDEX "Agent_registryAgentId_idx" ON "public"."Agent"("registryAgentId");

-- CreateIndex
CREATE INDEX "Proposal_vault_createdAt_idx" ON "public"."Proposal"("vault", "createdAt");

-- CreateIndex
CREATE INDEX "Execution_proposalId_createdAt_idx" ON "public"."Execution"("proposalId", "createdAt");

-- CreateIndex
CREATE INDEX "Feedback_registryAgentId_createdAt_idx" ON "public"."Feedback"("registryAgentId", "createdAt");

-- CreateIndex
CREATE INDEX "VaultSignal_ownerAddress_createdAt_idx" ON "public"."VaultSignal"("ownerAddress", "createdAt");

-- CreateIndex
CREATE INDEX "VaultSignal_vaultAddress_createdAt_idx" ON "public"."VaultSignal"("vaultAddress", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."Proposal" ADD CONSTRAINT "Proposal_proposerAgentId_fkey" FOREIGN KEY ("proposerAgentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Execution" ADD CONSTRAINT "Execution_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "public"."Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_registryAgentId_fkey" FOREIGN KEY ("registryAgentId") REFERENCES "public"."Agent"("registryAgentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_reviewerAgentId_fkey" FOREIGN KEY ("reviewerAgentId") REFERENCES "public"."Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
