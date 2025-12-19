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
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      console.log("Access token이 만료되었습니다. 재발급 시도 중...");

      originalRequest._retry = true;

      try {
        const refreshAuthorization = Cookies.get("refresh_authorization");

        console.log("재발급 요청 중 ..");
        console.log("refreshAuthorization 값:", refreshAuthorization);

        const response = await axios.post(
          `/api/reToken`,
          {},
          {
            headers: {
              refreshAuthorization: `Bearer ${refreshAuthorization}`,
            },
          }
        );

        console.log("재발급 요청 완료");

        // 새 Access Token 저장
        // 헤더의 토큰을 가져올 때는 response.headers[''] 형식을 지키고 반드시 소문자로 시작해야 함
        const newAccessToken = response.headers["authorization"];

        if (!newAccessToken) {
          console.error("새로운 Access Token을 가져오지 못했습니다.");
          return Promise.reject(error);
        }

        Cookies.set("authorization", newAccessToken, {
          secure: true,
          sameSite: "Strict",
        });

        api.defaults.headers.common["authorization"] = `Bearer ${newAccessToken}`;

        console.log("Access token이 성공적으로 재발급되었습니다.");

        // 기존 요청에 새 토큰을 업데이트
        originalRequest.headers.authorization = `Bearer ${newAccessToken}`;

        // 새로운 axios 인스턴스를 사용하여 요청을 다시 보냄
        return axios({...originalRequest, withCredentials: true });

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
