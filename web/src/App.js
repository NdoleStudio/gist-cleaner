import { Route, Routes, BrowserRouter } from 'react-router-dom';
import './App.css';
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Notfound from "./pages/404";

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Notfound />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;
