import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Chip,
  Grid,
} from "@mui/material";
import {
  AccountBalanceWallet,
  DownloadDone,
  Block,
  CalendarToday,
  Timer,
  Percent,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../web3/useWeb3";
import { toast } from "react-toastify";

function GradientDivider() {
  return (
    <Box
      sx={{
        height: "1px",
        background:
          "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)",
        my: 1,
      }}
    />
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Box sx={{ color: "text.disabled", display: "flex" }}>{icon}</Box>
        <Typography variant="overline" color="text.disabled" fontSize="0.6rem" letterSpacing={1.2}>
          {label}
        </Typography>
      </Box>
      <Typography variant="body2" fontFamily="monospace" fontWeight={600} sx={{ wordBreak: "break-all" }}>
        {value ?? <CircularProgress size={12} />}
      </Typography>
    </Box>
  );
}

export default function Employee() {
  const { contract, account } = useWeb3();

  const [earned, setEarned] = useState("0");
  const [streamInfo, setStreamInfo] = useState(null);
  const [hrWallet, setHrWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false);

  // ── Fetch owner once ──────────────────────────────────────────────
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        if (!contract) return;
        const owner = await contract.owner();
        setHrWallet(owner);
      } catch (err) {
        console.error("Failed to fetch owner:", err);
      }
    };
    fetchOwner();
  }, [contract]);

  // ── Fetch stream info once (static data) ─────────────────────────
  useEffect(() => {
const fetchStreamInfo = async () => {
  try {
    if (!contract || !account) return;

    setStreamLoading(true);

    const stream = await contract.streams(account);

    setStreamInfo({
      active: stream.active,
      monthlySalary: ethers.formatEther(stream.monthlySalary),
      startTime: new Date(Number(stream.startTime) * 1000).toLocaleString(),
      endTime: new Date(Number(stream.endTime) * 1000).toLocaleString(),
      cliffDuration: `${Number(stream.cliffDuration) / 3600} hours`,
      taxPercent: `${stream.taxPercent.toString()}%`,
    });

  } catch (err) {
    console.error("Failed to fetch stream info:", err);
  } finally {
    setStreamLoading(false);
  }
};

    fetchStreamInfo();
  }, [contract, account]);

  // ── Poll only earned every 5s ─────────────────────────────────────
  const fetchEarned = async () => {
    try {
      if (!contract || !account) return;
      setChecking(true);
      const amount = await contract.earned(account);
      setEarned(ethers.formatUnits(amount, 18));
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    fetchEarned();
    const interval = setInterval(fetchEarned, 5000);
    return () => clearInterval(interval);
  }, [contract, account]);

  // ── Withdraw ──────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    try {
      if (!contract) return;
      setLoading(true);
      const tx = await contract.withdraw();
      await tx.wait();
      toast.success("Withdrawal Successful!");
      fetchEarned();
    } catch (err) {
      console.error(err);
      toast.error("Withdrawal Failed");
    } finally {
      setLoading(false);
    }
  };

  // ── No wallet ─────────────────────────────────────────────────────
  if (!account) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Box
          sx={{
            textAlign: "center",
            p: 5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            maxWidth: 400,
          }}
        >
          <AccountBalanceWallet sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No Wallet Connected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect your wallet to access the employee portal.
          </Typography>
        </Box>
      </Box>
    );
  }

  // ── HR wallet ─────────────────────────────────────────────────────
  if (hrWallet && account.toLowerCase() === hrWallet.toLowerCase()) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Box
          sx={{
            textAlign: "center",
            p: 5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            maxWidth: 440,
          }}
        >
          <Block sx={{ fontSize: 48, color: "warning.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            HR Account Detected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            This wallet is registered as the HR administrator. The employee
            portal is not available for admin accounts.
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

  // ── Employee view ─────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} letterSpacing={-0.5} gutterBottom>
          Employee Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and withdraw your earned salary in real time.
        </Typography>
      </Box>

      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0 4px 40px rgba(0,0,0,0.08)",
          p: { xs: 3, md: 4 },
        }}
      >
        <Stack spacing={2.5}>

          {/* Connected wallet */}
          <Box>
            <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
              Connected Wallet
            </Typography>
            <Box
              sx={{
                mt: 1,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main", flexShrink: 0 }} />
              <Typography variant="body2" fontFamily="monospace" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                {account}
              </Typography>
            </Box>
          </Box>

          <GradientDivider />

          {/* Stream details grid — fetched once */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
                Stream Details
              </Typography>
              {streamInfo && (
                <Chip
                  label={streamInfo.active ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    bgcolor: streamInfo.active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                    color: streamInfo.active ? "success.main" : "error.main",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </Box>

            {streamLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : streamInfo ? (
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <InfoTile
                    icon={<CalendarToday sx={{ fontSize: 14 }} />}
                    label="Monthly Salary"
                    value={`${streamInfo.monthlySalary} HLUSD`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoTile
                    icon={<Percent sx={{ fontSize: 14 }} />}
                    label="Tax"
                    value={streamInfo.taxPercent}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoTile
                    icon={<Timer sx={{ fontSize: 14 }} />}
                    label="Start Time"
                    value={streamInfo.startTime}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoTile
                    icon={<Timer sx={{ fontSize: 14 }} />}
                    label="End Time"
                    value={streamInfo.endTime}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InfoTile
                    icon={<Timer sx={{ fontSize: 14 }} />}
                    label="Cliff Duration"
                    value={streamInfo.cliffDuration}
                  />
                </Grid>
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active stream found for this wallet.
              </Typography>
            )}
          </Box>

          <GradientDivider />

          {/* Earned — polls every 5s */}
          <Box>
            <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
              Earned Salary
            </Typography>
            <Box
              sx={{
                mt: 1.5,
                p: 3,
                borderRadius: 2,
                bgcolor: "rgba(99,102,241,0.07)",
                border: "1px solid rgba(99,102,241,0.2)",
                textAlign: "center",
                wordBreak: "break-all",
              }}
            >
              {checking && earned === "0" ? (
                <CircularProgress size={28} />
              ) : (
                <>
                  <Typography variant="h5" fontWeight={700} letterSpacing={-0.5} color="primary.main" fontFamily="monospace">
                    {earned}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" letterSpacing={2}>
                    HLUSD
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <GradientDivider />

          {/* Withdraw */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadDone />}
            onClick={handleWithdraw}
            disabled={loading || Number(earned) === 0}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              py: 1.4,
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
            }}
          >
            {loading ? "Withdrawing..." : Number(earned) === 0 ? "Nothing to Withdraw" : "Withdraw Salary →"}
          </Button>

        </Stack>
      </Box>
    </Box>
  );
}