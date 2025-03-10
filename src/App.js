import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatRoomInfo from "./ChatRoomInfo";
import ChatRooms from "./ChatRooms";
import LoginState from "./LoginState";
import FuncList from "./FuncList";
import Home from "./Home";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
        <FuncList>
          <Routes>
            <Route path="/:roomId" element={<ChatRoomInfo />} />
            <Route path="/chatrooms" element={<ChatRooms />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </FuncList>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
