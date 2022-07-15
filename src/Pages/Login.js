import { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase-config";

function Login() {
    const [registerEmail, setRegisteredEmail] = useState("");
    const [registerPassword, setRegisteredPassword] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

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
            navigate("/dashboard");
        } catch (error) {
            console.log(error.message);
            if (error.message === "Firebase: Password should be at least 6 characters (auth/weak-password).") {
                alert("Password should be at least 6 characters");
            } else if (error.message === "Firebase: Error (auth/invalid-email).") {
                alert("Please enter an email");
            } else if (error.message === "Firebase: Error (auth/email-already-in-use).") {
                alert("The email you entered is already in use");
            } else {
                alert("Please enter an email and password to create an account");
            }
        }
    };

    const login = async () => {
        try {
            const user = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            console.log(user);
            console.log("You're in!");
            navigate("/dashboard");
        } catch (error) {
            console.log(error.message);
            alert("Incorrect email or password");
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <div className="loginContainer">
            <div className="loginDiv">
                <h1>Task Manager</h1>
                {!toggleLogin ? (
                    <div>
                        <h3 className="loginSubTitle">Login</h3>
                        <div>
                            <input
                                className="loginInput"
                                type="text"
                                placeholder="Email"
                                onChange={(e) => {
                                    setLoginEmail(e.target.value);
                                }}
                            />
                        </div>
                        <div>
                            <input
                                className="loginInput"
                                type="password"
                                placeholder="Password"
                                onChange={(e) => {
                                    setLoginPassword(e.target.value);
                                }}
                            />
                        </div>
                        <div className="button loginButton" onClick={login}>
                            Login
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 className="loginSubTitle">Create Account</h3>
                        <div>
                            <input
                                className="loginInput"
                                type="text"
                                placeholder="Email"
                                onChange={(e) => {
                                    setRegisteredEmail(e.target.value);
                                }}
                            />
                        </div>
                        <div>
                            <input
                                className="loginInput"
                                type="password"
                                placeholder="Password"
                                onChange={(e) => {
                                    setRegisteredPassword(e.target.value);
                                }}
                            />
                        </div>
                        <div className="button loginButton" onClick={register}>
                            Create Account
                        </div>
                    </div>
                )}
                <div
                    onClick={() => {
                        setToggleLogin(!toggleLogin);
                    }}
                >
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
    );
}

export { Login };
