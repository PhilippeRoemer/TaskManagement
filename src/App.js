import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./Pages/Dashboard.js";
import { Login } from "./Pages/Login.js";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
