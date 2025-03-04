
import { useState, useEffect } from 'react';
import { Droppable, DroppableProps } from 'react-beautiful-dnd';

export function StrictModeDroppable({ children, ...props }: DroppableProps) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
}

// Add default export for backward compatibility
export default StrictModeDroppable;
