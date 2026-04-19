# How We Used Requestly

PayStream has two API surfaces that need testing: a REST-based gasless relayer and JSON-RPC calls to smart contracts on HeLa Testnet. Requestly let us build, organize, and run tests against both from a single API client.

We set up **27 requests across 7 folders** covering relayer endpoints, contract reads, ERC-20 token checks, network validation, end-to-end chained workflows, performance benchmarks, and schema validation. Two environment configs (HeLa Testnet and Local Hardhat) let us switch targets with one click.

## The Feature That Helped Most: AI Test Suggestions

Our test suite was failing intermittently with errors that were hard to trace. Requestly's AI feature analyzed the failing requests and **suggested corrected test cases with a single click**. Instead of manually debugging assertion logic and response schemas, the AI identified what was wrong and generated proper test scripts. This saved us significant debugging time and gave us confidence that our 60+ post-response assertions were actually correct.

## Impact

- **Caught a real bug**: Response comparison between `treasuryBalance()` and `currentBalance()` revealed a yield accrual timing mismatch in YieldVault.
- **Faster iteration**: One-click environment switching between local Hardhat and HeLa Testnet cut time per deploy-test cycle.
- **Hardened the relayer**: Negative tests (auth failures, missing fields, expired deadlines) ensured the relayer handled edge cases before frontend integration.
- **Informed UX decisions**: Latency benchmarking showed variable RPC response times (200ms-2s), which shaped our frontend loading states.
