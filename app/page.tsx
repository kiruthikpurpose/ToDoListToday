"use client"; // This is a Client Component

import { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

// Task Type
type Task = {
  id: string;
  text: string;
  hours: number;
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [inputHours, setInputHours] = useState<number | "">("");
  const [totalHours, setTotalHours] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [today, setToday] = useState<string>(new Date().toLocaleDateString());

  // Add new task with validation for hours
  const addTask = () => {
    if (inputValue.trim() && inputHours && totalHours + inputHours <= 24) {
      setTasks([
        ...tasks,
        { id: uuidv4(), text: inputValue, hours: inputHours, completed: false }
      ]);
      setTotalHours(totalHours + inputHours);
      setInputValue("");
      setInputHours("");
    }
  };

  // Mark task as complete
  const toggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    setCompletedTasks((prev) =>
      tasks.find((task) => task.id === taskId)?.completed ? prev - 1 : prev + 1
    );
  };

  // Drag and Drop functionality
  const moveTask = (dragIndex: number, hoverIndex: number) => {
    const updatedTasks = [...tasks];
    const [draggedTask] = updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);
    setTasks(updatedTasks);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center py-12 px-6 sm:px-8">
        <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">
            Plan Your Day ({today})
          </h1>

          {/* Date Picker */}
          <div className="mb-4">
            <input
              type="date"
              value={today}
              onChange={(e) => setToday(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-800 focus:ring-4 focus:ring-indigo-300"
            />
          </div>

          {/* Task Input */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Top Priority Task"
              className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-300 text-gray-900"
            />
            <input
              type="number"
              value={inputHours}
              onChange={(e) => setInputHours(parseInt(e.target.value))}
              placeholder="Hours"
              className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-purple-300 text-gray-900"
            />
          </div>

          {/* Add Task Button */}
          <button
            onClick={addTask}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-green-500 hover:to-blue-600 transition duration-200"
          >
            Add Task
          </button>

          {/* Task List */}
          <ul className="mt-8 space-y-4">
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                moveTask={moveTask}
                toggleComplete={toggleComplete}
              />
            ))}
          </ul>

          {/* Time Allocation */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-gray-800">
            <p>
              Total Time Allocated:{" "}
              <span className="font-semibold text-green-700">{totalHours} hrs</span> / 24 hrs
            </p>
            {totalHours === 24 && (
              <p className="text-red-500 mt-2">You've reached the 24-hour limit!</p>
            )}
          </div>

          {/* Task Completion Summary */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-gray-800">
            <p>
              Completed Tasks:{" "}
              <span className="font-semibold text-indigo-600">{completedTasks}</span> /{" "}
              {tasks.length}
            </p>
          </div>
        </div>
      </main>
    </DndProvider>
  );
}

// Drag and drop task card
const TaskCard = ({ task, index, moveTask, toggleComplete }: any) => {
  const [, drag] = useDrag({
    type: "TASK",
    item: { index }
  });

  const [, drop] = useDrop({
    accept: "TASK",
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveTask(item.index, index);
        item.index = index;
      }
    }
  });

  return (
    <li ref={(node) => drag(drop(node))} className="flex justify-between items-center p-4 bg-gray-200 rounded-lg shadow-sm hover:bg-gray-300 transition duration-200">
      <span
        className={`text-lg ${task.completed ? "line-through text-green-500" : "text-gray-800"}`}
      >
        {task.text} ({task.hours} hrs)
      </span>
      <button
        onClick={() => toggleComplete(task.id)}
        className={`ml-4 ${task.completed ? "text-green-600" : "text-red-500"} hover:scale-110`}
      >
        {task.completed ? "✓" : "✗"}
      </button>
    </li>
  );
};
