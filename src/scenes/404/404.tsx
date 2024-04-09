import React from "react";
import history from "router/history";
import NoPage from "assets/image/404.png";
import "./style/404.scss";
function Index() {
  return (
    <div className="noPage" onClick={() => history.replace("/home")}>
      <div className="noPage-container">
        <img src={NoPage} alt="404" />
      </div>
    </div>
  );
}
export default Index;
