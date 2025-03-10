import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatRoomInfo from "./ChatRoomInfo";
import ChatRooms from "./ChatRooms";
import LoginState from "./LoginState";
import Home from "./Home";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
        <Routes>
          <Route path="/:roomId" element={<ChatRoomInfo />} />
          <Route path="/" element={<ChatRooms />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
