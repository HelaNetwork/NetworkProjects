import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  walletAddress: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
}

const storedUser = localStorage.getItem('hc_user');
const storedWallet = localStorage.getItem('hc_wallet');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  walletAddress: storedWallet || null,
  isAuthenticated: !!storedWallet,
  isOnboarded: storedUser ? JSON.parse(storedUser)?.isOnboarded : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setWalletConnected: (state, action: PayloadAction<string>) => {
      state.walletAddress = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('hc_wallet', action.payload);
    },
    setUserProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isOnboarded = action.payload.isOnboarded;
      localStorage.setItem('hc_user', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.walletAddress = null;
      state.isAuthenticated = false;
      state.isOnboarded = false;
      localStorage.removeItem('hc_wallet');
      localStorage.removeItem('hc_user');
    },
  },
});

export const { setWalletConnected, setUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
