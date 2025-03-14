import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { LoginContext } from "./LoginState";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import { useParams, useNavigate } from "react-router-dom";
import "./ChatRoomInfo.css";
import Header from "./Header";
import Footer from "./Footer";
import { GoSignIn } from "react-icons/go";

const SOCKET_URL = "http://localhost:8080/ws";

function Home() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { userInfo } = useContext(LoginContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const stompClientRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [userCount, setUserCount] = useState(0);
  const [allUserCount, setAllUserCount] = useState(0);

  const getChatList = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/chat/room/${roomId}/messages`
      );

      const filteredMessages = response.data.filter(
        (message) => message.chatType !== "ENTER" && message.chatType !== "EXIT"
      );

      // 기존 채팅 내역을 반영, 이전의 ENTER, EXIT 메세지는 filter
      setMessages(filteredMessages);
      console.log(filteredMessages);
    } catch (error) {
      console.error("채팅 내역을 불러오는 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    getChatList();

    const socket = new SockJS(SOCKET_URL);

    const token = Cookies.get("authorization");
    setAccessToken(token);
    console.log(token);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log("[STOMP]:", msg),

      onConnect: () => {
        console.log("[STOMP] 연결 성공: ", stompClient);

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

        if (!sessionStorage.getItem(`entered-${roomId}`)) {
          console.log("[STOMP] 입장 메시지 전송");

          // 입장 메세지 정보
          const enterMessage = {
            chatType: "ENTER",
            accessToken: `Bearer ${token}`,
            roomId: roomId,
          };

          // 서버로 입장 메세지 전달, 특정 채팅방 [구독]에 대한 [응답]
          stompClient.publish({
            destination: "/app/chat/message",
            body: JSON.stringify(enterMessage),
          });

          sessionStorage.setItem(`entered-${roomId}`, "true");
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

      if (stompClientRef.current && stompClientRef.current.connected) {
        const exitMessage = {
          chatType: "EXIT",
          accessToken: `Bearer ${token}`,
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
      sessionStorage.removeItem(`entered-${roomId}`);
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
      accessToken: `Bearer ${accessToken}`,
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

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExit = () => {
    if (!window.confirm("채팅방을 나가시겠습니까 ?")) return;

    navigate("/chatrooms")
  }

  // 새로운 메시지가 추가될 때 자동으로 스크롤을 최신 메시지로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    console.log("현재 채팅방 ID:", roomId);
  }, []);

  return (
    <>
      <Header />
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-header">
            <div className="icon" onClick={handleExit}>
              <GoSignIn /> 
            </div>
            <span>
              [ 현재 접속자: {userCount}명 ]
            </span>
          </div>

          <div ref={chatContainerRef} className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${
                  msg.chatType === "ENTER" || msg.chatType === "EXIT"
                    ? "enter-message"
                    : msg.username === userInfo?.username
                    ? "mine"
                    : "other"
                }`}
              >
                {msg.chatType === "ENTER" || msg.chatType === "EXIT" ? (
                  <div className="enter-message-content">{msg.content}</div>
                ) : msg.username === userInfo?.username ? ( // 내꺼
                  <div className="message-wrapper">
                    <div className="message-content">{msg.content}</div>
                    <div className="message-timestamp mine-timestamp">
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                ) : (
                  // 상대꺼
                  <div className="message-wrapper">
                    <div className="message-username">{msg.name}</div>
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
}

export default Home;
