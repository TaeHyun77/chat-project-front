import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create();

api.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("authorization");

    if (accessToken) {
      config.headers.authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {

    // access token 만료로 인해 실패한 이전 발송한 요청 정보를 담고 있음
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("Access token이 만료되었습니다. 재발급 시도 중...");

      originalRequest._retry = true;

      try {
        const refreshAuthorization = Cookies.get("refresh_authorization");

        const response = await axios.post(
          "http://3.39.130.212:8080/reToken",
          {},
          {
            // 헤더에 담아서 보냄
            headers: {
              refreshAuthorization: `Bearer ${refreshAuthorization}`,
            },
          }
        );

        // 헤더의 토큰을 가져올 때는 response.headers[''] 형식을 지키고 반드시 소문자로 시작해야 함
        const newAccessToken = response.headers["authorization"];

        Cookies.set("authorization", newAccessToken, {
          secure: true,
          sameSite: "Strict",
        });
        
        if (newAccessToken) {
          console.log("Access token이 성공적으로 재발급되었습니다.");
        }

        api.defaults.headers.common["authorization"] = `Bearer ${newAccessToken}`;

        originalRequest.headers.authorization = `Bearer ${newAccessToken}`;

        // access token이 재발급 되면 이전에 실패한 요청을 다시 보냄
        return api(originalRequest);
      } catch (err) {
        console.error(
          "Refresh token이 만료되었거나 오류가 발생했습니다. 로그아웃 처리 필요."
        );
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
