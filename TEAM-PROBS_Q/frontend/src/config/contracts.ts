import { defineChain } from "viem";

// ─── HeLa Testnet Chain Definition ──────────────────────────────────────────
export const helaTestnet = defineChain({
    id: 666888,
    name: "HeLa Testnet",
    nativeCurrency: { name: "HLUSD", symbol: "HLUSD", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://testnet-rpc.helachain.com"] },
    },
    blockExplorers: {
        default: {
            name: "HeLa Explorer",
            url: "https://testnet-blockexplorer.helachain.com",
            apiUrl: "https://testnet-blockexplorer.helachain.com/api",
        },
    },
    testnet: true,
});

import deployedAddresses from "./deployed-addresses.json";

// ─── Contract Addresses ─────────────────────────────────────────────────────
// Deployed to HeLa Testnet (Dynamically imported)
export const CONTRACTS = {
    HLUSD: deployedAddresses.hlusd as `0x${string}`,
    TAX_VAULT: deployedAddresses.taxVault as `0x${string}`,
    TREASURY: deployedAddresses.treasury as `0x${string}`,
    PAY_STREAM: deployedAddresses.payStream as `0x${string}`,
};

// ─── ABIs ───────────────────────────────────────────────────────────────────
export const HLUSD_ABI = [
    {
        type: "function",
        name: "balanceOf",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "approve",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "allowance",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
    },
] as const;

export const TREASURY_ABI = [
    {
        type: "function",
        name: "deposit",
        inputs: [{ name: "amount", type: "uint256" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "getBalance",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getRequiredFunding",
        inputs: [{ name: "totalAmounts", type: "uint256[]" }],
        outputs: [{ name: "total", type: "uint256" }],
        stateMutability: "pure",
    },
] as const;

export const TAX_VAULT_ABI = [
    {
        type: "function",
        name: "getBalance",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "totalReceived",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
] as const;

export const PAYSTREAM_ABI = [
    // Admin
    {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "isHR",
        inputs: [{ name: "", type: "address" }],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "grantHR",
        inputs: [{ name: "hr", type: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "revokeHR",
        inputs: [{ name: "hr", type: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "defaultTaxBps",
        inputs: [],
        outputs: [{ name: "", type: "uint16" }],
        stateMutability: "view",
    },
    // Stream creation
    {
        type: "function",
        name: "createStream",
        inputs: [
            { name: "employee", type: "address" },
            { name: "totalAmount", type: "uint256" },
            { name: "start", type: "uint64" },
            { name: "end", type: "uint64" },
            { name: "_taxBps", type: "uint16" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "batchCreateStreams",
        inputs: [
            { name: "_employees", type: "address[]" },
            { name: "totalAmounts", type: "uint256[]" },
            { name: "starts", type: "uint64[]" },
            { name: "ends", type: "uint64[]" },
            { name: "taxBpsList", type: "uint16[]" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
    },
    // Management
    {
        type: "function",
        name: "pauseStream",
        inputs: [{ name: "employee", type: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "resumeStream",
        inputs: [{ name: "employee", type: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        name: "cancelStream",
        inputs: [{ name: "employee", type: "address" }],
        outputs: [],
        stateMutability: "nonpayable",
    },
    // Employee
    {
        type: "function",
        name: "withdraw",
        inputs: [],
        outputs: [],
        stateMutability: "nonpayable",
    },
    // Views
    {
        type: "function",
        name: "getStream",
        inputs: [{ name: "employee", type: "address" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "employee", type: "address" },
                    { name: "status", type: "uint8" },
                    { name: "taxBps", type: "uint16" },
                    { name: "startTime", type: "uint64" },
                    { name: "endTime", type: "uint64" },
                    { name: "pausedAt", type: "uint64" },
                    { name: "totalPaused", type: "uint64" },
                    { name: "ratePerSecond", type: "uint256" },
                    { name: "deposited", type: "uint256" },
                    { name: "withdrawn", type: "uint256" },
                    { name: "remainder", type: "uint256" },
                ],
            },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "earned",
        inputs: [{ name: "employee", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "withdrawable",
        inputs: [{ name: "employee", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getEmployees",
        inputs: [],
        outputs: [{ name: "", type: "address[]" }],
        stateMutability: "view",
    },
    {
        type: "function",
        name: "getEmployeeCount",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
    },
    // Events
    {
        type: "event",
        name: "StreamCreated",
        inputs: [
            { name: "employee", type: "address", indexed: true },
            { name: "totalAmount", type: "uint256", indexed: false },
            { name: "startTime", type: "uint64", indexed: false },
            { name: "endTime", type: "uint64", indexed: false },
            { name: "ratePerSecond", type: "uint256", indexed: false },
            { name: "remainder", type: "uint256", indexed: false },
            { name: "taxBps", type: "uint16", indexed: false },
        ],
    },
    {
        type: "event",
        name: "StreamPaused",
        inputs: [
            { name: "employee", type: "address", indexed: true },
            { name: "pausedAt", type: "uint64", indexed: false },
        ],
    },
    {
        type: "event",
        name: "StreamResumed",
        inputs: [
            { name: "employee", type: "address", indexed: true },
            { name: "resumedAt", type: "uint64", indexed: false },
            { name: "totalPaused", type: "uint64", indexed: false },
        ],
    },
    {
        type: "event",
        name: "StreamCanceled",
        inputs: [
            { name: "employee", type: "address", indexed: true },
            { name: "earnedAtCancel", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "Withdrawn",
        inputs: [
            { name: "employee", type: "address", indexed: true },
            { name: "net", type: "uint256", indexed: false },
            { name: "tax", type: "uint256", indexed: false },
        ],
    },
] as const;
