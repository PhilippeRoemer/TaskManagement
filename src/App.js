import { useEffect, useState } from "react";
import "./App.css";
import { db } from "./firebase-config";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

function App() {
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState("");
    const [tasks, setTasks] = useState([]);

    const [newTask, setNewTask] = useState("");
    const [newUpdatedTask, setNewUpdatedTask] = useState("");

    const [updateList, setUpdateList] = useState(false);

    /* DATA REFERENCES */
    const tasksCollectionRef = collection(db, "tasks");
    const projectsCollectionRef = collection(db, "projects");

    /* GET TASKS */
    useEffect(() => {
        const getTasks = async () => {
            const data = await getDocs(tasksCollectionRef);
            console.log(data);
            setTasks(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getTasks();
    }, [updateList]);

    /* GET PROJECTS */
    useEffect(() => {
        const getProjects = async () => {
            const data = await getDocs(projectsCollectionRef);
            console.log("Projects");
            console.log(data);
            console.log(data.docs);
            setProjects(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getProjects();
    }, [updateList]);

    /* CREATE PROJECT */
    const createProject = async () => {
        await addDoc(projectsCollectionRef, {
            id: newProject,
            test: "Testing",
        });
        document.getElementById("newProject").value = "";
        setUpdateList(!updateList);
    };

    /* DELETE PROJECT */
    const deleteProject = async (id) => {
        const taskDoc = doc(db, "projects", id);
        await deleteDoc(taskDoc);
        setUpdateList(!updateList);
    };

    /* CREATE TASK */
    const createTask = async () => {
        await addDoc(tasksCollectionRef, { task: newTask });
        document.getElementById("newTask").value = "";
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
        }
    };

    /* DELETE TASK */
    const deleteTask = async (id) => {
        const taskDoc = doc(db, "tasks", id);
        await deleteDoc(taskDoc);
        setUpdateList(!updateList);
    };

    return (
        <div>
            {/* SIDEBAR/ADD NEW PROJECT */}
            <div className="sidebar">
                <h1>Projects</h1>
                <input
                    type="text"
                    placeholder="Project"
                    id="newProject"
                    onChange={(e) => {
                        setNewProject(e.target.value);
                    }}
                />
                <button onClick={createProject}>Add Project</button>
                {projects.map((project) => {
                    return (
                        <div>
                            <p>{project.id}</p>
                            <button
                                onClick={() => {
                                    deleteProject(project.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>
            {/* PAGE CONTENT/PROJECT TASKS */}
            <div className="pageContent">
                <input
                    type="text"
                    placeholder="Task"
                    id="newTask"
                    onChange={(e) => {
                        setNewTask(e.target.value);
                    }}
                />
                <button onClick={createTask}>Add Task</button>
                {tasks.map((task) => {
                    return (
                        <div>
                            <p>Project: {task.project}</p>
                            <p>Task: {task.task}</p>
                            <input
                                type="text"
                                placeholder="Enter new task"
                                id="updatedTask"
                                onChange={(e) => {
                                    setNewUpdatedTask(e.target.value);
                                }}
                            />
                            <button onClick={updateTask} id={task.id}>
                                Update Task
                            </button>
                            <button
                                onClick={() => {
                                    deleteTask(task.id);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default App;
