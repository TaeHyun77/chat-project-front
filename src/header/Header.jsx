import Cookies from "js-cookie";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import * as req from "../api/req";
import inLogo from "../img/Incheon.png";
import { LoginContext } from "../state/LoginState";
import "./Header.css";

const Header = () => {
  const { isLogin, setIsLogin, setUserInfo, userInfo, logincheck } =
    useContext(LoginContext);

  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const onGoogleLogin = async () => {
    try {
      const response = await req.googleLogin();
      const data = response.data;

      if (response.status === 200) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Google 로그인 요청 실패:", error);
    }
  };

  const googleLogout = async () => {
    const check = window.confirm("로그아웃 하시겠습니까?");
    if (check) {
      try {
        const response = await api.post("/api/googleLogout");

        if (response.data) {
          Cookies.remove("authorization");
          api.defaults.headers.common.authorization = undefined;
          alert("로그아웃 성공!");
          setIsLogin(false);
          setUserInfo(null);
          navigate("/");
        }
      } catch (error) {
        console.error("로그아웃 실패:", error.response?.data || error.message);
      }
    }
  };

  const handleHome = () => navigate("/");
  const handleEdit = () => navigate("/editMember");
  const handleParkingInfo = () => {
    navigate("/parking-info");
    setIsMenuOpen(false);
  };
  const handleTransitTime = () => {
    navigate("/transit-time");
    setIsMenuOpen(false);
  };
  const handleChatRooms = () => {
    navigate("/chatrooms");
    setIsMenuOpen(false);
  };

  useEffect(() => {
    logincheck();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="headerContainer">
      <div className="logoContainer" onClick={handleHome}>
        <img src={inLogo} className="logo" />
        <p>Travel via Incheon Airport !</p>
      </div>

      {!isLogin ? (
        <div className="logContainer">
          <div className="dropdownWrapper" ref={dropdownRef}>
            <button
              className="navBtn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              메뉴 ▼
            </button>

            {isMenuOpen && (
              <div className="dropdownMenu">
                <button onClick={handleTransitTime} className="dropdownItem">
                  체크인 카운터 이동 소요시간
                </button>
                <button onClick={handleParkingInfo} className="dropdownItem">
                  실시간 주차장 정보
                </button>
                <button onClick={handleChatRooms} className="dropdownItem">
                  오픈 채팅방
                </button>
              </div>
            )}
          </div>

          <button onClick={onGoogleLogin} className="navBtn">
            Google 로그인
          </button>
        </div>
      ) : (
        <div className="logContainer">
          <p className="navText">환영해요 {userInfo?.name} 님 !</p>

          <p className="navBtn" onClick={handleEdit}>
            마이페이지
          </p>

          <div className="dropdownWrapper" ref={dropdownRef}>
            <button
              className="navBtn"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              메뉴 ▼
            </button>

            {isMenuOpen && (
              <div className="dropdownMenu">
                <button onClick={handleTransitTime} className="dropdownItem">
                  체크인 카운터 이동 소요시간
                </button>
                <button onClick={handleParkingInfo} className="dropdownItem">
                  실시간 주차장 정보
                </button>
                <button onClick={handleChatRooms} className="dropdownItem">
                  오픈 채팅방
                </button>
              </div>
            )}
          </div>

          <button onClick={googleLogout} className="navBtn danger">
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;