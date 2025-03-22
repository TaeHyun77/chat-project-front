import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footerContainer">
        <span style={{marginBottom:"10px"}}>Developed by Park TaeHyun</span>
        <span>Backend : https://github.com/TaeHyun77/chat-project.git</span>
        <span>Frontend : https://github.com/TaeHyun77/chat-project-front.git</span>
      </div>
    </footer>
  );
};

export default Footer;
