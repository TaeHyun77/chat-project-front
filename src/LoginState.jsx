import React, { useEffect, useState, createContext } from "react";
import api from "./api/api";
import Cookies from "js-cookie";

export const LoginContext = createContext();

const LoginState = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [roles, setRoles] = useState({ isUser: false, isAdmin: false });
  const [userInfo, setUserInfo] = useState({});

  const logincheck = async () => {

    const accessToken = Cookies.get("authorization");
    console.log(accessToken);

    if (!accessToken) {
        console.log("access 토큰이 없습니다.")
        logout();
        return;
    }

    api.defaults.headers.common.authorization = `Bearer ${accessToken}`;

    let response;
    let data;

    try {
      response = await api.get("http://3.39.130.212:8080/info");
      data = response.data;

      if (data === "UNAUTHORIZED" || response.status === 401) {
        console.error("Access 토큰이 만료되거나 잘못되었습니다.");
        return;
      }

      loginSetting(data, accessToken);
    } catch (error) {
      console.error(`Error: ${error}`);
      if (error.response && error.response.status) {
        console.error(`Status: ${error.response.status}`);
      }
      return;
    }
  };

  const loginSetting = (userData, accessToken) => {
    const { username, name, email, role} = userData;

    api.defaults.headers.common["authorization"] = `Bearer ${accessToken}`;
    setIsLogin(true);

    setUserInfo({ username, name, email, role});
  };

  const logout = () => {
    api.defaults.headers.common["authorization"] = undefined
    Cookies.remove("authorization")
    setIsLogin(false)
    setUserInfo(null)
  }

  useEffect(() => {
    logincheck();
  }, []);

  return (
    <LoginContext.Provider
      value={{ isLogin, setIsLogin, userInfo, roles, logincheck, setUserInfo}}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginState;
