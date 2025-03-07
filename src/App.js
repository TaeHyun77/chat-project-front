import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import ChatRooms from "./ChatRooms";
import LoginState from "./LoginState";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
          <Routes>
            <Route path="/:roomId" element={<Home />} />
            <Route path="/" element={<ChatRooms />} />
          </Routes>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
