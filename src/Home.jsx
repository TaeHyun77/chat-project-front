import React, { useEffect, useState, useContext, useCallback } from "react";
import * as req from "./api/req";
import { useNavigate } from "react-router-dom";
import { FuncModule } from "./state/FuncList";
import { LoginContext } from "./state/LoginState";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Skeleton from "react-loading-skeleton";
import "./Home.css";
import "react-loading-skeleton/dist/skeleton.css";

const PAGE_SIZE = 20;

const lineOptions = [
  { key: "t1Depart1", label: "T1 (1번 출국장)" },
  { key: "t1Depart2", label: "T1 (2번 출국장)" },
  { key: "t1Depart3", label: "T1 (3번 출국장)" },
  { key: "t1Depart4", label: "T1 (4번 출국장)" },
  { key: "t1Depart5", label: "T1 (5번 출국장)" },
  { key: "t1Depart6", label: "T1 (6번 출국장)" },
  { key: "t2Depart1", label: "T2 (1번 출국장)" },
  { key: "t2Depart2", label: "T2 (2번 출국장)" },
];

const Home = () => {
  const navigate = useNavigate();
  const { isLogin } = useContext(LoginContext);

  const {
    getFormattedDate,
    getTomorrowDate,
    get2LaterDate,
    formatDateTime,
    formatDateTime2,
    calculateDelay,
    getCongestionLevel,
  } = useContext(FuncModule);

  // 출국장 혼잡도 상태
  const [departures, setDepartures] = useState([]);
  const [filteredToday, setFilteredToday] = useState([]);
  const [filteredNext, setFilteredNext] = useState([]);
  const [selectedDate, setSelectedDate] = useState(""); // yyyyMMdd
  const [selectedDateList, setSelectedDateList] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);

  // 항공편 상태
  const [planes, setPlanes] = useState([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(true);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [selectedPlaneDate, setSelectedPlaneDate] = useState(
    getFormattedDate()
  );
  const [searchTerm, setSearchTerm] = useState("");

  const getDepartureData = async () => {
    try {
      const res = await req.departures();
      setDepartures(res.data);

      setFilteredToday(
        res.data.filter((d) => d.date === getFormattedDate())
      );
      setFilteredNext(
        res.data.filter((d) => d.date === getTomorrowDate())
      );

      setSelectedDate(getFormattedDate().substring(4));
      setSelectedDateList(
        res.data.filter((d) => d.date === getFormattedDate())
      );

      setSelectedLines(["t1Depart1"]);
    } catch (e) {
      console.error(e);
    }
  };

  const getPlanes = useCallback(async (reset = false) => {
    if (isFetching || (!hasNext && !reset)) return;


    const requestPage = reset ? 0 : page;

    reset ? setIsInitialLoading(true) : setIsFetching(true);

    try {
      const res = await req.getSlicePlanes({
        date: selectedPlaneDate,
        page: requestPage,
        size: PAGE_SIZE,
      });

      const content = res.data.content ?? [];

      setPlanes(prev =>
        reset ? content : [...prev, ...content]
      );

      setHasNext(!res.data.last);
      setPage(prev => (reset ? 1 : prev + 1));
    } catch (e) {
      console.error(e);
    } finally {
      setIsInitialLoading(false);
      setIsFetching(false);
    }
  }, [selectedPlaneDate, page, hasNext, isFetching]);


  const onScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollHeight - scrollTop <= clientHeight + 20) {
      getPlanes();
    }
  };

  const handleChatPage = () => {
    if (!isLogin) return alert("로그인을 먼저 진행해주세요 !");
    navigate("/chatrooms");
  };

  const toggleSelection = (key) => {
    setSelectedLines(prev =>
      prev.includes(key) ? [] : [key]
    );
  };

  const filteredPlanes = (planes ?? []).filter((p) =>
    p.flightId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    getDepartureData();
  }, []);

  useEffect(() => {
    setSelectedLines([]); // 날짜 변경 시 출국장 선택 해제
  }, [selectedDate]);

  useEffect(() => {
    setPlanes([]);
    setPage(0);
    setHasNext(true);
    getPlanes(true);
    document.querySelector(".table-container")?.scrollTo(0, 0);
  }, [selectedPlaneDate]);

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
                className={
                  selectedDate === getFormattedDate().substring(4) ? "active" : ""
                }
                onClick={() => {
                  setSelectedDate(getFormattedDate().substring(4));
                  setSelectedDateList(filteredToday);
                }}
              >
                {formatDateTime2(getFormattedDate().substring(4))}
              </button>

              <button
                className={
                  selectedDate === getTomorrowDate().substring(4) ? "active" : ""
                }
                onClick={() => {
                  setSelectedDate(getTomorrowDate().substring(4));
                  setSelectedDateList(filteredNext);
                }}
              >
                {formatDateTime2(getTomorrowDate().substring(4))}
              </button>
            </div>

            <div className="place-buttons">
              {lineOptions.map((option) => {
                const isSelected = selectedLines.includes(option.key);

                return (
                  <div key={option.key}>
                    <button
                      type="button"
                      className={isSelected ? "active" : ""}
                      onClick={() => toggleSelection(option.key)}
                    >
                      {option.label}
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
          <ResponsiveContainer width="100%" height={470}>
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
        <h2>항공편</h2>

        <div className="date-buttons">
          {[getFormattedDate(), getTomorrowDate(), get2LaterDate()].map((d) => (
            <button
              key={d}
              className={selectedPlaneDate === d ? "active" : ""}
              onClick={() => setSelectedPlaneDate(d)}
            >
              {formatDateTime2(d.substring(4))}
            </button>
          ))}
        </div>

        <div className="searchContainer">
          <input
            placeholder="항공편 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-container" onScroll={onScroll}>
          <div className="table-header">
            <div>항공편명</div>
            <div>항공사</div>
            <div>탑승구</div>
            <div>터미널</div>
            <div>상태</div>
            <div>체크인</div>
            <div>시간</div>
          </div>

          {isInitialLoading && <Skeleton count={8} height={40} />}

          {filteredPlanes.map((p, index) => (
            <div
              key={`${p.flightId}-${p.scheduleDateTime}-${index}`}
              className="data-row"
            >
              <div data-label="항공편명">{p.flightId}</div>
              <div data-label="항공사">{p.airLine}</div>
              <div data-label="탑승구">{p.gatenumber || "미정"}</div>
              <div data-label="터미널">{p.terminalid}</div>
              <div data-label="상태">{p.remark === "null" ? "예정" : p.remark}</div>
              <div data-label="체크인">{p.chkinrange}</div>

              <div data-label="시간" className="plane-time">
                <p className="real-time">예정 시각 : {formatDateTime(p.scheduleDateTime)}</p>
                <p className="update-time">변경 시각 : {formatDateTime(p.estimatedDateTime)}</p>
                <p className="delay-time">{calculateDelay(p.scheduleDateTime, p.estimatedDateTime)}</p>
              </div>

            </div>
          ))}

          {isFetching && <Skeleton count={3} height={40} />}
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Home;
