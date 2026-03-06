import { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LoginContext } from "../state/LoginState";
import { FuncModule } from "../state/FuncList";
import * as req from "../api/req";
import { Client } from "@stomp/stompjs";

import Header from "../header/Header";
import Footer from "../footer/Footer";

import SockJS from "sockjs-client";
import Skeleton from "react-loading-skeleton";
import { IoIosArrowBack } from "react-icons/io";

import "./ChatRoomInfo.css";

//const SOCKET_URL = "https://incheon-airport-info.site/ws"; // Ec2
const SOCKET_URL = "http://localhost:8080/ws"; // 로컬

const ChatRoomInfo = () => {
  const navigate = useNavigate();
  const { chatroomId } = useParams();

  const { userInfo } = useContext(LoginContext);
  const { formatDateTime3, formatTime } = useContext(FuncModule);

  const [roomInfo, setRoomInfo] = useState({
    memberResDto: {},
  });
  const [chatInfo, setChatInfo] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [allUserCount, setAllUserCount] = useState(0);

  const [roomLoading, setRoomLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(true);

  const isReady = !roomLoading && !chatLoading;

  const stompClientRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const [userCount, setUserCount] = useState(0);
  const [isRoomDeleted, setIsRoomDeleted] = useState(false);
  const [isComposing, setIsComposing] = useState(false);


  // 채팅방 정보
  const getRoomInfo = async () => {
    try {
      const response = await req.chatRoomInfo(chatroomId);
      const { chatRoomId, chatRoomName, memberResDto, createdAt, modifiedAt } =
        response.data;

      setRoomInfo({
        chatRoomId,
        chatRoomName,
        memberResDto,
        createdAt,
        modifiedAt,
      });
    } catch (e) {
      console.error("채팅방 정보 조회 실패", e);
    } finally {
      setRoomLoading(false);
    }
  };

  // 해당 채팅방의 채팅 목록
  const getChats = async () => {
    try {
      const response = await req.chats(chatroomId);
      setChatInfo(response.data);
    } catch (e) {
      console.error("채팅 목록 조회 실패", e);
    } finally {
      setChatLoading(false);
    }
  };

  // 채팅방 삭제
  const deleteRoom = async () => {
    if (userInfo?.username !== roomInfo?.memberResDto?.username) {
      alert("방 생성자가 아닙니다.");
      return;
    }

    if (!window.confirm("채팅방을 삭제하시겠습니까?")) return;

    try {
      await req.deleteRoom(chatroomId);
      setIsRoomDeleted(true);

      stompClientRef.current?.publish({
        destination: `/topic/chat/delete/${chatroomId}`,
        body: "chatroom deleted",
      });

      navigate("/chatRooms");
    } catch (e) {
      console.error("채팅방 삭제 실패", e);
    }
  };

  // 채팅방 진입 시 socket 연결

  useEffect(() => {
    const socket = new SockJS(SOCKET_URL);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log("[STOMP]:", msg),

      onConnect: () => {
        console.log("[STOMP] 연결 성공: ", stompClient);

        // 1. 채팅 메시지 구독
        stompClient.subscribe(`/topic/chat/${chatroomId}`, (message) => {
          if (message.body) {
            console.log("[STOMP] 메시지 수신: ", message.body);
            const receivedMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, receivedMessage]);
          }
        });

        // 2. 현재 방 인원 수 구독
        stompClient.subscribe(`/topic/chatroom/userCnt/${chatroomId}`, (message) => {
          console.log("[STOMP] 현재 인원 수: ", message.body);
          setUserCount(parseInt(message.body, 10));
        });

        // 3. 방 삭제 이벤트 구독
        stompClient.subscribe(`/topic/chat/delete/${chatroomId}`, (message) => {
          console.log("[STOMP] 채팅방 삭제 메시지 수신:", message.body);
          if (message.body === "chatroom deleted") {
            alert("채팅방이 삭제되었습니다.");
            navigate("/chatRooms");
          }
        });

        // 4. 전체 유저 카운트 관련 구독

        stompClient.subscribe(`/topic/all/userCnt`, (message) => {
          console.log("[STOMP] 전체 인원 수: ", message.body);
          setAllUserCount(parseInt(message.body, 10));
        });

        // 인원 수 요청
        stompClient.publish({ destination: `/app/chatroom/{roomId}/userCnt` });
        stompClient.publish({ destination: "/app/chat/userCnt" });

        // 5. 입장 메시지 (세션 기준, 새로고침 시 중복 방지)
        if (!sessionStorage.getItem(`entered-${chatroomId}`)) {

          console.log("[STOMP] 입장 메시지 전송");

          const enterMessage = {
            chatType: "ENTER",
            username: userInfo?.username,
            nickName: userInfo?.nickName,
            chatroomId: chatroomId
          };

          stompClient.publish({
            destination: "/app/chat/message",
            body: JSON.stringify(enterMessage),
          });
          sessionStorage.setItem(`entered-${chatroomId}`, "true");
        }
      },

      onStompError: (e) => {
        console.error("[STOMP] 연결 실패: ", e);
        stompClient.deactivate();
      },

      onDisconnect: () => {
        console.log("[STOMP] 연결 해제");
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    // 6. 브라우저 종료(새로고침, 탭 닫기) 시 퇴장 메시지 전송
    const handleBeforeUnload = () => {
      if (
        !isRoomDeleted &&
        stompClientRef.current &&
        stompClientRef.current.connected
      ) {
        const exitMessage = {
          chatType: "EXIT",
          username: userInfo?.username,
          nickName: userInfo?.nickName,
          chatroomId,
        };
        stompClientRef.current.publish({
          destination: "/app/chat/message",
          body: JSON.stringify(exitMessage),
        });
        console.log("[STOMP] beforeunload 퇴장 메시지 전송 완료");
      }
      sessionStorage.removeItem(`entered-${chatroomId}`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // 7. WebSocket 연결 해제
    return () => {
      console.log("[STOMP] 채팅방 컴포넌트 unmount");

      window.removeEventListener("beforeunload", handleBeforeUnload);

      // useEffect 언마운트 시에는 퇴장 메시지 중복 방지
      if (
        !isRoomDeleted &&
        stompClientRef.current &&
        stompClientRef.current.connected
      ) {
        const exitMessage = {
          chatType: "EXIT",
          username: userInfo?.username,
          nickName: userInfo?.nickName,
          chatroomId,
        };

        stompClientRef.current.publish({
          destination: "/app/chat/message",
          body: JSON.stringify(exitMessage),
        });
        console.log("[STOMP] 언마운트 시 퇴장 메시지 전송 완료");
      }

      stompClient.deactivate();
      sessionStorage.removeItem(`entered-${chatroomId}`);
    };
  }, [chatroomId]);

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
      nickName: userInfo?.nickName,
      createdAt: koreaTime,
      chatroomId: chatroomId,
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

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    setMessage(e.target.value);
  };

  // 새로운 메시지가 추가될 때 자동으로 스크롤을 최신 메시지로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (chatroomId) {
      getRoomInfo();
      getChats();
    }
  }, [chatroomId]);

  useEffect(() => {
    setMessages(
      chatInfo.filter(
        (m) => m.chatType !== "ENTER" && m.chatType !== "EXIT"
      )
    );
}, [chatInfo]);

return (
  <>
    <Header />
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-menu">
          {roomLoading ? (
            <Skeleton width={150} height={15} />
          ) : (
            <>
              <span>{roomInfo.chatRoomName}</span>
              <br />
              <label className="chatRoonInfo" style={{ marginTop: "10px" }}>
                <span>
                  채팅방 생성자 : {roomInfo.memberResDto.nickName}
                </span>{" "}
                <span className="chatRoomDelete">
                  {formatDateTime3(roomInfo.createdAt)}

                  {userInfo?.username === roomInfo?.memberResDto?.username && (
                    <span onClick={() => deleteRoom(chatroomId)}>
                      채팅방 삭제
                    </span>
                  )}
                </span>
              </label>
            </>
          )}
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
          {chatLoading
            ? Array.from({ length: 10 }).map((_, index) => (
              <Skeleton
                key={index}
                height={30}
                width="90%"
                style={{ marginBottom: "10px" }}
              />
            ))
            : messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg?.chatType === "ENTER" || msg?.chatType === "EXIT"
                  ? "enter-message"
                  : msg?.memberResDto?.username === userInfo?.username
                    ? "mine"
                    : "other"
                  }`}
              >
                {msg?.chatType === "ENTER" || msg?.chatType === "EXIT" ? (
                  <div className="enter-message-content">
                    {msg?.memberResDto.nickName}님이{" "}
                    {msg?.chatType === "ENTER" ? "입장하였습니다." : "퇴장하였습니다."}
                  </div>
                ) : msg?.memberResDto?.username === userInfo?.username ? (
                  <div className="message-wrapper">
                    <div className="message-content">{msg?.content}</div>
                    <div className="message-timestamp mine-timestamp">
                      {formatTime(msg?.createdAt)}
                    </div>
                  </div>
                ) : (
                  <div className="message-wrapper">
                    <div className="message-username">
                      {msg?.memberResDto?.name}
                    </div>
                    <div className="message-content">{msg?.content}</div>
                    <div className="message-timestamp other-timestamp">
                      {formatTime(msg?.createdAt)}
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
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onKeyDown={(e) => {
              if (isComposing) return;
              if (e.key === "Enter") sendMessage();
            }}
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
