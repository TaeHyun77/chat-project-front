import React, { useEffect, useMemo, useState } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import * as req from "../api/req";
import "./ParkingInfo.css";

const ParkingInfo = () => {
  const [parkingList, setParkingList] = useState([]);
  const [terminal, setTerminal] = useState("T1");
  const [loading, setLoading] = useState(true);

  const getParkingInfo = async () => {
    try {
      const response = await req.getParkingInfo();
      setParkingList(response.data || []);
    } catch (error) {
      console.error("주차장 정보 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (raw) => {
    if (!raw) return "";

    const dateStr = raw.substring(0, 14);

    const year = dateStr.substring(0, 4);
    const month = parseInt(dateStr.substring(4, 6), 10);
    const day = parseInt(dateStr.substring(6, 8), 10);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);

    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
  };

  useEffect(() => {
    getParkingInfo();
  }, []);

  const filteredList = useMemo(() => {
    return parkingList.filter((item) => item.floor?.startsWith(terminal));
  }, [parkingList, terminal]);

  const getOccupancyRate = (parking, parkingarea) => {
    if (!parkingarea || parkingarea === 0) return 0;
    return Math.round((parking / parkingarea) * 100);
  };

  const getParkingMapSrc = () => {
    if (terminal === "T1") return "/parking-map/T1_parking.jpg";
    if (terminal === "T2") return "/parking-map/T2_parking.jpg";
    return null;
  };

  return (
    <div className="parking-page">
      <Header />

      <div className="parking_label">
        <div className="parking_container">
          <h3>실시간 주차장 정보</h3>

          <div className="parking_top">
            <div className="filter_group">
              <label>터미널</label>
              <select
                value={terminal}
                onChange={(e) => setTerminal(e.target.value)}
              >
                <option value="T1">T1</option>
                <option value="T2">T2</option>
              </select>
            </div>
          </div>

          <div className="parking_map_section">
            <h4>{terminal} 주차장 안내도</h4>
            <img
              src={getParkingMapSrc()}
              alt={`${terminal} 주차장 안내도`}
              className="parking_map_image"
            />
          </div>

          {loading ? (
            <div className="parking_empty">주차장 정보를 불러오는 중입니다.</div>
          ) : filteredList.length === 0 ? (
            <div className="parking_empty">표시할 주차장 정보가 없습니다.</div>
          ) : (
            <div className="parking_list">
              {filteredList.map((item) => {
                const rate = getOccupancyRate(item.parking, item.parkingarea);

                return (
                  <div className="parking_card" key={item.id}>
                    <div className="parking_card_header">
                      <span className="parking_floor">{item.floor}</span>
                      <span className="parking_rate">{rate}% 사용중</span>
                    </div>

                    <div className="parking_count_row">
                      <div className="parking_count_box">
                        <p>주차 차량 수</p>
                        <strong>{item.parking}</strong>
                      </div>
                      <div className="parking_count_box">
                        <p>총 주차면수</p>
                        <strong>{item.parkingarea}</strong>
                      </div>
                    </div>

                    <div className="parking_progress_wrap">
                      <div
                        className="parking_progress"
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      />
                    </div>

                    <div className="parking_time">
                      업데이트 시간: {formatDateTime(item.datetm)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ParkingInfo;