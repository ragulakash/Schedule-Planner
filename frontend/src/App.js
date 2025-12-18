import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000";

function App() {
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/schedules`);
    setTasks(res.data);
  };

  const fetchNotes = async () => {
    const res = await axios.get(`${API}/notes`);
    setNotes(res.data.content);
  };

  useEffect(() => {
    fetchTasks();
    fetchNotes();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      axios.post(`${API}/notes`, { content: notes });
    }, 500);
    return () => clearTimeout(t);
  }, [notes]);

  const addTask = async () => {
    if (!title.trim()) return;
    await axios.post(`${API}/schedules`, { title, date, time });
    setTitle("");
    setDate("");
    setTime("");
    setShowModal(false);
    fetchTasks();
  };

  const toggleTask = async (id, completed) => {
    await axios.put(`${API}/schedules/${id}`, { completed: !completed });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/schedules/${id}`);
    fetchTasks();
  };

  return (
    <div className="container">
      {/* TASKS */}
      <div className="panel tasks">
        <div className="tasks-header">
          <h2>Tasks</h2>
          <button className="new-task-blue" onClick={() => setShowModal(true)}>
            + New Task
          </button>
        </div>

        <ul>
          {tasks.map(task => (
            <li
              key={task.id}
              className={`task ${task.completed ? "done" : ""}`}
              onClick={() => toggleTask(task.id, task.completed)}
            >
              <div>
                <strong>{task.title}</strong>
                <div className="meta">
                  {task.date && <span>{task.date}</span>}
                  {task.time && <span>{task.time}</span>}
                </div>
              </div>
              <button onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}>✕</button>
            </li>
          ))}
        </ul>
      </div>

      {/* NOTES */}
      <div className="panel notes">
        <h2>Notes</h2>
        <textarea
          placeholder="Write your notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>New Task</h3>
            <input placeholder="Task title" value={title}
              onChange={(e) => setTitle(e.target.value)} />
            <input type="date" value={date}
              onChange={(e) => setDate(e.target.value)} />
            <input type="time" value={time}
              onChange={(e) => setTime(e.target.value)} />

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="add-btn" onClick={addTask}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
