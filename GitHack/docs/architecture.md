# PayStream Architecture

## System Overview

PayStream is a decentralized payroll streaming system built on EVM-compatible blockchains. Employers stream ERC-20 salaries per-second, employees withdraw anytime, and a configurable percentage (default 10%) is automatically deducted as tax to a vault.

## System Diagram

```mermaid
graph TB
    subgraph Frontend
        HR["HR Dashboard<br/>(Vite + React)"]
        EMP["Employee Portal<br/>(Vite + React)"]
    end

    subgraph Smart Contracts
        PS["PayStream.sol<br/>AccessControl + ReentrancyGuard"]
        TV["TaxVault.sol<br/>Ownable"]
        SM["StreamMath.sol<br/>Pure Library"]
        MT["MockToken.sol<br/>ERC-20"]
    end

    HR -->|"createStream / pause / cancel / fund"| PS
    EMP -->|"withdraw / calculateAccrued"| PS
    PS -->|"splitTax()"| SM
    PS -->|"safeTransfer (employee share)"| MT
    PS -->|"deposit (tax share)"| TV
    TV -->|"holds tax tokens"| MT

    style PS fill:#6366f1,color:#fff
    style TV fill:#8b5cf6,color:#fff
    style SM fill:#a855f7,color:#fff
    style MT fill:#10b981,color:#fff
```

## Data Flow

```mermaid
sequenceDiagram
    participant HR as HR Manager
    participant PS as PayStream
    participant SM as StreamMath
    participant TV as TaxVault
    participant EMP as Employee

    HR->>PS: createStream(employee, ratePerSecond)
    Note over PS: Store Stream struct, emit StreamCreated

    HR->>PS: fundContract(amount)
    Note over PS: transferFrom HR → contract treasury

    EMP->>PS: withdraw(streamId)
    PS->>SM: calculateAccrued(rate, elapsed)
    PS->>SM: splitTax(gross, basisPoints)
    PS->>EMP: safeTransfer(employeeShare)
    PS->>TV: deposit(taxShare)
    Note over TV: Tax collected and held
```

## Contract Architecture

| Contract | Inherits | Purpose |
|----------|----------|---------|
| `PayStream.sol` | AccessControl, ReentrancyGuard | Main streaming logic, stream CRUD, withdrawals |
| `TaxVault.sol` | Ownable | Holds tax deductions, admin-only withdrawals |
| `StreamMath.sol` | — (library) | Pure math: `calculateAccrued`, `splitTax` |
| `MockToken.sol` | ERC20 | Test token for local development |
| `IPayStream.sol` | — (interface) | Contract interface with all external functions |

## Tax Model

- Tax is stored as **basis points** (1 bp = 0.01%)
- Default: **1000 bp = 10%**
- On every withdrawal:
  - `taxShare = (grossAmount × taxBasisPoints) / 10000`
  - `employeeShare = grossAmount − taxShare`
- Admin can update via `setTaxRate(newBasisPoints)`

## Security

- **AccessControl**: `HR_ROLE` for stream management, `DEFAULT_ADMIN_ROLE` for tax config
- **ReentrancyGuard**: Protects `withdraw()` against reentrancy
- **Checks-Effects-Interactions**: State updated before external calls
- **SafeERC20**: All token transfers use OZ SafeERC20 wrappers
- **Input validation**: Zero-address checks, zero-amount checks, bounds checks
