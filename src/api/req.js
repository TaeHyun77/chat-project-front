import axios from 'axios';
import api from './api';

export const info = () => api.get("/api/info");

export const roomCreatorInfo = (roomCreator) => api.get(`/api/roomCreatorInfo/${roomCreator}`);

export const departures = () => axios.get("/api/get/departures", { withCredentials: false });

export const planes = () => axios.get("/api/get/planes" , { withCredentials: false });

export const googleLogin = () => api.get("/api/googleLogin");

export const googleLogout = () => api.post("/api/googleLogout");

export const chatRooms = () => api.get("/api/chat/rooms");

export const createChatRoom = (data) => api.post("/api/chat/room", data);

export const enterChatRoom = (roomId) => api.get(`/api/chat/room/${roomId}/messages`);

export const chatRoomInfo = (roomId) => api.get(`/api/chatRoomInfo/${roomId}`);

export const isNickName = (editNickName) => api.get(`/api/isNickName/${editNickName}`);

export const editNickName = (id, editNickName) => api.post(`/api/edit/${id}/${editNickName}`);

export const deleteRoom = (roomId) => axios.delete(`/api/delete/${roomId}`);