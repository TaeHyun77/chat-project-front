import React, { useEffect, useState, useContext } from "react";
import { FuncModule } from "./FuncList";

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
  const {
    getFormattedDate,
    getTomorrowDate,
    get2LaterDate,
    formatDateTime,
    formatDateTime2,
    calculateDelay,
    getCongestionLevel,
  } = useContext(FuncModule);

  const [departureData, setDepartureDataList] = useState([]);
  const [filteredToday, setFilteredToday] = useState([]);
  const [filteredNext, setFilteredNext] = useState([]);
  const [planeList, setPlaneList] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateList, setSelectedDateList] = useState(filteredToday);

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

  const lineOptions = [
    { key: "t1Depart12", label: "T1 출발 (1, 2번 게이트)" },
    { key: "t1Depart3", label: "T1 출발 (3번 게이트)" },
    { key: "t1Depart4", label: "T1 출발 (4번 게이트)" },
    { key: "t1Depart56", label: "T1 출발 (5, 6번 게이트)" },
    { key: "t2Depart1", label: "T2 출발 (1번 게이트)" },
    { key: "t2Depart2", label: "T2 출발 (2번 게이트)" },
  ];

  const toggleSelection = (key) => {
    setSelectedLines(
      (prev) => (prev.includes(key) ? [] : [key]) // 배열에 하나만 들어가게끔 설정
    );
  };

  const filteredFlights = planeList.filter((plane) =>
    plane.flightId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    getDepartureData();
    getPlaneList();
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h2>
          출국장 예상 혼잡도 <span>( {formatDateTime2(selectedDate)} )</span>
        </h2>
        <div className="departure-info">
          <p style={{ color: "blue" }}>
            오늘로부터 이틀 간의 데이터를 제공합니다.{" "}
          </p>
          <p>7000명 미만 : 원활</p>
          <p>7001명 ~ 7600명: 보통</p>
          <p>7601명 ~ 8200명 : 약간 혼잡</p>
          <p>8201명 ~ 8600명 : 혼잡</p>
          <p>8601명 이상 : 매우 혼잡</p>
        </div>
        <div className="chart-section">
          <div className="chart-filters">
            <div className="date-buttons">
              <button
                onClick={() => {
                  setSelectedDate(getFormattedDate().substring(4));
                  setSelectedDateList(filteredToday);
                }}
              >
                {formatDateTime2(getFormattedDate().substring(4))}
              </button>
              <button
                onClick={() => {
                  setSelectedDate(getTomorrowDate().substring(4));
                  setSelectedDateList(filteredNext);
                }}
              >
                {formatDateTime2(getTomorrowDate().substring(4))}
              </button>
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
              data={selectedDateList}
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
                    selectedDateList,
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
                  stroke="blue"
                  name={lineOptions.find((o) => o.key === key)?.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="container">
        <h2>
          항공기 목록{" "}
          <span>
            ( {formatDateTime2(getFormattedDate().substring(4))} ~{" "}
            {formatDateTime2(get2LaterDate().substring(4))} )
          </span>
        </h2>

        <div className="departure-info">
          <p style={{ color: "blue" }}>
            오늘로부터 3일 간의 데이터를 제공합니다.{" "}
          </p>
          <p style={{ color: "blue" }}>항공기 상태 값이 업데이트 됩니다.</p>
        </div>

        <div className="searchContainer">
          <input
            type="text"
            placeholder="항공편 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container">
          <div className="data-row header">
            <div>항공편</div>
            <div>항공사</div>
            <div>탑승구</div>
            <div>터미널</div>
            <div>상태</div>
            <div>항공기 번호</div>
            <div>시간</div>
          </div>
          <div className="data-body">
            {filteredFlights.map((plane, index) => (
              <div className="data-row" key={index}>
                <div>{plane.flightId}</div>
                <div>{plane.airLine}</div>
                <div>{plane.gateNumber}</div>
                <div>{plane.terminalId}</div>
                <div>{plane.remark == "null" ? "대기중" : plane.remark}</div>
                <div>{plane.aircraftRegNo}</div>
                <div className="plane-time">
                  {plane.scheduleDatetime === plane.estimatedDatetime ? (
                    <>
                      <p style={{ color: "red" }}>
                        예정 시간 : {formatDateTime(plane.scheduleDatetime)}
                      </p>
                      <p>변경 내역 없음</p>
                    </>
                  ) : (
                    <>
                      <p style={{ color: "red" }}>
                        예정 시간 : {formatDateTime(plane.scheduleDatetime)}
                      </p>
                      <p style={{ color: "blue" }}>
                        변경 시간 : {formatDateTime(plane.estimatedDatetime)}
                      </p>
                      <p>
                        {calculateDelay(
                          plane.scheduleDatetime,
                          plane.estimatedDatetime
                        )}
                      </p>
                    </>
                  )}
                </div>
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
