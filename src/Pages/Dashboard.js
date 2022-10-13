import { useEffect, useState } from "react";
import "../App.css";
import { db } from "../firebase-config";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, Timestamp, Firestore, increment } from "firebase/firestore";
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

    const [editProjectTitle, setEditProjectTitle] = useState("");
    const [toggleProjectTitle, setToggleProjectTitle] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [toggleAddTask, setToggleAddTask] = useState(false);
    const [newTask, setNewTask] = useState("");
    const [newTaskType, setNewTaskType] = useState("Task");
    const [newTaskPriority, setNewTaskPriority] = useState("Low");
    const [newUpdatedTask, setNewUpdatedTask] = useState("");
    const [toDoTask, setToDoTask] = useState([]);
    const [completedTask, setCompletedTask] = useState([]);

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
            console.log("Data docs:");
            console.log(data.docs);
            const allTasks = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            console.log("All tasks:");
            console.log(allTasks);
            setSelectedTask(null);
            /* Filters tasks by the selected project */
            const filteredProject = allTasks.filter((id) => id.project === selectedProjectID);
            console.log("Filtered project:");
            console.log(filteredProject);
            setTasks(filteredProject);
            /* Filters out all todo tasks */
            const toDo = filteredProject.filter((tasks) => tasks.completed === false);
            setToDoTask(toDo);
            /* Filters out all project completed tasks */
            const completedTasks = filteredProject.filter((completedTask) => completedTask.completed === true);
            setCompletedTask(completedTasks);
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

            const projectDoc = doc(db, "users", user.uid, "projects", selectedProjectID);
            const taskStatusUpdate = { tasks_completed: increment(0), tasks_open: increment(1) };
            await updateDoc(projectDoc, taskStatusUpdate);

            setNewTask("");
            setToggleAddTask(false);
            setNewTaskPriority("Low");
            setNewTaskType("Task");
            setUpdateList(!updateList);
        }
    };

    /* CREATE TASK ON ENTER*/
    const createTaskOnEnter = (e) => {
        if (e.code === "Enter") {
            createTask();
        }
    };

    /* UPDATE PROJECT TITLE */
    const updateProjectTitle = async () => {
        console.log(editProjectTitle);
        if (editProjectTitle !== "") {
            const projectDoc = doc(db, "users", user.uid, "projects", selectedProjectID);
            const updatedTitle = { project: editProjectTitle };

            await updateDoc(projectDoc, updatedTitle);
            setUpdateList(!updateList);
            setToggleProjectTitle(!toggleProjectTitle);
        } else {
            setToggleProjectTitle(!toggleProjectTitle);
        }
    };

    /* UPDATE PROJECT TITLE ON ENTER*/
    const updateProjectTitleOnEnter = (e) => {
        if (e.code === "Enter") {
            updateProjectTitle();
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

    /* UPDATE PRIORITY */
    const updatePriority = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", taskID);
        const newFields = { priority: e.target.value };
        await updateDoc(taskDoc, newFields);
        setUpdateList(!updateList);
    };

    /* UPDATE TYPE */
    const updateType = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", taskID);
        const newFields = { type: e.target.value };
        await updateDoc(taskDoc, newFields);
        setUpdateList(!updateList);
    };

    /* DELETE TASK */
    const deleteTask = async (id) => {
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", id);
        await deleteDoc(taskDoc);

        const projectDoc = doc(db, "users", user.uid, "projects", selectedProjectID);
        const taskStatusUpdate = { tasks_open: increment(-1) };
        await updateDoc(projectDoc, taskStatusUpdate);

        setUpdateList(!updateList);
    };

    /* MOVE TASK TO ToDo */
    const moveTaskToDo = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", taskID);
        const newFields = { completed: false };
        await updateDoc(taskDoc, newFields);

        const projectDoc = doc(db, "users", user.uid, "projects", selectedProjectID);
        const taskStatusUpdate = { tasks_open: increment(1), tasks_completed: increment(-1) };
        await updateDoc(projectDoc, taskStatusUpdate);
        setUpdateList(!updateList);
    };

    /* DELETE COMPLETED TASK */
    const deleteCompletedTask = async (id) => {
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", id);
        await deleteDoc(taskDoc);

        const projectDoc = doc(db, "users", user.uid, "projects", selectedProjectID);
        const taskStatusUpdate = { tasks_completed: increment(-1) };
        await updateDoc(projectDoc, taskStatusUpdate);

        setUpdateList(!updateList);
    };

    /* COMPLETED TASK */
    const completeTask = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "users", user.uid, "projects", selectedProjectID, "tasks", taskID);
        const newFields = { completed: true, date_completed: Timestamp.now() };

        const projectDoc = doc(db, "users", user.uid, "projects", selectedProjectID);
        const newFields2 = { tasks_completed: increment(1), tasks_open: increment(-1) };

        await updateDoc(projectDoc, newFields2);
        await updateDoc(taskDoc, newFields);
        setUpdateList(!updateList);
    };

    /* TOGGLE SECLECTED TASK */
    const toggleTask = (i) => {
        if (selectedTask === i) {
            return setSelectedTask(null);
        }
        console.log(selectedTask);
        setSelectedTask(i);
        setSelectedCompletedTask(null);
        setNewUpdatedTask("");
    };

    /* TOGGLE SECLECTED COMPLETED TASK */
    const toggleCompletedTask = (i) => {
        console.log(i);
        if (selectedCompletedTask === i) {
            return setSelectedCompletedTask(null);
        }
        console.log(selectedTask);
        setSelectedCompletedTask(i);
        setSelectedTask(null);
    };

    /* DISABLE TASK INFO TOGGLING*/
    const disableToggling = (e) => {
        e.stopPropagation();
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
                                    setEditProjectTitle("");
                                    setToggleAddTask(false);
                                }}
                            >
                                <p>
                                    {project.project} {project.tasks_open > 0 ? <span className="tasksOpen">{project.tasks_open}</span> : null}
                                </p>
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
                        Sign out
                    </div>
                </div>
                {selectedProjectID == "" ? (
                    <div className="selectProjectContainer">
                        <h1>Select or create a new project</h1>
                    </div>
                ) : (
                    <div>
                        <div className="projectTitleContainer">
                            {!toggleProjectTitle ? (
                                <h1
                                    className="projectTitle"
                                    onClick={() => {
                                        setToggleProjectTitle(!toggleProjectTitle);
                                    }}
                                >
                                    {selectedProjectName === editProjectTitle || editProjectTitle === "" ? selectedProjectName : editProjectTitle}
                                </h1>
                            ) : (
                                <input
                                    className="editProjectTitleInput"
                                    type="text"
                                    placeholder="Task"
                                    id="newTask"
                                    defaultValue={selectedProjectName === editProjectTitle || editProjectTitle === "" ? selectedProjectName : editProjectTitle}
                                    onChange={(e) => {
                                        setEditProjectTitle(e.target.value);
                                    }}
                                    onBlur={updateProjectTitle}
                                    onKeyPress={updateProjectTitleOnEnter}
                                    autoFocus
                                />
                            )}
                        </div>
                        {/* LIST OUT TO DO TASKS */}
                        {toDoTask.length > 0 ? <h3>To Do: {toDoTask.length}</h3> : <h3>To Do</h3>}
                        {tasks
                            .filter((obj) => obj.completed === false)
                            .sort((a, b) => (a.task_created > b.task_created ? 1 : -1))
                            .map((task, i) => (
                                <div className="taskDiv" onClick={() => toggleTask(i)}>
                                    {/* TASK */}
                                    <div className="taskTitle">
                                        <p id={task.task}>{task.task}</p>
                                        <div className="taskGlanceDiv">
                                            <div className={task.priority === "Low" ? "taskGlancePriorityLow" : task.priority === "Medium" ? "taskGlancePriorityMedium" : task.priority === "High" ? "taskGlancePriorityHigh" : null}> </div>
                                            <p className="taskGlanceType">{task.type}</p>

                                            {selectedTask === i ? "-" : "+"}
                                        </div>
                                    </div>
                                    {/* EXPANDED TASK INFO - UPDATE/COMPLETE/REMOVE */}
                                    <div className={selectedTask === i ? "content show" : "content"} onClick={disableToggling}>
                                        <div className="updateTaskContainer">
                                            <div className="taskInputDiv">
                                                <p>Task:</p>
                                                <input
                                                    className="taskUpdateInput"
                                                    type="text"
                                                    placeholder="Edit current task"
                                                    id="updatedTask"
                                                    value={newUpdatedTask}
                                                    onChange={(e) => {
                                                        setNewUpdatedTask(e.target.value);
                                                    }}
                                                />
                                            </div>
                                            <div className="button updateButton" onClick={updateTask} id={task.id}>
                                                Update Task
                                            </div>
                                        </div>
                                        <div className="dropdownUpdateContainer">
                                            <div className="updatePriorityContainer">
                                                <p>Priority:</p>
                                                <select className="dropdown" onChange={updatePriority} id={task.id}>
                                                    {task.priority === "Low" ? (
                                                        <option value="Low" selected>
                                                            Low
                                                        </option>
                                                    ) : (
                                                        <option value="Low">Low</option>
                                                    )}

                                                    {task.priority === "Medium" ? (
                                                        <option value="Medium" selected>
                                                            Medium
                                                        </option>
                                                    ) : (
                                                        <option value="Medium">Medium</option>
                                                    )}

                                                    {task.priority === "High" ? (
                                                        <option value="High" selected>
                                                            High
                                                        </option>
                                                    ) : (
                                                        <option value="High">High</option>
                                                    )}
                                                </select>
                                            </div>

                                            <div className="updateTypeContainer">
                                                <p>Type:</p>
                                                <select className="dropdown" onChange={updateType} id={task.id}>
                                                    {task.type === "Task" ? (
                                                        <option value="Task" selected>
                                                            Task
                                                        </option>
                                                    ) : (
                                                        <option value="Task">Task</option>
                                                    )}

                                                    {task.type === "Bug" ? (
                                                        <option value="Bug" selected>
                                                            Bug
                                                        </option>
                                                    ) : (
                                                        <option value="Bug">Bug</option>
                                                    )}

                                                    {task.type === "Feature" ? (
                                                        <option value="Feature" selected>
                                                            Feature
                                                        </option>
                                                    ) : (
                                                        <option value="Feature" id={task.id}>
                                                            Feature
                                                        </option>
                                                    )}
                                                </select>
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
                                </div>
                            ))}
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
                                        onKeyPress={createTaskOnEnter}
                                    />

                                    <p>Priority:</p>
                                    <select
                                        className="dropdown"
                                        onChange={(e) => {
                                            setNewTaskPriority(e.target.value);
                                        }}
                                    >
                                        <option value="Low" selected>
                                            Low
                                        </option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>

                                    <p>Type:</p>
                                    <select
                                        className="dropdown"
                                        onChange={(e) => {
                                            setNewTaskType(e.target.value);
                                        }}
                                    >
                                        <option value="Task" selected>
                                            Task
                                        </option>
                                        <option value="Bug">Bug</option>
                                        <option value="Feature">Feature</option>
                                    </select>

                                    <div className="expandedAddTaskButton" onClick={createTask}>
                                        Add Task
                                    </div>
                                </div>
                            ) : null}
                        </div>
                        {/* COMPLETED TASKS */}
                        {completedTask.length > 0 ? <h3>Completed: {completedTask.length}</h3> : null}
                        {tasks
                            .filter((obj) => obj.completed === true)
                            .sort((a, b) => (a.date_completed > b.date_completed ? -1 : 1))
                            .map((task, i) => (
                                <div className="taskDiv" onClick={() => toggleCompletedTask(i)}>
                                    {/* TASK */}
                                    <div className="taskTitle">
                                        <p id={task.task}>{task.task}</p>
                                        <div className="completedTaskGlanceDiv">{selectedCompletedTask === i ? "-" : "+"}</div>
                                    </div>
                                    {/* EXPANDED TASK INFO - UPDATE/COMPLETE/REMOVE */}
                                    <div className={selectedCompletedTask === i ? "content show" : "content"} onClick={disableToggling}>
                                        <div className="updateTaskContainer">
                                            <div className="button updateButton" onClick={moveTaskToDo} id={task.id}>
                                                Move to To Do
                                            </div>
                                        </div>

                                        {/* DELETE TASK */}
                                        <div
                                            className="button removeButton"
                                            onClick={() => {
                                                deleteCompletedTask(task.id);
                                            }}
                                        >
                                            Remove
                                        </div>
                                    </div>
                                </div>
                            ))}
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
