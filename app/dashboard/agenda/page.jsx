'use client';
import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useAuth } from '@/context/AuthContext';
import GlassCard from '@/components/GlassCard';
import { Calendar } from 'lucide-react';

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

function DroppableSlot({ id, time, children }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`flex border-b border-white/10 h-20 p-2 transition-colors ${isOver ? 'bg-purple-900/30' : 'bg-white/5'}`}>
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
    { id: 't3', title: 'Olahraga', duration: 1 },
  ]);
  const [schedule, setSchedule] = useState({});
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find(t => t.id === active.id);
    const hour = parseInt(over.id.split('-')[1]);

    setSchedule(prev => ({ ...prev, [over.id]: task }));

    const startTime = new Date();
    startTime.setHours(hour, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + task.duration * 60 * 60 * 1000);

    await fetch('/api/calendar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: task.title, start: startTime.toISOString(), end: endTime.toISOString() })
    });
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3"><Calendar /> Agenda (Time Blocking)</h1>
      <p className="text-gray-400 text-sm -mt-4">Drag tugas dari kiri ke timeline kanan untuk auto-block ke Google Calendar.</p>
      
      <div className="flex gap-6 h-[70vh]">
        <div className="w-1/3 overflow-y-auto glass-card p-4">
          <h2 className="text-lg font-bold mb-4 text-purple-400">📋 Today's Tasks</h2>
          {tasks.map(task => <DraggableTask key={task.id} id={task.id} title={task.title} duration={task.duration} />)}
        </div>

        <div className="flex-1 overflow-y-auto glass-card p-4">
          <h2 className="text-lg font-bold mb-4 text-blue-400">📅 Time Blocking</h2>
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
    </div>
  );
}