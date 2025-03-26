import React, { useContext, useEffect } from "react";
import * as req from '../api/req';
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { LoginContext } from "../state/LoginState";
import api from "../api/api";
import Cookies from "js-cookie";
import "./Header.css";
import inLogo from "../img/Incheon.png";

const Header = () => {
  const { isLogin, setIsLogin, userInfo, setUserInfo, logincheck } =
    useContext(LoginContext);
  const navigate = useNavigate();

  // Google 로그인
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

  // 로그아웃
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
        } else {
          console.error("로그아웃 실패");
        }
      } catch (error) {
        console.error("로그아웃 실패:", error.response?.data || error.message);
      }
    }
  };

  const handleHome = () => {
    navigate("/");
  }

  const handleEdit = () => {
    navigate("/editMember");
  }

  useEffect(() => {
    logincheck();
  }, []);

  useEffect(() => {
    console.log("로그인 상태 : " + isLogin);
  }, [isLogin]);

  return (
    <header className="headerContainer">
      <div className="logoContainer" onClick={handleHome}>
        <img src={inLogo} className="logo" />
        <p>Travel via Incheon Airport !</p>
      </div>
      {!isLogin ? (
        <div className="logContainer">
          <button onClick={onGoogleLogin} className="loginButton">
            Google 로그인
          </button>
        </div>
      ) : (
        <div className="logContainer">
          <p className="edit_member" onClick={handleEdit}>회원 정보 수정</p>
          <p className="loginName">환영해요 {userInfo?.name} 님 !</p>
          <button onClick={googleLogout} className="logoutButton">
            로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
