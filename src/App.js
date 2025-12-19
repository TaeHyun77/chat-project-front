import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatRoomInfo from "./chatRoom/ChatRoomInfo";
import ChatRooms from "./chatRoom/ChatRooms";
import LoginState from "./state/LoginState";
import Chatcontext from "./chatRoom/ChatRoomInfo";
import FuncList from "./state/FuncList";
import Home from "./Home";
import EditMember from "./edit/EditMember";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
          <FuncList>
            <Routes>
              <Route path="/room/:roomId" element={<ChatRoomInfo />} />
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
