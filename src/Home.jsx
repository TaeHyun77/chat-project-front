import React, { useEffect, useState, useContext } from "react";
import * as req from "./api/req";
import { useNavigate } from "react-router-dom";
import { FuncModule } from "./state/FuncList";
import Map from "./img/map.png";
import { LoginContext } from "./state/LoginState";
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
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
  const navigate = useNavigate();
  const { isLogin, userInfo } = useContext(LoginContext);

  const [departureData, setDepartureDataList] = useState([]);
  const [filteredToday, setFilteredToday] = useState([]);
  const [filteredNext, setFilteredNext] = useState([]);
  const [planeList, setPlaneList] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateList, setSelectedDateList] = useState(filteredToday);

  const [isLoading, setIsLoading] = useState(true); // skeleton UI를 위함

  const getDepartureData = async () => {
    try {
      const response = await req.departures();

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
    setIsLoading(true); // 데이터 불러오기 시작 시 로딩 활성화
    try {
      const response = await req.planes();
      const now = new Date();

      const filteredPlanes = response.data.filter((plane) => {
        const flightDate = new Date(
          `${plane.scheduleDatetime.substring(
            0,
            4
          )}-${plane.scheduleDatetime.substring(
            4,
            6
          )}-${plane.scheduleDatetime.substring(
            6,
            8
          )}T${plane.scheduleDatetime.substring(
            8,
            10
          )}:${plane.scheduleDatetime.substring(10, 12)}`
        );
        return !(flightDate < now && plane.remark === "출발");
      });

      setPlaneList(filteredPlanes);
    } catch (error) {
      console.error("항공편 데이터 불러오는 중 오류 발생", error);
    } finally {
      setIsLoading(false); // 데이터 로드 완료 후 로딩 해제
    }
  };

  const lineOptions = [
    { key: "t1Depart12", label: "T1 (1, 2번 출국장)" },
    { key: "t1Depart3", label: "T1 (3번 출국장)" },
    { key: "t1Depart4", label: "T1 (4번 출국장)" },
    { key: "t1Depart56", label: "T1 (5, 6번 출국장)" },
    { key: "t2Depart1", label: "T2 (1번 출국장)" },
    { key: "t2Depart2", label: "T2 (2번 출국장)" },
  ];

  const toggleSelection = (key) => {
    setSelectedLines(
      (prev) => (prev.includes(key) ? [] : [key]) // 배열에 하나만 들어가게끔 설정
    );
  };

  const filteredFlights = planeList.filter((plane) =>
    plane.flightId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    const dateA = new Date(
      `${a.scheduleDatetime.substring(0, 4)}-${a.scheduleDatetime.substring(
        4,
        6
      )}-${a.scheduleDatetime.substring(6, 8)}T${a.scheduleDatetime.substring(
        8,
        10
      )}:${a.scheduleDatetime.substring(10, 12)}`
    );
    const dateB = new Date(
      `${b.scheduleDatetime.substring(0, 4)}-${b.scheduleDatetime.substring(
        4,
        6
      )}-${b.scheduleDatetime.substring(6, 8)}T${b.scheduleDatetime.substring(
        8,
        10
      )}:${b.scheduleDatetime.substring(10, 12)}`
    );

    return dateA - dateB; // 오름차순 정렬
  });

  const handleChatPage = () => {
    if (!isLogin) return alert("로그인을 먼저 진행해주세요 !");
    navigate("/chatrooms");
  };

  useEffect(() => {
    getDepartureData();
    getPlaneList();
  }, []);

  return (
    <>
      <Header />
      <div
        className="container"
        style={{ display: "flex", alignItems: "center" }}
      >
        <p className="goChat">로그인 하여 여러 사용자들과 소통해보세요 !</p>
        <button className="chatBtn" onClick={handleChatPage}>
          채팅방 이동
        </button>
      </div>
      <div className="container">
        <h2>
          출국장 예상 혼잡도 <span>( {formatDateTime2(selectedDate)} )</span>
        </h2>
        <div className="departure-info">
          <p style={{ color: "blue" }}>
            오늘로부터 이틀 간의 데이터를 제공합니다
          </p>
          <p style={{ color: "blue" }}>
            날짜를 먼저 선택 후 출국장을 선택 해주세요
          </p>
          <p style={{ color: "red" }}>7000명 미만 : 원활</p>
          <p style={{ color: "red" }}>7001명 ~ 7600명: 보통</p>
          <p style={{ color: "red" }}>7601명 ~ 8200명 : 약간 혼잡</p>
          <p style={{ color: "red" }}>8201명 ~ 8600명 : 혼잡</p>
          <p style={{ color: "red" }}>8601명 이상 : 매우 혼잡</p>
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
          <p style={{ color: "blue" }}>
            항공기 상태 값이 실시간 업데이트 됩니다.
          </p>
          <p style={{ color: "blue" }}>
            {" "}
            오늘 날짜의 조회되지 않는 항공편은 이미 출발한 항공편입니다.{" "}
          </p>
          <p style={{ color: "red" }}>
            {" "}
            P01 : T1 터미널 , P02 : 탑승동 , P03 : T2 터미널
          </p>
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
            <div>시간</div>
          </div>
          <div className="data-body">
            {isLoading
              ? // Skeleton UI 적용
                Array(8)
                  .fill()
                  .map((_, index) => (
                    <div className="data-row" key={index}>
                      <div>
                        <Skeleton width={80} height={20} />
                      </div>
                      <div>
                        <Skeleton width={100} height={20} />
                      </div>
                      <div>
                        <Skeleton width={50} height={20} />
                      </div>
                      <div>
                        <Skeleton width={50} height={20} />
                      </div>
                      <div>
                        <Skeleton width={80} height={20} />
                      </div>
                      <div>
                        <Skeleton width={120} height={20} />
                      </div>
                    </div>
                  ))
              : sortedFlights.map((plane, index) => (
                  <div className="data-row" key={index}>
                    <div>{plane.flightId}</div>
                    <div>{plane.airLine}</div>
                    <div>
                      {plane.gateNumber == ""
                        ? "미정"
                        : plane.gateNumber + "번"}
                    </div>
                    <div>{plane.terminalId}</div>
                    <div>{plane.remark == "null" ? "예정" : plane.remark}</div>
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
                            변경 시간 :{" "}
                            {formatDateTime(plane.estimatedDatetime)}
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

      <div className="container" style={{ display: "flex" }}>
        <div className="mapImg">
          <img src={Map} className="map" />
        </div>
        <div className="mapInfo">
          <p style={{ fontSize: "25px", color: "red" }}>
            B1 공항철도 입구부터 F3 체크인 카운터까지 소요시간{" "}
          </p>
          <div style={{ display: "flex" }}>
            <div style={{ marginRight: "50px" }}>
              <p>( T1 ) ~ A 체크인 카운터 : 약 16분</p>
              <p>( T1 ) ~ B 체크인 카운터 : 약 15분</p>
              <p>( T1 ) ~ C 체크인 카운터 : 약 14분</p>
              <p>( T1 ) ~ D 체크인 카운터 : 약 13분</p>
              <p>( T1 ) ~ E 체크인 카운터 : 약 12분</p>
              <p>( T1 ) ~ F 체크인 카운터 : 약 11분</p>
              <p>( T1 ) ~ G 체크인 카운터 : 약 10분</p>
              <p>( T1 ) ~ H 체크인 카운터 : 약 11분</p>
              <p>( T1 ) ~ J 체크인 카운터 : 약 12분</p>
              <p>( T1 ) ~ K 체크인 카운터 : 약 13분</p>
              <p>( T1 ) ~ L 체크인 카운터 : 약 14분</p>
              <p>( T1 ) ~ M 체크인 카운터 : 약 15분</p>
              <p>( T1 ) ~ N 체크인 카운터 : 약 16분</p>
            </div>
            <div>
              <p>( T2 ) ~ A 체크인 카운터 : 약 9분</p>
              <p>( T2 ) ~ B 체크인 카운터 : 약 8분</p>
              <p>( T2 ) ~ C 체크인 카운터 : 약 7분</p>
              <p>( T2 ) ~ D 체크인 카운터 : 약 6분</p>
              <p>( T2 ) ~ E 체크인 카운터 : 약 6분</p>
              <p>( T2 ) ~ F 체크인 카운터 : 약 7분</p>
              <p>( T2 ) ~ G 체크인 카운터 : 약 8분</p>
              <p>( T2 ) ~ H 체크인 카운터 : 약 9분</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
