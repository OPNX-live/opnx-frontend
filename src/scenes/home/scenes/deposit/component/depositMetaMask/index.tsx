/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, memo, useCallback, useState, useMemo } from "react";
import { Modal, Form, message, Input, Button, Slider, Radio } from "antd";
import ModelViewer from "@metamask/logo";
import { connect } from "react-redux";
import { ethers } from "ethers";
// import web3 from "web3";
import { Decimal } from "decimal.js";
import { messageError } from "utils";
import { getEthereumProvider } from "utils/ethProvider";
import getDefaultEthGasPrice from "./ethgasAPI.json";
import { getETHGasPrice, getNonce } from "service/http/http";
import {
  WrappedComponentProps,
  injectIntl,
  FormattedMessage,
} from "react-intl";
import "./index.scss";
// import { isLive } from "utils/isLive";
// import { sendMessage } from 'service/webScoket/config';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 20 },
};

const blockLayout = {
  wrapperCol: { offset: 0, span: 24 },
};

const tailLayout = {
  wrapperCol: { offset: 3, span: 21 },
};

type TStateProps = ReturnType<typeof mapStateToProps>;
type TDispatchProps = ReturnType<typeof mapDispatchToProps>;
type TOwnProps = { network: string; coin: string; address: string };

const DepositMetaMask = memo(
  (
    IProps: TStateProps & TDispatchProps & WrappedComponentProps & TOwnProps
  ) => {
    const {
      network,
      provider,
      dashboardUserData,
      intl,
      mateMaskSelectedAddress,
      address,
      coin,
    } = IProps;
    const [form] = Form.useForm();
    // network={network} address={selectAddress}
    const minDepositETH = "0.001";

    const [quickShow, setQuickShow] = useState(false);
    const [gasPriceEth, setCurrentGasPriceEth] = useState("");
    // const [gasPriceWei, setCurrentGasPriceWei] = useState("");
    // const [currentEthUsdPrice, setCurrentEthUsdPrice] = useState("");
    const [balance, setBalance] = useState("");
    // const [currentAddress, setCurrentAddress] = useState("");
    const [amount, setAmount] = useState("");
    // const [gasEthUsdPrice, setGasEthUsdPrice] = useState("0");

    const [ethNetWork, setEthNetWork] = useState("homestead");

    const [submitButtondisabled, setSubmitButtondisabled] = useState(false);
    // const [quickShow, setQuickShow] = useState(false);
    const [realTimeGasPrice, setRealTimeGasPrice] = useState<any>({
      safeLow: 1,
      standard: 26.4,
      fast: 29.6,
      fastest: 36,
    });

    const [userGasPriceWei, setUserGasPriceWei] = useState("");
    const [radioGasPriceWei, setRadioGasPriceWei] = useState("standard");
    const [isRealTimeGasPrice, setIsRealTimeGasPrice] = useState(true);

    useEffect(() => {
      const viewer = ModelViewer({
        pxNotRatio: true,
        width: 110,
        height: 110,
        followMouse: false,
        slowDrift: false,
      });
      const container = document.getElementById("deposit-metamask-logo");
      if (container) {
        container.appendChild(viewer.container);
        viewer.lookAt({
          x: 100,
          y: 100,
        });
        viewer.setFollowMouse(true);
        viewer.stopAnimation();
      }
    }, []);

    const getAPIETHGasPrices = useCallback(async () => {
      if (isRealTimeGasPrice) {
        const data = await getETHGasPrice();
        let prices = {
          safeLow: 1,
          standard: 25,
          fast: 36,
          fastest: 36,
        };
        if (data && data.data) {
          setIsRealTimeGasPrice(false);
          prices["safeLow"] = Number(data.data.safeLow) * 10;
          prices["standard"] = Number(data.data.average) * 10;
          prices["fast"] = Number(data.data.fast) * 10;
          prices["fastest"] = Number(data.data.fastest) * 10;
        } else if (getDefaultEthGasPrice) {
          prices["safeLow"] = getDefaultEthGasPrice.safeLow * 10;
          prices["standard"] = getDefaultEthGasPrice.average * 10;
          prices["fast"] = getDefaultEthGasPrice.fast * 10;
          prices["fastest"] = getDefaultEthGasPrice.fastest * 10;
        }
        setRealTimeGasPrice(prices);
        let defaultGas: string = "1";
        if (radioGasPriceWei === "safeLow") {
          defaultGas = prices["safeLow"].toString();
        } else if (radioGasPriceWei === "standard") {
          defaultGas = prices["standard"].toString();
        } else if (radioGasPriceWei === "fastest") {
          defaultGas = prices["fastest"].toString();
        }
        setUserGasPriceWei(defaultGas);
      }
    }, [radioGasPriceWei]);

    const setInitData = useCallback(async () => {
      // Web3 browser user detected. You can now use the provider.
      // @ts-ignore
      try {
        const ethProvider = await getEthereumProvider();
        if (ethProvider) {
          const signer = await ethProvider.getSigner();
          // const gasPrice = await signer.getGasPrice();
          const balance = await signer.getBalance();
          const net = await ethProvider.getNetwork();
          setEthNetWork(net.name);
          // setCurrentGasPriceWei(ethers.utils.formatUnits(gasPrice, "gwei"));
          setBalance(ethers.utils.formatEther(balance));
          // setUserGasPriceWei(ethers.utils.formatUnits(gasPrice, "wei"));
        } else {
          message.error(
            intl.formatMessage({ id: "MetaMask open failed, place try again" })
          );
        }
      } catch (err) {
        console.log(err);
        if (err && err.message) {
          message.error(
            intl.formatMessage({ id: "MetaMask open failed, place try again" })
          );
        }
      }
    }, [intl, provider]);

    useEffect(() => {
      // @ts-ignore
      setInitData();
    }, [mateMaskSelectedAddress, setInitData]);

    useEffect(() => {
      if (network.toUpperCase() === "ETH" && mateMaskSelectedAddress) {
        getAPIETHGasPrices();
      }
    }, [network, mateMaskSelectedAddress, getAPIETHGasPrices]);

    useEffect(() => {
      if (userGasPriceWei) {
        const userGas = ethers.utils.formatEther(userGasPriceWei); // new Decimal(userGasPriceWei).div(new Decimal(10).pow(18)).toString();
        setCurrentGasPriceEth(userGas);
      }
    }, [mateMaskSelectedAddress, userGasPriceWei, amount]);
    //  setCurrentGasPriceEth(ethers.utils.formatEther(gasPrice));

    /*useEffect(() => {
    const ethTicker = ticker.filter((item: any) => item.marketCode.toUpperCase === "ETH-USD"); // setCurrentEthUsdPrice
    if (ethTicker && ethTicker.length > 0) {
      setCurrentEthUsdPrice(ethTicker[0].lastMarkPrice);
    }
 }, [ticker]);*/

    /*useEffect(() => {
    if (currentEthUsdPrice && gasPriceEth) {
      const price = new Decimal(currentEthUsdPrice).mul(new Decimal(gasPriceEth));
      setGasEthUsdPrice(price.toString())
    }
  }, [currentEthUsdPrice, gasPriceEth]);*/

    const sendTransaction = useCallback(async () => {
      const ethProvider = await getEthereumProvider();
      if (ethProvider) {
        // console.log("in sendTransaction ethProvider", ethProvider);
        const signer = await ethProvider.getSigner();
        const getAddress = await signer.getAddress();
        const nonce = await getNonce(getAddress);

        if (nonce) {
          // console.log("in sendTransaction getAddress start");
          // const getAddress = await signer.getAddress();
          // console.log("in sendTransaction getAddress end");
          if (getAddress) {
            const params = {
              from: getAddress,
              to: address,
              // to: mateMaskSelectedAddress,
              gasPrice: userGasPriceWei,
              value: amount,
            };
            if (!params.to) {
              message.error(
                intl.formatMessage({ id: "Invalid Disposit to address" })
              );
              setSubmitButtondisabled(false);
              return;
            } else if (!params.value) {
              message.error(
                intl.formatMessage({ id: "Invalid Disposit amount" })
              );
              setSubmitButtondisabled(false);
              return;
            }
            // console.log("in sendTransaction signer.sendTransaction data");
            const gas = new Decimal(userGasPriceWei)
              .div(new Decimal(10).pow(9))
              .toString();

            const price = new Decimal(amount).toString();
            // console.log(userGasPriceWei, gas, ethers.utils.parseEther(gas.toString()));
            // console.log(amount, price, ethers.utils.parseEther(price));

            try {
              // console.log("sendTransaction:", params);
              // console.log("gasPrice:", gas, "value: ", price);
              const data = {
                ...params,
                gasPrice: ethers.utils.parseEther(gas),
                value: ethers.utils.parseEther(price),
              };
              // console.log("in sendTransaction start sendTransaction");
              const res = await signer.sendTransaction(data);
              // console.log(res);
              //console.log("in sendTransaction end response");
              if (res) {
                message.success(intl.formatMessage({ id: "Disposit Success" }));
              } else {
                message.error(
                  intl.formatMessage({ id: "Disposit Submit Failed" })
                );
              }
              setSubmitButtondisabled(false);
              setQuickShow(false);
            } catch (err) {
              setQuickShow(false);
              // console.log(err);
              if (err && err.code) {
                if (err.code === 4001) {
                  message.error(
                    intl.formatMessage({
                      id: "MetaMask Signature: User denied transaction signature.",
                    })
                  );
                } else if (err.code === -32003) {
                  message.error(
                    intl.formatMessage({ id: "Transaction rejected3" })
                  );
                } else {
                  // message.error(err.message);
                  message.error(
                    intl.formatMessage({ id: "Disposit Submit Failed" })
                  );
                }
              } else {
                message.error(
                  intl.formatMessage({ id: "Disposit Submit Failed" })
                );
              }
            }
            setSubmitButtondisabled(false);
          } else {
            message.error(intl.formatMessage({ id: "Disposit Submit Failed" }));
            setSubmitButtondisabled(false);
          }
        } else {
          setSubmitButtondisabled(false);
          message.warning(
            intl.formatMessage({ id: "MetaMask open failed, place try again" })
          );
        }
      } else {
        setSubmitButtondisabled(false);
        message.warning(
          intl.formatMessage({ id: "MetaMask open failed, place try again" })
        );
      }
    }, [
      provider,
      userGasPriceWei,
      amount,
      mateMaskSelectedAddress,
      intl,
      address,
    ]);

    const depositMetamaskQuickonFinish = useCallback(() => {
      // console.log("depositMetamaskQuickonFinish mount, minDepositETH:", amount, minDepositETH);
      if (
        amount &&
        Number(amount) > 0 &&
        Number(amount) >= Number(minDepositETH)
      ) {
        // console.log("depositMetamaskQuickonFinish sendTransaction");
        setSubmitButtondisabled(true);
        sendTransaction();
      } else {
        if (!amount) {
          message.error(messageError("31005"));
        } else if (Number(userGasPriceWei) <= 0) {
          message.error(messageError("31005"));
        } else if (Number(amount) < Number(minDepositETH)) {
          message.error(
            intl.formatMessage({
              id: "Minimum deposit is {value} {coin}（Metamask）",
            })
          );
        }
      }
    }, [amount, minDepositETH, userGasPriceWei]);

    const amountChange = useCallback(
      (e) => {
        const value = e.target.value;
        //  if (Number(value)) {
        setAmount(value);
      },
      [balance]
    );

    const depositAllIn = useCallback(() => {
      setAmount(balance);
    }, [balance]);

    const gasPriceChange = useCallback((value) => {
      setUserGasPriceWei(value.toString());
    }, []);

    const transationChange = useCallback(
      (e) => {
        const val = e.target.value;
        const getRealTimeGas: any = realTimeGasPrice[val];
        setUserGasPriceWei(getRealTimeGas.toString());
        setRadioGasPriceWei(val);
      },
      [realTimeGasPrice]
    );

    const isCurrentAddress = useMemo(async () => {
      const currentLoginAddress = dashboardUserData.publicAddress;
      if (
        currentLoginAddress.toLowerCase() ===
        mateMaskSelectedAddress.toLowerCase()
      ) {
        return true;
      }
      return false;
    }, [
      dashboardUserData.publicAddress,
      intl,
      provider,
      mateMaskSelectedAddress,
    ]);

    const openSendModal = useCallback(
      (open: boolean) => {
        // console.log("ethNetWork:", ethNetWork, "isLive: ", isLive);
        /*if (isLive) {
      // @ts-ignore
      if ( ethNetWork !== "homestead" || ethNetWork !== "mainnet") {
        message.warning(
          intl.formatMessage({ id: "MetaMask open failed, place try again" })
        );
        return;
      }
    } */
        /*if (open) {
      sendMessage.subscribe("ticker:all");
    } else {
      sendMessage.unsubscribe("ticker:all");
    }*/
        // if (isCurrentAddress) {
        setQuickShow(open);
        //  }
      },
      [ethNetWork, intl]
    );

    const depositComponent = useMemo(() => {
      // console.log("depositComponent:", network, mateMaskSelectedAddress, isCurrentAddress);
      if (
        network.toUpperCase() === "ETH" &&
        mateMaskSelectedAddress &&
        isCurrentAddress
      ) {
        return true;
      }
      return false;
    }, [network, mateMaskSelectedAddress, isCurrentAddress]);

    return (
      <div
        className={`deposit-metamask-component ${
          !depositComponent ? "hide-deposit-metamask" : ""
        }`}
      >
        <div className={"deposit-metamask"}>
          <div id={"deposit-metamask-logo"} />
          <Button
            onClick={() => {
              openSendModal(true);
            }}
          >
            <FormattedMessage
              id="Quick-Deposit"
              defaultMessage="Quick Deposit"
            />
          </Button>
        </div>
        {/*<Modal
        className="deposit-metamask-quick"
        title={"'"}
        footer={null}
        visible={quickShow}
        width={450}
        onCancel={() => {
          setQuickShow(false);
        }}
        maskClosable={false}
        destroyOnClose={true}
      >
          <Form
            name="basic"
            form={form}
            {...layout}
            initialValues={{ remember: true }}
            hideRequiredMark={true}
            onFinish={depositMetamaskQuickonFinish}
          >

            <div className="deposit-metamask-quick-title">
              <FormattedMessage id="MetamaskQuick Deposit" />
            </div>
            <Form.Item label={<FormattedMessage id="Current-account" />} {...tailLayout} className="deposit-metamask-quick-item"
            >
             <span className="deposit-metamask-quick-item-content">{ balance }</span>
            </Form.Item>
            <Form.Item label={<FormattedMessage id="Currency" />} {...tailLayout} className="deposit-metamask-quick-item"
            >
             <span className="deposit-metamask-quick-item-content">{ "ETH" }</span>
            </Form.Item>
            <Form.Item label={<FormattedMessage id="Outgoing-address" />} {...tailLayout} className="deposit-metamask-quick-item"
            >
             <span className="deposit-metamask-quick-item-content">{ currentAddress}</span>
            </Form.Item>
            <Form.Item label={<FormattedMessage id="Transfer-in-address" />} {...tailLayout} className="deposit-metamask-quick-item"
            >
             <span className="deposit-metamask-quick-item-content">{ address }</span>
            </Form.Item>
            <Form.Item
              { ...blockLayout }
              className="deposit-metamask-quick-input"
            >
              <FormattedMessage id="Amount" />
              <Input allowClear={true} data-type="amount" onChange={amountChange} />
            </Form.Item>

            <Form.Item { ...blockLayout } className="deposit-metamask-quick-item"
            >
             <span className="deposit-metamask-quick-item-fee">
               <FormattedMessage id="Estimated handling fee" values={{ coin: `${gasPriceEth} ETH ($${gasEthUsdPrice} USD)`}} />
             </span>
            </Form.Item>
            
            <Form.Item { ...blockLayout } className="deposit-matemask-quick-ant">
              <div className="deposit-metamask-quick-btn">
                <Button
                  type="primary"
                  htmlType="submit"
                >
                  <FormattedMessage id="Submit" />
                </Button>
              </div>
            </Form.Item>
          </Form>
      </Modal>*/}
        <Modal
          className="deposit-metamask-quick-confirm"
          title={
            <div className="deposit-metamask-quick-title">
              Deposit {coin} to Open Exchange
            </div>
          }
          footer={null}
          visible={quickShow}
          width={420}
          onCancel={() => {
            openSendModal(false);
          }}
          maskClosable={false}
          destroyOnClose={true}
        >
          <div className="deposit-metamask-quick-confirm-top-content">
            <FormattedMessage
              id="Note: Minimum deposit is {value} {coin}（Metamask）"
              values={{ value: minDepositETH, coin: coin }}
            />
          </div>
          <Form
            name="basic"
            form={form}
            {...layout}
            initialValues={{ remember: true }}
            hideRequiredMark={true}
            onFinish={depositMetamaskQuickonFinish}
          >
            <Form.Item
              {...blockLayout}
              className="deposit-metamask-quick-confirm-input"
            >
              <FormattedMessage id="Amount" />
              <Input
                allowClear={true}
                data-type="amount"
                value={amount}
                onChange={amountChange}
                suffix={
                  <span onClick={depositAllIn}>
                    <FormattedMessage id="MAX" />
                  </span>
                }
              />
            </Form.Item>
            <Form.Item
              {...blockLayout}
              className="deposit-metamask-quick-confirm-input"
            >
              <FormattedMessage
                id="Gas price: {coin} wei"
                values={{ coin: userGasPriceWei }}
              />
              <Slider
                defaultValue={Number(userGasPriceWei)}
                value={Number(userGasPriceWei)}
                max={21000}
                min={1}
                onChange={gasPriceChange}
              />
            </Form.Item>
            <Form.Item
              label={<FormattedMessage id="transation" />}
              {...tailLayout}
              className="deposit-metamask-quick-confirm-input"
            >
              <Radio.Group
                onChange={transationChange}
                defaultValue={radioGasPriceWei}
                value={radioGasPriceWei}
              >
                <Radio.Button value="safeLow" key="safeLow">
                  <FormattedMessage id="slow" />
                </Radio.Button>
                <Radio.Button value="standard" key="standard">
                  <FormattedMessage id="average" />
                </Radio.Button>
                <Radio.Button value="fastest" key="fastest">
                  <FormattedMessage id="fast" />
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              {...blockLayout}
              className="deposit-metamask-quick-confirm-item"
            >
              <span className="deposit-metamask-quick-item-fee">
                <FormattedMessage
                  id="Estimated handling fee"
                  values={{ coin: `≈ ${gasPriceEth} ETH` }}
                />
              </span>
            </Form.Item>

            <Form.Item
              {...blockLayout}
              className="deposit-matemask-quick-confirm-ant"
            >
              <div className="deposit-metamask-quick-confirm-btn">
                <Button
                  loading={submitButtondisabled}
                  type="primary"
                  htmlType="submit"
                >
                  <FormattedMessage id="Submit" />
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }
);
const mapStateToProps = (state: any) => {
  return {
    dashboardUserData: state.dashboardUserData,
    provider: state.provider,
    mateMaskSelectedAddress: state.mateMaskSelectedAddress,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DepositMetaMask));
