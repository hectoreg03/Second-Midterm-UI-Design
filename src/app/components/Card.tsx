import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import './Card.scss'; // Aquí importas el archivo SCSS

interface Task {
  id: string;
  content: {
    title: string;
    description: string;
    createdAt?: string;
  };
}

interface CardProps {
  id: string;
  title: string;
  items: Task[];
}

// Helper for sortable items
const SortableItem = ({ id, task }: { id: string; task: Task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`taskCard ${isDragging ? "isDragging" : ""}`}
    >
      <h4 className="font-medium text-gray-800 dark:text-white mb-2">{task.content.title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{task.content.description}</p>
      {task.content.createdAt && (
        <div className="createdAt">
          Created: {new Date(task.content.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default function Card({ id, title, items }: CardProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="containerClasses">
      <h4>{title}</h4>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {items.length > 0 && (
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Tasks({items.length})
          </span>
        )}
      </h3>

      <SortableContext id={id} items={items.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="droppableArea">
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id} task={item} />
          ))}
          {items.length === 0 && (
            <div className="emptyState">
              <p className="text-sm text-gray-500 dark:text-gray-400">Drop items here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
