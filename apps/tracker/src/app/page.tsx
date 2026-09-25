'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, Circle, Clock, Plus, Trophy, MessageSquare, AlertCircle } from 'lucide-react';

interface Update {
  id: string;
  author: string;
  content: string;
  type: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  author: string;
  createdAt: string;
}

export default function Home() {
  const [name, setName] = useState('');
  const [hasName, setHasName] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [updateType, setUpdateType] = useState('UPDATE');
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('tracker_name');
    if (savedName) {
      setName(savedName);
      setHasName(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [updatesRes, tasksRes] = await Promise.all([
        fetch('/api/updates'),
        fetch('/api/tasks')
      ]);
      setUpdates(await updatesRes.json());
      setTasks(await tasksRes.json());
    } catch (e) {
      console.error('Failed to fetch data');
    }
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('tracker_name', name.trim());
      setHasName(true);
      fetchData();
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;

    await fetch('/api/updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: name, content: newUpdate, type: updateType })
    });
    setNewUpdate('');
    fetchData();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: name, title: newTask })
    });
    setNewTask('');
    fetchData();
  };

  const handleToggleTask = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    fetchData();
  };

  if (!hasName) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center">
              <Trophy size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">Welcome to Famba Tracker</h1>
          <p className="text-gray-400 text-center mb-8">Enter your name to start logging achievements and tasks.</p>
          <form onSubmit={handleSaveName} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Alex, Sarah..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Trophy className="text-yellow-500" />
              Project Tracker
            </h1>
            <p className="text-gray-400 mt-1">Logged in as <span className="text-blue-400 font-semibold">{name}</span></p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="text-blue-400" size={20} />
                Post an Update
              </h2>
              <form onSubmit={handleAddUpdate}>
                <textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="What did we achieve today?"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4 min-h-[100px]"
                  required
                />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUpdateType('UPDATE')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${updateType === 'UPDATE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      General Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpdateType('ACHIEVEMENT')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${updateType === 'ACHIEVEMENT' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      Achievement
                    </button>
                  </div>
                  <button type="submit" className="bg-white text-black px-6 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-200 transition-all w-full sm:w-auto justify-center">
                    <Send size={16} /> Post
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="text-purple-400" size={20} />
                Timeline
              </h2>
              {updates.length === 0 ? (
                <div className="text-center py-10 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500">
                  No updates yet. Be the first!
                </div>
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
                  {updates.map((update) => (
                    <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-gray-950 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl ${update.type === 'ACHIEVEMENT' ? 'bg-yellow-500 text-yellow-950' : 'bg-blue-500 text-blue-950'} relative z-10`}>
                        {update.type === 'ACHIEVEMENT' ? <Trophy size={16} /> : <AlertCircle size={16} />}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-900 border border-gray-800 p-5 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">{update.author}</span>
                          <time className="text-xs text-gray-500">{new Date(update.createdAt).toLocaleString()}</time>
                        </div>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{update.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tasks Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl sticky top-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={20} />
                Tasks & Goals
              </h2>
              <form onSubmit={handleAddTask} className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-lg transition-all">
                  <Plus size={20} />
                </button>
              </form>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No pending tasks.</p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.status)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${task.status === 'DONE' ? 'bg-gray-950 border-gray-900 opacity-60' : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'}`}
                    >
                      <button className="mt-0.5 shrink-0">
                        {task.status === 'DONE' ? (
                          <CheckCircle2 className="text-green-500" size={18} />
                        ) : (
                          <Circle className="text-gray-500" size={18} />
                        )}
                      </button>
                      <div>
                        <p className={`text-sm ${task.status === 'DONE' ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Added by {task.author}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
