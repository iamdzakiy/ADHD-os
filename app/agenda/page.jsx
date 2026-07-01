'use client';
import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAuth } from '@/context/AuthContext';

// Komponen Tugas yang bisa di-drag
function DraggableTask({ id, title, duration }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className="bg-purple-600/80 backdrop-blur text-white p-3 rounded-lg mb-2 cursor-grab active:cursor-grabbing shadow-lg border border-purple-400/30">
      <div className="font-semibold">{title}</div>
      <div className="text-xs opacity-70">{duration}h</div>
    </div>
  );
}

// Komponen Slot Waktu yang bisa di-drop
function DroppableSlot({ id, time, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`flex border-b border-gray-700/50 h-20 p-2 transition-colors ${isOver ? 'bg-purple-900/30' : 'bg-white/5'}`}>
      <div className="w-16 text-gray-400 text-sm pt-1">{time}</div>
      <div className="flex-1 flex flex-col gap-1">{children}</div>
    </div>
  );
}

export default function AgendaPage() {
  const { user } = useAuth();
  const [tasks] = useState([
    { id: 't1', title: 'Deep Work: AI Project', duration: 2 },
    { id: 't2', title: 'Balas Email & Admin', duration: 0.5 },
  ]);
  const [schedule, setSchedule] = useState({});
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find(t => t.id === active.id);
    const hour = parseInt(over.id.split('-')[1]);
    
    // 1. Update UI Lokal
    setSchedule(prev => ({ ...prev, [over.id]: task }));

    // 2. SYNC KE GOOGLE CALENDAR
    const startTime = new Date();
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + task.duration * 60 * 60 * 1000);

    await fetch('/api/calendar', {
      method: 'POST',
      body: JSON.stringify({
        summary: task.title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      })
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 - 19:00

  return (
    <div className="flex h-screen text-white bg-gray-900/50 backdrop-blur-xl">
      {/* KIRI: Daftar Tugas */}
      <div className="w-1/3 p-6 border-r border-gray-700/50 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-purple-400">📋 Today's Tasks</h2>
        {tasks.map(task => <DraggableTask key={task.id} id={task.id} title={task.title} duration={task.duration} />)}
      </div>

      {/* KANAN: Timeline Kalender */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4 text-blue-400">📅 Time Blocking (Drag tasks here)</h2>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {hours.map(hour => {
            const slotId = `slot-${hour}`;
            return (
              <DroppableSlot key={slotId} id={slotId} time={`${hour}:00`}>
                {schedule[slotId] && (
                  <div className="bg-blue-600/80 p-2 rounded text-sm h-full flex items-center">
                    {schedule[slotId].title}
                  </div>
                )}
              </DroppableSlot>
            );
          })}
        </DndContext>
      </div>
    </div>
  );
}