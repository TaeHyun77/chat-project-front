import React, { useEffect, useState, useContext, useMemo } from "react";
import { LoginContext } from "../state/LoginState";
import * as req from "../api/req";

import "./FlightSection.css";

// weathercode → 날씨 아이콘 매핑
const getWeatherIcon = (code) => {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 57) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 67) return "🌧️";
  if (code <= 75) return "🌨️";
  if (code === 77) return "🌨️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌡️";
};

const FlightSection = () => {
  const { userInfo } = useContext(LoginContext);

  const [flightKeyword, setFlightKeyword] = useState("");
  const [flightDate, setFlightDate] = useState("");
  const [flightResults, setFlightResults] = useState([]);
  const [isFlightLoading, setIsFlightLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [subscribedIds, setSubscribedIds] = useState(new Set());
  const [subscribedFlights, setSubscribedFlights] = useState([]);
  const [weatherMap, setWeatherMap] = useState({});
  const [weatherLoading, setWeatherLoading] = useState(false);

  const searchFlights = async () => {
    if (!flightKeyword.trim()) {
      alert("검색어를 입력해주세요!");
      return;
    }

    try {
      setIsFlightLoading(true);
      const response = await req.searchFlights({
        q: flightKeyword,
        date: flightDate || undefined
      });

      setFlightResults(response.data || []);
    } catch (error) {
      console.error("항공편 검색 실패:", error);
    } finally {
      setIsFlightLoading(false);
    }
  };

  const handleAutoComplete = async (value) => {
    setFlightKeyword(value);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await req.autocompleteFlights(value);
      setSuggestions(res.data || []);
    } catch (err) {
      console.error("자동완성 실패", err);
    }
  };

  const fetchSubscribedFlights = async () => {
    try {
      const response = await req.getSubscribedFlights();
      const flights = response.data || [];
      setSubscribedFlights(flights);
      setSubscribedIds(new Set(flights.map((f) => String(f.id))));
    } catch (error) {
      console.error("구독 항공편 조회 실패:", error);
    }
  };

  const handleSubscribe = async (flight) => {
    console.log("구독 요청 항공편 정보:", flight);
    try {
      await req.subscribeFlight(flight.planeId);
      await fetchSubscribedFlights();
      alert("항공편 구독에 성공하였습니다.")
    } catch (error) {
      console.error("항공편 구독 실패:", error);
      if (error.response?.status === 409) {
        alert("이미 구독한 항공편입니다.");
      } else {
        alert("항공편 구독에 실패했습니다.");
      }
    }
  };

  const handleUnsubscribe = async (flight) => {
    console.log("구독 해제 요청 항공편 정보:", flight);
    try {
      await req.unsubscribeFlight(flight.id);
      await fetchSubscribedFlights();
      alert("항공편 구독 해제에 성공하였습니다.");
    } catch (error) {
      console.error("항공편 구독 해제 실패:", error);
      alert("항공편 구독 해제에 실패했습니다.");
    }
  };

  const fetchWeatherForSubscriptions = async () => {
    setWeatherLoading(true);
    try {
      const response = await req.getSubscribedFlightWeather();
      const list = response.data || [];
      const map = {};
      list.forEach((item) => {
        map[item.airportCode] = item;
      });
      setWeatherMap(map);
    } catch (error) {
      console.error("날씨 예보 조회 실패:", error);
    }
    setWeatherLoading(false);
  };

  const formatFlightDateTime = (raw) => {
    if (!raw) return "-";

    const year = raw.substring(0, 4);
    const month = raw.substring(4, 6);
    const day = raw.substring(6, 8);
    const hour = raw.substring(8, 10);
    const minute = raw.substring(10, 12);

    return `${year}.${month}.${day} ${hour}:${minute}`;
  };

  useEffect(() => {
    if (userInfo?.id) {
      fetchSubscribedFlights();
    }
  }, [userInfo]);

  useEffect(() => {
    if (subscribedFlights.length > 0) {
      fetchWeatherForSubscriptions();
    }
  }, [subscribedFlights]);

  const sortedFlightResults = useMemo(() => {
    return [...flightResults].sort((a, b) =>
      String(a.scheduleDateTime).localeCompare(String(b.scheduleDateTime))
    );
  }, [flightResults]);

  return (
    <>
      {/* 항공편 검색 */}
      <div className="flight_section_wrapper">
        <div className="flight_search_section">
          <h3>항공편 검색</h3>

          <div className="edit_group flight_search_group">
            <div className="flight_input_box">
              <input
                type="text"
                placeholder="편명, 항공사, 공항 입력"
                value={flightKeyword}
                onChange={(e) => handleAutoComplete(e.target.value)}
              />

              {suggestions.length > 0 && (
                <ul className="autocomplete_list">
                  {suggestions.map((s, idx) => {
                    const parts = s.split(" | ");
                    const displayText = parts.length >= 4
                      ? `${parts[0]} | ${parts[1]} | ${parts[2]} | ${formatFlightDateTime(parts[3])}`
                      : s;
                    return (
                      <li
                        key={idx}
                        onClick={() => {
                          setFlightKeyword(parts[0]);
                          setSuggestions([]);
                        }}
                      >
                        {displayText}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <input
              type="text"
              placeholder="날짜 : YYYYMMDD"
              value={flightDate}
              onChange={(e) => setFlightDate(e.target.value)}
            />

            <button className="distinctBtn" onClick={searchFlights}>
              검색
            </button>
          </div>

          <ul className="flight_result_list">
            {isFlightLoading ? (
              <p className="flight-empty">검색 중...</p>
            ) : suggestions.length > 0 ? null : sortedFlightResults.length === 0 ? (
              <p className="flight-empty">검색 결과가 없습니다.</p>
            ) : (
              sortedFlightResults.map((flight) => (
                <li key={flight.flightId + flight.scheduleDateTime}>
                  <div className="flight_card">
                    <div className="flight_card_top">
                      <strong>{flight.flightId} - {flight.airLine}</strong>
                    </div>

                    <div className="flight_airport">{flight.airport}</div>

                    <div className="flight_meta">
                      <span>예정: {formatFlightDateTime(flight.scheduleDateTime)}</span>
                      <span>변경: {formatFlightDateTime(flight.estimatedDateTime)}</span>
                    </div>

                    <div className="flight_meta">
                      <span>터미널: {flight.terminalid}</span>
                      <span>체크인: {flight.chkinrange || "-"}</span>
                      <span>게이트: {flight.gatenumber || "-"}</span>
                      <span>상태: {flight.remark && flight.remark !== "null" ? flight.remark : "미정"}</span>
                    </div>

                    <div className="flight_subscribe">
                      {subscribedIds.has(String(flight.planeId)) ? (
                        <button
                          className="unsubscribe_btn"
                          onClick={() => handleUnsubscribe(flight)}
                        >
                          구독 해제
                        </button>
                      ) : (
                        <button
                          className="subscribe_btn"
                          onClick={() => handleSubscribe(flight)}
                        >
                          구독
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* 구독한 항공편 */}
      <div className="flight_section_wrapper">
        <div className="flight_search_section">
          <h3>구독한 항공편</h3>

          <ul className="flight_result_list">
            {subscribedFlights.length === 0 ? (
              <p className="flight-empty">구독한 항공편이 없습니다.</p>
            ) : (
              subscribedFlights.map((flight) => (
                <li key={flight.id || flight.flightId + flight.scheduleDateTime}>
                  <div className="flight_card">
                    <div className="flight_card_top">
                      <strong>{flight.flightId}</strong>
                      <span>{flight.airLine}</span>
                    </div>

                    <div className="flight_airport">{flight.airport}</div>

                    <div className="flight_meta">
                      <span>예정: {formatFlightDateTime(flight.scheduleDateTime)}</span>
                      <span>변경: {formatFlightDateTime(flight.estimatedDateTime)}</span>
                    </div>

                    <div className="flight_meta">
                      <span>터미널: {flight.terminalid}</span>
                      <span>체크인: {flight.chkinrange || "-"}</span>
                      <span>게이트: {flight.gatenumber || "-"}</span>
                    </div>

                    {flight.airportCode && (
                      <div className="flight_weather_section">
                        {weatherLoading && !weatherMap[flight.airportCode] ? (
                          <span className="weather_loading">날씨 정보 로딩 중...</span>
                        ) : weatherMap[flight.airportCode] ? (
                          <>
                            <div className="weather_header">
                              {weatherMap[flight.airportCode].airportName} 날씨
                            </div>
                            <div className="weather_hourly_scroll">
                              {weatherMap[flight.airportCode].forecasts.map((h, idx) => (
                                <div key={idx} className="weather_hourly_item">
                                  <span className="hourly_time">
                                    {h.time.substring(11, 16)}
                                  </span>
                                  <span className="hourly_icon">
                                    {getWeatherIcon(h.weatherCode)}
                                  </span>
                                  <span className="hourly_temp">{h.temperature}°</span>
                                  <span className="hourly_desc">{h.description}</span>
                                  {h.precipitation > 0 && (
                                    <span className="hourly_precip">{h.precipitation}mm</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <span className="weather_error">날씨 정보를 불러오는데 실패하였습니다.</span>
                        )}
                      </div>
                    )}

                    <div className="flight_subscribe">
                      <button
                        className="unsubscribe_btn"
                        onClick={() => handleUnsubscribe(flight)}
                      >
                        구독 해제
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default FlightSection;
