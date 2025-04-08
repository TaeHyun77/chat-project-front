import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../state/LoginState";
import { FuncModule } from "../state/FuncList";
import * as req from "../api/req";
import Header from "../header/Header";
import Footer from "../footer/Footer";

import Skeleton from "react-loading-skeleton";
import { TbMessage2Minus } from "react-icons/tb";
import "./EditMember.css";

const EditMember = () => {
  const { userInfo } = useContext(LoginContext);
  const { formatDateTime3 } = useContext(FuncModule);
  const [userId, setUserId] = useState(userInfo?.id);
  const [memberChatRooms, setMemberChatRooms] = useState([]);
  const [editNickName, setEditNickName] = useState(userInfo?.nickName);
  const [isNickNameAvailable, setIsNickNameAvailable] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  console.log("Is : " + isNickNameAvailable);

  const navigate = useNavigate();

  const getMemberChatRooms = async (userId) => {
    try {
      const response = await req.getMemberChatRooms(userId);

      setMemberChatRooms(response.data.chatRoomMemberDtos);
    } catch (error) {
      console.error("회원의 채팅방 정보를 가져오는 중 에러 발생:", error);
    }
    setIsLoading(false);
  };

  const getIsNickName = async (editNickName) => {
    if (!editNickName.trim()) {
      alert("닉네임을 입력해주세요!");
      return;
    }

    try {
      const response = await req.isNickName(editNickName);
      setIsNickNameAvailable(response.data ? "unavailable" : "available");
    } catch (error) {
      console.error("중복 체크 중 오류 발생:", error);
      setIsNickNameAvailable(false);
    }
  };

  const getEditNickName = async (id, editNickName) => {
    if (isNickNameAvailable != "available") {
      alert("중복 확인을 해주세요 !");
      return;
    }

    const check = window.confirm("회원 정보를 수정 하시겠습니까 ?");

    if (check) {
      try {
        const response = await req.editNickName(id, editNickName);

        if (response.status == 200) {
          alert("회원 정보가 수정 되었습니다 !");
          navigate("/");
        } else {
          alert("회원 정보가 수정 중 오류 발생 !");
        }
      } catch (error) {
        console.error("회원 정보 수정 중 오류 발생", error);
      }
    }
  };

  const enterRoom = (roomId) => {
    if (!window.confirm("채팅에 참여하시겠습니까?")) return;

    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    if (userInfo?.nickName) {
      setEditNickName(userInfo.nickName);
      setUserId(userInfo?.id);
    }

    if (userInfo?.id) {
      getMemberChatRooms(userInfo.id);
    }
  }, [userInfo]);

  return (
    <>
      <Header />
      <label className="edit_label">
        <div className="edit_container">
          <h3>회원정보 수정</h3>

          <div className="form-group">
            <label>이메일</label>
            <input type="email" name="email" value={userInfo?.email} disabled />
          </div>

          <div className="form-group">
            <label>이름</label>
            <input type="text" disabled name="name" value={userInfo?.name} />
          </div>

          <div className="form-group">
            <label>유저 코드</label>
            <input
              type="text"
              disabled
              name="name"
              value={userInfo?.username}
            />
          </div>

          <div className="form_group">
            <label>닉네임</label>
            <div className="edit_group">
              <input
                type="text"
                name="nickName"
                value={editNickName}
                onChange={(e) => {
                  setEditNickName(e.target.value);
                  setIsNickNameAvailable(false);
                }}
              />
              <button
                className="distinctBtn"
                onClick={() => getIsNickName(editNickName)}
              >
                중복 확인
              </button>
            </div>
            {isNickNameAvailable !== null && (
              <p
                style={{
                  color: isNickNameAvailable ? "green" : "red",
                  fontSize: "13px",
                }}
              >
                {isNickNameAvailable === "available"
                  ? "사용 가능합니다."
                  : isNickNameAvailable === "unavailable"
                  ? "사용할 수 없습니다."
                  : "중복 확인 후 닉네임을 변경해보세요 !"}
              </p>
            )}
          </div>

          <button
            className="save-btn"
            onClick={() => getEditNickName(userId, editNickName)}
          >
            저장
          </button>
        </div>
        <div className="member_chatRoom">
          <h3>{userInfo?.name}님의 채팅방</h3>
          <div className="room-list">
            <ul className="member-chatrooms-list">
              {isLoading // 로딩 중이면 Skeleton UI 표시
                ? [...Array(5)].map((_, index) => (
                    <li key={index} className="chatroom-item">
                      <Skeleton height={40} width={400} />
                    </li>
                  ))
                : memberChatRooms.map(
                    (
                      memberChatRooms,
                      index // 데이터가 로드되면 정상 목록 표시
                    ) => (
                      <li
                        className="chatroom-item"
                        onClick={() => enterRoom(memberChatRooms?.chatRoomId)}
                      >
                        <div className="chatroom-content">
                          <div className="chatroom-header">
                            <TbMessage2Minus />
                            <span className="chatroom-title">
                              {memberChatRooms?.chatRoomName}
                            </span>
                          </div>

                          <div className="chatroom-meta">
                            <span>
                              {memberChatRooms?.member?.name} -{" "}
                              {formatDateTime3(memberChatRooms.createdAt)}
                            </span>
                          </div>
                        </div>
                      </li>
                    )
                  )}
            </ul>
          </div>
        </div>
      </label>
      <Footer />
    </>
  );
};

export default EditMember;
