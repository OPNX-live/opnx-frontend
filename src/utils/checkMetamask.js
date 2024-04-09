import detectEthereumProvider from '@metamask/detect-provider';
import { message } from "antd";
import store from "store/index";
import { localStorage } from "utils";
import { intl } from "utils/Language";
import { getEthereumProvider } from "utils/ethProvider";
import { setMateMaskAddress } from "store/actions/publicAction";
import { setLoginOut } from "utils/loginOut";


const metamaskChangeLoginOut = () => {
  const state = store.getState();
  if (state.isLogin) {
    if (state && state.dashboardUserData && state.dashboardUserData.accountSource === "METAMASK" && !state.dashboardUserData.bindEmail) {
      setLoginOut();
      localStorage.set("metamaskAddress", "");
    }
  }
}

export const initEthereum = async () => {
  const provider = await detectEthereumProvider();
  if (!provider) {message.error(intl("Cannot connect to MetaMask")); return }
  const handleAccountsChanged = (accounts) => {
    const currentAccount = accounts[0] || "";
    // console.log("handleAccountsChanged accounts: ", currentAccount);


    store.dispatch(setMateMaskAddress(currentAccount));
    metamaskChangeLoginOut();

  }

  const handleChainChanged = (_chainId) => {
    // We recommend reloading the page, unless you must do otherwise
    getEthereumProvider();
    metamaskChangeLoginOut();
  }

  const handleDisconnect = () => {
    // console.log("handleDisconnect");
    getEthereumProvider();
    metamaskChangeLoginOut();
  }

  const handleConnect = () => {
    // console.log("handleConnect");
    getEthereumProvider();
  }

  const handleOnMessage = (e) => {
    // console.log("handleOnMessage");
  }

  if (provider) {
    if (provider !== window.ethereum) {
      message.error(intl("Cannot connect to MetaMask"));
    } else {
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect',  handleDisconnect);
      provider.on("connect", handleConnect);
      provider.on("message", handleOnMessage);
      /*provider
      .request({ method: 'eth_accounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        console.error(err);
      });*/
      /*provider.request({ method: 'eth_requestAccounts' })
      .then(handleAccountsChanged)
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });*/
      return provider
    }
  } else {
    message.error(intl("Cannot connect to MetaMask"));
    // console.log('Please install MetaMask!');
  }
}