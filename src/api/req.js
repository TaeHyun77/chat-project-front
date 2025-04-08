import axios from 'axios';
import api from './api';

// 로그인 유저 정보
export const info = () => api.get("/api/info");

// 회원의 채팅방 정보
export const getMemberChatRooms = (id) => api.get(`/api/member/${id}/chatRooms`);

// 출국장 데이터
export const departures = () => axios.get("/api/get/departures", { withCredentials: false });

// 항공편 데이터
export const planes = () => axios.get("/api/get/planes" , { withCredentials: false });

// 구글 로그인 & 로그 아웃
export const googleLogin = () => api.get("/api/googleLogin");
export const googleLogout = () => api.post("/api/googleLogout");

// 채팅방 목록
export const chatRooms = () => api.get("/api/chat/rooms");

// 채팅방 생성
export const createChatRoom = (data) => api.post("/api/chat/room", data);

// 각 채팅방 정보
export const chatRoomInfo = (roomId) => api.get(`/api/chatRoomInfo/${roomId}`);

// 채팅방 삭제
export const deleteRoom = (roomId) => axios.delete(`/api/delete/${roomId}`);

// 특정 채팅방의 채팅 내역 조회
export const chatList = (id) => axios.get(`/api/chatList/${id}`);

// 닉네임 중복 여부 파악
export const isNickName = (editNickName) => api.get(`/api/isNickName/${editNickName}`);

// 닉네임 수정
export const editNickName = (id, editNickName) => api.post(`/api/edit/${id}/${editNickName}`);
