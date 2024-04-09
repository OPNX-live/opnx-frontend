/** @jsxImportSource @emotion/react */
import { useIntl } from "react-intl";
import { Modal, Tabs } from "@opnx-pkg/uikit";
import { memo, useCallback, useState } from "react";
import styled from "@emotion/styled";
const Wapper = styled(Modal)`
  .opnx-modal-content {
    height: 100%;
    width: 100%;
  }
  .opnx-modal-body {
    overflow: hidden;
    padding: 0;
  }
`;
interface IProps {
  isOpen: boolean;
  onCallBack: () => void;
}
const VideoModal = memo<IProps>(({ isOpen, onCallBack }) => {
  const [activeTab, setActiveTab] = useState("1");
  const tabData = [
    {
      value: "1",
      children: "Video 1",
    },
  ];
  const tabContent = useCallback(() => {
    switch (activeTab) {
      case "1":
        return (
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/eZ31-lksMT0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      default:
        break;
    }
  }, [activeTab]);
  return (
    <Wapper isOpen={isOpen} onCancel={() => onCallBack()}>
      {/* <Tabs
        onChange={(e) => {
          setActiveTab(e);
        }}
        activeKey={activeTab}
      >
        {tabData.map((p: { value: string; children: string }) => (
          <Tabs.TabPane
            key={p.value}
            value={p.value}
            tab={p.children}
          ></Tabs.TabPane>
        ))}
      </Tabs> */}
      {tabContent()}
    </Wapper>
  );
});
export default VideoModal;
