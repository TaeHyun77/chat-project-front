import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer>
      <div className="footerContainer">
        <span className="footer-author">Developed by Park TaeHyun</span>
        <div className="footer-links">
          <a href="https://github.com/TaeHyun77/chat-project" target="_blank" rel="noopener noreferrer">
            Backend GitHub
          </a>
          <a href="https://github.com/TaeHyun77/chat-project-front" target="_blank" rel="noopener noreferrer">
            Frontend GitHub
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
