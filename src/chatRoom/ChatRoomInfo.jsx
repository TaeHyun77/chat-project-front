import { useEffect, useRef, useState, useContext } from "react";
import * as req from "../api/req";
import { LoginContext } from "../state/LoginState";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import { IoIosArrowBack } from "react-icons/io";
import { FuncModule } from "../state/FuncList";

import "./ChatRoomInfo.css";

// const SOCKET_URL = "https://incheon-airport-info.site/ws"; // Ec2
const SOCKET_URL = "http://localhost:8080/ws"; // 로컬

const ChatRoomInfo = () => {
  const { userInfo } = useContext(LoginContext);
  const { formatDateTime3, formatTime } = useContext(FuncModule);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [userCount, setUserCount] = useState(0);
  const [allUserCount, setAllUserCount] = useState(0);

  const [isRoomDeleted, setIsRoomDeleted] = useState(false);

  const getRoomInfo = async () => {

    try {
      const response = await req.chatRoomInfo(roomId);

      const { id, chatRoomName, creator, member, chats, createdAt, modifiedAt } = response.data;

      console.log("asdadad" + chats)
      setRoomInfo({ id, chatRoomName, creator, member, chats, createdAt, modifiedAt });

    } catch (error) {
      console.error("채팅방 정보를 불러오는 중 오류 발생:", error);
    }
  };

  const deleteRoom = async (roomId) => {
    if (userInfo?.username != roomInfo?.creator) {
      alert("방 생성자가 아닙니다.");
      return;
    }

    const check = window.confirm("채팅방을 삭제 하시겠습니까? ?");

    if (check) {
      try {
        const response = await req.deleteRoom(roomId);

        if (response.status == 200) {
          setIsRoomDeleted(true);

          if (stompClientRef.current) {
            stompClientRef.current.publish({
              destination: `/topic/chat/delete/${roomId}`,
              body: "방 삭제됨",
            });
          }

          navigate("/chatRooms");
        } else {
          alert("채팅 방 삭제 중 오류 발생 ..");
        }
      } catch (error) {
        console.error("채팅방 삭제 중 오류 발생", error);
      }
    }
  };

  useEffect(() => {

    const socket = new SockJS(SOCKET_URL);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log("[STOMP]:", msg),

      onConnect: () => {
        console.log("[STOMP] 연결 성공: ", stompClient);

        stompClient.subscribe(`/topic/chat/delete/${roomId}`, (message) => {
          console.log("[STOMP] 채팅방 삭제 메시지 수신:", message.body);

          if (message.body === "방 삭제됨") {
            alert("채팅방이 삭제되었습니다.");

            // 채팅방 삭제 시 이동
            navigate("/chatRooms");
          }
        });

        // 특정 채팅방 [구독]
        stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
          if (message.body) {
            console.log("[STOMP] 메시지 수신: ", message.body);
            const receivedMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          }
        });

        // 특정 채팅방 접속 인원 수 [구독]
        stompClient.subscribe(
          `/topic/chatroom/userCnt/${roomId}`,
          (message) => {
            console.log("[STOMP] 현재 인원 수: ", message.body);
            setUserCount(parseInt(message.body, 10));
          }
        );

        // 특정 채팅방 접속 인원 수 [응답]
        stompClient.publish({
          destination: `/app/chatroom/userCnt`,
        });

        // 채팅방에 접속한 모든 인원 수 [구독]
        stompClient.subscribe(`/topic/all/userCnt`, (message) => {
          console.log("[STOMP] 전체 인원 수: ", message.body);
          setAllUserCount(parseInt(message.body, 10));
        });

        // 채팅방에 접속한 모든 인원 수 [응답]
        stompClient.publish({
          destination: "/app/chat/userCnt",
        });

        if (!localStorage.getItem(`entered-${roomId}`)) {
          console.log("[STOMP] 입장 메시지 전송");

          // 입장 메세지 정보
          const enterMessage = {
            chatType: "ENTER",
            username: userInfo?.username,
            nickName:userInfo?.nickName,
            roomId: roomId,
          };

          // 서버로 입장 메세지 전달, 특정 채팅방 [구독]에 대한 [응답]
          stompClient.publish({
            destination: "/app/chat/message",
            body: JSON.stringify(enterMessage),
          });

          localStorage.setItem(`entered-${roomId}`, "true");
        }
      },

      onStompError: (e) => {
        console.error("[STOMP] 연결 실패: ", e);
        stompClient.deactivate();
      },

      // websocket 연결이 해제될 때 자동 실행
      // 즉, stompClient.deactivate()이 실행 될 때 작동
      onDisconnect: () => {
        console.log("[STOMP] 연결 해제");
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      console.log("[STOMP] 채팅방 나감, 퇴장 메시지 전송 후 연결 해제");

      if (
        !isRoomDeleted &&
        stompClientRef.current &&
        stompClientRef.current.connected
      ) {
        const exitMessage = {
          chatType: "EXIT",
          username: userInfo?.username,
          nickName:userInfo?.nickName,
          roomId: roomId,
        };

        // 서버로 퇴장 메시지 전달, 특정 채팅방 [구독]에 대한 [응답]
        stompClientRef.current.publish({
          destination: "/app/chat/message",
          body: JSON.stringify(exitMessage),
        });

        console.log("[STOMP] 퇴장 메시지 전송 완료");
      }

      // WebSocket 연결 해제
      stompClient.deactivate();
      localStorage.removeItem(`entered-${roomId}`);
    };
  }, [roomId]);

  const sendMessage = () => {
    if (
      !message.trim() ||
      !stompClientRef.current ||
      !stompClientRef.current.connected
    )
      return;

    const now = new Date();
    const koreaTime = new Date(
      now.getTime() + 9 * 60 * 60 * 1000
    ).toISOString(); // KST 변환

    const newMessage = {
      chatType: "TALK",
      content: message,
      username: userInfo?.username,
      nickName:userInfo?.nickName,
      createdAt: koreaTime,
      roomId: roomId,
    };

    stompClientRef.current.publish({
      destination: "/app/chat/message",
      body: JSON.stringify(newMessage),
    });

    setMessage("");
    inputRef.current?.focus();
  };

  const handleExit = () => {
    if (!window.confirm("채팅방을 나가시겠습니까 ?")) return;

    navigate("/chatrooms");
  };

  // 새로운 메시지가 추가될 때 자동으로 스크롤을 최신 메시지로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (roomId) {
      getRoomInfo();
    }
  }, [roomId]);

  useEffect(() => {
    if (roomInfo?.chats) {

      const filteredMessages = roomInfo.chats.filter(
        (message) => message.chatType !== "ENTER" && message.chatType !== "EXIT"
      );

      setMessages(filteredMessages);
    }
  }, [roomInfo]);

  return (
    <>
      <Header />
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-menu">
            <span>{roomInfo.chatRoomName}</span>
            <br />
            <label className="chatRoonInfo" style={{ marginTop: "10px" }}>
              <span>
                {roomInfo?.member?.nickName} ({roomInfo?.member?.username})
              </span>{" "}
              <span className="chatRoomDelete">
                {formatDateTime3(roomInfo.createdAt)}
                {userInfo?.username === roomInfo?.member?.username && (
                  <span onClick={() => deleteRoom(roomId)}>채팅방 삭제</span>
                )}
              </span>
            </label>
          </div>
          <div className="chat-header">
            <div className="icon">
              <div className="left-section" onClick={handleExit}>
                <IoIosArrowBack />
                <span>나가기</span>
              </div>
              <span className="right-section">접속자: {userCount}명</span>
            </div>
          </div>

          <div ref={chatContainerRef} className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${
                  msg.chatType === "ENTER" || msg.chatType === "EXIT"
                    ? "enter-message"
                    : msg.member.username === userInfo?.username
                    ? "mine"
                    : "other"
                }`}
              >
                {msg.chatType === "ENTER" || msg.chatType === "EXIT" ? (
                  <div className="enter-message-content">{msg.content}</div>
                ) : msg.member.username === userInfo?.username ? ( // 내꺼
                  <div className="message-wrapper">
                    <div className="message-content">{msg.content}</div>
                    <div className="message-timestamp mine-timestamp">
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                ) : (
                  // 상대꺼
                  <div className="message-wrapper">
                    <div className="message-username">{msg.member.name}</div>
                    <div className="message-content">{msg.content}</div>
                    <div className="message-timestamp other-timestamp">
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="메시지를 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="chat-send-button" onClick={sendMessage}>
              전송
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatRoomInfo;
