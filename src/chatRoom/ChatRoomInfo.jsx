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
<<<<<<< HEAD
  const navigate = useNavigate();

  const { userInfo } = useContext(LoginContext);
  const { formatDateTime3, formatTime } = useContext(FuncModule);
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState({});
  const [chatInfo, setChatInfo] = useState([]);
=======
  const { userInfo } = useContext(LoginContext);
  const { formatDateTime3, formatTime } = useContext(FuncModule);
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [roomInfo, setRoomInfo] = useState({});
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [userCount, setUserCount] = useState(0);
  const [allUserCount, setAllUserCount] = useState(0);

  const [isRoomDeleted, setIsRoomDeleted] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
<<<<<<< HEAD
  const [isComposing, setIsComposing] = useState(false);

  // 채팅방 정보
=======

>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
  const getRoomInfo = async () => {
    try {
      const response = await req.chatRoomInfo(roomId);

<<<<<<< HEAD
      const { chatRoomName, creator, member, createdAt, modifiedAt } = response.data;
=======
      const { chatRoomName, creator, member, chats, createdAt, modifiedAt } = response.data;
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da

      setRoomInfo({
        chatRoomName,
        creator,
        member,
<<<<<<< HEAD
        createdAt,
        modifiedAt,
      });

=======
        chats,
        createdAt,
        modifiedAt,
      });
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
    } catch (error) {
      console.error("채팅방 정보를 불러오는 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  // 해당 채팅방의 채팅 목록
  const getChats = async () => {
    try {
      const response = await req.chats(roomId);

      setChatInfo(response.data);

      console.log("채팅 데이터 불러오기 성공:", response.data);
    } catch (error) {
      console.error("채팅방 정보를 불러오는 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 채팅방 삭제
=======
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
  const deleteRoom = async (roomId) => {
    console.log(userInfo?.username + ", " + roomInfo?.member?.username)

    if (userInfo?.username != roomInfo?.member?.username) {
      alert("방 생성자가 아닙니다.");
      return;
    }

<<<<<<< HEAD
=======

>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
    const check = window.confirm("채팅방을 삭제 하시겠습니까? ?");

    if (check) {
      try {
        const response = await req.deleteRoom(roomId);

<<<<<<< HEAD
        setIsRoomDeleted(true);

        if (stompClientRef.current) {
          stompClientRef.current.publish({
            destination: `/topic/chat/delete/${roomId}`,
            body: "chatroom deleted",
          });
        }

        navigate("/chatRooms");

=======
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
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
      } catch (error) {
        console.error("채팅방 삭제 중 오류 발생", error);
      }
    }
  };

<<<<<<< HEAD
  // 채팅방 진입 시 socket 연결
=======
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
  useEffect(() => {
    const socket = new SockJS(SOCKET_URL);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (msg) => console.log("[STOMP]:", msg),

      onConnect: () => {
        console.log("[STOMP] 연결 성공: ", stompClient);

<<<<<<< HEAD
        // 1. 채팅 메시지 구독
        stompClient.subscribe(`/topic/chat/${roomId}`, (message) => {
          if (message.body) {
            console.log("[STOMP] 메시지 수신: ", message.body);
            const receivedMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, receivedMessage]);
          }
        });

        // 2. 현재 방 인원 수 구독
        stompClient.subscribe(`/topic/chatroom/userCnt/${roomId}`, (message) => {
          console.log("[STOMP] 현재 인원 수: ", message.body);
          setUserCount(parseInt(message.body, 10));
        });

        // 3. 방 삭제 이벤트 구독
        stompClient.subscribe(`/topic/chat/delete/${roomId}`, (message) => {
          console.log("[STOMP] 채팅방 삭제 메시지 수신:", message.body);
          if (message.body === "chatroom deleted") {
            alert("채팅방이 삭제되었습니다.");
=======
        stompClient.subscribe(`/topic/chat/delete/${roomId}`, (message) => {
          console.log("[STOMP] 채팅방 삭제 메시지 수신:", message.body);

          if (message.body === "방 삭제됨") {
            alert("채팅방이 삭제되었습니다.");

            // 채팅방 삭제 시 이동
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
            navigate("/chatRooms");
          }
        });

<<<<<<< HEAD
        // 4. 전체 유저 카운트 관련 구독
=======
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
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
        stompClient.subscribe(`/topic/all/userCnt`, (message) => {
          console.log("[STOMP] 전체 인원 수: ", message.body);
          setAllUserCount(parseInt(message.body, 10));
        });

<<<<<<< HEAD
        // 인원 수 요청
        stompClient.publish({ destination: `/app/chatroom/userCnt` });
        stompClient.publish({ destination: "/app/chat/userCnt" });

        // 5. 입장 메시지 (세션 기준, 새로고침 시 중복 방지)
        if (!sessionStorage.getItem(`entered-${roomId}`)) {
          console.log("[STOMP] 입장 메시지 전송");
=======
        // 채팅방에 접속한 모든 인원 수 [응답]
        stompClient.publish({
          destination: "/app/chat/userCnt",
        });

        if (!localStorage.getItem(`entered-${roomId}`)) {
          console.log("[STOMP] 입장 메시지 전송");

          // 입장 메세지 정보
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
          const enterMessage = {
            chatType: "ENTER",
            username: userInfo?.username,
            nickName: userInfo?.nickName,
<<<<<<< HEAD
            roomId,
          };
=======
            roomId: roomId,
          };

          // 서버로 입장 메세지 전달, 특정 채팅방 [구독]에 대한 [응답]
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
          stompClient.publish({
            destination: "/app/chat/message",
            body: JSON.stringify(enterMessage),
          });
<<<<<<< HEAD
          sessionStorage.setItem(`entered-${roomId}`, "true");
=======

          localStorage.setItem(`entered-${roomId}`, "true");
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
        }
      },

      onStompError: (e) => {
        console.error("[STOMP] 연결 실패: ", e);
        stompClient.deactivate();
      },

<<<<<<< HEAD
=======
      // websocket 연결이 해제될 때 자동 실행
      // 즉, stompClient.deactivate()이 실행 될 때 작동
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
      onDisconnect: () => {
        console.log("[STOMP] 연결 해제");
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

<<<<<<< HEAD
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
          roomId,
        };
        stompClientRef.current.publish({
          destination: "/app/chat/message",
          body: JSON.stringify(exitMessage),
        });
        console.log("[STOMP] beforeunload 퇴장 메시지 전송 완료");
      }
      sessionStorage.removeItem(`entered-${roomId}`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // 7. WebSocket 연결 해제
    return () => {
      console.log("[STOMP] 채팅방 컴포넌트 unmount");

      window.removeEventListener("beforeunload", handleBeforeUnload);

      // useEffect 언마운트 시에는 퇴장 메시지 중복 방지
=======
    return () => {
      console.log("[STOMP] 채팅방 나감, 퇴장 메시지 전송 후 연결 해제");

>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
      if (
        !isRoomDeleted &&
        stompClientRef.current &&
        stompClientRef.current.connected
      ) {
        const exitMessage = {
          chatType: "EXIT",
          username: userInfo?.username,
          nickName: userInfo?.nickName,
<<<<<<< HEAD
          roomId,
        };
=======
          roomId: roomId,
        };

        // 서버로 퇴장 메시지 전달, 특정 채팅방 [구독]에 대한 [응답]
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
        stompClientRef.current.publish({
          destination: "/app/chat/message",
          body: JSON.stringify(exitMessage),
        });
<<<<<<< HEAD
        console.log("[STOMP] 언마운트 시 퇴장 메시지 전송 완료");
      }

      stompClient.deactivate();
      sessionStorage.removeItem(`entered-${roomId}`);
=======

        console.log("[STOMP] 퇴장 메시지 전송 완료");
      }

      // WebSocket 연결 해제
      stompClient.deactivate();
      localStorage.removeItem(`entered-${roomId}`);
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
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
      nickName: userInfo?.nickName,
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

<<<<<<< HEAD
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

=======
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
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
<<<<<<< HEAD
      getChats();
=======
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
    }
  }, [roomId]);

  useEffect(() => {
<<<<<<< HEAD
    if (chatInfo) {
      const filteredMessages = chatInfo.filter(
=======
    if (roomInfo?.chats) {
      const filteredMessages = roomInfo.chats.filter(
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
        (message) => message.chatType !== "ENTER" && message.chatType !== "EXIT"
      );

      setMessages(filteredMessages);
    }
<<<<<<< HEAD
  }, [chatInfo]);
=======
  }, [roomInfo]);
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da

  return (
    <>
      <Header />
      <div className="chat-container">
        <div className="chat-box">
          <div className="chat-menu">
            {isLoading ? (
              <Skeleton width={150} height={15} />
            ) : (
              <>
                <span>{roomInfo.chatRoomName}</span>
                <br />
                <label className="chatRoonInfo" style={{ marginTop: "10px" }}>
                  <span>
<<<<<<< HEAD
                    채팅방 생성자 : {roomInfo?.member?.name}
                  </span>{" "}
                  <span className="chatRoomDelete">
                    채팅방 생성일자 : {formatDateTime3(roomInfo.createdAt)}
=======
                    {roomInfo?.member?.nickName} ({roomInfo?.member?.username})
                  </span>{" "}
                  <span className="chatRoomDelete">
                    {formatDateTime3(roomInfo.createdAt)}
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
                    {userInfo?.username === roomInfo?.member?.username && (
                      <span onClick={() => deleteRoom(roomId)}>
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
            {isLoading
              ? Array.from({ length: 10 }).map((_, index) => (
<<<<<<< HEAD
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
                    : msg?.member?.username === userInfo?.username
                      ? "mine"
                      : "other"
                    }`}
                >
                  {msg?.chatType === "ENTER" || msg?.chatType === "EXIT" ? (
                    <div className="enter-message-content">
                      {msg?.content.split(":")[0]}님이{" "}
                      {msg?.chatType === "ENTER" ? "입장하였습니다." : "퇴장하였습니다."}
                    </div>
                  ) : msg?.member?.username === userInfo?.username ? (
                    <div className="message-wrapper">
                      <div className="message-content">{msg?.content}</div>
                      <div className="message-timestamp mine-timestamp">
                        {formatTime(msg?.createdAt)}
                      </div>
                    </div>
                  ) : (
                    <div className="message-wrapper">
                      <div className="message-username">
                        {msg?.member?.name}
                      </div>
                      <div className="message-content">{msg?.content}</div>
                      <div className="message-timestamp other-timestamp">
                        {formatTime(msg?.createdAt)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
=======
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
                    className={`chat-message ${
                      msg?.chatType === "ENTER" || msg?.chatType === "EXIT"
                        ? "enter-message"
                        : msg?.member?.username === userInfo?.username
                        ? "mine"
                        : "other"
                    }`}
                  >
                    {msg?.chatType === "ENTER" || msg?.chatType === "EXIT" ? (
                      <div className="enter-message-content">
                        {msg?.content}
                      </div>
                    ) : msg?.member?.username === userInfo?.username ? (
                      <div className="message-wrapper">
                        <div className="message-content">{msg?.content}</div>
                        <div className="message-timestamp mine-timestamp">
                          {formatTime(msg?.createdAt)}
                        </div>
                      </div>
                    ) : (
                      <div className="message-wrapper">
                        <div className="message-username">
                          {msg?.member?.name}
                        </div>
                        <div className="message-content">{msg?.content}</div>
                        <div className="message-timestamp other-timestamp">
                          {formatTime(msg?.createdAt)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
          </div>

          <div className="chat-input-container">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="메시지를 입력하세요..."
              value={message}
<<<<<<< HEAD
              onChange={handleChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onKeyDown={(e) => {
                if (isComposing) return; 
                if (e.key === "Enter") sendMessage();
              }}
=======
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
>>>>>>> 4e34a2167360762f862a0d61bff35ea23c1d24da
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
