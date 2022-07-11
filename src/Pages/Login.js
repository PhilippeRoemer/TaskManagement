import React from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";

function Login() {
    let navigate = useNavigate();
    return (
        <div className="loginContainer">
            <div className="loginDiv">
                <h1>Task Manager</h1>

                <input className="loginInput" type="text" placeholder="Username" id="newTask" />

                <input className="loginInput" type="password" placeholder="Password" id="newTask" />
                <div
                    className="button loginButton"
                    onClick={() => {
                        navigate("/dashboard");
                    }}
                >
                    Login
                </div>
            </div>
        </div>
    );
}

export { Login };
