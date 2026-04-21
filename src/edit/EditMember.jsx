import React, { useState } from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import ProfileSection from "./ProfileSection";
import FlightSection from "./FlightSection";
import "./EditMember.css";

const EditMember = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="edit-page">
      <Header />

      <div className="edit_tab_group">
        <button
          className={activeTab === "profile" ? "edit_tab_btn active" : "edit_tab_btn"}
          onClick={() => setActiveTab("profile")}
        >
          내 정보
        </button>
        <button
          className={activeTab === "flight" ? "edit_tab_btn active" : "edit_tab_btn"}
          onClick={() => setActiveTab("flight")}
        >
          항공편
        </button>
      </div>

      <div className="edit_content">
        {activeTab === "profile" ? <ProfileSection /> : <FlightSection />}
      </div>

      <Footer />
    </div>
  );
};

export default EditMember;
