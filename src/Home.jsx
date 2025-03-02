import { useEffect, useRef, useState, useContext } from "react";
import { LoginContext } from "./LoginState";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Cookies from "js-cookie";
import "./Home.css";
import Header from "./Header";

const SOCKET_URL = "http://localhost:8080/ws";

function Home() {
  const { userInfo } = useContext(LoginContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [accessToken, setAccessToken] = useState("");
  const stompClientRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS(SOCKET_URL);
    const token = Cookies.get("authorization");
    console.log(token);
    setAccessToken(token);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log("[STOMP]:", msg),

      onConnect: () => {
        console.log("[STOMP] 연결 성공: ", stompClient);

        // 클라이언트가 보낸 메시지를 다시 서버에서 받아오는 부분
        stompClient.subscribe("/topic/chat", (message) => {
          if (message.body) {
            console.log("[STOMP] 메시지 수신: ", message.body);
            const receivedMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          }
        });
      },
      onStompError: (e) => {
        console.error("[STOMP] 연결 실패: ", e);
        stompClient.deactivate();
      },
      onDisconnect: () => console.log("STOMP 연결 해제"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
    };
  }, []);

  // 새로운 메시지가 추가될 때 자동으로 스크롤을 최신 메시지로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (
      !message.trim() ||
      !stompClientRef.current ||
      !stompClientRef.current.connected
    )
      return;

    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMessage = {
      content: message,
      accessToken: `Bearer ${accessToken}`,
      timestamp: formattedTime,
    };

    stompClientRef.current.publish({
      destination: "/app/chat",
      body: JSON.stringify(newMessage),
    });

    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      <Header />
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-header">Simple Chat</div>

          <div ref={chatContainerRef} className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.username === userInfo?.username ? "mine" : "other"}`}
              >
                <div className="message-wrapper">
                  <div className="message-username">{msg.username}</div>
                  <div className="message-content">{msg.content}</div>
                  <div
                    className={`message-timestamp ${
                      msg.username === userInfo?.username ? "mine-timestamp" : "other-timestamp"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
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
    </>
  );
}

export default Home;
