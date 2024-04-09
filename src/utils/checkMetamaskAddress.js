
import { setLoginOut } from "utils/loginOut";

export const checkMetamaskAddress =  async (data) => {
   //  console.log("checkMetamask state", state);
    if (data.code === "0000") {
      if (data && data.data && data.data.accountSource === "METAMASK" && !data.data.bindEmail) {
        // console.log(data.data.accountSource );
        try {
          const eth = window.ethereum || window.web3.currentProvider;
        
          const getAddress = eth.selectedAddress;
            // console.log(getAddress, data.data.publicAddress);
            // console.log(state.dashboardUserData.publicAddress, getAddress);
            if ( getAddress !== data.data.publicAddress) {
              setLoginOut();
            }
        } catch(err) {
          setLoginOut();
        }
      }
    } else {
      setLoginOut();
    }
};
