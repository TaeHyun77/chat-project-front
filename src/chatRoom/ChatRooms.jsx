import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../state/LoginState";
import { FuncModule } from "../state/FuncList";
import * as req from "../api/req";

import Header from "../header/Header";
import Footer from "../footer/Footer";

import Skeleton from "react-loading-skeleton";
import { TbMessage2Minus } from "react-icons/tb";

import "./ChatRooms.css";

const ChatRooms = () => {
  const { userInfo, isLogin } = useContext(LoginContext);
  const { formatDateTime3 } = useContext(FuncModule);

  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getChatRooms = async () => {
    try {
      const response = await req.chatRooms();
      setRooms(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("채팅방을 불러오는 중 오류 발생:", error);
    }
    setIsLoading(false);
  };

  const createRoom = async () => {
    if (!window.confirm("채팅방을 생성하시겠습니까?")) return;
    if (!isLogin) return alert("로그인이 필요합니다!"), setNewRoomName("");

    const trimmedName = newRoomName.trim();
    if (!trimmedName) {
      alert("채팅방 이름을 입력 해주세요");
      return;
    }

    const chatRoomInfo = {
      chatRoomName: trimmedName,
      creator: userInfo?.username,
    };

    try {
      const response = await req.createChatRoom(chatRoomInfo);

      setRooms((prev) => [...prev, response.data]); // 상태 업데이트
      setNewRoomName("");

      await getChatRooms(); // 방을 다시 불러와 최신 상태 유지
    } catch (error) {
      console.error("채팅방 생성 오류:", error);
    }
  };

  const enterRoom = (roomId) => {
    if (!window.confirm("채팅에 참여하시겠습니까?")) return;
    if (!isLogin) return alert("로그인이 필요합니다!");

    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    getChatRooms();
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
            {isLoading // 로딩 중이면 Skeleton UI 표시
              ? [...Array(5)].map((_, index) => (
                  <li key={index} className="chatroom-item">
                    <Skeleton height={40} width={400} />
                  </li>
                ))
              : rooms.map(
                  (
                    room,
                    index // 데이터가 로드되면 정상 목록 표시
                  ) => (
                    <li
                      className="chatroom-item"
                      onClick={() => enterRoom(room?.chatRoomId)}
                    >
                      <div className="chatroom-content">
                        <div className="chatroom-header">
                          <TbMessage2Minus />
                          <span className="chatroom-title">
                            {room?.chatRoomName}
                          </span>
                        </div>

                        <div className="chatroom-meta">
                          <span>
                            {room?.member?.name} -{" "}
                            {formatDateTime3(room.createdAt)}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                )}
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatRooms;
