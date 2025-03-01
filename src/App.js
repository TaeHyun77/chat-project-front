import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";
import LoginState from './LoginState';

function App() {
  return (
    <BrowserRouter>
      <LoginState>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </LoginState>
    </BrowserRouter>
  );
}

export default App;
