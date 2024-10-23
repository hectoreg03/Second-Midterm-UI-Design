import React from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
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

export default function Card({ id, title, items }: CardProps) {
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

      <Droppable droppableId={id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="droppableArea"
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`taskCard ${
                      snapshot.isDragging ? "isDragging" : ""
                    }`}
                  >
                    <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                      {item.content.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.content.description}
                    </p>
                    {item.content.createdAt && (
                      <div className="createdAt">
                        Created: {new Date(item.content.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {items.length === 0 && (
              <div className="emptyState">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Drop items here
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
