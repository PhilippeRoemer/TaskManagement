import { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import laptopImage from "../images/TaskManager_Laptop.png";

function Login() {
    const [registerEmail, setRegisteredEmail] = useState("");
    const [registerPassword, setRegisteredPassword] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginErrorMessage, setLoginErrorMessage] = useState(false);
    const [createAccountErrorMessage, setCreateAccountErrorMessage] = useState(null);

    const [toggleLogin, setToggleLogin] = useState(false);

    const [user, setUser] = useState({});

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
    }, []);

    let navigate = useNavigate();

    const register = async () => {
        try {
            const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
            console.log(user);
            setCreateAccountErrorMessage(null);
            navigate("/dashboard");
        } catch (error) {
            console.log(error.message);
            if (error.message === "Firebase: Password should be at least 6 characters (auth/weak-password).") {
                setCreateAccountErrorMessage("Password should be at least 6 characters");
            } else if (error.message === "Firebase: Error (auth/invalid-email).") {
                setCreateAccountErrorMessage("Please enter an email");
            } else if (error.message === "Firebase: Error (auth/email-already-in-use).") {
                setCreateAccountErrorMessage("The email you entered is already in use");
            } else {
                setCreateAccountErrorMessage("Please enter an email and password to create an account");
            }
        }
    };

    const registerOnEnter = (e) => {
        if (e.code === "Enter") {
            register();
        }
    };

    const login = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            console.log(user);
            console.log("You're in!");
            setLoginErrorMessage(false);
            navigate("/dashboard");
        } catch (error) {
            console.log(error.message);
            setLoginErrorMessage(true);
        }
    };

    const loginOnEnter = (e) => {
        if (e.code === "Enter") {
            login();
        }
    };

    const toggle = () => {
        setToggleLogin(!toggleLogin);
        setLoginEmail("");
        setLoginPassword("");

        setRegisteredEmail("");
        setRegisteredPassword("");
        setLoginErrorMessage(false);
        setCreateAccountErrorMessage(null);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <div class="homeContainer">
            <div class="contentContainer">
                <div class="contentText">
                    <h1>Task Manager</h1>
                    <p>Organize your project tasks with Task Manager.</p>
                </div>
                <img src={laptopImage} alt="" className="laptopImage" />
            </div>
            <div class="loginContainer">
                <div>
                    <div>
                        {!toggleLogin ? (
                            <div className="loginDiv">
                                <h1 className="loginSubTitle">Login</h1>
                                <div>
                                    <input
                                        className="loginInput"
                                        type="text"
                                        placeholder="Email"
                                        value={loginEmail}
                                        onChange={(e) => {
                                            setLoginEmail(e.target.value);
                                        }}
                                        onKeyPress={loginOnEnter}
                                    />
                                </div>
                                <div>
                                    <input
                                        className="loginInput"
                                        type="password"
                                        placeholder="Password"
                                        value={loginPassword}
                                        onChange={(e) => {
                                            setLoginPassword(e.target.value);
                                        }}
                                        onKeyPress={loginOnEnter}
                                    />
                                </div>
                                {loginErrorMessage === false ? null : <p className="errorMessage">Incorrect email or password</p>}
                                <div className="button loginButton" onClick={login}>
                                    Login
                                </div>
                            </div>
                        ) : (
                            <div className="loginDiv">
                                <h1 className="loginSubTitle">Create an Account</h1>
                                <div>
                                    <input
                                        className="loginInput"
                                        type="text"
                                        placeholder="Email"
                                        value={registerEmail}
                                        onChange={(e) => {
                                            setRegisteredEmail(e.target.value);
                                        }}
                                        onKeyPress={registerOnEnter}
                                    />
                                </div>
                                <div>
                                    <input
                                        className="loginInput"
                                        type="password"
                                        placeholder="Password"
                                        value={registerPassword}
                                        onChange={(e) => {
                                            setRegisteredPassword(e.target.value);
                                        }}
                                        onKeyPress={registerOnEnter}
                                    />
                                </div>
                                {createAccountErrorMessage === null ? null : <p className="errorMessage">{createAccountErrorMessage}</p>}
                                <div className="button loginButton" onClick={register}>
                                    Create Account
                                </div>
                            </div>
                        )}
                        <div onClick={toggle}>
                            {!toggleLogin ? (
                                <p className="createAccountToggle">
                                    <u>Click here to create an account</u>
                                </p>
                            ) : (
                                <p className="createAccountToggle">
                                    <u>Click here to Login</u>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Login };
