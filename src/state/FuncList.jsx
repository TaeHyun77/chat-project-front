import React, { useEffect, useState, createContext } from "react";

export const FuncModule = createContext();

const FuncList = ({ children }) => {

  // 오늘 날짜를 YYYYMMDD 형식으로 반환하는 함수
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // 내일 날짜를 YYYYMMDD 형식으로 반환하는 함수
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // 모레 날짜를 YYYYMMDD 형식으로 반환하는 함수
  const get2LaterDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  // 
  const formatDateTime = (dateTime) => {
    if (!dateTime || dateTime.length !== 12) return dateTime;
    const year = dateTime.substring(0, 4);
    const month = dateTime.substring(4, 6);
    const day = dateTime.substring(6, 8);
    const hour = dateTime.substring(8, 10);
    const minute = dateTime.substring(10, 12);
    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  // 
  const formatDateTime2 = (dateTime) => {
    const day = dateTime.substring(0, 2);
    const hour = dateTime.substring(2, 4);
    return `${day}월 ${hour}일`;
  };

  // 2025-03-25T20:42:35.305122 ( LocalDateTime ) -> 2025-03-25 20:42
  const formatDateTime3 = (dateTimeString) => {
    if (dateTimeString) {
      return dateTimeString
        .split(":")
        .slice(0, 2)
        .join(":")
        .replace(/\s+/g, "")
        .replace("T", " ");
    }
  };

  const calculateDelay = (schedule, estimated) => {
    const scheduleDate = new Date(
      `${schedule.substring(0, 4)}-${schedule.substring(
        4,
        6
      )}-${schedule.substring(6, 8)}T${schedule.substring(
        8,
        10
      )}:${schedule.substring(10, 12)}`
    );
    const estimatedDate = new Date(
      `${estimated.substring(0, 4)}-${estimated.substring(
        4,
        6
      )}-${estimated.substring(6, 8)}T${estimated.substring(
        8,
        10
      )}:${estimated.substring(10, 12)}`
    );

    const delayMinutes = Math.round(
      (estimatedDate - scheduleDate) / (1000 * 60)
    );
    return delayMinutes > 0 ? `지연 ${delayMinutes}분` : "";
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

  return (
    <FuncModule.Provider
      value={{
        getFormattedDate,
        getTomorrowDate,
        get2LaterDate,
        formatDateTime,
        formatDateTime2,
        calculateDelay,
        getCongestionLevel,
        formatDateTime3
      }}
    >
      {children}
    </FuncModule.Provider>
  );
};

export default FuncList;
