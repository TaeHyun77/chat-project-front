import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "./LoginState";
import api from "./api/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Home.css";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";

const Home = () => {
  const [departureData, setDepartureDataList] = useState([]);
  const [filteredToday, setFilteredToday] = useState([]);
  const [filteredNext, setFilteredNext] = useState([]);
  const [planeList, setPlaneList] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);

  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const get2LaterDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const getDepartureData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/get/departures");
      setDepartureDataList(response.data);

      const filteredToday = response.data.filter(
        (list) => list.date == getFormattedDate()
      );
      setFilteredToday(filteredToday);
      console.log(filteredToday);

      const filteredNext = response.data.filter(
        (list) => list.date == getTomorrowDate()
      );
      setFilteredNext(filteredNext);
      console.log(filteredNext);
    } catch (errer) {
      console.error("출국장 데이터 불러오는 중 오류 발생", errer);
    }
  };

  const getPlaneList = async () => {
    try {
      const response = await axios.get("http://localhost:8080/get/planes");

      setPlaneList(response.data);
      console.log(planeList);
    } catch (errer) {
      console.error("출국장 데이터 불러오는 중 오류 발생", errer);
    }
  };

  const toggleSelection = (key) => {
    setSelectedLines(
      (prev) => (prev.includes(key) ? [] : [key]) // 배열에 하나만 들어가게끔 설정
    );
  };

  const getCongestionLevel = (value, data, index) => {
    // 2시간 지속 체크
    const prev1 = index > 0 ? data[index - 1].totalDepartures : 0;
    const prev2 = index > 1 ? data[index - 2].totalDepartures : 0;
    const is2HoursAbove7600 = prev1 > 7600 && prev2 > 7600;
    const is2HoursAbove8200 = prev1 > 8200 && prev2 > 8200;

    if (value < 7000) return "원활";
    if (value <= 7600) return "보통";
    if (value <= 8200) return "약간 혼잡";
    if (value <= 8600 || is2HoursAbove7600) return "혼잡";
    if (value > 8600 || is2HoursAbove8200) return "매우 혼잡";
    return "";
  };

  const lineOptions = [
    { key: "t1Depart12", label: "T1 출발 (1, 2번 게이트)" },
    { key: "t1Depart3", label: "T1 출발 (3번 게이트)" },
    { key: "t1Depart4", label: "T1 출발 (4번 게이트)" },
    { key: "t1Depart56", label: "T1 출발 (5, 6번 게이트)" },
    { key: "t2Depart1", label: "T2 출발 (1번 게이트)" },
    { key: "t2Depart2", label: "T2 출발 (2번 게이트)" },
  ];

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ff7300",
    "#00c49f",
    "#ffbb28",
    "#ff4444",
  ];

  useEffect(() => {
    getDepartureData();
    getPlaneList();
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h2>출국장 혼잡도</h2>
        <div className="chart-section">
          <div className="chart-filters">
            <div className="date-buttons">
              <button>{getFormattedDate().substring(4)}</button>
              <button>{getTomorrowDate().substring(4)}</button>
            </div>
            <div className="place-buttons">
              {lineOptions.map((option) => (
                <div key={option.key}>
                  <button
                    type="button"
                    onClick={() => toggleSelection(option.key)}
                  >
                    {option.label}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={filteredToday}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timeZone"
                tickFormatter={(tick) => tick.split("_")[0]}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => {
                  const congestion = getCongestionLevel(
                    value,
                    filteredToday,
                    props.payload.index
                  );
                  return [`${value}명 (${congestion})`, name];
                }}
              />
              <Legend />
              {selectedLines.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  name={lineOptions.find((o) => o.key === key)?.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="container">
        <h2>
          {getFormattedDate().substring(4)} ~ {get2LaterDate().substring(4)}{" "}
          항공기 목록{" "}
        </h2>
        <div className="table-container">
          <div className="data-row header">
            <div>항공편</div>
            <div>항공사</div>
            <div>일정 출발 시간</div>
            <div>변경 시간</div>
            <div>탑승구</div>
            <div>터미널</div>
            <div>상태</div>
            <div>항공기 번호</div>
          </div>
          <div className="data-body">
            {planeList.map((plane, index) => (
              <div className="data-row" key={index}>
                <div>{plane.flightId}</div>
                <div>{plane.airLine}</div>
                <div>{plane.scheduleDatetime}</div>
                <div>{plane.estimatedDatetime}</div>
                <div>{plane.gateNumber}</div>
                <div>{plane.terminalId}</div>
                <div>{plane.remark}</div>
                <div>{plane.aircraftRegNo}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
