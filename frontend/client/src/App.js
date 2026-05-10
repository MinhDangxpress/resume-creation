import logo from "./logo.svg";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SoYeuLyLichForm from "./components/SoYeuLyLichForm";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/so-yeu-ly-lich" element={<SoYeuLyLichForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
