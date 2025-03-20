import axios from 'axios';
import api from './api';

export const info = () => api.get("/api/info");

export const departures = () => axios.get("/api/get/departures");

export const planes = () => axios.get("/api/get/planes");

export const googleLogin = () => axios.get("/api/googleLogin");

export const googleLogout = () => api.post("/api/googleLogout");

export const chatRooms = () => api.get("/api/chat/rooms");

export const createChatRoom = (data) => api.post("/api/chat/room", data);

export const enterChatRoom = (roomId) => axios.get(`/api/chat/room/${roomId}/messages`);
