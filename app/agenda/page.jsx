'use client';
import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAuth } from '@/context/AuthContext';

// Komponen Task yang bisa di-drag
function Task({ id, title, duration }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className="bg-purple-600 text-white p-3 rounded mb-2 cursor-grab active:cursor-grabbing shadow-lg">
      {title} <span className="text-xs opacity-70">({duration}j)</span>
    </div>
  );
}

// Komponen Time Slot di Kalender yang bisa di-drop
function TimeSlot({ id, time, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`flex border-b border-gray-700 h-20 p-2 transition-colors ${isOver ? 'bg-purple-900/50' : 'bg-white/5'}`}>
      <div className="w-16 text-gray-400 text-sm">{time}</div>
      <div className="flex-1 flex flex-col gap-1">{children}</div>
    </div>
  );
}

export default function AgendaPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Kerjakan Laporan Q3', duration: 2 },
    { id: 't2', title: 'Olahraga & Mandi', duration: 1 },
    { id: 't3', title: 'Balas Email Klien', duration: 0.5 },
  ]);
  const [schedule, setSchedule] = useState({}); // { 'slot-09': { id: 't1', title: '...' } }

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const slotId = over.id;
    const task = tasks.find(t => t.id === taskId);

    // 1. Update UI Lokal
    setSchedule(prev => ({ ...prev, [slotId]: task }));

    // 2. SYNC KE GOOGLE CALENDAR API
    // Slot ID misalnya 'slot-09' -> jam 09:00
    const hour = parseInt(slotId.split('-')[1]);
    const startTime = new Date();
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + task.duration * 60 * 60 * 1000);

    await fetch('/api/calendar', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.uid,
        summary: task.title,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
      })
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 sampai 19:00

  return (
    <div className="flex h-screen text-white bg-gray-900">
      {/* KIRI: Daftar Tugas (To-Do) */}
      <div className="w-1/3 p-6 border-r border-gray-700 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">📋 Tugas Hari Ini</h2>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div>
            {tasks.map(task => <Task key={task.id} id={task.id} title={task.title} duration={task.duration} />)}
          </div>

          {/* KANAN: Timeline Kalender */}
          <div className="flex-1 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-gray-900 py-2">📅 Waktu Fokus (Drag ke sini)</h2>
            {hours.map(hour => {
              const slotId = `slot-${hour}`;
              return (
                <TimeSlot key={slotId} id={slotId} time={`${hour}:00`}>
                  {schedule[slotId] && (
                    <div className="bg-blue-600 p-2 rounded text-sm h-full">
                      {schedule[slotId].title}
                    </div>
                  )}
                </TimeSlot>
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
}