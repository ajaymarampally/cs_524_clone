import React, { useState } from "react";
import info1 from "../img/info_1.jpg";
import info2 from "../img/info_2.jpg";
import info3 from "../img/info_3.jpg";
import info4 from "../img/info_4.jpg";
import hamburger from "../img/hamburger.svg";

interface AnalyticsProps {
  analytics_header: string;
}

function AnalyticsComponent(props: AnalyticsProps) {


  const convertCamelCase = (str: string) => {
    return str
      .split(" ")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      <div id="analytics__box">
        <div id="analytics_hamburger">
            <img src={hamburger} alt="hamburger" id="hamburger__icon" />
        </div>
        <div id="analytics__header">
          {convertCamelCase(props.analytics_header.toLowerCase())}
        </div>
        <div className="row">
          <div className="col-6">
            <div id="analytics__info">
                <img src={info1} alt="info1" id="info__img" />
            </div>
            </div>
          <div className="col-6">
            <div id="analytics__info">
                <img src={info2} alt="info2" id="info__img" />
            </div>
            </div>
        </div>
        <div className="row">
          <div className="col-6">
            <div id="analytics__info">
                <img src={info3} alt="info3" id="info__img" />
            </div>
          </div>
          <div className="col-6">
            <div id="analytics__info">
                <img src={info4} alt="info4" id="info__img" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AnalyticsComponent;
