import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect  } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "../web3/useWeb3";
import { CONTRACT_ADDRESS } from "../web3/config";
import { toast } from "react-toastify";

export default function Treasury() {
  const { contract, hlusd, account, isOwner } = useWeb3();

  const [balance, setBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [checkingOwner, setCheckingOwner] = useState(true);

  useEffect(() => {
    const fetchOwner = async () => {
      try {
        if (!contract) return;

        const owner = await contract.owner();
        setOwnerAddress(owner);
      } catch (err) {
        console.error("Failed to fetch owner:", err);
      } finally {
        setCheckingOwner(false);
      }
    };

    fetchOwner();
  }, [contract]);

  const isContractOwner =
    ownerAddress &&
    account &&
    ownerAddress.toLowerCase() === account.toLowerCase();

  const fetchBalance = async () => {
    try {
      if (!contract) return;
      const bal = await contract.treasuryBalance();
      setBalance(ethers.formatUnits(bal, 18));
    } catch (err) {
      toast.error("Failed to fetch balance");
    }
  };

  const handleDeposit = async () => {
    try {
      if (!contract) return;
      if (!amount) return toast.warning("Enter amount");

      setLoading(true);

      const parsedAmount = ethers.parseEther(amount);

      const depositTx = await contract.depositTreasury({
        value: parsedAmount,
      });

      await depositTx.wait();

      toast.success("Treasury Deposited Successfully!");
      setAmount("");
      fetchBalance();
    } catch (err) {
      console.error(err);
      toast.error("Transaction Failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingOwner) {
    return <CircularProgress />;
  }

  if (!isContractOwner) {
    return (
      <Typography color="error">
        Only contract owner can access Treasury Management.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Treasury Management
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Button variant="outlined" onClick={fetchBalance}>
            Refresh Treasury Balance
          </Button>

          <Typography>
            Current Balance:{" "}
            <strong>{balance ? `${balance} HLUSD` : "—"}</strong>
          </Typography>

          <TextField
            label="Deposit Amount (HLUSD)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={handleDeposit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Approve & Deposit"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
