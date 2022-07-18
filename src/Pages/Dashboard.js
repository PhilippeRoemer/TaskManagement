import { useEffect, useState } from "react";
import "../App.css";
import { db } from "../firebase-config";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp, Firestore } from "firebase/firestore";
import trashIcon from "../images/trash_icon.png";
import sidebarImage from "../images/sidebar_background.png";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [toggleAddProject, setToggleAddProject] = useState(false);
    const [newProject, setNewProject] = useState("blank");
    const [selectedProjectID, setSelectedProjectID] = useState([]);
    const [selectedProjectName, setSelectedProjectName] = useState("");

    const [tasks, setTasks] = useState([]);
    const [toggleTaskInfo, setToggleTaskInfo] = useState([]);
    const [toggleAddTask, setToggleAddTask] = useState(false);
    const [toggleState, setToggleState] = useState(false);
    const [newTask, setNewTask] = useState("");
    const [newTaskType, setNewTaskType] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState("");
    const [newUpdatedTask, setNewUpdatedTask] = useState("");

    const [updateList, setUpdateList] = useState(false);

    const [user, setUser] = useState({});

    let navigate = useNavigate();

    const logout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    /* GET TASKS AFTER THE PROJECT IS SELECTED*/
    useEffect(() => {
        const getTasks = async () => {
            const data = await getDocs(collection(db, "users", user.uid, "projects", selectedProjectID, "tasks"));
            console.log(data.docs);
            const allTasks = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            console.log(allTasks);
            /* Filters tasks by the selected project */
            const filteredProject = allTasks.filter((id) => id.project === selectedProjectID);
            console.log(filteredProject);
            setTasks(filteredProject);
        };
        getTasks();
    }, [selectedProjectID, updateList]);

    /* GET PROJECTS */
    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                const usersCollectionRef2 = collection(db, "users", currentUser.uid, "projects");
                setUser(currentUser);
                console.log(currentUser.uid);
                const getProjects = async () => {
                    const data = await getDocs(usersCollectionRef2);
                    console.log(data.docs);
                    setProjects(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
                };

                getProjects();
            } else {
                navigate("/login");
            }
        });
    }, [updateList]);

    /* CREATE PROJECT */
    const createProject = async () => {
        await addDoc(collection(db, "users", user.uid, "projects"), {
            project: newProject,
            project_created: Timestamp.now(),
        });

        document.getElementById("newProject").value = "";
        setToggleAddProject(false);
        setUpdateList(!updateList);
    };

    /* DELETE PROJECT */
    const deleteProject = async () => {
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID);
        if (window.confirm("You are about to delete: " + selectedProjectName + "\n\nAre you sure you want to delete this project?")) {
            await deleteDoc(taskDoc);
            setSelectedProjectID("");
            setUpdateList(!updateList);
        }
    };

    /* CREATE TASK */
    const createTask = async () => {
        const tasksCollectionRef2 = collection(db, "users", user.uid, "projects", selectedProjectID, "tasks");
        if (newTaskPriority === "" || newTaskType === "" || newTask === "") {
            alert("Please enter all fields to create a new task");
        } else {
            await addDoc(tasksCollectionRef2, { task: newTask, project: selectedProjectID, completed: false, task_created: Timestamp.now(), type: newTaskType, priority: newTaskPriority });
            setNewTask("");
            setToggleAddTask(false);
            setNewTaskPriority("");
            setNewTaskType("");
            setUpdateList(!updateList);
        }
    };

    /* UPDATE TASK */
    const updateTask = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", taskID);
        const newFields = { task: newUpdatedTask };

        if (newUpdatedTask === "") {
            alert("Enter a task to update");
        } else {
            await updateDoc(taskDoc, newFields);
            document.getElementById("updatedTask").value = "";
            setUpdateList(!updateList);
            setNewUpdatedTask("");
        }
    };

    /* DELETE TASK */
    const deleteTask = async (id) => {
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", id);
        await deleteDoc(taskDoc);
        setUpdateList(!updateList);
    };

    /* COMPLETE TASK */
    const completeTask = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", taskID);
        const newFields = { completed: true, date_completed: Timestamp.now() };

        await updateDoc(taskDoc, newFields);
        setUpdateList(!updateList);
    };

    return (
        <div>
            {/* SIDEBAR/ADD NEW PROJECT */}
            <div className="sidebar" style={{ backgroundImage: `url(${sidebarImage})`, backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
                <h1>Projects</h1>

                {projects
                    .sort((a, b) => (a.project_created > b.project_created ? 1 : -1))
                    .map((project) => {
                        return (
                            <div
                                className={selectedProjectID === project.id ? "selectedSidebarProject" : "projectList"}
                                onClick={() => {
                                    setSelectedProjectID(project.id);
                                    setSelectedProjectName(project.project);
                                    setToggleAddTask(false);
                                }}
                            >
                                <p>{project.project}</p>
                            </div>
                        );
                    })}

                <div
                    className="addProjectButton"
                    onClick={() => {
                        setToggleAddProject(!toggleAddProject);
                    }}
                >
                    {!toggleAddProject ? <p>+ Add a new project</p> : <p>- Add a new project</p>}
                </div>
                {toggleAddProject ? (
                    <div className="expandedAddProjectContainer">
                        <input
                            className="addProjectInput"
                            type="text"
                            placeholder="Project"
                            id="newProject"
                            onChange={(e) => {
                                setNewProject(e.target.value);
                            }}
                        />
                        <div className="expandedAddProjectButton" onClick={createProject}>
                            Add Project
                        </div>
                    </div>
                ) : null}
            </div>
            {/* PAGE CONTENT/PROJECT TASKS */}
            <div className="pageContent">
                <div className="userDiv">
                    <p>
                        <b>User Logged In:</b> {user ? user.email : "Not Logged In"}
                    </p>
                    <div className="signoutButton" onClick={logout}>
                        Signout
                    </div>
                </div>
                {selectedProjectID == "" ? (
                    <div className="selectProjectContainer">
                        <h1>Select or create a new project</h1>
                    </div>
                ) : (
                    <div>
                        <h1 className="projectTitle">{selectedProjectName}</h1>
                        {/* LIST OUT TO DO TASKS */}
                        <h3>To Do</h3>
                        {tasks
                            .sort((a, b) => (a.task_created > b.task_created ? 1 : -1))
                            .map((task) => {
                                if (task.completed === false) {
                                    return (
                                        <div className="taskDiv">
                                            {/* TASK */}
                                            <div className="taskTitle">
                                                <p
                                                    className="taskToggle"
                                                    id={task.task}
                                                    onClick={(e) => {
                                                        setToggleTaskInfo(e.target.id);
                                                        setToggleState(!toggleState);
                                                    }}
                                                >
                                                    {task.task}
                                                </p>
                                                <div className="taskGlanceDiv">
                                                    <div className={task.priority === "Low" ? "taskGlancePriorityLow" : task.priority === "Medium" ? "taskGlancePriorityMedium" : task.priority === "High" ? "taskGlancePriorityHigh" : null}> </div>
                                                    <p className="taskGlanceType">{task.type}</p>

                                                    {(toggleTaskInfo === task.task) & (toggleState === true) ? <p>&#x2212;</p> : <p>&#x2b;</p>}
                                                </div>
                                            </div>
                                            {(toggleTaskInfo === task.task) & (toggleState === true) ? (
                                                <div className="taskInfo">
                                                    {/* EXPANDED TASK INFO - UPDATE/COMPLETE/REMOVE */}
                                                    <div className="taskInputDiv">
                                                        <input
                                                            className="taskUpdateInput"
                                                            type="text"
                                                            placeholder="Edit current task"
                                                            id="updatedTask"
                                                            onChange={(e) => {
                                                                setNewUpdatedTask(e.target.value);
                                                            }}
                                                        />
                                                        <div className="button updateButton" onClick={updateTask} id={task.id}>
                                                            Update Task
                                                        </div>
                                                    </div>
                                                    {/* MARK TASK AS COMPLETED */}
                                                    <div className="button completedButton" onClick={completeTask} id={task.id}>
                                                        Completed
                                                    </div>
                                                    {/* DELETE TASK */}
                                                    <div
                                                        className="button removeButton"
                                                        onClick={() => {
                                                            deleteTask(task.id);
                                                        }}
                                                    >
                                                        Remove
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    );
                                }
                            })}
                        {/* ADD TASK */}
                        <div className="addTaskContainer">
                            <div
                                className="addTaskButton"
                                onClick={() => {
                                    setToggleAddTask(!toggleAddTask);
                                }}
                            >
                                {!toggleAddTask ? <p>+ Add a new task</p> : <p>- Add a new task</p>}
                            </div>
                            {toggleAddTask ? (
                                /* EXPANDED ADD TASK */
                                <div className="expandedAddTaskContainer">
                                    <input
                                        className="addTaskInput"
                                        type="text"
                                        placeholder="Task"
                                        id="newTask"
                                        onChange={(e) => {
                                            setNewTask(e.target.value);
                                        }}
                                    />
                                    <select
                                        className="dropdown"
                                        onChange={(e) => {
                                            setNewTaskPriority(e.target.value);
                                        }}
                                    >
                                        <option disabled selected value>
                                            Priority
                                        </option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                    <select
                                        className="dropdown"
                                        onChange={(e) => {
                                            setNewTaskType(e.target.value);
                                        }}
                                    >
                                        <option disabled selected value>
                                            Type
                                        </option>
                                        <option value="Task">Task</option>
                                        <option value="Bug">Bug</option>
                                        <option value="Feature">Feature</option>
                                    </select>

                                    <div className="expandedAddTaskButton" onClick={createTask}>
                                        Add Task
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <h3>Completed</h3>
                        {tasks
                            .sort((a, b) => (a.date_completed > b.date_completed ? -1 : 1))
                            .map((task) => {
                                if (task.completed === true) {
                                    return (
                                        <div className="completedTasks">
                                            <p>{task.task}</p>
                                            <div>
                                                <img
                                                    alt="#"
                                                    src={trashIcon}
                                                    className="completedTaskDelete"
                                                    onClick={() => {
                                                        deleteTask(task.id);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            })}
                        <div className="deleteProject">
                            <div onClick={deleteProject} className="deleteProjectButton">
                                Delete Project
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export { Dashboard };
