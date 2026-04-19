// import {
//   Box,
//   Typography,
//   Paper,
//   TextField,
//   Button,
//   Stack,
//   CircularProgress,
//   Divider,
// } from "@mui/material";
// import { useState } from "react";
// import { ethers } from "ethers";
// import { useWeb3 } from "../web3/useWeb3";
// import { toast } from "react-toastify";

// export default function Streams() {
//   const { contract, isOwner } = useWeb3();

//   const [employee, setEmployee] = useState("");
//   const [salary, setSalary] = useState("");
//   const [tax, setTax] = useState("");
//   const [earnedAmount, setEarnedAmount] = useState("");
//   const [loading, setLoading] = useState(false);

//   // =========================
//   // Start Stream
//   // =========================
//   const handleStartStream = async () => {
//     try {
//       if (!contract) return;
//       if (!employee || !salary || tax === "")
//         return toast.warning("Fill all fields");

//       setLoading(true);

//       const parsedSalary = ethers.parseUnits(salary, 18);

//       const tx = await contract.startStream(
//         employee,
//         parsedSalary,
//         Number(tax)
//       );

//       await tx.wait();

//       toast.success("Stream Started Successfully!");
//       setEmployee("");
//       setSalary("");
//       setTax("");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to start stream");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // Pause Stream
//   // =========================
//   const handlePause = async () => {
//     try {
//       if (!contract || !employee)
//         return toast.warning("Enter employee address");

//       setLoading(true);

//       const tx = await contract.pauseStream(employee);
//       await tx.wait();

//       toast.success("Stream Paused");
//     } catch (err) {
//       console.error(err);
//       toast.error("Pause Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // Cancel Stream
//   // =========================
//   const handleCancel = async () => {
//     try {
//       if (!contract || !employee)
//         return toast.warning("Enter employee address");

//       setLoading(true);

//       const tx = await contract.cancelStream(employee);
//       await tx.wait();

//       toast.success("Stream Cancelled");
//     } catch (err) {
//       console.error(err);
//       toast.error("Cancel Failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // Check Earned
//   // =========================
//   const handleCheckEarned = async () => {
//     try {
//       if (!contract || !employee)
//         return toast.warning("Enter employee address");

//       const amount = await contract.earned(employee);
//       setEarnedAmount(ethers.formatUnits(amount, 18));
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch earned amount");
//     }
//   };

//   if (!isOwner) {
//     return (
//       <Typography color="error">
//         Only contract owner can manage streams.
//       </Typography>
//     );
//   }

//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         Stream Management
//       </Typography>

//       <Paper sx={{ p: 4 }}>
//         <Stack spacing={3}>
//           <TextField
//             label="Employee Address"
//             value={employee}
//             onChange={(e) => setEmployee(e.target.value)}
//             fullWidth
//           />

//           <Divider />

//           <TextField
//             label="Monthly Salary (HLUSD)"
//             value={salary}
//             onChange={(e) => setSalary(e.target.value)}
//             fullWidth
//           />

//           <TextField
//             label="Tax Percentage"
//             value={tax}
//             onChange={(e) => setTax(e.target.value)}
//             fullWidth
//           />

//           <Button
//             variant="contained"
//             onClick={handleStartStream}
//             disabled={loading}
//           >
//             {loading ? <CircularProgress size={24} /> : "Start Stream"}
//           </Button>

//           <Divider />

//           <Button
//             variant="outlined"
//             color="warning"
//             onClick={handlePause}
//             disabled={loading}
//           >
//             Pause Stream
//           </Button>

//           <Button
//             variant="outlined"
//             color="error"
//             onClick={handleCancel}
//             disabled={loading}
//           >
//             Cancel Stream
//           </Button>

//           <Divider />

//           <Button variant="outlined" onClick={handleCheckEarned}>
//             Check Earned Amount
//           </Button>

//           {earnedAmount && (
//             <Typography>
//               Earned: <strong>{earnedAmount} HLUSD</strong>
//             </Typography>
//           )}
//         </Stack>
//       </Paper>
//     </Box>
//   );
// }

import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Divider,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  PlayArrow,
  PauseCircle,
  CancelOutlined,
  SearchOutlined,
  LockClock,
} from "@mui/icons-material";
import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../web3/useWeb3";
import { toast } from "react-toastify";

// ── Aceternity-style bottom shimmer on hover ──────────────────────────
function ShimmerButton({ children, sx = {}, ...props }) {
  return (
    <Button
      {...props}
      sx={{
        position: "relative",
        overflow: "hidden",
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 2,
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(to right, transparent, #06b6d4, transparent)",
          opacity: 0,
          transition: "opacity 0.4s ease",
        },
        "&:hover::after": { opacity: 1 },
        ...sx,
      }}
    >
      {children}
    </Button>
  );
}

// ── Gradient divider (Aceternity style) ──────────────────────────────
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

export default function Streams() {
  const { contract, isOwner } = useWeb3();

  const [employee, setEmployee] = useState("");
  const [salary, setSalary] = useState("");
  const [tax, setTax] = useState("");
  const [earnedAmount, setEarnedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [durationMonths, setDurationMonths] = useState("");
  const [cliffMonths, setCliffMonths] = useState("");

  const startLoading = (action) => {
    setLoading(true);
    setLoadingAction(action);
  };
  const stopLoading = () => {
    setLoading(false);
    setLoadingAction("");
  };

  console.log("Employee value:", employee);
  console.log("Is valid address:", ethers.isAddress(employee));

  const handleStartStream = async () => {
    try {
      if (!contract) return;

      if (!employee || !salary || tax === "" || !durationMonths)
        return toast.warning("Fill all required fields");

      if (Number(tax) > 50)
        return toast.error("Tax cannot exceed 50%");

      startLoading("start");

      const parsedSalary = ethers.parseUnits(salary, 18);

      // Convert months (string like "0.01") into seconds safely
      const secondsPerMonth = 30n * 24n * 60n * 60n; // 2592000

      // Convert months to 18 decimal precision
      const monthsScaled = ethers.parseUnits(durationMonths, 18);

      // Now calculate seconds safely
      const durationSeconds =
        (monthsScaled * secondsPerMonth) / 10n**18n;

      const cliffSeconds = cliffMonths
        ? (ethers.parseUnits(cliffMonths, 18) * secondsPerMonth) / 10n**18n
        : 0n;


      const stream = await contract.streams(employee);

      if (stream.active) {
        return toast.error("Employee already has active stream");
      }

      async function logTreasuryBalance() {
        try {
          // 1. Call the treasuryBalance function from the smart contract
          // This returns a BigInt in Wei
          const balanceWei = await contract.treasuryBalance();

          // 2. Convert the Wei (big number) to a readable string (like "5.0")
          const balanceEth = ethers.formatEther(balanceWei);

          console.log(`Current Treasury Balance: ${balanceEth} ETH`);
          
          return balanceEth;
        } catch (error) {
          console.error("Error fetching treasury balance:", error);
        }
      }

      // Usage:
      logTreasuryBalance();

      const liability = await contract.totalAccruedLiability();
      console.log("Liability:", ethers.formatEther(liability));

      try {
        await contract.startStream.staticCall(
          employee,
          ethers.parseEther("1"),
          10,
          2592000,
          0
        );
        console.log("Static call success");
      } catch (e) {
        console.log("Revert:", e);
      }

      const tx = await contract.startStream(
        employee,
        parsedSalary,
        BigInt(tax),
        durationSeconds,
        cliffSeconds
      );

      await tx.wait();

      toast.success("Stream Started Successfully!");

      setEmployee("");
      setSalary("");
      setTax("");
      setDurationMonths("");
      setCliffMonths("");

    } catch (err) {
      console.error(err);
      toast.error("Failed to start stream");
    } finally {
      stopLoading();
    }
  };

  const handlePause = async () => {
    try {
      if (!contract || !employee) return toast.warning("Enter employee address");
      startLoading("pause");
      await (await contract.pauseStream(employee)).wait();
      toast.success("Stream Paused");
    } catch (err) {
      console.error(err);
      toast.error("Pause Failed");
    } finally { stopLoading(); }
  };

  const handleCancel = async () => {
    try {
      if (!contract || !employee) return toast.warning("Enter employee address");
      startLoading("cancel");
      await (await contract.cancelStream(employee)).wait();
      toast.success("Stream Cancelled");
    } catch (err) {
      console.error(err);
      toast.error("Cancel Failed");
    } finally { stopLoading(); }
  };

  const handleCheckEarned = async () => {
    try {
      if (!contract || !employee) return toast.warning("Enter employee address");
      startLoading("check");
      const amount = await contract.earned(employee);
      setEarnedAmount(ethers.formatUnits(amount, 18));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch earned amount");
    } finally { stopLoading(); }
  };

  const isLoadingAction = (action) => loading && loadingAction === action;

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
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "primary.main",
        },
      },
    },
  };

  if (!isOwner) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
        }}
      >
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
          <LockClock sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Access Restricted
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Only the contract owner can manage payment streams.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 520 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} letterSpacing={-0.5} gutterBottom>
          Stream Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start, pause, or cancel employee payment streams.
        </Typography>
      </Box>

      {/* Card */}
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

          {/* Employee address — shared across all actions */}
          <Box>
            <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
              Employee
            </Typography>
            <TextField
              placeholder="0x... wallet address"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              fullWidth
              size="small"
              sx={{ mt: 0.75, ...inputSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined fontSize="small" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <GradientDivider />

          {/* Start stream fields */}
          <Box>
            <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
              New Stream
            </Typography>
            <Stack spacing={2} sx={{ mt: 0.75 }}>
              <TextField
                placeholder="Monthly salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                fullWidth
                size="small"
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.disabled">HLUSD</Typography>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                placeholder="Tax percentage"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                fullWidth
                size="small"
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.disabled">%</Typography>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                placeholder="Duration (months)"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                fullWidth
                size="small"
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.disabled">
                        months
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                placeholder="Cliff (months)"
                value={cliffMonths}
                onChange={(e) => setCliffMonths(e.target.value)}
                fullWidth
                size="small"
                sx={inputSx}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.disabled">
                        months
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>

          <ShimmerButton
            variant="contained"
            fullWidth
            startIcon={isLoadingAction("start") ? <CircularProgress size={16} color="inherit" /> : <PlayArrow />}
            onClick={handleStartStream}
            disabled={loading}
            size="large"
          >
            {isLoadingAction("start") ? "Starting..." : "Start Stream →"}
          </ShimmerButton>

          <GradientDivider />

          {/* Stream controls */}
          <Box>
            <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
              Stream Controls
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ mt: 0.75 }}>
              <ShimmerButton
                variant="outlined"
                color="warning"
                fullWidth
                startIcon={isLoadingAction("pause") ? <CircularProgress size={14} color="inherit" /> : <PauseCircle />}
                onClick={handlePause}
                disabled={loading}
              >
                {isLoadingAction("pause") ? "Pausing..." : "Pause"}
              </ShimmerButton>
              <ShimmerButton
                variant="outlined"
                color="error"
                fullWidth
                startIcon={isLoadingAction("cancel") ? <CircularProgress size={14} color="inherit" /> : <CancelOutlined />}
                onClick={handleCancel}
                disabled={loading}
              >
                {isLoadingAction("cancel") ? "Cancelling..." : "Cancel"}
              </ShimmerButton>
            </Stack>
          </Box>

          <GradientDivider />

          {/* Check earned */}
          <Box>
            <Typography variant="overline" color="text.disabled" letterSpacing={1.5} fontSize="0.65rem">
              Earnings Lookup
            </Typography>
            <ShimmerButton
              variant="outlined"
              fullWidth
              startIcon={isLoadingAction("check") ? <CircularProgress size={14} color="inherit" /> : <SearchOutlined />}
              onClick={handleCheckEarned}
              disabled={loading}
              sx={{ mt: 0.75 }}
            >
              {isLoadingAction("check") ? "Checking..." : "Check Earned Amount"}
            </ShimmerButton>

            {earnedAmount !== null && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(99,102,241,0.07)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total earned
                </Typography>
                <Chip
                  label={`${earnedAmount} HLUSD`}
                  size="small"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    bgcolor: "primary.main",
                    color: "white",
                    fontSize: "0.8rem",
                  }}
                />
              </Box>
            )}
          </Box>

        </Stack>
      </Box>
    </Box>
  );
}