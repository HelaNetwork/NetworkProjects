import { useContext } from "react";
import { Web3Context } from "./Web3Context";

export const useWeb3 = () => useContext(Web3Context);