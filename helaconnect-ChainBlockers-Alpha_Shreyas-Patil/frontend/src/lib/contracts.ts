
export const mockContract = {
  checkUserStatus: async (wallet: string) => {
    return localStorage.getItem(`mock_registered_${wallet.toLowerCase()}`) === 'true';
  },
  registerUser: async (wallet: string) => {
    localStorage.setItem(`mock_registered_${wallet.toLowerCase()}`, 'true');
    return { wait: async () => true };
  },
  areConnected: async (user1: string, user2: string) => {
    return localStorage.getItem(`mock_conn_${user1.toLowerCase()}_${user2.toLowerCase()}`) === 'true';
  },
  addConnection: async (user1: string, user2: string) => {
    localStorage.setItem(`mock_conn_${user1.toLowerCase()}_${user2.toLowerCase()}`, 'true');
    return { wait: async () => true };
  },
  removeConnection: async (user1: string, user2: string) => {
    localStorage.removeItem(`mock_conn_${user1.toLowerCase()}_${user2.toLowerCase()}`);
    return { wait: async () => true };
  }
};
