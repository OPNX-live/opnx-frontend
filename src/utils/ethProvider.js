
import { ethers } from "ethers";

export const getEthereumProvider = async () => {
  if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
    let provider = null;
    const eth = window.ethereum || window.web3.currentProvider;
    eth.enable().then(provider = new ethers.providers.Web3Provider(eth));
    // store.dispatch(setProvider(provider));
    return provider;
  }
  return false;
};
