import { useEffect, useState } from "react";
import "./App.css";
import { db } from "./firebase-config";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";

function App() {
    const [newProject, setNewProject] = useState("");
    const [newTask, setNewTask] = useState("");
    const [newUpdatedTask, setNewUpdatedTask] = useState("");
    const [tasks, setTasks] = useState([]);
    const [updateList, setUpdateList] = useState(false);

    const tasksCollectionRef = collection(db, "tasks");

    const createTask = async () => {
        await addDoc(tasksCollectionRef, { project: newProject, task: newTask });
        document.getElementById("newProject").value = "";
        document.getElementById("newTask").value = "";
        setUpdateList(!updateList);
    };

    const updateTask = async (e) => {
        const taskID = e.target.id;
        const taskDoc = doc(db, "tasks", taskID);
        const newFields = { task: newUpdatedTask };
        await updateDoc(taskDoc, newFields);
        setUpdateList(!updateList);
    };

    const deleteUser = async (id) => {
        const taskDoc = doc(db, "tasks", id);
        await deleteDoc(taskDoc);
        setUpdateList(!updateList);
    };

    useEffect(() => {
        const getTasks = async () => {
            const data = await getDocs(tasksCollectionRef);
            console.log(data);
            setTasks(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };

        getTasks();
    }, [updateList]);

    return (
        <div>
            <input
                type="text"
                placeholder="Project"
                id="newProject"
                onChange={(e) => {
                    setNewProject(e.target.value);
                }}
            />
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
                            onChange={(e) => {
                                setNewUpdatedTask(e.target.value);
                            }}
                        />
                        <button onClick={updateTask} id={task.id}>
                            Update Task
                        </button>
                        <button
                            onClick={() => {
                                deleteUser(task.id);
                            }}
                        >
                            Delete
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default App;
