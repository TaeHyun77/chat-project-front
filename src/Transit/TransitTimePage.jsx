import React, { useEffect, useMemo, useState } from "react";
import * as req from "../api/req";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import "./TransitTimePage.css";

const TransitTimePage = () => {
  const [activeTab, setActiveTab] = useState("arex");
  const [arexList, setArexList] = useState([]);
  const [parkingList, setParkingList] = useState([]);
  const [terminal, setTerminal] = useState("T1");
  const [counter, setCounter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadTransitData = async () => {
    try {
      setLoading(true);
      const [arexRes, parkingRes] = await Promise.all([
        req.getArexTransitTime(),
        req.getParkingTransitTime(),
      ]);

      setArexList(arexRes.data || []);
      setParkingList(parkingRes.data || []);
    } catch (error) {
      console.error("소요시간 데이터 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransitData();
  }, []);

  const currentList = activeTab === "arex" ? arexList : parkingList;

  const filteredList = useMemo(() => {
    return currentList.filter((item) => {
      const terminalMatch = item.terminal === terminal;
      const counterMatch =
        counter === "ALL" ? true : item.checkInCounter === counter;

      return terminalMatch && counterMatch;
    });
  }, [currentList, terminal, counter]);

  const availableCounters = useMemo(() => {
    const source = currentList.filter((item) => item.terminal === terminal);
    const counters = [...new Set(source.map((item) => item.checkInCounter))];
    return counters.sort();
  }, [currentList, terminal]);

  return (
    <div className="transit-page">
      <Header />

      <div className="transit_label">
        <div className="transit_container">
          <h3>체크인 카운터 소요시간</h3>

          <div className="transit_top_filters">
            <div className="filter_group">
              <label>이동 수단</label>
              <div className="tab_group">
                <button
                  className={activeTab === "arex" ? "tab_btn active" : "tab_btn"}
                  onClick={() => setActiveTab("arex")}
                >
                  공항철도
                </button>
                <button
                  className={activeTab === "parking" ? "tab_btn active" : "tab_btn"}
                  onClick={() => setActiveTab("parking")}
                >
                  주차장
                </button>
              </div>
            </div>

            <div className="filter_row">
              <div className="filter_group">
                <label>터미널</label>
                <select
                  value={terminal}
                  onChange={(e) => {
                    setTerminal(e.target.value);
                    setCounter("ALL");
                  }}
                >
                  <option value="T1">T1</option>
                  <option value="T2">T2</option>
                </select>
              </div>

              <div className="filter_group">
                <label>체크인 카운터</label>
                <select
                  value={counter}
                  onChange={(e) => setCounter(e.target.value)}
                >
                  <option value="ALL">전체</option>
                  {availableCounters.map((counterItem) => (
                    <option key={counterItem} value={counterItem}>
                      {counterItem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="transit_empty">소요시간 데이터를 불러오는 중입니다.</div>
          ) : filteredList.length === 0 ? (
            <div className="transit_empty">조건에 맞는 소요시간 데이터가 없습니다.</div>
          ) : (
            <div className="transit_list">
              {filteredList.map((item, index) => (
                <div className="transit_card" key={`${item.from}-${item.checkInCounter}-${index}`}>
                  <div className="transit_card_header">
                    <span className="transit_badge">{item.terminal}</span>
                    <span className="transit_counter">체크인 카운터 {item.checkInCounter}</span>
                  </div>

                  <div className="transit_from">{item.from}</div>

                  <div className="transit_minutes">
                    약 <strong>{item.travelMinutes}</strong>분
                  </div>

                  <div className="transit_seconds">
                    {item.travelSeconds}초
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TransitTimePage;