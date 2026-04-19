import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  CardGiftcard,
  VpnKey,
  AccountBalanceWallet,
  Warning,
  History,
  Download,
} from "@mui/icons-material";
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../web3/useWeb3";
import { toast } from "react-toastify";

// ── Shared styles ─────────────────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "rgba(255,255,255,0.03)",
    transition: "box-shadow 0.2s",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.25)",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
    },
  },
};

const shimmerBtnSx = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 600,
  position: "relative",
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: "1px",
    background: "linear-gradient(to right, transparent, #06b6d4, transparent)",
    opacity: 0,
    transition: "opacity 0.4s ease",
  },
  "&:hover::after": { opacity: 1 },
};

function GradientDivider() {
  return (
    <Box sx={{
      height: "1px",
      background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)",
      my: 1,
    }} />
  );
}

function SectionLabel({ icon, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
      {icon}
      <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
        {label}
      </Typography>
    </Box>
  );
}

// ── HR Treasury Panel ─────────────────────────────────────────────────
function HRTreasuryPanel({ contract }) {
  const [treasuryBalance, setTreasuryBalance] = useState(null);
  const [depositAmount, setDepositAmount]     = useState("");
  const [bonusAddress, setBonusAddress]       = useState("");
  const [bonusAmount, setBonusAmount]         = useState("");
  const [emergencyAmount, setEmergencyAmount] = useState("");
  const [taxVault, setTaxVault]               = useState("");

  const [loadingBalance,   setLoadingBalance]   = useState(false);
  const [loadingDeposit,   setLoadingDeposit]   = useState(false);
  const [loadingBonus,     setLoadingBonus]     = useState(false);
  const [loadingEmergency, setLoadingEmergency] = useState(false);
  const [loadingVault,     setLoadingVault]     = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      if (!contract) return;
      setLoadingBalance(true);
      const bal = await contract.treasuryBalance();
      setTreasuryBalance(ethers.formatEther(bal));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBalance(false);
    }
  }, [contract]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const handleDeposit = async () => {
    try {
      if (!depositAmount) return toast.warning("Enter deposit amount");
      setLoadingDeposit(true);
      const tx = await contract.depositTreasury({
        value: ethers.parseEther(depositAmount),
      });
      await tx.wait();
      toast.success(`Deposited ${depositAmount} HLUSD to vault`);
      setDepositAmount("");
      fetchBalance();
    } catch (err) {
      toast.error(err.reason || "Deposit failed");
    } finally {
      setLoadingDeposit(false);
    }
  };

  const handlePayBonus = async () => {
    try {
      if (!bonusAddress || !bonusAmount)
        return toast.warning("Fill employee address and bonus amount");
      setLoadingBonus(true);
      const tx = await contract.payBonus(bonusAddress, {
        value: ethers.parseEther(bonusAmount),
      });
      await tx.wait();
      toast.success(`Bonus of ${bonusAmount} HLUSD sent!`);
      setBonusAddress(""); setBonusAmount("");
      fetchBalance();
    } catch (err) {
      toast.error(err.reason || "Failed to send bonus");
    } finally {
      setLoadingBonus(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    try {
      if (!emergencyAmount) return toast.warning("Enter withdrawal amount");
      setLoadingEmergency(true);
      const tx = await contract.emergencyWithdraw(
        ethers.parseEther(emergencyAmount)
      );
      await tx.wait();
      toast.success(`Emergency withdrawal of ${emergencyAmount} HLUSD complete`);
      setEmergencyAmount("");
      fetchBalance();
    } catch (err) {
      toast.error(err.reason || "Emergency withdrawal failed");
    } finally {
      setLoadingEmergency(false);
    }
  };

  const handleUpdateTaxVault = async () => {
    try {
      if (!taxVault) return toast.warning("Enter a vault address");
      setLoadingVault(true);
      const tx = await contract.updateTaxVault(taxVault);
      await tx.wait();
      toast.success("Tax vault updated!");
      setTaxVault("");
    } catch (err) {
      toast.error(err.reason || "Failed to update vault");
    } finally {
      setLoadingVault(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 620 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} letterSpacing={-0.5} gutterBottom>
          Management Functions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage vault funds, pay bonuses, and configure settings.
        </Typography>
      </Box>

      {/* Balance card */}
      <Box sx={{
        p: 3, mb: 3, borderRadius: 3,
        border: "1px solid rgba(99,102,241,0.25)",
        bgcolor: "rgba(99,102,241,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Box>
          <Typography variant="overline" color="text.disabled" fontSize="0.65rem" letterSpacing={1.5}>
            Vault Balance
          </Typography>
          <Typography variant="h4" fontWeight={700} fontFamily="monospace" color="primary.main">
            {loadingBalance
              ? <CircularProgress size={28} />
              : `${treasuryBalance ?? "—"} HLUSD`}
          </Typography>
        </Box>
        <Button
          variant="outlined" size="small"
          onClick={fetchBalance}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      <Stack spacing={3}>

        {/* Pay Bonus */}
        <Box sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <SectionLabel
            icon={<CardGiftcard sx={{ fontSize: 16, color: "primary.main" }} />}
            label="Pay Instant Bonus"
          />
          <Stack spacing={1.5}>
            <TextField
              placeholder="Employee wallet address (0x...)"
              value={bonusAddress}
              onChange={(e) => setBonusAddress(e.target.value)}
              fullWidth size="small" sx={inputSx}
            />
            <TextField
              placeholder="Bonus amount"
              value={bonusAmount}
              onChange={(e) => setBonusAmount(e.target.value)}
              fullWidth size="small" sx={inputSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.disabled">HLUSD</Typography>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained" fullWidth
              onClick={handlePayBonus}
              disabled={loadingBonus}
              startIcon={loadingBonus ? <CircularProgress size={14} color="inherit" /> : <CardGiftcard />}
              sx={shimmerBtnSx}
            >
              {loadingBonus ? "Sending..." : "Send Bonus →"}
            </Button>
          </Stack>
        </Box>

        {/* Emergency Withdraw */}
        <Box sx={{
          p: 3, borderRadius: 3,
          border: "1px solid rgba(239,68,68,0.25)",
          bgcolor: "rgba(239,68,68,0.03)",
        }}>
          <SectionLabel
            icon={<Warning sx={{ fontSize: 16, color: "error.main" }} />}
            label="Emergency Withdraw"
          />
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 1.5 }}>
            Withdraws funds directly to the owner wallet. Use only in emergencies.
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <TextField
              placeholder="Amount"
              value={emergencyAmount}
              onChange={(e) => setEmergencyAmount(e.target.value)}
              size="small" sx={{ flex: 1, ...inputSx }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.disabled">HLUSD</Typography>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined" color="error"
              onClick={handleEmergencyWithdraw}
              disabled={loadingEmergency}
              startIcon={loadingEmergency ? <CircularProgress size={14} color="inherit" /> : <Warning />}
              sx={{
                ...shimmerBtnSx,
                whiteSpace: "nowrap",
                "&::after": {
                  content: '""', position: "absolute",
                  bottom: 0, left: 0, right: 0, height: "1px",
                  background: "linear-gradient(to right, transparent, #ef4444, transparent)",
                  opacity: 0, transition: "opacity 0.4s ease",
                },
              }}
            >
              {loadingEmergency ? "Withdrawing..." : "Emergency Withdraw"}
            </Button>
          </Stack>
        </Box>

        {/* Update Tax Vault */}
        <Box sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <SectionLabel
            icon={<VpnKey sx={{ fontSize: 16, color: "warning.main" }} />}
            label="Update Tax Vault"
          />
          <Stack direction="row" spacing={1.5}>
            <TextField
              placeholder="New vault address (0x...)"
              value={taxVault}
              onChange={(e) => setTaxVault(e.target.value)}
              size="small" sx={{ flex: 1, ...inputSx }}
            />
            <Button
              variant="outlined" color="warning"
              onClick={handleUpdateTaxVault}
              disabled={loadingVault}
              startIcon={loadingVault ? <CircularProgress size={14} color="inherit" /> : <VpnKey />}
              sx={{
                ...shimmerBtnSx,
                whiteSpace: "nowrap",
                "&::after": {
                  content: '""', position: "absolute",
                  bottom: 0, left: 0, right: 0, height: "1px",
                  background: "linear-gradient(to right, transparent, #f59e0b, transparent)",
                  opacity: 0, transition: "opacity 0.4s ease",
                },
              }}
            >
              {loadingVault ? "Updating..." : "Update"}
            </Button>
          </Stack>
        </Box>

      </Stack>
    </Box>
  );
}


// ── Main Export ───────────────────────────────────────────────────────
export default function Treasury() {
  const { contract, account } = useWeb3();
  const [hrWallet, setHrWallet]   = useState(null);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        if (!contract) return;
        const owner = await contract.owner();
        setHrWallet(owner);
      } catch (err) {
        console.error(err);
      } finally {
        setResolving(false);
      }
    };
    fetchOwner();
  }, [contract]);

  if (!account) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Box sx={{
          textAlign: "center", p: 5, borderRadius: 3,
          border: "1px solid", borderColor: "divider",
          bgcolor: "background.paper", maxWidth: 400,
        }}>
          <AccountBalanceWallet sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>No Wallet Connected</Typography>
          <Typography variant="body2" color="text.secondary">
            Connect your wallet to continue.
          </Typography>
        </Box>
      </Box>
    );
  }

  if (resolving) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

const isHR = hrWallet && account.toLowerCase() === hrWallet.toLowerCase();

  if (!isHR) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Box sx={{
          textAlign: "center", p: 5, borderRadius: 3,
          border: "1px solid", borderColor: "divider",
          bgcolor: "background.paper", maxWidth: 440,
        }}>
          <Warning sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This page is only accessible to the contract owner.
          </Typography>
          <Chip
            label={`${account.slice(0, 6)}...${account.slice(-4)}`}
            variant="outlined"
            sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
          />
        </Box>
      </Box>
    );
  }

  return <HRTreasuryPanel contract={contract} />;
}