import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Layout, Calendar, CheckSquare, Users, Briefcase, FileText, Plus, Search, 
  ArrowLeft, AlertCircle, CheckCircle2, X, Zap, ArrowRight, Database, 
  Loader2, Clock, Filter, ListTodo, Trash2, UserPlus, RefreshCcw, User, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Paperclip, 
  Link as LinkIcon, Save, AlignLeft, Repeat, CalendarDays
} from 'lucide-react';

// --- CONFIGURACIÓN SUPABASE ---
// IMPORTANTE: REEMPLAZA ESTO CON TUS DATOS DE SUPABASE
const supabaseUrl = 'https://wnmephaqeimbkxyhnudk.supabase.co'; 
const supabaseKey = 'sb_publishable_I8-PavLHDmKc50hr6FXviA_uzGtUzt2';

const supabase = createClient(supabaseUrl, supabaseKey);

// --- UTILIDADES DE FECHA ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (d1, d2) => {
  return d1.getDate() === d2.getDate() && 
         d1.getMonth() === d2.getMonth() && 
         d1.getFullYear() === d2.getFullYear();
};

const getMonthDays = (year, month) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

// --- COMPONENTES UI REUTILIZABLES ---
// (Mantenemos tus componentes visuales idénticos)

const Badge = ({ children, color = 'gray', className = '' }) => {
  const colors = {
    gray: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    blue: 'bg-blue-900/30 text-blue-300 border-blue-800',
    green: 'bg-emerald-900/30 text-emerald-300 border-emerald-800',
    yellow: 'bg-amber-900/30 text-amber-300 border-amber-800',
    red: 'bg-red-900/30 text-red-300 border-red-800',
    purple: 'bg-purple-900/30 text-purple-300 border-purple-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[color]} ${className}`}>
      {children}
    </span>
  );
};

const Avatar = ({ name, size = 'md', className = '' }) => {
  const sizes = { sm: 'w-5 h-5 text-[9px]', md: 'w-8 h-8 text-xs', lg: 'w-12 h-12 text-lg' };
  return (
    <div className={`${sizes[size]} bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold border border-zinc-700 flex-shrink-0 ${className}`} title={name}>
      {name ? name.substring(0,2).toUpperCase() : <User size={12}/>}
    </div>
  );
};

const AvatarStack = ({ assignees = [], size = 'md', limit = 3 }) => {
  if (!assignees || assignees.length === 0) return null;
  const visible = assignees.slice(0, limit);
  const remainder = assignees.length - limit;

  return (
    <div className="flex -space-x-2">
      {visible.map((name, i) => (
        <Avatar key={i} name={name} size={size} className="ring-2 ring-zinc-900" />
      ))}
      {remainder > 0 && (
        <div className={`ring-2 ring-zinc-900 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 font-bold border border-zinc-700 flex-shrink-0 ${size === 'sm' ? 'w-5 h-5 text-[8px]' : 'w-8 h-8 text-xs'}`}>
          +{remainder}
        </div>
      )}
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false, loading = false }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700",
    ghost: "hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-100",
    danger: "bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
  };

  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {loading ? <Loader2 size={16} className="animate-spin"/> : (Icon && <Icon size={16} />)}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 ${className}`}>
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>}
    <input 
      className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-zinc-600"
      {...props} 
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>}
    <select 
      className="bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none"
      {...props} 
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const MultiSelectUser = ({ label, users, selectedUsers = [], onChange }) => {
  const toggleUser = (userName) => {
    if (selectedUsers.includes(userName)) {
      onChange(selectedUsers.filter(u => u !== userName));
    } else {
      onChange([...selectedUsers, userName]);
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">{label}</label>}
      <div className="flex flex-wrap gap-2">
        {users.map(u => {
          const isSelected = selectedUsers.includes(u.name);
          return (
            <button
              key={u.id}
              onClick={() => toggleUser(u.name)}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
            >
              {isSelected && <CheckCircle2 size={10} />}
              {u.name}
            </button>
          )
        })}
        {users.length === 0 && <span className="text-zinc-600 text-xs">No hay equipo. Agrega miembros primero.</span>}
      </div>
    </div>
  );
};

const TaskItem = ({ task, onUpdateStatus, onClick, showProject = true }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const percentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <div className="group flex flex-col p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all mb-2 cursor-pointer relative overflow-hidden" onClick={() => onClick && onClick(task)}>
       {totalSubtasks > 0 && !isExpanded && (
         <div className="absolute bottom-0 left-0 h-1 bg-zinc-800 w-full">
            <div className={`h-full transition-all duration-500 ${percentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${percentage}%` }}></div>
         </div>
       )}

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, task.status === 'done' ? 'backlog' : 'done', task); }}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-600 hover:border-zinc-400'}`}
          >
            {task.status === 'done' && <CheckCircle2 size={14} />}
          </button>
          <div className="flex flex-col">
            <span className={`text-sm leading-tight ${task.status === 'done' ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
              {task.title}
            </span>
            <div className="flex flex-wrap gap-2 items-center mt-1">
              {showProject && task.projectName && (
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Briefcase size={10}/> {task.projectName}
                </span>
              )}
              {task.recurrence && task.recurrence !== 'none' && (
                <span className="text-[10px] text-indigo-400 flex items-center gap-1 border border-indigo-900/50 px-1 rounded bg-indigo-900/10">
                  <Repeat size={10}/> {task.recurrence === 'weekly' ? 'Semanal' : 'Mensual'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 pl-2">
              <div className="flex items-center gap-1">
                <AvatarStack assignees={task.assignees} size="sm" />
                <Badge color={task.priority === 'alta' ? 'red' : 'gray'}>{task.priority}</Badge>
              </div>
            <span className="text-[10px] text-zinc-600 uppercase">
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-CO', {day:'numeric', month:'short'}) : (task.plannedDay === 'backlog' ? 'Sin fecha' : task.plannedDay)}
            </span>
        </div>
      </div>
      
      {totalSubtasks > 0 && (
        <div className="mt-2 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] text-zinc-500 pl-8">
              <ListTodo size={12} />
              <span className="font-mono">{completedSubtasks}/{totalSubtasks}</span>
              <span>({percentage}%)</span>
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
             className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-zinc-800 transition-colors"
           >
             {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
           </button>
        </div>
      )}

      {isExpanded && task.subtasks && (
        <div className="mt-3 pl-8 space-y-1 border-t border-zinc-800 pt-2 animate-in slide-in-from-top-2 duration-200">
          {task.subtasks.map(sub => (
            <div key={sub.id} className="flex items-center justify-between py-1 text-xs">
               <div className="flex items-center gap-2">
                 <div className={`w-3 h-3 rounded-full border ${sub.completed ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-600'}`}></div>
                 <span className={`text-zinc-400 ${sub.completed ? 'line-through' : ''}`}>{sub.title}</span>
               </div>
               <div className="flex items-center gap-1">
                  {sub.assignees?.map(assignee => (
                    <Avatar key={assignee} name={assignee} size="sm" className="w-4 h-4 text-[8px]" />
                  ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (ADAPTADO A SUPABASE) ---

export default function AgencyOS() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // Data States
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  
  // Filter State
  const [filterUser, setFilterUser] = useState('all');

  // Navigation State
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  // Modal States
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isClientModalOpen, setClientModalOpen] = useState(false);
  
  // State for Editing
  const [editingTask, setEditingTask] = useState(null);
  const [newAttachment, setNewAttachment] = useState({ name: '', url: '' });

  // New Task State
  const [newTask, setNewTask] = useState({ 
    title: '', 
    status: 'backlog', 
    priority: 'media', 
    projectId: '', 
    projectName: '', 
    plannedDay: 'backlog',
    recurrence: 'none', 
    dueDate: '',
    assignees: [], 
    subtasks: [] 
  });
  
  const [tempSubtask, setTempSubtask] = useState('');
  const [tempSubtaskAssignee, setTempSubtaskAssignee] = useState('');

  const [newProject, setNewProject] = useState({ name: '', clientId: '', lead: '' });
  const [newUser, setNewUser] = useState({ name: '', role: '', email: '' });
  const [newClient, setNewClient] = useState({ name: '', contactPerson: '', email: '' });

  // --- SUPABASE DATA FETCHING ---
  
  const fetchData = async () => {
    // Obtenemos los datos. Nota: En producción usarías useEffects separados o React Query
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
    
    // Configuración para realtime (opcional, básico)
    // Para que esto funcione, la tabla en Supabase debe tener Realtime activado
    const channel = supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchData)
    .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // --- ACTIONS ADAPTED FOR SUPABASE ---

  const handleAddTask = async () => {
    if (!newTask.title) return;
    
    let finalProjectName = newTask.projectName;
    if (newTask.projectId) {
       const p = projects.find(proj => proj.id === newTask.projectId);
       if (p) finalProjectName = p.name;
    }

    // Adaptación: Aseguramos que los arrays sean compatibles con JSONB de Supabase
    const taskData = {
      title: newTask.title,
      status: newTask.status,
      priority: newTask.priority,
      projectId: newTask.projectId,
      projectName: finalProjectName,
      plannedDay: newTask.plannedDay,
      recurrence: newTask.recurrence,
      dueDate: newTask.dueDate,
      assignees: newTask.assignees || [], // Array a JSON
      subtasks: newTask.subtasks || [],   // Array a JSON
      blocked: false,
      createdAt: new Date().toISOString()
    };

    const { error } = await supabase.from('tasks').insert([taskData]);
    if (error) console.error('Error adding task:', error);
    
    fetchData(); // Refrescar datos
    setTaskModalOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!editingTask) return;
    
    const { error } = await supabase.from('tasks').update({
      title: editingTask.title,
      status: editingTask.status,
      priority: editingTask.priority,
      assignees: editingTask.assignees,
      subtasks: editingTask.subtasks,
      notes: editingTask.notes || '',
      attachments: editingTask.attachments || [],
      recurrence: editingTask.recurrence || 'none',
      dueDate: editingTask.dueDate || ''
    }).eq('id', editingTask.id);

    if (error) console.error('Error updating:', error);
    
    fetchData();
    setDetailModalOpen(false);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus, taskData = null) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    fetchData();
  };

  const handleToggleSubtaskFromList = async (taskId, subtaskId, currentSubtasks) => {
    const updatedSubtasks = currentSubtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    await supabase.from('tasks').update({ subtasks: updatedSubtasks }).eq('id', taskId);
    fetchData();
  };

  const handleAddUser = async () => {
    if (!newUser.name) return;
    await supabase.from('team').insert([{ ...newUser, createdAt: new Date().toISOString() }]);
    setNewUser({ name: '', role: '', email: '' });
    setUserModalOpen(false);
    fetchData();
  };

  const handleAddProject = async () => {
    if (!newProject.name || !newProject.clientId) return;
    const client = clients.find(c => c.id === newProject.clientId);
    await supabase.from('projects').insert([{
      ...newProject,
      clientName: client ? client.name : '',
      status: 'activo',
      createdAt: new Date().toISOString()
    }]);
    setNewProject({ name: '', clientId: '', lead: '' });
    setProjectModalOpen(false);
    fetchData();
  };

  const handleAddClient = async () => {
    if (!newClient.name) return;
    await supabase.from('clients').insert([{
      ...newClient,
      status: 'activo',
      createdAt: new Date().toISOString()
    }]);
    setNewClient({ name: '', contactPerson: '', email: '' });
    setClientModalOpen(false);
    fetchData();
  };
  
  // --- SUBTASKS HELPERS FOR MODAL ---
  const handleAddSubtaskToNew = () => {
    if (!tempSubtask.trim()) return;
    const assignees = tempSubtaskAssignee ? [tempSubtaskAssignee] : [];
    setNewTask({
      ...newTask,
      subtasks: [...newTask.subtasks, { 
        id: Math.random().toString(36).substr(2, 9), 
        title: tempSubtask, 
        completed: false, 
        assignees: assignees 
      }]
    });
    setTempSubtask('');
    setTempSubtaskAssignee(''); 
  };

  const handleRemoveSubtaskFromNew = (id) => {
    setNewTask({
      ...newTask,
      subtasks: newTask.subtasks.filter(s => s.id !== id)
    });
  };

  // --- DETAIL EDITING HELPERS ---
  const handleTaskClick = (task) => {
    setEditingTask(JSON.parse(JSON.stringify(task)));
    setDetailModalOpen(true);
  };
  
  const updateEditingTask = (field, value) => {
    setEditingTask(prev => ({ ...prev, [field]: value }));
  };

  const toggleEditingSubtask = (subId) => {
    const updatedSubtasks = editingTask.subtasks.map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    updateEditingTask('subtasks', updatedSubtasks);
  };
  
  const updateEditingSubtaskAssignees = (subId, newAssignees) => {
    const updatedSubtasks = editingTask.subtasks.map(s => 
      s.id === subId ? { ...s, assignees: newAssignees } : s
    );
    updateEditingTask('subtasks', updatedSubtasks);
  };
  
  const addAttachment = () => {
    if (!newAttachment.url) return;
    const attachment = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAttachment.name || newAttachment.url,
      url: newAttachment.url,
      type: 'link'
    };
    updateEditingTask('attachments', [...(editingTask.attachments || []), attachment]);
    setNewAttachment({ name: '', url: '' });
  };
  
  const openNewTaskModal = (preselectedProjectId = '') => {
    let preselectedProjectName = '';
    if (preselectedProjectId) {
      const proj = projects.find(p => p.id === preselectedProjectId);
      if (proj) preselectedProjectName = proj.name;
    }
    
    setNewTask({
      title: '',
      status: 'backlog',
      priority: 'media',
      projectId: preselectedProjectId,
      projectName: preselectedProjectName,
      plannedDay: 'backlog',
      recurrence: 'none',
      dueDate: '',
      assignees: [],
      subtasks: [],
      notes: '',
      attachments: []
    });
    setTempSubtask('');
    setTempSubtaskAssignee('');
    setTaskModalOpen(true);
  };

  // --- FILTRADO LOGIC ---
  const getFilteredTasks = (taskList) => {
    if (filterUser === 'all') return taskList;
    return taskList.filter(task => {
      const isMainAssignee = task.assignees && task.assignees.includes(filterUser);
      const isSubtaskAssignee = task.subtasks && task.subtasks.some(s => s.assignees && s.assignees.includes(filterUser));
      return isMainAssignee || isSubtaskAssignee;
    });
  };

  const getFilteredProjects = (projectList) => {
    if (filterUser === 'all') return projectList;
    return projectList.filter(p => p.lead === filterUser);
  };

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    setCurrentView('projects');
  };

  const handleClientClick = (clientId) => {
    setSelectedClientId(clientId);
    setCurrentView('clients');
  };

  const resetNavigation = () => {
    setSelectedProjectId(null);
    setSelectedClientId(null);
  };
  
  const UserFilterSelect = () => (
    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1">
      <Filter size={14} className="text-zinc-500" />
      <select 
        value={filterUser}
        onChange={(e) => setFilterUser(e.target.value)}
        className="bg-transparent text-sm text-zinc-300 focus:outline-none cursor-pointer"
      >
        <option value="all">Todo el Equipo</option>
        {teamMembers.map(m => (
          <option key={m.id} value={m.name}>{m.name}</option>
        ))}
      </select>
    </div>
  );

  // --- VIEWS ---
  
  const Dashboard = () => {
    const filteredTasks = getFilteredTasks(tasks);
    const filteredProjects = getFilteredProjects(projects);
    const activeProjects = filteredProjects.filter(p => p.status === 'activo').length;
    const blockedTasks = filteredTasks.filter(t => t.blocked).length;
    const pendingTasks = filteredTasks.filter(t => t.status !== 'done').length;

    return (
      <div className="space-y-6 animate-fade-in">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Hola, Equipo</h1>
            <p className="text-zinc-400 mt-1">Resumen operativo.</p>
          </div>
          <div className="flex gap-2">
            <Button icon={Plus} onClick={() => openNewTaskModal()}>Nueva Tarea</Button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="flex items-center gap-4 cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => setCurrentView('projects')}>
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400"><Briefcase size={24}/></div>
            <div>
              <div className="text-2xl font-bold text-zinc-100">{activeProjects}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Proyectos Activos</div>
            </div>
          </Card>
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><Zap size={24}/></div>
            <div>
              <div className="text-2xl font-bold text-zinc-100">{pendingTasks}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Tareas Pendientes</div>
            </div>
          </Card>
           <Card className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400"><AlertCircle size={24}/></div>
            <div>
              <div className="text-2xl font-bold text-zinc-100">{blockedTasks}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider">Bloqueos</div>
            </div>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-zinc-100">Tareas Prioritarias</h3>
                <Badge color="red">Urgente</Badge>
              </div>
              <div className="space-y-2">
                {filteredTasks.filter(t => t.priority === 'alta' && t.status !== 'done').slice(0, 5).map(task => (
                  <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateTaskStatus} onClick={handleTaskClick} />
                ))}
                {filteredTasks.filter(t => t.priority === 'alta' && t.status !== 'done').length === 0 && (
                  <div className="text-center py-8 text-zinc-500 italic">Todo limpio. No hay urgencias.</div>
                )}
              </div>
            </Card>
          </div>
          <div>
            <Card className="h-full flex flex-col justify-center items-center text-center p-6">
               <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-4">
                 <Clock size={24} />
               </div>
               <h3 className="font-semibold text-zinc-100">Tiempo de Foco</h3>
               <p className="text-zinc-500 text-sm mt-2 mb-4">Recuerda bloquear Martes y Miércoles para trabajo profundo sin interrupciones.</p>
               <Button variant="secondary" className="w-full text-xs" onClick={() => setCurrentView('week')}>Ver Calendario</Button>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const AgendaView = () => {
    const [viewMode, setViewMode] = useState('week'); 
    const [currentDate, setCurrentDate] = useState(new Date());
    const filteredTasks = getFilteredTasks(tasks);

    const navigate = (direction) => {
      const newDate = new Date(currentDate);
      if (viewMode === 'day') newDate.setDate(currentDate.getDate() + direction);
      if (viewMode === 'week') newDate.setDate(currentDate.getDate() + (direction * 7));
      if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + direction);
      setCurrentDate(newDate);
    };

    const getTasksForDate = (date) => {
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      return filteredTasks.filter(t => {
        if (t.status === 'done') return false;
        if (t.dueDate === dateStr) return true;
        if (!t.dueDate && t.plannedDay === dayName) return true;
        return false;
      });
    };

    const renderMonthView = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const days = getMonthDays(year, month);
      
      return (
        <div className="grid grid-cols-7 gap-1 h-full">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
            <div key={d} className="text-center text-xs font-bold text-zinc-500 py-2">{d}</div>
          ))}
          {Array.from({length: days[0].getDay()}).map((_, i) => <div key={`empty-${i}`} className="bg-transparent" />)}
          {days.map(date => {
            const dayTasks = getTasksForDate(date);
            const isToday = isSameDay(date, new Date());
            return (
              <div key={date.toString()} className={`bg-zinc-900 border ${isToday ? 'border-indigo-500' : 'border-zinc-800'} rounded p-2 min-h-[100px] overflow-hidden hover:border-zinc-600 transition-colors`}>
                  <span className={`text-xs font-bold ${isToday ? 'text-indigo-400' : 'text-zinc-500'}`}>{date.getDate()}</span>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                    {dayTasks.map(t => (
                      <div key={t.id} className="text-[9px] bg-zinc-800 rounded px-1 py-0.5 truncate text-zinc-300 cursor-pointer hover:text-white" onClick={() => handleTaskClick(t)}>
                        {t.title}
                      </div>
                    ))}
                  </div>
              </div>
            )
          })}
        </div>
      );
    };

    const renderWeekView = () => {
      const startOfWeek = getStartOfWeek(currentDate);
      const weekDays = Array.from({length: 7}, (_, i) => addDays(startOfWeek, i)); 

      return (
        <div className="flex h-full min-w-[1000px] gap-4">
          {weekDays.map(date => {
            const dayTasks = getTasksForDate(date);
            const isToday = isSameDay(date, new Date());
            return (
              <div key={date.toString()} className={`flex-1 flex flex-col h-full rounded-xl border ${isToday ? 'border-indigo-500/50 bg-indigo-900/5' : 'border-zinc-800 bg-zinc-900/50'} backdrop-blur-sm`}>
                <div className="p-3 border-b border-zinc-800 text-center">
                  <h3 className={`font-bold ${isToday ? 'text-indigo-400' : 'text-zinc-200'}`}>
                    {date.toLocaleDateString('es-CO', { weekday: 'long' })}
                  </h3>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">{date.getDate()} {date.toLocaleDateString('es-CO', { month: 'short' })}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {dayTasks.map(task => (
                    <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateTaskStatus} onClick={handleTaskClick} />
                  ))}
                  <button 
                    onClick={() => { 
                      setNewTask({...newTask, dueDate: date.toISOString().split('T')[0]}); 
                      setTaskModalOpen(true); 
                    }}
                    className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 rounded border border-dashed border-zinc-800 transition-all"
                  >
                    + Añadir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    const renderDayView = () => {
      const dayTasks = getTasksForDate(currentDate);
      return (
        <div className="max-w-3xl mx-auto h-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
           <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
             <CalendarDays className="text-indigo-500" /> 
             {currentDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
           </h2>
           <div className="space-y-3">
              {dayTasks.length === 0 && <p className="text-zinc-500 italic">No hay tareas programadas para este día.</p>}
              {dayTasks.map(task => (
                <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateTaskStatus} onClick={handleTaskClick} />
              ))}
              <Button variant="secondary" className="w-full mt-4" onClick={() => { setNewTask({...newTask, dueDate: currentDate.toISOString().split('T')[0]}); setTaskModalOpen(true); }}>
                 <Plus size={16} /> Añadir Tarea para Hoy
              </Button>
           </div>
        </div>
      );
    };

    return (
      <div className="h-full overflow-hidden flex flex-col">
        <header className="flex justify-between items-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-zinc-100">Agenda</h2>
            <div className="flex items-center gap-1 bg-zinc-900 rounded-md border border-zinc-800 p-1">
               <button onClick={() => navigate(-1)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400"><ChevronLeft size={16}/></button>
               <span className="text-xs font-mono w-24 text-center text-zinc-300">
                 {viewMode === 'month' 
                    ? currentDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) 
                    : currentDate.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
               </span>
               <button onClick={() => navigate(1)} className="p-1 hover:bg-zinc-800 rounded text-zinc-400"><ChevronRight size={16}/></button>
            </div>
          </div>
          
          <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
             <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'day' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Día</button>
             <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'week' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Semana</button>
             <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Mes</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
           {viewMode === 'day' && renderDayView()}
           {viewMode === 'week' && renderWeekView()}
           {viewMode === 'month' && renderMonthView()}
        </div>
      </div>
    );
  };

  const ClientsView = () => (
     <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-100">Cartera de Clientes</h2>
        <div className="flex gap-2">
          <Button variant="primary" icon={Plus} onClick={() => setClientModalOpen(true)}>Nuevo Cliente</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client => (
           <Card key={client.id} onClick={() => handleClientClick(client.id)} className="hover:border-zinc-600 transition-colors cursor-pointer group hover:shadow-lg hover:shadow-indigo-900/10">
             <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {client.name.substring(0,2).toUpperCase()}
                </div>
                <Badge color={client.status === 'activo' ? 'green' : 'gray'}>{client.status}</Badge>
             </div>
             <h3 className="font-bold text-lg text-zinc-100 mb-1">{client.name}</h3>
             <p className="text-sm text-zinc-500 mb-4">{client.contactPerson || 'Sin contacto asignado'}</p>
             <div className="flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-800 pt-3 mt-auto">
               <FileText size={14} />
               <span>{projects.filter(p => p.clientId === client.id).length} Proyectos</span>
             </div>
           </Card>
        ))}
      </div>
    </div>
  );

  const ProjectsView = () => {
    const filteredProjects = getFilteredProjects(projects);
    return (
      <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-100">Proyectos Activos</h2>
        <Button variant="primary" icon={Plus} onClick={() => setProjectModalOpen(true)}>Nuevo Proyecto</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filteredProjects.map(project => {
             const pTasks = tasks.filter(t => t.projectId === project.id);
             const activeCount = pTasks.filter(t => t.status !== 'done').length;
             
             return (
              <div 
                key={project.id} 
                onClick={() => handleProjectClick(project.id)}
                className="group flex flex-col p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-900/10"
              >
                  <div className="flex justify-between items-start mb-3">
                    <Badge color="blue">En Ejecución</Badge>
                    <ArrowRight size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors -rotate-45 group-hover:rotate-0 transform duration-300"/>
                  </div>
                  <h3 className="font-bold text-zinc-100 text-lg mb-1 truncate">{project.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                      <Users size={14} className="text-zinc-500"/>
                      <span className="text-sm text-zinc-400">{project.clientName || 'Cliente Desconocido'}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">{activeCount} tareas pendientes</span>
                    <div className="w-24 bg-zinc-800 h-1 rounded-full">
                       <div className="bg-indigo-500 h-full rounded-full" style={{ width: '40%' }}></div> 
                    </div>
                  </div>
              </div>
             );
           })}
      </div>
    </div>
    );
  };

  const AllTasksView = () => {
    const filteredTasks = getFilteredTasks(tasks);
    const activeParentTasks = filteredTasks.filter(t => t.status !== 'done');
    const doneItems = filteredTasks.filter(t => t.status === 'done');

    return (
      <div className="h-full flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Gestión de Tareas</h2>
          <Button onClick={() => openNewTaskModal()} icon={Plus}>Nueva Tarea Global</Button>
        </header>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* COL 1: Main Tasks */}
          <div className="flex flex-col h-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
              <h3 className="font-bold text-zinc-200">Tareas Activas</h3>
              <Badge color="blue">{activeParentTasks.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeParentTasks.map(task => (
                 <TaskItem key={task.id} task={task} onUpdateStatus={handleUpdateTaskStatus} onClick={handleTaskClick} />
              ))}
              {activeParentTasks.length === 0 && <div className="text-center text-zinc-600 py-10 text-sm">No hay tareas principales.</div>}
            </div>
          </div>

          {/* COL 2: Done */}
          <div className="flex flex-col h-full bg-zinc-900/30 border border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
              <h3 className="font-bold text-zinc-400">Hechas / Finalizadas</h3>
              <Badge color="green">{doneItems.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 opacity-75">
               {doneItems.map((item, idx) => (
                 <div key={idx} className="p-2 rounded border border-transparent hover:bg-zinc-900/50 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500"/>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs text-zinc-500 line-through truncate">{item.title}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TeamView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-100">Directorio de Equipo</h2>
        <Button onClick={() => setUserModalOpen(true)} icon={UserPlus}>Nuevo Miembro</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {teamMembers.map(member => (
            <Card key={member.id} className="hover:border-zinc-700">
               <div className="flex items-center gap-4">
                  <Avatar name={member.name} size="lg" />
                  <div>
                     <h3 className="font-bold text-zinc-100">{member.name}</h3>
                     <p className="text-sm text-indigo-400">{member.role}</p>
                     <p className="text-xs text-zinc-500 mt-1">{member.email}</p>
                  </div>
               </div>
            </Card>
         ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 border-r border-zinc-800 transition-all duration-300 flex flex-col bg-zinc-950`}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-white text-lg">A</span>
          </div>
          {isSidebarOpen && <span className="ml-3 font-bold tracking-tight">AgencyOS</span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layout },
            { id: 'week', label: 'Agenda', icon: Calendar },
            { id: 'projects', label: 'Proyectos', icon: Briefcase },
            { id: 'tasks', label: 'Todas las Tareas', icon: CheckSquare },
            { id: 'clients', label: 'Clientes', icon: Users },
            { id: 'team', label: 'Equipo', icon: UserPlus },
          ].map(item => (
             <button
               key={item.id}
               onClick={() => { setCurrentView(item.id); resetNavigation(); }}
               className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${currentView === item.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
             >
               <item.icon size={20} />
               {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
             </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur z-10">
          <div className="flex items-center gap-4 text-zinc-500">
            <Search size={18} />
          </div>
          <div className="flex items-center gap-4">
             <UserFilterSelect />
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-zinc-700"></div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative">
           {currentView === 'dashboard' && <Dashboard />}
           {currentView === 'week' && <AgendaView />}
           {currentView === 'clients' && <ClientsView />}
           {currentView === 'projects' && <ProjectsView />}
           {currentView === 'tasks' && <AllTasksView />}
           {currentView === 'team' && <TeamView />}
        </div>
      </main>

      {/* MODAL: NEW TASK */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-zinc-100">Nueva Tarea</h3>
              <button onClick={() => setTaskModalOpen(false)}><X size={20} className="text-zinc-500 hover:text-zinc-300"/></button>
            </div>
            
            <Input 
              label="Título" 
              placeholder="Ej. Diseño de interfaz home..." 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              autoFocus
            />

            <MultiSelectUser 
               label="Responsables Generales"
               users={teamMembers}
               selectedUsers={newTask.assignees || []}
               onChange={(newAssignees) => setNewTask({...newTask, assignees: newAssignees})}
            />

            <Select 
                label="Proyecto Asociado" 
                value={newTask.projectId}
                onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                disabled={!!selectedProjectId} 
                options={[
                  {value: '', label: 'Sin Proyecto (General)'},
                  ...projects.map(p => ({value: p.id, label: p.name}))
                ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select 
                label="Prioridad" 
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                options={[
                  {value: 'baja', label: 'Baja'},
                  {value: 'media', label: 'Media'},
                  {value: 'alta', label: 'Alta 🔥'},
                ]}
              />
              <Select 
                label="Planificar Para" 
                value={newTask.plannedDay}
                onChange={(e) => setNewTask({...newTask, plannedDay: e.target.value})}
                options={[
                  {value: 'backlog', label: 'Backlog (Sin fecha)'},
                  {value: 'monday', label: 'Lunes'},
                  {value: 'tuesday', label: 'Martes'},
                  {value: 'wednesday', label: 'Miércoles'},
                  {value: 'thursday', label: 'Jueves'},
                  {value: 'friday', label: 'Viernes'},
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
                <Select 
                  label="Recurrencia" 
                  value={newTask.recurrence}
                  onChange={(e) => setNewTask({...newTask, recurrence: e.target.value})}
                  options={[
                    {value: 'none', label: 'No recurrente'},
                    {value: 'weekly', label: 'Semanal'},
                    {value: 'monthly', label: 'Mensual'},
                  ]}
                />
                <div>
                   <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Fecha Límite</label>
                   <input 
                      type="date"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                   />
                </div>
            </div>

            {/* Subtasks Input with Immediate Assignment */}
            <div className="mt-4 border-t border-zinc-800 pt-4">
               <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 block">Checklist / Subtareas</label>
               <div className="flex gap-2 mb-2 items-center">
                 <input 
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Escribe una subtarea..."
                    value={tempSubtask}
                    onChange={(e) => setTempSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtaskToNew()}
                 />
                 <select 
                    className="bg-zinc-950 border border-zinc-800 rounded-md px-2 py-2 text-sm text-zinc-300 focus:outline-none"
                    value={tempSubtaskAssignee}
                    onChange={(e) => setTempSubtaskAssignee(e.target.value)}
                 >
                    <option value="">Responsable...</option>
                    {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                 </select>
                 <Button variant="secondary" onClick={handleAddSubtaskToNew} icon={Plus}>Añadir</Button>
               </div>
               <div className="space-y-1 max-h-32 overflow-y-auto">
                 {newTask.subtasks.map(sub => (
                   <div key={sub.id} className="flex items-center justify-between p-2 bg-zinc-900 rounded text-sm group">
                     <div className="flex items-center gap-2">
                       <span className="text-zinc-300">{sub.title}</span>
                       {sub.assignees?.map(a => <Avatar key={a} name={a} size="sm"/>)}
                     </div>
                     <button onClick={() => handleRemoveSubtaskFromNew(sub.id)} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
              <Button variant="ghost" onClick={() => setTaskModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddTask}>Crear Tarea</Button>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL: NEW PROJECT */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <Card className="w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">Nuevo Proyecto</h3>
              <Input label="Nombre del Proyecto" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              
              <Select 
                label="Cliente" 
                value={newProject.clientId}
                onChange={(e) => setNewProject({...newProject, clientId: e.target.value})}
                options={[
                  {value: '', label: 'Seleccionar Cliente'},
                  ...clients.map(c => ({value: c.id, label: c.name}))
                ]}
              />

              <Select 
                label="Líder del Proyecto" 
                value={newProject.lead}
                onChange={(e) => setNewProject({...newProject, lead: e.target.value})}
                options={[
                  {value: '', label: 'Seleccionar Líder'},
                  ...teamMembers.map(m => ({value: m.name, label: m.name}))
                ]}
              />

              <div className="flex justify-end gap-2 mt-6">
                 <Button variant="ghost" onClick={() => setProjectModalOpen(false)}>Cancelar</Button>
                 <Button onClick={handleAddProject}>Crear Proyecto</Button>
              </div>
           </Card>
        </div>
      )}

      {/* MODAL: NEW CLIENT */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <Card className="w-full max-w-md shadow-2xl">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">Nuevo Cliente</h3>
              <Input label="Nombre de la Empresa" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
              <Input label="Persona de Contacto" value={newClient.contactPerson} onChange={e => setNewClient({...newClient, contactPerson: e.target.value})} />
              <Input label="Email de Contacto" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
              <div className="flex justify-end gap-2 mt-6">
                 <Button variant="ghost" onClick={() => setClientModalOpen(false)}>Cancelar</Button>
                 <Button onClick={handleAddClient}>Guardar Cliente</Button>
              </div>
           </Card>
        </div>
      )}

      {/* MODAL: NEW USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <Card className="w-full max-w-sm shadow-2xl">
              <h3 className="text-lg font-bold text-zinc-100 mb-4">Nuevo Miembro</h3>
              <Input label="Nombre" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <Input label="Rol (Ej. Diseñador)" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} />
              <Input label="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <div className="flex justify-end gap-2 mt-4">
                 <Button variant="ghost" onClick={() => setUserModalOpen(false)}>Cancelar</Button>
                 <Button onClick={handleAddUser}>Guardar</Button>
              </div>
           </Card>
        </div>
      )}

    </div>
  );
}