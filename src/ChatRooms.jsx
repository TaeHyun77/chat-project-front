import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "./LoginState";
import api from "./api/api";
import Header from "./Header";
import Footer from "./Footer";
import "./ChatRooms.css";

const ChatRooms = () => {
  const { userInfo, isLogin } = useContext(LoginContext);

  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();

  const selectRooms = async () => {
    try {
      const response = await api.get("http://localhost:8080/chat/rooms");
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

    try {
      const response = await api.post("http://localhost:8080/chat/room", {
        chatRoomName: trimmedName,
        creator: userInfo?.username,
      });

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

    navigate(`/${roomId}`);
  };

  useEffect(() => {
    selectRooms();
  }, []);

  return (
    <>
      <Header />
      <div className="chatrooms-container">
        <h2 className="chatrooms-title">채팅방</h2>
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
            방 만들기
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
