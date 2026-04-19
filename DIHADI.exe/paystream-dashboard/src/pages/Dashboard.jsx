// import { Box, Typography, Paper } from "@mui/material";

// export default function Dashboard() {
//   return (
//     <Box>
//       <Typography variant="h4" gutterBottom>
//         Dashboard
//       </Typography>

//       <Paper sx={{ p: 4 }}>
//         <Typography variant="body1" color="text.secondary">
//           Welcome to PayStream Vault Dashboard.
//           <br />
//           This is your main overview page.
//         </Typography>
//       </Paper>
//     </Box>
//   );
// }

import { Box, Typography, Paper, Button, Chip, Stack } from "@mui/material";
import { ArrowForward, RocketLaunch } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { PAYSTREAM_ABI } from "../web3/abi"; 
import {CONTRACT_ADDRESS} from "../web3/config";

export default function Dashboard() {
  const [activeStreams, setActiveStreams] = useState("—");
  const [treasuryBalance, setTreasuryBalance] = useState("—");
  const [totalLiability, setTotalLiability] = useState("—");

  useEffect(() => {
    const loadStats = async () => {
      try {
        if (!window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          PAYSTREAM_ABI,
          provider
        );

        const [streams, treasury, liability] = await Promise.all([
          contract.totalActiveStreams(),
          contract.treasuryBalance(),
          contract.totalAccruedLiability(),
        ]);

        setActiveStreams(streams.toString());
        setTreasuryBalance(
          Number(ethers.formatEther(treasury)).toFixed(4) + " HLUSD"
        );
        setTotalLiability(
          Number(ethers.formatEther(liability)).toFixed(4) + " HLUSD"
        );
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      }
    };

    loadStats();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "grey.900",
          mb: 4,
          px: { xs: 4, md: 8 },
          py: { xs: 8, md: 12 },
          textAlign: "center",
        }}
      >
        {/* Top gradient blob */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "-10rem",
              left: "50%",
              transform: "translateX(-50%) rotate(30deg)",
              width: "72rem",
              aspectRatio: "1155/678",
              background:
                "linear-gradient(to top right, #ff80b5, #9089fc)",
              opacity: 0.25,
              filter: "blur(80px)",
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </Box>

        {/* Bottom gradient blob */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            bottom: "-10rem",
            left: "calc(50% + 3rem)",
            transform: "translateX(-50%)",
            width: "72rem",
            aspectRatio: "1155/678",
            background:
              "linear-gradient(to top right, #ff80b5, #9089fc)",
            opacity: 0.2,
            filter: "blur(80px)",
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Content */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label={
              <>
                Built on HLUSD, the synthetic dollar of HeLa Chain{" "}
              </>
            }
            variant="outlined"
            sx={{
              mb: 4,
              color: "grey.400",
              borderColor: "rgba(255,255,255,0.15)",
              bgcolor: "transparent",
              fontSize: "0.8rem",
              height: "auto",
              py: 0.75,
              px: 0.5,
              cursor: "pointer",
              "&:hover": { borderColor: "rgba(255,255,255,0.3)" },
            }}
          />

          <Typography
            variant="h2"
            fontWeight={600}
            sx={{
              color: "white",
              letterSpacing: -1,
              mb: 3,
              fontSize: { xs: "2.25rem", md: "3.5rem" },
              maxWidth: 640,
              mx: "auto",
              lineHeight: 1.15,
            }}
          >
            Manage your onchain payroll with PayStream Vault
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "grey.400",
              mb: 5,
              maxWidth: 480,
              mx: "auto",
              fontSize: "1.05rem",
              lineHeight: 1.7,
            }}
          >
            Stream salaries, automate treasury flows, and manage your entire
            decentralized workforce all from one dashboard.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<RocketLaunch />}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Get started
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
        {[
          { label: "Active Streams", value: activeStreams },
          { label: "Treasury Balance", value: treasuryBalance },
          { label: "Total Liability", value: totalLiability },
        ].map(({ label, value }) => (
          <Paper
            key={label}
            sx={{
              flex: 1,
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              elevation: 0,
            }}
          >
            <Typography variant="overline" color="text.disabled" letterSpacing={1.2}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700} mt={0.5}>
              {value}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}