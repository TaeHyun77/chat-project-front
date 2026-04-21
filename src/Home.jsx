import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import * as req from "./api/req";
import Footer from "./footer/Footer";
import Header from "./header/Header";
import "./Home.css";
import { FuncModule } from "./state/FuncList";
import { LoginContext } from "./state/LoginState";

const PAGE_SIZE = 20;

const terminalGroups = [
  {
    terminal: "T1",
    options: [
      { key: "t1Depart1", label: "1번" },
      { key: "t1Depart2", label: "2번" },
      { key: "t1Depart3", label: "3번" },
      { key: "t1Depart4", label: "4번" },
      { key: "t1Depart5", label: "5번" },
      { key: "t1Depart6", label: "6번" },
    ],
  },
  {
    terminal: "T2",
    options: [
      { key: "t2Depart1", label: "1번" },
      { key: "t2Depart2", label: "2번" },
    ],
  },
];

// 차트 Legend용 전체 옵션 (label에 터미널 포함)
const allLineOptions = terminalGroups.flatMap((g) =>
  g.options.map((o) => ({ ...o, label: `${g.terminal} ${o.label} 출국장` }))
);

const Home = () => {
  const navigate = useNavigate();
  const { isLogin } = useContext(LoginContext);

  const {
    getYesterdayDate,
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
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

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
    if (searchTerm.trim()) return;
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollHeight - scrollTop <= clientHeight + 20) {
      getPlanes();
    }
  };

  const handleAutoComplete = async (value) => {
    console.log("selectedPlaneDate : " + selectedPlaneDate)
    setSearchTerm(value);

    if (!value.trim()) {
      setSuggestions([]);
      setSearchResults([]);
      return;
    }

    try {
      const res = await req.autocompleteFlights(value, selectedPlaneDate);
      setSuggestions(res.data || []);
    } catch (err) {
      console.error("자동완성 실패", err);
    }
  };

  const handleSearch = async (keyword) => {
    const q = keyword ?? searchTerm;
    if (!q.trim()) return;

    setSuggestions([]);
    setIsSearchLoading(true);

    try {
      const res = await req.searchFlights({
        q,
        date: selectedPlaneDate || undefined,
      });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("항공편 검색 실패:", err);
    } finally {
      setIsSearchLoading(false);
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

  const getBarColor = (value) => {
    if (value < 7000) return "#4caf50";
    if (value <= 7600) return "#8bc34a";
    if (value <= 8200) return "#ffc107";
    if (value <= 8600) return "#ff9800";
    return "#f44336";
  };

  const isSearchMode = searchTerm.trim().length > 0;

  const sortedSearchResults = useMemo(() => {
    return [...searchResults].sort((a, b) =>
      String(a.scheduleDateTime).localeCompare(String(b.scheduleDateTime))
    );
  }, [searchResults]);

  const isYesterday = selectedPlaneDate === getYesterdayDate();

  const filteredPlanes = useMemo(() => {
    if (!isYesterday) return planes;
    return planes.filter((p) => p.remark !== "출발");
  }, [planes, isYesterday]);

  const displayPlanes = isSearchMode ? sortedSearchResults : filteredPlanes;

  useEffect(() => {
    getDepartureData();
  }, []);

  useEffect(() => {
    setSelectedLines([]); // 날짜 변경 시 출국장 선택 해제
  }, [selectedDate]);

  useEffect(() => {
    setSearchTerm("");
    setSuggestions([]);
    setSearchResults([]);
    setPlanes([]);
    setPage(0);
    setHasNext(true);
    getPlanes(true);
    document.querySelector(".table-container")?.scrollTo(0, 0);
  }, [selectedPlaneDate]);

  return (
    <>
      <Header />
      <div className="container">
        <h2>
          출국장 예상 혼잡도 <span>( {formatDateTime2(selectedDate)} )</span>
        </h2>
        <div className="departure-info">
          <div className="info-notice">
            <p>오늘로부터 이틀 간의 데이터를 제공합니다</p>
            <p>날짜를 먼저 선택 후 출국장을 선택 해주세요</p>
          </div>
          <div className="info-levels">
            <span className="level smooth">원활 (7,000명 미만)</span>
            <span className="level normal">보통 (7,001 ~ 7,600명)</span>
            <span className="level slight">약간 혼잡 (7,601 ~ 8,200명)</span>
            <span className="level busy">혼잡 (8,201 ~ 8,600명)</span>
            <span className="level very-busy">매우 혼잡 (8,601명 이상)</span>
          </div>
        </div>
        <div className="chart-section">
          <div className="chart-filters">
            <div className="filter-group">
              <span className="filter-label">날짜</span>
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
            </div>
            <div className="filter-group">
              <span className="filter-label">출국장</span>
              <div className="terminal-groups">
                {terminalGroups.map((group) => (
                  <div key={group.terminal} className="terminal-group">
                    <span className="terminal-label">{group.terminal}</span>
                    <div className="place-buttons">
                      {group.options.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          className={selectedLines.includes(option.key) ? "active" : ""}
                          onClick={() => toggleSelection(option.key)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={selectedDateList}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis
                  dataKey="timeZone"
                  tickFormatter={(tick) => tick.split("_")[0]}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(120, 187, 223, 0.1)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    const value = payload[0].value;
                    const name = payload[0].name;
                    const isNoData = value == null || value === 0;
                    return (
                      <div style={{
                        background: "white",
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: "12px 16px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: 13,
                      }}>
                        <p style={{ margin: "0 0 6px", color: "#666", fontWeight: 500 }}>
                          {label?.split("_")[0]}
                        </p>
                        {isNoData ? (
                          <span style={{
                            display: "inline-block",
                            padding: "3px 10px",
                            borderRadius: 12,
                            backgroundColor: "#ccc",
                            color: "white",
                            fontSize: 12,
                            fontWeight: 500,
                          }}>
                            미운영
                          </span>
                        ) : (
                          <>
                            <p style={{ margin: "0 0 4px", color: "#333" }}>
                              {name}: <strong>{value.toLocaleString()}명</strong>
                            </p>
                            <span style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: 12,
                              backgroundColor: getBarColor(value),
                              color: getBarColor(value) === "#ffc107" ? "#333" : "white",
                              fontSize: 12,
                              fontWeight: 500,
                            }}>
                              {getCongestionLevel(value, selectedDateList,
                                selectedDateList.findIndex((d) => d.timeZone === label))}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#333", fontSize: 13, fontWeight: 500 }}>
                      {value}
                    </span>
                  )}
                />
                {selectedLines.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    radius={[4, 4, 0, 0]}
                    name={allLineOptions.find((o) => o.key === key)?.label}
                  >
                    {selectedDateList.map((entry, index) => (
                      <Cell key={index} fill={getBarColor(entry[key] || 0)} />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="container">
        <h2>항공편</h2>

        <div className="plane-toolbar">
          <div className="date-buttons">
            {[getYesterdayDate(), getFormattedDate(), getTomorrowDate(), get2LaterDate()].map((d) => (
              <button
                key={d}
                className={selectedPlaneDate === d ? "active" : ""}
                onClick={() => setSelectedPlaneDate(d)}
              >
                {d === getYesterdayDate() ? "어제" : formatDateTime2(d.substring(4))}
              </button>
            ))}
          </div>
          <div className="searchContainer">
            <input
              placeholder="편명, 항공사, 공항 검색"
              value={searchTerm}
              onChange={(e) => handleAutoComplete(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            {suggestions.length > 0 && (
              <ul className="home_autocomplete_list">
                {suggestions.map((s, idx) => {
                  const parts = s.split(" | ");
                  const displayText = parts.length >= 4
                    ? `${parts[0]} | ${parts[1]} | ${parts[2]} | ${formatDateTime(parts[3])}`
                    : s;
                  return (
                    <li
                      key={idx}
                      onClick={() => {
                        setSearchTerm(parts[0]);
                        setSuggestions([]);
                        handleSearch(parts[0]);
                      }}
                    >
                      {displayText}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {selectedPlaneDate === getYesterdayDate() && (
          <p className="yesterday-notice">
            이 목록에 없는 항공편은 이미 출발한 항공편입니다.
          </p>
        )}

        <div className="table-container" onScroll={onScroll}>
          <div className="table-header">
            <div>항공편명</div>
            <div>항공사</div>
            <div>목적지</div>
            <div>탑승구</div>
            <div>터미널</div>
            <div>상태</div>
            <div>체크인</div>
            <div>시간</div>
          </div>

          {(isInitialLoading || isSearchLoading) && <Skeleton count={8} height={40} />}

          {!isInitialLoading && !isSearchLoading && displayPlanes.length === 0 && (
            <div className="table-empty">조회된 항공편이 없습니다.</div>
          )}

          {!isSearchLoading && displayPlanes.map((p, index) => (
            <div
              key={`${p.flightId}-${p.scheduleDateTime}-${index}`}
              className="data-row"
            >
              <div data-label="항공편명">{p.flightId}</div>
              <div data-label="항공사">{p.airLine}</div>
              <div data-label="목적지">{p.airport}</div>
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

          {!isSearchMode && isFetching && <Skeleton count={3} height={40} />}
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Home;