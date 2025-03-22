import React, { useEffect, useState, useContext } from "react";
import * as req from './api/req';
import { useNavigate } from "react-router-dom";
import { LoginContext } from "./LoginState";
import Header from "./Header";
import Footer from "./Footer";
import "./ChatRooms.css";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

const ChatRooms = () => {
  const { userInfo, isLogin } = useContext(LoginContext);

  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();

  const selectRooms = async () => {
    try {
      const response = await req.chatRooms();
      setRooms(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("채팅방을 불러오는 중 오류 발생:", error);
    }
  };

  const createRoom = async () => {
    if (!window.confirm("채팅방을 생성하시겠습니까?")) return;
    if (!isLogin) return alert("로그인이 필요합니다!"), setNewRoomName("");

    const trimmedName = newRoomName.trim();
    if (!trimmedName) return;

    const chatRoomInfo = {
      chatRoomName : trimmedName,
      creator : userInfo?.username
    }

    try {
      const response = await req.createChatRoom(chatRoomInfo);

      console.log("새로운 채팅방:", response.data);

      setRooms((prev) => [...prev, response.data]); // 상태 업데이트
      setNewRoomName("");

      await selectRooms(); // 방을 다시 불러와 최신 상태 유지
    } catch (error) {
      console.error("채팅방 생성 오류:", error);
    }
  };

  const enterRoom = (roomId) => {
    if (!window.confirm("채팅에 참여하시겠습니까?")) return;
    if (!isLogin) return alert("로그인이 필요합니다!");

    navigate(`/api/${roomId}`);
  };

  useEffect(() => {
    selectRooms();
  }, []);

  return (
    <>
      <Header />
      <div className="chatrooms-container">
        <h2 className="chatrooms-title">실시간 오픈 채팅방</h2>
        <div className="chatrooms-input-container">
          <input
            type="text"
            className="chatrooms-input"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createRoom()}
            placeholder="채팅방 이름 입력"
          />
          <button className="chatrooms-button" onClick={createRoom}>
            채팅방 생성
          </button>
        </div>
        <div className="room-list">
          <ul className="chatrooms-list">
            {rooms.map((room, index) => (
              <li
                key={room.id || room.chatRoomId || `room-${index}`}
                className="chatroom-item"
                onClick={() => enterRoom(room.chatRoomId)}
              >
                {room.chatRoomName}
                <span className="chatIcon"><IoChatbubbleEllipsesOutline /></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatRooms;
