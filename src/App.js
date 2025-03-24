import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatRoomInfo from "./ChatRoomInfo";
import ChatRooms from "./ChatRooms";
import LoginState from "./LoginState";
import FuncList from "./FuncList";
import Home from "./Home";
import EditMember from "./EditMember";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
        <FuncList>
          <Routes>
            <Route path="/api/:roomId" element={<ChatRoomInfo />} />
            <Route path="/chatrooms" element={<ChatRooms />} />
            <Route path="/" element={<Home />} />
            <Route path="/editMember" element={<EditMember />} />
          </Routes>
        </FuncList>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
