import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "./LoginState";
import * as req from "./api/req";
import Header from "./Header";
import Footer from "./Footer";
import "./EditMember.css";

const EditMember = () => {
  const { userInfo } = useContext(LoginContext);
  const [userId, setUserId] = useState(userInfo?.id);
  const [editNickName, setEditNickName] = useState(userInfo?.nickName);
  const [isNickNameAvailable, setIsNickNameAvailable] = useState(false);
  console.log("Is : " + isNickNameAvailable);

  const navigate = useNavigate();

  const getIsNickName = async (editNickName) => {
    if (!editNickName.trim()) {
      alert("닉네임을 입력해주세요!");
      return;
    }

    try {
      const response = await req.isNickName(editNickName);
      setIsNickNameAvailable(!response.data);
    } catch (error) {
      console.error("중복 체크 중 오류 발생:", error);
      setIsNickNameAvailable(false);
    }
  };

  const getEditNickName = async (id, editNickName) => {
    if (!isNickNameAvailable) {
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

  useEffect(() => {
    if (userInfo?.nickName) {
      setEditNickName(userInfo.nickName);
      setUserId(userInfo?.id);
    }
  }, [userInfo]);

  return (
    <>
      <Header />
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
          <input type="text" disabled name="name" value={userInfo?.username} />
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
              {isNickNameAvailable ? "사용 가능합니다." : "사용할 수 없습니다."}
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
      <Footer />
    </>
  );
};

export default EditMember;
