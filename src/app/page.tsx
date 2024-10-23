"use client";
import React, { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { format, addDays, startOfWeek, isToday } from "date-fns";
import Card from "./components/Card";
import { Sun, Moon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import './page.css'; // Importa el archivo CSS

interface Task {
  id: string;
  content: {
    title: string;
    description: string;
    createdAt: string;
  };
}

interface Columns {
  pending: Task[];
  inProgress: Task[];
  completed: Task[];
}

export default function TaskManager() {
  const [startDate, setStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
  });

  const [columns, setColumns] = useState<Columns>({
    pending: [],
    inProgress: [],
    completed: []
  });

  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(startDate, index);
      return format(date, "EEEE, MMM d");
    });
    setDaysOfWeek(days);

    const today = format(new Date(), "EEEE, MMM d");
    if (!selectedDay || !days.includes(selectedDay)) {
      setSelectedDay(days.includes(today) ? today : days[0]);
    }
  }, [startDate, selectedDay]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    localStorage.setItem("theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setStartDate(prev => addDays(prev, direction === "next" ? 7 : -7));
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    setColumns(prev => {
      const newColumns = { ...prev };
      const sourceCol = source.droppableId as keyof typeof columns;
      const destCol = destination.droppableId as keyof typeof columns;

      const sourceItems = [...prev[sourceCol]];
      const [movedItem] = sourceItems.splice(source.index, 1);

      if (sourceCol === destCol) {
        sourceItems.splice(destination.index, 0, movedItem);
        newColumns[sourceCol] = sourceItems;
      } else {
        const destItems = [...prev[destCol]];
        destItems.splice(destination.index, 0, movedItem);
        newColumns[sourceCol] = sourceItems;
        newColumns[destCol] = destItems;
      }

      return newColumns;
    });
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      content: {
        ...newTask,
        createdAt: new Date().toISOString(),
      }
    };

    setColumns(prev => ({
      ...prev,
      pending: [...prev.pending, task]
    }));

    setNewTask({ title: "", description: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="task-manager">
        <div className="container">
            <header className="header">
                <div className="header-top">
                    <h1>{selectedDay}</h1>
                    <button onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === "light" ? <Moon /> : <Sun />}
                    </button>
                </div>
                
            </header>

            <div className="main-content">
              <div className="days-carousel">
                    {daysOfWeek.map((day, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedDay(day)}
                            className={`day-button ${day === selectedDay ? "selected" : ""}`}
                        >
                            {day}
                        </button>
                    ))}
              </div>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="tasks-grid">
                        <Card id="pending" title="Pending" items={columns.pending} />
                        <Card id="inProgress" title="In Progress" items={columns.inProgress} />
                        <Card id="completed" title="Completed" items={columns.completed} />
                    </div>
                </DragDropContext>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Create New Task</h2>
                            <input
                                type="text"
                                placeholder="Task title"
                                value={newTask.title}
                                onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <textarea
                                placeholder="Task description"
                                value={newTask.description}
                                onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                            />
                            <div className="modal-actions">
                                <button onClick={addTask}>Create Task</button>
                                <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="navigation">
                <button className= "nav-button" onClick={() => navigateWeek("prev")}>
                    <ChevronLeft /> Previous
                </button>
                <button className= "nav-button" onClick={() => navigateWeek("next")}>
                    Next <ChevronRight />
                </button>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="add-task-button" aria-label="Add new task">
                <Plus />
            </button>
        </div>
    </div>
);
}
