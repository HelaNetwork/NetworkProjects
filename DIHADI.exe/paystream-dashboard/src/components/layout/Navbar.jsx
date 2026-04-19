// import { AppBar, Toolbar, Typography, Button } from "@mui/material";
// import { useWeb3 } from "../../web3/useWeb3";

// export default function Navbar() {
//   const { account, connectWallet } = useWeb3();

//   return (
//     <AppBar position="fixed">
//       <Toolbar>
//         <Typography sx={{ flexGrow: 1 }} variant="h6">
//           PayStream Vault
//         </Typography>

//         <Button color="inherit" onClick={connectWallet}>
//           {account
//             ? account.slice(0, 6) + "..." + account.slice(-4)
//             : "Connect Wallet"}
//         </Button>
//       </Toolbar>
//     </AppBar>
//   );
// }


import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  AccountBalanceWallet,
  Circle,
} from "@mui/icons-material";
import { useWeb3 } from "../../web3/useWeb3";

function shortenAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Navbar() {
  const { account, connectWallet } = useWeb3();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
          <AccountBalanceWallet sx={{ color: "primary.main" }} />
          <Typography
            variant="h6"
            fontWeight={700}
            letterSpacing={-0.5}
            sx={{ userSelect: "none" }}
          >
            PayStream
            <Box component="span" sx={{ color: "primary.main", ml: 0.5 }}>
              Vault
            </Box>
          </Typography>
        </Box>

        {/* Wallet */}
        {account ? (
          <Tooltip title="Connected wallet address" arrow>
            <Chip
              icon={
                <Circle
                  sx={{ fontSize: "10px !important", color: "success.main !important" }}
                />
              }
              label={shortenAddress(account)}
              variant="outlined"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.8rem",
                borderColor: "divider",
                cursor: "default",
                "&:hover": { bgcolor: "action.hover" },
              }}
            />
          </Tooltip>
        ) : (
          <Button
            variant="contained"
            size="small"
            startIcon={<AccountBalanceWallet />}
            onClick={connectWallet}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}