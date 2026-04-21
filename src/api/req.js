import axios from 'axios';
import api from './api';

// 로그인 유저 정보
export const info = () => api.get("/api/info");

// 회원의 채팅방 정보
export const getMemberChatRooms = (id) => api.get(`/api/member/${id}/chatRooms`);

// 출국장 데이터
export const departures = () => axios.get("/airport/departures", { withCredentials: false });

// 항공편 데이터
export const getSlicePlanes = ({ date, page, size }) =>
    axios.get("/airport/slice/planes", {
        params: {
            date,
            page,
            size,
        },
        withCredentials: false,
    });


// 구글 로그인 & 로그 아웃
export const googleLogin = () => api.get("/api/googleLogin");
export const googleLogout = () => api.post("/api/googleLogout");

// 채팅방 목록
export const chatRooms = () => api.get("/api/chat/rooms");

// 채팅 목록
export const chats = (chatRoomId) => api.get(`/api/chats/${chatRoomId}`);

// 채팅방 생성
export const createChatRoom = (data) => api.post("/api/chat/room", data);

// 특정 채팅방 정보
export const chatRoomInfo = (roomId) => api.get(`/api/chatRoomInfo/${roomId}`);

// 채팅방 삭제
export const deleteRoom = (roomId) => axios.delete(`/api/delete/${roomId}`);

// 닉네임 중복 여부 파악
export const isNickName = (editNickName) => api.get(`/api/isNickName/${editNickName}`);

// 닉네임 수정
export const editNickName = (id, editNickName) => api.post(`/api/edit/${id}/${editNickName}`);

export const getArexTransitTime = () => api.get("/api/airport/transit/arex");

export const getParkingTransitTime = () => api.get("/api/airport/transit/parking");

export const getParkingInfo = () => api.get("/api/airport/parking");

export const searchFlights = (params) => {
    return api.get("/api/flights/search", { params });
};

export const autocompleteFlights = (q, date) => {
    return api.get("/api/flights/autocomplete", { params: { q, date } });
};

// 항공편 구독
export const subscribeFlight = (planeId) => api.post(`/api/flight/subscribe/${planeId}`);

// 항공편 구독 해제
export const unsubscribeFlight = (planeId) => api.delete(`/api/flight/subscribe/cancel/${planeId}`);

// 구독 항공편 목록 조회
export const getSubscribedFlights = () => api.get("/api/flight/subscriptions");

// 구독 항공편 도착 공항 시간별 날씨 예보 조회
export const getSubscribedFlightWeather = () => api.get("/api/flight/subscriptions/weather");