import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatRoomInfo from "./chatRoom/ChatRoomInfo";
import ChatRooms from "./chatRoom/ChatRooms";
import LoginState from "./state/LoginState";
import FuncList from "./state/FuncList";
import Home from "./Home";
import EditMember from "./edit/EditMember";
import TransitTimePage from "./Transit/TransitTimePage";
import ParkingInfo from "./parking/ParkingInfo";

function App() {
  return (
    <BrowserRouter>
      <LoginState>
          <FuncList>
            <Routes>
              <Route path="/room/:chatroomId" element={<ChatRoomInfo />} />
              <Route path="/chatrooms" element={<ChatRooms />} />
              <Route path="/" element={<Home />} />
              <Route path="/editMember" element={<EditMember />} />
              <Route path="/transit-time" element={<TransitTimePage />} />
              <Route path="/parking-info" element={<ParkingInfo />} />
            </Routes>
          </FuncList>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
