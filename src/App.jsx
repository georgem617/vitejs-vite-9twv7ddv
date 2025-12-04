import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Layout, Calendar, CheckSquare, Users, Briefcase, Plus, Search, 
  ArrowLeft, CheckCircle2, X, Clock, Filter, ListTodo, Trash2, 
  UserPlus, RefreshCcw, User, ChevronDown, ChevronUp, Save, 
  AlignLeft, Repeat, CalendarDays, ArrowUpRight, PieChart, BarChart2
} from 'lucide-react';

// --- CONFIGURACIÓN SUPABASE ---
// ⚠️ ASEGÚRATE DE QUE ESTAS CLAVES SEAN LAS TUYAS (YA ESTÁN PUESTAS SEGÚN TU CÓDIGO ANTERIOR)
const supabaseUrl = 'https://wnmephaqeimbkxyhnudk.supabase.co'; 
const supabaseKey = 'sb_publishable_I8-PavLHDmKc50hr6FXviA_uzGtUzt2';

const supabase = createClient(supabaseUrl, supabaseKey);
const appId = 'agency-os-default';

// --- COMPONENTES UI ---

const Badge = ({ children, color = 'gray', className = '', onClick }) => {
  const colors = {
    gray: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    blue: 'bg-blue-900/30 text-blue-300 border-blue-800',
    green: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
    yellow: 'bg-amber-900/30 text-amber-300 border-amber-800',
    red: 'bg-red-900/30 text-red-300 border-red-800',
  };
  return (
    <span onClick={onClick} className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[color]} ${className} ${onClick ? 'cursor-pointer hover:brightness-110' : ''}`}>
      {children}
    </span>
  );
};

const Avatar = ({ name, size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5 text-[9px]', md: 'w-8 h-8 text-xs', lg: 'w-12 h-12 text-lg' };
  return (
    <div className={`${sizes[size]} bg-zinc-700 rounded-full flex items-center justify-center text-zinc-200 font-bold border border-zinc-600 flex-shrink-0`} title={name}>
      {name ? name.substring(0,2).toUpperCase() : <User size={12}/>}
    </div>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-zinc-200 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>}
    <input className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600 w-full" {...props} />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>}
    <select className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none w-full" {...props}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

// --- APP PRINCIPAL ---

export default function AgencyOS() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Filters & Nav
  const [filterUser, setFilterUser] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  // Modals
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  
  // Edits
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ 
    title: '', status: 'backlog', priority: 'media', projectId: '', projectName: '', plannedDay: 'backlog', recurrence: 'none', dueDate: '', assignees: [], subtasks: [] 
  });
  const [newProject, setNewProject] = useState({ name: '', clientId: '', lead: '' });
  const [newClient, setNewClient] = useState({ name: '', contactPerson: '', email: '' });
  const [newUser, setNewUser] = useState({ name: '', role: '', email: '' });
  const [tempSubtask, setTempSubtask] = useState('');

  // --- SUPABASE DATA FETCHING ---
  const fetchData = async () => {
    const { data: t } = await supabase.from('tasks').select('*');
    const { data: p } = await supabase.from('projects').select('*');
    const { data: c } = await supabase.from('clients').select('*');
    const { data: tm } = await supabase.from('team').select('*');

    if (t) setTasks(t);
    if (p) setProjects(p);
    if (c) setClients(c);
    if (tm) setTeamMembers(tm);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- LOGIC ---

  const handleAddTask = async () => {
    if (!newTask.title) return;
    let finalProjectName = newTask.projectName;
    if (newTask.projectId) {
       const p = projects.find(proj => proj.id === newTask.projectId);
       if (p) finalProjectName = p.name;
    }
    
    await supabase.from('tasks').insert([{
      ...newTask, 
      projectName: finalProjectName, 
      createdAt: new Date().toISOString()
    }]);
    
    fetchData();
    setTaskModalOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!editingTask) return;
    await supabase.from('tasks').update({
        title: editingTask.title,
        status: editingTask.status,
        priority: editingTask.priority,
        assignees: editingTask.assignees,
        subtasks: editingTask.subtasks,
        notes: editingTask.notes,
        dueDate: editingTask.dueDate
    }).eq('id', editingTask.id);
    
    fetchData();
    setDetailModalOpen(false);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    fetchData();
  };

  const handleConvertSubtaskToTask = async (subId) => {
    const subtask = editingTask.subtasks.find(s => s.id === subId);
    if (!subtask) return;
    
    if (!confirm(`¿Crear tarea nueva a partir de "${subtask.title}"?`)) return;

    const updatedSubtasks = editingTask.subtasks.filter(s => s.id !== subId);
    setEditingTask({ ...editingTask, subtasks: updatedSubtasks });
    
    await supabase.from('tasks').update({ subtasks: updatedSubtasks }).eq('id', editingTask.id);

    await supabase.from('tasks').insert([{
      title: subtask.title,
      status: 'todo',
      priority: editingTask.priority,
      projectId: editingTask.projectId || '',
      projectName: editingTask.projectName || '',
      plannedDay: 'backlog',
      assignees: subtask.assignees || [],
      dueDate: '',
      subtasks: [],
      createdAt: new Date().toISOString()
    }]);
    
    fetchData();
    alert("✅ Subtarea convertida correctamente.");
  };

  const handleDeleteTask = async () => {
    if(confirm("¿Eliminar permanentemente?")) {
        await supabase.from('tasks').delete().eq('id', editingTask.id);
        fetchData();
        setDetailModalOpen(false);
    }
  };

  // --- HELPERS ---
  const getFilteredTasks = () => {
    if (filterUser === 'all') return tasks;
    return tasks.filter(t => t.assignees?.includes(filterUser) || t.subtasks?.some(s => s.assignees?.includes(filterUser)));
  };

  const getFilteredProjects = () => {
    if (filterUser === 'all') return projects;
    return projects.filter(p => p.lead === filterUser);
  };

  // --- COMPONENTES ---

  const TaskCard = ({ task }) => {
     const completedSub = task.subtasks?.filter(s => s.completed).length || 0;
     const totalSub = task.subtasks?.length || 0;
     const percent = totalSub > 0 ? Math.round((completedSub/totalSub)*100) : 0;

     return (
       <div 
         onClick={() => { setEditingTask(JSON.parse(JSON.stringify(task))); setDetailModalOpen(true); }}
         className="bg-zinc-900 border border-zinc-800 p-3 rounded mb-2 cursor-pointer hover:border-zinc-600 group"
       >
          <div className="flex justify-between items-start">
             <div className="flex gap-3 items-start">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, task.status === 'done' ? 'backlog' : 'done'); }}
                  className={`mt-1 w-4 h-4 rounded border flex items-center justify-center ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-600'}`}
                >
                   {task.status === 'done' && <CheckCircle2 size={12}/>}
                </button>
                <div>
                   <span className={`text-sm ${task.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{task.title}</span>
                   <div className="flex gap-2 mt-1">
                      {task.projectName && <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Briefcase size={10}/> {task.projectName}</span>}
                      {task.dueDate && <span className="text-[10px] text-amber-500 flex items-center gap-1"><CalendarDays size={10}/> {task.dueDate}</span>}
                   </div>
                </div>
             </div>
             <Badge color={task.priority==='alta'?'red':'gray'}>{task.priority}</Badge>
          </div>
          {totalSub > 0 && (
             <div className="mt-2 flex items-center gap-2 pl-7">
                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                   <div className="bg-indigo-500 h-full" style={{width: `${percent}%`}}></div>
                </div>
                <span className="text-[10px] text-zinc-500">{completedSub}/{totalSub}</span>
             </div>
          )}
       </div>
     )
  };

  const DashboardView = () => {
     const filteredP = getFilteredProjects();
     const filteredT = getFilteredTasks();
     const total = filteredT.length;
     const done = filteredT.filter(t=>t.status==='done').length;

     return (
        <div className="space-y-6">
           <div className="grid grid-cols-4 gap-4">
              <Card className="h-24 flex flex-col justify-between border-l-4 border-l-zinc-600"><span className="text-xs text-zinc-500 font-bold">TOTAL</span><span className="text-3xl font-bold text-white">{total}</span></Card>
              <Card className="h-24 flex flex-col justify-between border-l-4 border-l-emerald-500"><span className="text-xs text-zinc-500 font-bold">HECHAS</span><span className="text-3xl font-bold text-white">{done}</span></Card>
              <Card className="h-24 flex flex-col justify-between border-l-4 border-l-indigo-500"><span className="text-xs text-zinc-500 font-bold">PENDIENTES</span><span className="text-3xl font-bold text-white">{total-done}</span></Card>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <Card>
                 <h3 className="font-bold mb-4 flex items-center gap-2 text-white"><BarChart2 size={18}/> Avance Proyectos</h3>
                 <div className="space-y-3">
                    {filteredP.map(p => {
                       const pt = tasks.filter(t=>t.projectId===p.id);
                       let items = 0, completed = 0;
                       pt.forEach(t=>{
                          items++; if(t.status==='done') completed++;
                          if(t.subtasks) { items+=t.subtasks.length; completed+=t.subtasks.filter(s=>s.completed).length; }
                       });
                       const pct = items===0?0:Math.round((completed/items)*100);
                       return (
                          <div key={p.id} className="cursor-pointer" onClick={()=>{setSelectedProjectId(p.id); setCurrentView('projects')}}>
                             <div className="flex justify-between text-xs mb-1 text-zinc-300"><span>{p.name}</span><span>{pct}%</span></div>
                             <div className="w-full h-2 bg-zinc-800 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width:`${pct}%`}}></div></div>
                          </div>
                       )
                    })}
                 </div>
              </Card>
           </div>
        </div>
     )
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
       {/* SIDEBAR */}
       <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-zinc-800 font-bold text-lg">AgencyOS</div>
          <nav className="flex-1 p-4 space-y-1">
             {[{id:'dashboard',l:'Dashboard',i:Layout},{id:'projects',l:'Proyectos',i:Briefcase},{id:'tasks',l:'Tareas',i:CheckSquare},{id:'clients',l:'Clientes',i:Users},{id:'team',l:'Equipo',i:UserPlus}].map(m => (
                <button key={m.id} onClick={()=>{setCurrentView(m.id); setSelectedProjectId(null); setSelectedClientId(null);}} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-medium ${currentView===m.id ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                   <m.i size={18}/> {m.l}
                </button>
             ))}
          </nav>
       </aside>

       {/* MAIN */}
       <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8">
             <div className="flex items-center gap-2 text-zinc-400">
                <Filter size={16}/>
                <select className="bg-transparent text-sm focus:outline-none" value={filterUser} onChange={e=>setFilterUser(e.target.value)}>
                   <option value="all">Todo el Equipo</option>
                   {teamMembers.map(m=><option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
             </div>
             <button onClick={()=>{setNewTask({title:'', status:'backlog', priority:'media', projectId:'', projectName:'', plannedDay:'backlog', recurrence:'none', dueDate:'', assignees:[], subtasks:[]}); setTaskModalOpen(true)}} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"><Plus size={16}/> Nueva Tarea</button>
          </header>

          <div className="flex-1 overflow-auto p-8">
             {currentView === 'dashboard