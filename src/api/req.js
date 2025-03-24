import axios from 'axios';
import api from './api';

export const info = () => api.get("/api/info");

export const roomCreatorInfo = (roomCreator) => axios.get(`/api/roomCreatorInfo/${roomCreator}`);

export const departures = () => axios.get("/api/get/departures");

export const planes = () => axios.get("/api/get/planes");

export const googleLogin = () => axios.get("/api/googleLogin");

export const googleLogout = () => api.post("/api/googleLogout");

export const chatRooms = () => api.get("/api/chat/rooms");

export const createChatRoom = (data) => api.post("/api/chat/room", data);

export const enterChatRoom = (roomId) => axios.get(`/api/chat/room/${roomId}/messages`);

export const chatRoomInfo = (roomId) => axios.get(`/api/chatRoomInfo/${roomId}`);

export const isNickName = (editNickName) => axios.get(`/api/isNickName/${editNickName}`);

export const editNickName = (id, editNickName) => axios.post(`/api/edit/${id}/${editNickName}`);