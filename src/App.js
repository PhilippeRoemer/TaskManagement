import { useEffect, useState } from "react";
import "./App.css";
import { db } from "./firebase-config";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import trashIcon from "../src/images/trash_icon.png";

function App() {
    const [projects, setProjects] = useState([]);
    const [toggleAddProject, setToggleAddProject] = useState(false);
    const [newProject, setNewProject] = useState("blank");
    const [selectedProject, setSelectedProject] = useState([]);

    const [tasks, setTasks] = useState([]);
    const [toggleTaskInfo, setToggleTaskInfo] = useState([]);
    const [toggleAddTask, setToggleAddTask] = useState(false);
    const [newTask, setNewTask] = useState("");
    const [newUpdatedTask, setNewUpdatedTask] = useState("");

    const [updateList, setUpdateList] = useState(false);

    const tasksCollectionRef = collection(db, "tasks");
    const projectsCollectionRef = collection(db, "projects");

    /* GET TASKS AFTER THE PROJECT IS SELECTED*/
    useEffect(() => {
        const getTasks = async () => {
            const data = await getDocs(tasksCollectionRef);
            const allTasks = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            console.log(allTasks);
            /* Filters tasks by the selected project */
            const filteredProject = allTasks.filter((id) => id.project === selectedProject);
            console.log(filteredProject);
            setTasks(filteredProject);
        };
        getTasks();
    }, [selectedProject, updateList]);

    /* GET PROJECTS */
    useEffect(() => {
        const getProjects = async () => {
            const data = await getDocs(projectsCollectionRef);
            setProjects(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getProjects();
    }, [updateList]);

    /* CREATE PROJECT */
    const createProject = async () => {
        await addDoc(projectsCollectionRef, {
            project: newProject,
        });

        document.getElementById("newProject").value = "";
        setToggleAddProject(false);
        setUpdateList(!updateList);
    };

    /* DELETE PROJECT */
    const deleteProject = async (id) => {
        const taskDoc = doc(db, "projects", id);
        if (window.confirm("Are you sure you want to delete this project?")) {
            await deleteDoc(taskDoc);
        }

        setUpdateList(!updateList);
    };

    /* CREATE TASK */
    const createTask = async () => {
        await addDoc(tasksCollectionRef, { task: newTask, project: selectedProject, completed: false });
        document.getElementById("newTask").value = "";
        setToggleAddTask(false);
        setUpdateList(!updateList);
    };

    /* UPDATE TASK */
    const updateTask = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "tasks", taskID);
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
        const taskDoc = doc(db, "tasks", id);
        await deleteDoc(taskDoc);
        setUpdateList(!updateList);
    };

    /* COMPLETE TASK */
    const completeTask = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "tasks", taskID);
        const newFields = { completed: true };

        await updateDoc(taskDoc, newFields);
        setUpdateList(!updateList);
    };

    return (
        <div>
            {/* SIDEBAR/ADD NEW PROJECT */}
            <div className="sidebar">
                <h1>Projects</h1>
                {projects.map((project) => {
                    return (
                        <div className="projectList">
                            <p
                                onClick={() => {
                                    setSelectedProject(project.project);
                                }}
                            >
                                {project.project}
                            </p>
                            {/* DELETE PROJECT */}
                            <img
                                src={trashIcon}
                                className="projectDelete"
                                onClick={() => {
                                    deleteProject(project.id);
                                }}
                            />
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
                    <div>
                        <input
                            type="text"
                            placeholder="Project"
                            id="newProject"
                            onChange={(e) => {
                                setNewProject(e.target.value);
                            }}
                        />
                        <button onClick={createProject}>Add Project</button>
                    </div>
                ) : null}
            </div>
            {/* PAGE CONTENT/PROJECT TASKS */}
            <div className="pageContent">
                {selectedProject == "" ? (
                    <h1>Select a project</h1>
                ) : (
                    <div>
                        <h1>{selectedProject}</h1>
                        {/* LIST OUT TO DO TASKS */}
                        <h1>To Do</h1>
                        {tasks.map((task) => {
                            if (task.completed === false) {
                                return (
                                    <div className="task">
                                        {/* TASK */}
                                        <p
                                            id={task.task}
                                            onClick={(e) => {
                                                setToggleTaskInfo(e.target.id);
                                            }}
                                        >
                                            {task.task}
                                        </p>
                                        {toggleTaskInfo === task.task ? (
                                            <div className="taskInfo">
                                                {/* TASK INFO - UPDATE/COMPLETE/REMOVE */}
                                                <input
                                                    type="text"
                                                    placeholder="Edit current task"
                                                    id="updatedTask"
                                                    onChange={(e) => {
                                                        setNewUpdatedTask(e.target.value);
                                                    }}
                                                />
                                                <button onClick={updateTask} id={task.id}>
                                                    Update Task
                                                </button>
                                                {/* MARK TASK AS COMPLETED */}
                                                <button onClick={completeTask} id={task.id}>
                                                    Completed
                                                </button>
                                                {/* DELETE TASK */}
                                                <button
                                                    onClick={() => {
                                                        deleteTask(task.id);
                                                    }}
                                                >
                                                    Remove
                                                </button>
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
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Task"
                                        id="newTask"
                                        onChange={(e) => {
                                            setNewTask(e.target.value);
                                        }}
                                    />
                                    <button onClick={createTask}>Add Task</button>
                                </div>
                            ) : null}
                        </div>

                        <h1>Completed</h1>
                        {tasks.map((task) => {
                            if (task.completed === true) {
                                return (
                                    <div className="completedTasks">
                                        <p>{task.task}</p>

                                        <button
                                            onClick={() => {
                                                deleteTask(task.id);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
