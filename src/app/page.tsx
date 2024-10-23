"use client";
import React, { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, addDays, startOfWeek } from "date-fns";
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

// Helper for sortable items
const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

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

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeColumn = Object.keys(columns).find((col) =>
      columns[col].some((task) => task.id === active.id)
    );
    const overColumn = Object.keys(columns).find((col) => col === over.id);

    if (activeColumn && overColumn && activeColumn !== overColumn) {
      // Move between columns
      setColumns((prev) => {
        const activeTasks = [...prev[activeColumn]];
        const overTasks = [...prev[overColumn]];
        const [movedTask] = activeTasks.splice(
          activeTasks.findIndex((task) => task.id === active.id),
          1
        );
        overTasks.push(movedTask);

        return {
          ...prev,
          [activeColumn]: activeTasks,
          [overColumn]: overTasks,
        };
      });
    }
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

              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="tasks-grid">
                  {Object.keys(columns).map((columnId) => (
                    <SortableContext
                      key={columnId}
                      items={columns[columnId as keyof Columns].map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <Card id={columnId} title={columnId} items={columns[columnId as keyof Columns]} />
                    </SortableContext>
                  ))}
                </div>
              </DndContext>

                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h2>Create New Task</h2>
                            <input
                                type="text"
                                placeholder="Task title"
                                value={newTask.title}
                                onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value })) }
                            />
                            <textarea
                                placeholder="Task description"
                                value={newTask.description}
                                onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value })) }
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
                <button className="nav-button" onClick={() => navigateWeek("prev")}>
                    <ChevronLeft /> Previous
                </button>
                <button className="nav-button" onClick={() => navigateWeek("next")}>
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
