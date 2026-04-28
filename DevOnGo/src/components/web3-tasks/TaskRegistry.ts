import React from 'react';
import BlockChainBreak from '@/interactive/BlockChainBreak';
import CheckBalance from '@/interactive/CheckBalance';
import CheckHelaConnection from '@/interactive/CheckHelaConnection';
import CheckHelaFaucet from '@/interactive/GetTestToken';
import InstallMetaMask from '@/interactive/InstallMetaMask';
import SendToSelf from '@/interactive/SendToSelf';
import SendToUs from '@/interactive/SendToUs';
import WalletAddress from '@/interactive/WalledAddress';
import WalletCreateAndConnect from '@/interactive/WalletCreateAndConnect';

export const Web3TaskRegistry: Record<string, React.FC> = {
  'blockchain-integrity': BlockChainBreak,
  'check-balance': CheckBalance,
  'check-hela-connection': CheckHelaConnection,
  'check-hela-faucet': CheckHelaFaucet,
  'install-metamask': InstallMetaMask,
  'send-to-self': SendToSelf,
  'send-to-us': SendToUs,
  'wallet-address': WalletAddress,
  'wallet-create-connect': WalletCreateAndConnect,
};
