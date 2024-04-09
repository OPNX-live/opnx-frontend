import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import currentLevel from "../../assets/image/currentLevel.png";
import { plpFee, tradFee } from "../../service/http/http";
import empty from "../../assets/image/empty-table.png";
import { Table, message } from "antd";
import MakerModal from "./components/makerModal/makermodal";
import messageError from "utils/errorCode";
import ProgressComponent from "components/progressComponent/ProgressComponent";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { worthList, dayList, marketList } from "./type";
import "./index.scss";
import numeral from "numeral";
type INamePropsState = ReturnType<typeof mapStateToProps>;
type INameDispatchState = ReturnType<typeof mapDispatchToProps>;
interface IProgressStateResult {
  flexBalance: string;
  levelPercent: number;
  nextLevel: string;
  vipLevel: string;
  nextFlexBalance: string;
}

function FeeSchedule({
  useData,
  ...props
}: WrappedComponentProps & ReturnType<typeof mapStateToProps>) {
  const column = [
    {
      title: props.intl.formatMessage({ id: "VIP_Level" }),
      dataIndex: "vipLevel",
      key: "vipLevel",
      width: 118,
      children: [
        {
          title: "",
          dataIndex: "vipLevel",
          key: "building",
          width: 118,
          render: (item: string, index: any) => (
            <div
              className="currentlevel"
              style={
                index.vipLevel === vipLevel
                  ? { color: "#318BF5" }
                  : { color: "#E5DFF5" }
              }
            >
              {index.vipLevel === vipLevel ? (
                <img alt="currentLevel" src={currentLevel} />
              ) : null}
              <span>Lv {item}</span>
            </div>
          )
        }
      ]
    },
    {
      title: "Any of:",
      key: "worket",
      children: [
        {
          title: (
            <div className="maker-div">
              <span style={{ padding: "0 6px" }}>% of Maker Volume</span>
              <span
                style={{
                  borderLeft: "4px solid rgba(20,22,25,1)",
                  borderRight: "4px solid rgba(20,22,25,1)",
                  padding: "0 6px"
                }}
              >
                30 Day Volume
              </span>
              <span style={{ padding: "0 6px" }}>$ worth of FLEX</span>
            </div>
          ),
          dataIndex: props.intl.formatMessage({ id: "contractsTaker" }),
          key: "contractsTaker",
          width: 340,
          render: (item: string, index: any) => (
            <div className="any-of">
              <span className={"market-span-color"}>{index.marketVolume}</span>
              <span>{index.dayVolume}</span>
              <span>{index.worth}</span>
            </div>
          )
        }
      ]
    },
    {
      title: props.intl.formatMessage({ id: "Derivatives/Contracts" }),
      key: "address",
      children: [
        {
          title: (
            <div className="maker-div">
              <span className="market-span">
                {props.intl.formatMessage({ id: "Maker" })}
              </span>
              <span>{props.intl.formatMessage({ id: "Taker" })}</span>
            </div>
          ),
          dataIndex: props.intl.formatMessage({ id: "contractsTaker" }),
          key: "contractsTaker",
          width: 215,
          render: (item: string, index: any) => (
            <div className="maker-div">
              {index.contractsMaker === index.spotTaker ? null : (
                <span
                  className={
                    index.contractsMaker <= 0 ? "market-span-color" : ""
                  }
                >
                  {numeral(index.contractsMaker).format("0.000%")}
                </span>
              )}
              <span className={Number(item) < 0 ? "market-span-color" : ""}>
                {numeral(index.contractsTaker).format("0.000%")}
              </span>
            </div>
          )
        }
      ]
    },
    {
      title: props.intl.formatMessage({ id: "Spot_Markets" }),
      key: "tags",
      dataIndex: "tags",
      children: [
        {
          title: (
            <div className="maker-div">
              <span className="market-span">
                {props.intl.formatMessage({ id: "Maker" })}
              </span>
              <span>{props.intl.formatMessage({ id: "Taker" })}</span>
            </div>
          ),
          dataIndex: "spotTaker",
          key: "spotTaker",
          width: 215,
          render: (item: string, index: any) => (
            <div className="maker-div">
              {index.spotMaker === index.spotTaker ? null : (
                <span
                  className={index.spotMaker < 0 ? "market-span-color" : ""}
                >
                  {numeral(index.spotMaker).format("0.000%")}
                </span>
              )}
              <span className={Number(item) < 0 ? "market-span-color" : ""}>
                {numeral(item).format("0.000%")}
              </span>
            </div>
          )
        }
      ]
    },
    {
      title: props.intl.formatMessage({ id: "Spread_Trading" }),
      key: "action",
      width: 215,
      children: [
        {
          title: (
            <div className="maker-div">
              <span className="market-span">
                {props.intl.formatMessage({ id: "Maker" })}
              </span>
              <span>{props.intl.formatMessage({ id: "Taker" })}</span>
            </div>
          ),
          dataIndex: "spreadTaker",
          key: "spreadTaker",
          width: 215,
          render: (item: string, index: any) => (
            <div className="maker-div">
              {index.spreadMaker === index.spreadTaker ? null : (
                <span
                  className={index.spreadMaker <= 0 ? "market-span-color" : ""}
                >
                  {numeral(index.spreadMaker).format("0.000%")}
                </span>
              )}
              <span className={Number(item) < 0 ? "market-span-color" : ""}>
                {numeral(item).format("0.000%")}
              </span>
            </div>
          )
        }
      ]
    },
    {
      title: props.intl.formatMessage({ id: "Repo_Trading" }),
      key: "actions",
      width: 215,
      children: [
        {
          title: (
            <div className="maker-div">
              <span className="market-span">
                {props.intl.formatMessage({ id: "Maker" })}
              </span>
              <span>{props.intl.formatMessage({ id: "Taker" })}</span>
            </div>
          ),
          dataIndex: "repoMaker",
          key: "repoTaker",
          width: 215,
          render: (item: string, index: any) => (
            <div className="maker-div">
              {index.repoMaker === index.repoTaker ? null : (
                <span
                  className={index.repoMaker <= 0 ? "market-span-color" : ""}
                >
                  {numeral(index.repoMaker).format("0.000%")}
                </span>
              )}
              <span className={Number(item) < 0 ? "market-span-color" : ""}>
                {numeral(item).format("0.000%")}
              </span>
            </div>
          )
        }
      ]
    }
  ];
  const [lastLevel, setLastLevel] = useState<number>(0);
  const [feeData, setFeeData] = useState([]);
  const [plpData, setPlpData] = useState([]);
  const [vipLevel, setVipLevel] = useState<number>();
  const [visable, setVisable] = useState<boolean>(false);
  useEffect(() => {
    tradFee().then((res) => {
      if (res.success) {
        const datas = res.data.map((i: any, index: number) => {
          return {
            ...i,
            marketVolume: marketList[`${index}`],
            dayVolume: dayList[`${index}`],
            worth: worthList[`${index}`]
          };
        });
        setFeeData(datas);
        if (res.data && res.data.length > 0) {
          const lastItem = res.data[res.data.length - 1];
          setLastLevel(Number(lastItem.vipLevel));
        }
      } else {
        message.warning(res.message);
      }
    });
  }, []);
  useEffect(() => {
    plpFee().then((res) => {
      if (res.success) {
        const datas = res.data.map((i: any, index: number) => {
          return {
            ...i,
            marketVolume: marketList[`${index}`],
            dayVolume: dayList[`${index}`],
            worth: worthList[`${index}`]
          };
        });
        setPlpData(datas);
        // if (res.data && res.data.length > 0) {
        //   const lastItem = res.data[res.data.length - 1];
        //   setLastLevel(Number(lastItem.vipLevel));
        // }
      } else {
        message.warning(res.message);
      }
    });
  }, []);
  const resultCallback = (e: IProgressStateResult) => {
    setVipLevel(Number(e?.vipLevel));
  };
  const onCloseModel = () => {
    setVisable(false);
  };
  return (
    <div className="fee-schedule">
      <div
        className="fee-top"
        role={
          useData.tradingFeeLevel.vipType &&
          useData.tradingFeeLevel.specialVipLevel !== null
            ? "line"
            : "none"
        }
      >
        <div>{props.intl.formatMessage({ id: "Fee_Schedule" })}</div>
      </div>
      {useData.tradingFeeLevel.vipType &&
        useData.tradingFeeLevel.specialVipLevel !== null && (
          <div className="fee-specialVipLevel">
            <div className="fee-specialVipLevel-bold">
              {props.intl.formatMessage({ id: "specialVipLevel1" })}
            </div>
            <div className="fee-specialVipLevel-bold-latest">
              {props.intl.formatMessage({ id: "specialVipLevel2" })}{" "}
              <u className="fee-specialVipLevel-vip">
                VIP
                {useData.tradingFeeLevel.vipType &&
                useData.tradingFeeLevel.specialVipLevel !== null
                  ? useData.tradingFeeLevel.specialVipLevel
                  : 1}
              </u>
            </div>
            <div className="fee-specialVipLevel-text">
              {props.intl.formatMessage({ id: "specialVipLevel3" })}
            </div>
            <div className="fee-specialVipLevel-text">
              {props.intl.formatMessage({ id: "specialVipLevel4" })}
            </div>
          </div>
        )}
      <div className="fee-progress">
        <ProgressComponent
          type="feeSchedule"
          feeData={feeData}
          lastLevel={lastLevel}
          resultCallback={resultCallback}
        />
      </div>
      <div className="fee-table">
        <nav className="fee-table-tading">
          <span>{props.intl.formatMessage({ id: "Trading_Fee" })}</span>
          <span
            onClick={() => {
              setVisable(true);
            }}
          >
            {props.intl.formatMessage({ id: "fee_Maker/Taker" })}
          </span>
        </nav>
        <Table
          columns={column}
          dataSource={feeData}
          rowClassName={(record) =>
            record.vipLevel === vipLevel ? "bgColor" : ""
          }
          rowKey={(recond) => recond._id}
          bordered
          size="middle"
          pagination={false}
          locale={{
            emptyText: (
              <div className="empty-table">
                <img src={empty} alt="empty-table" />
                <span style={{ marginTop: "12px" }}>
                  {props.intl.formatMessage({ id: "Fees_loading" })}
                </span>
              </div>
            )
          }}
        />
        <nav className="fee-table-tading" style={{marginTop:"24px"}}>
          <span>Plp fee</span>
          <span
            onClick={() => {
              setVisable(true);
            }}
          >

            {/* {props.intl.formatMessage({ id: "fee_Maker/Taker" })} */}
          </span>
        </nav>
         <Table
          columns={column}
          dataSource={plpData}
          rowClassName={(record) =>
            record.vipLevel === vipLevel ? "bgColor" : ""
          }
          rowKey={(recond) => recond._id}
          bordered
          size="middle"
          pagination={false}
          locale={{
            emptyText: (
              <div className="empty-table">
                <img src={empty} alt="empty-table" />
                <span style={{ marginTop: "12px" }}>
                  {props.intl.formatMessage({ id: "Fees_loading" })}
                </span>
              </div>
            )
          }}
        />
        <div className="fee-message">
          <div className="message-title">
            {props.intl.formatMessage({ id: "Fee_Specifications" })}
          </div>
          <div className="fee-message-first">
            <span className="fee-tag"></span>
            <span>{props.intl.formatMessage({ id: "trad_fee_message1" })}</span>
          </div>
          <div className="fee-message-first">
            <span className="fee-tag"></span>
            <span>{props.intl.formatMessage({ id: "trad_fee_message2" })}</span>
          </div>
          <div className="fee-message-first-two">
            <span className="fee-tags"></span>
            <span>{props.intl.formatMessage({ id: "trad_fee_message3" })}</span>
          </div>
          <div className="fee-notes">
            <div className="fee-notes-div1">
              <span className="fee-tag"></span>
              <span>{props.intl.formatMessage({ id: "Notes" })}:</span>
            </div>
            <div className="fee-notes-div2">
              {props.intl.formatMessage({ id: "trad_fee_message4" })}
            </div>
            <div className="fee-notes-div2">
              {" "}
              {props.intl.formatMessage({ id: "trad_fee_message5" })}
            </div>
            <div className="fee-notes-div2">
              Fee=((1 * 9000) + (1 * 9010)) * fee
            </div>
          </div>
          <div className="message-title">
            {props.intl.formatMessage({ id: "enough_FLEX" })}
          </div>
          <div className="fee-notes">
            <div className="fee-notes-div1">
              <span className="fee-tag"></span>
              <span>
                {props.intl.formatMessage({ id: "Contracts_Spread" })}:
              </span>
            </div>
            <div className="fee-notes-div2">
              {props.intl.formatMessage({ id: "Linear_accounts" })}
            </div>
            <div className="fee-notes-div2">
              {props.intl.formatMessage({ id: "Inverse_accounts" })}
            </div>
            <div className="fee-notes-div2">
              {props.intl.formatMessage({ id: "trad_fee_message6" })}
            </div>
          </div>
          <div className="fee-notes">
            <div className="fee-notes-div1">
              <span className="fee-tag"></span>
              <span>{props.intl.formatMessage({ id: "Spot" })}:</span>
            </div>
            <div className="fee-notes-div2">
              {props.intl.formatMessage({ id: "trad_fee_message7" })}
            </div>
            <div className="fee-notes-div2">
              {props.intl.formatMessage({ id: "trad_fee_message8" })}
            </div>
          </div>
          <MakerModal visable={visable} onCloseModel={onCloseModel} />
        </div>
      </div>
    </div>
  );
}
const mapStateToProps = (state: IGlobalT) => {
  return {
    useData: state.dashboardUserData
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(FeeSchedule));
