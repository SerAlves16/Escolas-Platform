import { Role } from '@/types';

export interface ColumnDef {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
  className?: string;
}

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'time';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
}

export interface PageConfig {
  table: string;
  select: string;
  columns: ColumnDef[];
  formFields: FormField[];
  title: string;
  description: string;
  icon: any;
  filterColumn?: string;
  filterValue?: string;
  canCreate?: Role[];
  canEdit?: Role[];
  canDelete?: Role[];
  extraActions?: (row: any, onRefresh: () => void) => React.ReactNode;
  transformOnSave?: (data: Record<string, any>, isEdit: boolean) => Record<string, any>;
}

export const pageConfigs: Record<string, PageConfig> = {
  // ---- Users / Profiles ----
  '/dashboard/users': {
    table: 'profiles',
    select: '*, school:schools(name)',
    title: 'Gestão de Utilizadores',
    description: 'Gerir todos os utilizadores da plataforma',
    icon: 'Users',
    canCreate: ['admin'],
    canEdit: ['admin'],
    canDelete: ['admin'],
    columns: [
      { key: 'full_name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role', render: (r) => <span className="capitalize">{r.role}</span> },
      { key: 'phone', label: 'Telefone', render: (r) => r.phone || '—' },
      { key: 'is_active', label: 'Estado', render: (r) => r.is_active ? 'Ativo' : 'Inativo' },
    ],
    formFields: [
      { key: 'full_name', label: 'Nome completo', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'phone', label: 'Telefone', type: 'text' },
      {
        key: 'role', label: 'Role', type: 'select', required: true,
        options: [
          { value: 'admin', label: 'Administrador' },
          { value: 'direction', label: 'Direção' },
          { value: 'secretaria', label: 'Secretaria' },
          { value: 'teacher', label: 'Professor' },
          { value: 'class_director', label: 'Diretor de Turma' },
          { value: 'canteen', label: 'Refeitório' },
          { value: 'bar', label: 'Bar' },
          { value: 'stationery', label: 'Papelaria' },
          { value: 'staff_servicos', label: 'Serviços' },
          { value: 'parent', label: 'Encarregado' },
          { value: 'student', label: 'Aluno' },
        ],
      },
      { key: 'is_active', label: 'Ativo', type: 'checkbox' },
    ],
  },

  // ---- Teachers ----
  '/dashboard/teachers': {
    table: 'teachers',
    select: '*, profile:profiles(full_name, email, phone)',
    title: 'Professores',
    description: 'Gestão de professores',
    icon: 'GraduationCap',
    canCreate: ['admin', 'secretaria'],
    canEdit: ['admin', 'secretaria'],
    canDelete: ['admin'],
    columns: [
      { key: 'profile', label: 'Nome', render: (r) => r.profile?.full_name || '—' },
      { key: 'profile', label: 'Email', render: (r) => r.profile?.email || '—' },
      { key: 'profile', label: 'Telefone', render: (r) => r.profile?.phone || '—' },
    ],
    formFields: [
      { key: 'profile_id', label: 'ID do Perfil (UUID)', type: 'text', required: true, placeholder: 'UUID do utilizador' },
    ],
  },

  // ---- Students ----
  '/dashboard/students': {
    table: 'students',
    select: '*, profile:profiles(full_name, email, phone, is_active), enrollments:enrollments(class:classes(name))',
    title: 'Alunos',
    description: 'Gestão de alunos',
    icon: 'UserCheck',
    canCreate: ['admin', 'secretaria'],
    canEdit: ['admin', 'secretaria'],
    canDelete: ['admin'],
    columns: [
      { key: 'profile', label: 'Nome', render: (r) => r.profile?.full_name || '—' },
      { key: 'profile', label: 'Email', render: (r) => r.profile?.email || '—' },
      { key: 'student_number', label: 'Nº Aluno', render: (r) => r.student_number || '—' },
      { key: 'enrollments', label: 'Turma', render: (r) => r.enrollments?.[0]?.class?.name || '—' },
      { key: 'balance', label: 'Saldo', render: (r) => `${(r.balance ?? 0).toFixed(2)} €` },
      { key: 'profile', label: 'Estado', render: (r) => r.profile?.is_active ? 'Ativo' : 'Inativo' },
    ],
    formFields: [
      { key: 'profile_id', label: 'ID do Perfil (UUID)', type: 'text', required: true, placeholder: 'UUID do utilizador' },
      { key: 'student_number', label: 'Nº de Aluno', type: 'text' },
      { key: 'qr_token', label: 'QR Token', type: 'text' },
      { key: 'balance', label: 'Saldo (€)', type: 'number', defaultValue: 0 },
    ],
  },

  // ---- Parents ----
  '/dashboard/parents': {
    table: 'parents',
    select: '*, profile:profiles(full_name, email, phone)',
    title: 'Encarregados de Educação',
    description: 'Gestão de encarregados',
    icon: 'Users',
    canCreate: ['admin', 'secretaria'],
    canEdit: ['admin', 'secretaria'],
    canDelete: ['admin'],
    columns: [
      { key: 'profile', label: 'Nome', render: (r) => r.profile?.full_name || '—' },
      { key: 'profile', label: 'Email', render: (r) => r.profile?.email || '—' },
      { key: 'profile', label: 'Telefone', render: (r) => r.profile?.phone || '—' },
    ],
    formFields: [
      { key: 'profile_id', label: 'ID do Perfil (UUID)', type: 'text', required: true, placeholder: 'UUID do utilizador' },
    ],
  },

  // ---- Staff ----
  '/dashboard/staff': {
    table: 'staff',
    select: '*, profile:profiles(full_name, email, phone)',
    title: 'Funcionários',
    description: 'Gestão de funcionários',
    icon: 'UserCog',
    canCreate: ['admin'],
    canEdit: ['admin'],
    canDelete: ['admin'],
    columns: [
      { key: 'profile', label: 'Nome', render: (r) => r.profile?.full_name || '—' },
      { key: 'profile', label: 'Email', render: (r) => r.profile?.email || '—' },
      { key: 'staff_type', label: 'Tipo de Serviço', render: (r) => {
        const labels: Record<string, string> = { canteen: 'Refeitório', bar: 'Bar', stationery: 'Papelaria', other: 'Outro' };
        return labels[r.staff_type] || r.staff_type;
      } },
    ],
    formFields: [
      { key: 'profile_id', label: 'ID do Perfil (UUID)', type: 'text', required: true, placeholder: 'UUID do utilizador' },
      {
        key: 'staff_type', label: 'Tipo de Serviço', type: 'select', required: true,
        options: [
          { value: 'canteen', label: 'Refeitório' },
          { value: 'bar', label: 'Bar' },
          { value: 'stationery', label: 'Papelaria' },
          { value: 'other', label: 'Outro' },
        ],
      },
    ],
  },

  // ---- Classes ----
  '/dashboard/classes': {
    table: 'classes',
    select: '*, class_director:profiles!class_director_id(full_name)',
    title: 'Turmas',
    description: 'Gestão de turmas',
    icon: 'BookOpen',
    canCreate: ['admin', 'secretaria'],
    canEdit: ['admin', 'secretaria'],
    canDelete: ['admin'],
    columns: [
      { key: 'name', label: 'Turma' },
      { key: 'grade', label: 'Ano', render: (r) => r.grade || '—' },
      { key: 'year', label: 'Ano Letivo' },
      { key: 'class_director', label: 'Diretor de Turma', render: (r) => r.class_director?.full_name || '—' },
    ],
    formFields: [
      { key: 'name', label: 'Nome da turma', type: 'text', required: true, placeholder: '7º A' },
      { key: 'grade', label: 'Ano', type: 'text', placeholder: '7º ano' },
      { key: 'year', label: 'Ano letivo', type: 'text', required: true, placeholder: '2025/2026' },
    ],
  },

  // ---- Subjects ----
  '/dashboard/subjects': {
    table: 'subjects',
    select: '*',
    title: 'Disciplinas',
    description: 'Gestão de disciplinas',
    icon: 'BookMarked',
    canCreate: ['admin', 'secretaria'],
    canEdit: ['admin', 'secretaria'],
    canDelete: ['admin'],
    columns: [
      { key: 'name', label: 'Disciplina' },
      { key: 'code', label: 'Código', render: (r) => r.code || '—' },
    ],
    formFields: [
      { key: 'name', label: 'Nome da disciplina', type: 'text', required: true },
      { key: 'code', label: 'Código', type: 'text', placeholder: 'MAT' },
    ],
  },

  // ---- Schedules ----
  '/dashboard/schedules': {
    table: 'schedules',
    select: '*, class:classes(name), subject:subjects(name), teacher:profiles(full_name)',
    title: 'Horários',
    description: 'Gestão de horários',
    icon: 'Clock',
    canCreate: ['admin', 'secretaria'],
    canEdit: ['admin', 'secretaria'],
    canDelete: ['admin'],
    columns: [
      { key: 'class', label: 'Turma', render: (r) => r.class?.name || '—' },
      { key: 'subject', label: 'Disciplina', render: (r) => r.subject?.name || '—' },
      { key: 'teacher', label: 'Professor', render: (r) => r.teacher?.full_name || '—' },
      { key: 'day_of_week', label: 'Dia', render: (r) => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][r.day_of_week] || '—' },
      { key: 'start_time', label: 'Início', render: (r) => r.start_time?.slice(0, 5) || '—' },
      { key: 'end_time', label: 'Fim', render: (r) => r.end_time?.slice(0, 5) || '—' },
      { key: 'room', label: 'Sala', render: (r) => r.room || '—' },
    ],
    formFields: [
      { key: 'class_id', label: 'ID da Turma', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'subject_id', label: 'ID da Disciplina', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'teacher_id', label: 'ID do Professor', type: 'text', placeholder: 'UUID' },
      {
        key: 'day_of_week', label: 'Dia da semana', type: 'select', required: true,
        options: [
          { value: '0', label: 'Domingo' }, { value: '1', label: 'Segunda' },
          { value: '2', label: 'Terça' }, { value: '3', label: 'Quarta' },
          { value: '4', label: 'Quinta' }, { value: '5', label: 'Sexta' },
          { value: '6', label: 'Sábado' },
        ],
      },
      { key: 'start_time', label: 'Hora de início', type: 'time', required: true },
      { key: 'end_time', label: 'Hora de fim', type: 'time', required: true },
      { key: 'room', label: 'Sala', type: 'text' },
    ],
    transformOnSave: (data) => ({
      ...data,
      day_of_week: data.day_of_week ? parseInt(data.day_of_week) : 1,
    }),
  },

  // ---- Grades ----
  '/dashboard/grades': {
    table: 'grades',
    select: '*, student:students(profile:profiles(full_name)), subject:subjects(name)',
    title: 'Notas',
    description: 'Gestão de notas',
    icon: 'Award',
    canCreate: ['admin', 'direction', 'teacher', 'class_director'],
    canEdit: ['admin', 'direction', 'teacher', 'class_director'],
    canDelete: ['admin'],
    columns: [
      { key: 'student', label: 'Aluno', render: (r) => r.student?.profile?.full_name || '—' },
      { key: 'subject', label: 'Disciplina', render: (r) => r.subject?.name || '—' },
      { key: 'term', label: 'Período' },
      { key: 'value', label: 'Nota', render: (r) => r.value?.toFixed(1) || '—' },
      { key: 'assessment_type', label: 'Tipo', render: (r) => r.assessment_type || '—' },
      { key: 'date', label: 'Data', render: (r) => r.date ? new Date(r.date).toLocaleDateString('pt-PT') : '—' },
    ],
    formFields: [
      { key: 'student_id', label: 'ID do Aluno', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'subject_id', label: 'ID da Disciplina', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'term', label: 'Período', type: 'text', required: true, placeholder: '1º Período' },
      { key: 'value', label: 'Nota (0-20)', type: 'number', required: true, defaultValue: 10 },
      { key: 'assessment_type', label: 'Tipo de avaliação', type: 'text', placeholder: 'Teste' },
      { key: 'date', label: 'Data', type: 'date', required: true },
      { key: 'notes', label: 'Notas', type: 'textarea' },
    ],
  },

  // ---- Attendance ----
  '/dashboard/attendance': {
    table: 'attendance',
    select: '*, student:students(profile:profiles(full_name)), subject:subjects(name)',
    title: 'Faltas',
    description: 'Gestão de faltas e assiduidade',
    icon: 'ClipboardList',
    canCreate: ['admin', 'direction', 'teacher', 'class_director'],
    canEdit: ['admin', 'direction', 'teacher', 'class_director'],
    canDelete: ['admin'],
    columns: [
      { key: 'student', label: 'Aluno', render: (r) => r.student?.profile?.full_name || '—' },
      { key: 'subject', label: 'Disciplina', render: (r) => r.subject?.name || '—' },
      { key: 'date', label: 'Data', render: (r) => r.date ? new Date(r.date).toLocaleDateString('pt-PT') : '—' },
      { key: 'justified', label: 'Justificada', render: (r) => r.justified ? 'Sim' : 'Não' },
      { key: 'observation', label: 'Observação', render: (r) => r.observation || '—' },
    ],
    formFields: [
      { key: 'student_id', label: 'ID do Aluno', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'subject_id', label: 'ID da Disciplina', type: 'text', placeholder: 'UUID' },
      { key: 'date', label: 'Data', type: 'date', required: true },
      { key: 'justified', label: 'Justificada', type: 'checkbox' },
      { key: 'justification', label: 'Justificação', type: 'text' },
      { key: 'observation', label: 'Observação', type: 'textarea' },
    ],
  },

  // ---- Products (filtered by outlet) ----
  '/dashboard/products': {
    table: 'products',
    select: '*',
    title: 'Produtos',
    description: 'Gestão de produtos',
    icon: 'Package',
    canCreate: ['admin', 'bar', 'stationery', 'staff_servicos'],
    canEdit: ['admin', 'bar', 'stationery', 'staff_servicos'],
    canDelete: ['admin'],
    columns: [
      { key: 'name', label: 'Produto' },
      { key: 'category', label: 'Categoria', render: (r) => r.category || '—' },
      { key: 'price', label: 'Preço', render: (r) => `${(r.price ?? 0).toFixed(2)} €` },
      { key: 'stock', label: 'Stock' },
      { key: 'outlet_type', label: 'Tipo', render: (r) => {
        const labels: Record<string, string> = { bar: 'Bar', stationery: 'Papelaria', canteen: 'Refeitório' };
        return labels[r.outlet_type] || r.outlet_type;
      } },
      { key: 'is_active', label: 'Estado', render: (r) => r.is_active ? 'Ativo' : 'Inativo' },
    ],
    formFields: [
      { key: 'name', label: 'Nome do produto', type: 'text', required: true },
      { key: 'category', label: 'Categoria', type: 'text', placeholder: 'Bebidas' },
      { key: 'price', label: 'Preço (€)', type: 'number', required: true, defaultValue: 0 },
      { key: 'cost', label: 'Custo (€)', type: 'number', defaultValue: 0 },
      { key: 'stock', label: 'Stock', type: 'number', required: true, defaultValue: 0 },
      { key: 'min_stock', label: 'Stock mínimo', type: 'number', defaultValue: 0 },
      {
        key: 'outlet_type', label: 'Tipo de ponto de venda', type: 'select', required: true,
        options: [
          { value: 'bar', label: 'Bar' },
          { value: 'stationery', label: 'Papelaria' },
          { value: 'canteen', label: 'Refeitório' },
        ],
      },
      { key: 'image_url', label: 'URL da imagem', type: 'text' },
      { key: 'is_active', label: 'Ativo', type: 'checkbox' },
    ],
  },

  // ---- Stocks ----
  '/dashboard/stocks': {
    table: 'products',
    select: '*',
    title: 'Stocks',
    description: 'Gestão de stocks',
    icon: 'Package',
    canEdit: ['admin', 'bar', 'stationery', 'staff_servicos'],
    columns: [
      { key: 'name', label: 'Produto' },
      { key: 'category', label: 'Categoria', render: (r) => r.category || '—' },
      { key: 'stock', label: 'Stock atual' },
      { key: 'min_stock', label: 'Stock mínimo', render: (r) => r.min_stock || 0 },
      { key: 'stock', label: 'Estado', render: (r) => {
        if (r.stock <= 0) return <span className="text-red-600 font-medium">Esgotado</span>;
        if (r.stock <= (r.min_stock || 0)) return <span className="text-amber-600 font-medium">Baixo</span>;
        return <span className="text-emerald-600">OK</span>;
      } },
    ],
    formFields: [
      { key: 'stock', label: 'Stock atual', type: 'number', required: true },
      { key: 'min_stock', label: 'Stock mínimo', type: 'number' },
    ],
  },

  // ---- Balances ----
  '/dashboard/balances': {
    table: 'students',
    select: '*, profile:profiles(full_name)',
    title: 'Saldos',
    description: 'Gestão de saldos de alunos',
    icon: 'Wallet',
    canEdit: ['admin'],
    columns: [
      { key: 'profile', label: 'Aluno', render: (r) => r.profile?.full_name || '—' },
      { key: 'student_number', label: 'Nº Aluno', render: (r) => r.student_number || '—' },
      { key: 'balance', label: 'Saldo', render: (r) => `${(r.balance ?? 0).toFixed(2)} €` },
    ],
    formFields: [
      { key: 'balance', label: 'Saldo (€)', type: 'number', required: true, defaultValue: 0 },
    ],
  },

  // ---- News ----
  '/dashboard/news': {
    table: 'news',
    select: '*',
    title: 'Notícias',
    description: 'Gestão de notícias',
    icon: 'Newspaper',
    canCreate: ['admin', 'direction'],
    canEdit: ['admin', 'direction'],
    canDelete: ['admin', 'direction'],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'excerpt', label: 'Resumo', render: (r) => r.excerpt || '—' },
      { key: 'published', label: 'Estado', render: (r) => r.published ? 'Publicado' : 'Rascunho' },
      { key: 'published_at', label: 'Publicado em', render: (r) => r.published_at ? new Date(r.published_at).toLocaleDateString('pt-PT') : '—' },
    ],
    formFields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'excerpt', label: 'Resumo', type: 'textarea' },
      { key: 'content', label: 'Conteúdo', type: 'textarea', required: true },
      { key: 'image_url', label: 'URL da imagem', type: 'text' },
      { key: 'published', label: 'Publicado', type: 'checkbox' },
    ],
    transformOnSave: (data, isEdit) => {
      if (data.published && !isEdit) data.published_at = new Date().toISOString();
      return data;
    },
  },

  // ---- Events ----
  '/dashboard/events': {
    table: 'events',
    select: '*',
    title: 'Eventos',
    description: 'Gestão de eventos',
    icon: 'CalendarDays',
    canCreate: ['admin', 'direction'],
    canEdit: ['admin', 'direction'],
    canDelete: ['admin', 'direction'],
    columns: [
      { key: 'title', label: 'Evento' },
      { key: 'location', label: 'Local', render: (r) => r.location || '—' },
      { key: 'start_date', label: 'Início', render: (r) => r.start_date ? new Date(r.start_date).toLocaleDateString('pt-PT') : '—' },
      { key: 'category', label: 'Categoria', render: (r) => r.category || '—' },
    ],
    formFields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'description', label: 'Descrição', type: 'textarea' },
      { key: 'start_date', label: 'Data de início', type: 'date', required: true },
      { key: 'end_date', label: 'Data de fim', type: 'date' },
      { key: 'location', label: 'Local', type: 'text' },
      { key: 'category', label: 'Categoria', type: 'text' },
      { key: 'image_url', label: 'URL da imagem', type: 'text' },
    ],
    transformOnSave: (data) => {
      if (data.start_date) data.start_date = new Date(data.start_date).toISOString();
      if (data.end_date) data.end_date = new Date(data.end_date).toISOString();
      return data;
    },
  },

  // ---- Meetings ----
  '/dashboard/meetings': {
    table: 'meetings',
    select: '*, parent:parents(profile:profiles(full_name)), teacher:teachers(profile:profiles(full_name))',
    title: 'Reuniões',
    description: 'Gestão de reuniões',
    icon: 'CalendarCheck',
    canCreate: ['admin', 'direction', 'teacher', 'class_director', 'parent'],
    canEdit: ['admin', 'direction', 'teacher', 'class_director'],
    columns: [
      { key: 'parent', label: 'Encarregado', render: (r) => r.parent?.profile?.full_name || '—' },
      { key: 'teacher', label: 'Professor', render: (r) => r.teacher?.profile?.full_name || '—' },
      { key: 'scheduled_at', label: 'Agendado para', render: (r) => r.scheduled_at ? new Date(r.scheduled_at).toLocaleString('pt-PT') : '—' },
      { key: 'status', label: 'Estado', render: (r) => {
        const labels: Record<string, string> = { pending: 'Pendente', confirmed: 'Confirmada', completed: 'Concluída', cancelled: 'Cancelada' };
        return labels[r.status] || r.status;
      } },
      { key: 'location', label: 'Local', render: (r) => r.location || '—' },
    ],
    formFields: [
      { key: 'parent_id', label: 'ID do Encarregado', type: 'text', placeholder: 'UUID' },
      { key: 'teacher_id', label: 'ID do Professor', type: 'text', placeholder: 'UUID' },
      { key: 'scheduled_at', label: 'Data e hora', type: 'date', required: true },
      {
        key: 'status', label: 'Estado', type: 'select',
        options: [
          { value: 'pending', label: 'Pendente' },
          { value: 'confirmed', label: 'Confirmada' },
          { value: 'completed', label: 'Concluída' },
          { value: 'cancelled', label: 'Cancelada' },
        ],
      },
      { key: 'location', label: 'Local', type: 'text' },
      { key: 'notes', label: 'Notas', type: 'textarea' },
    ],
    transformOnSave: (data) => {
      if (data.scheduled_at) data.scheduled_at = new Date(data.scheduled_at).toISOString();
      return data;
    },
  },

  // ---- Menus ----
  '/dashboard/menus': {
    table: 'menus',
    select: '*',
    title: 'Ementas',
    description: 'Gestão de ementas do refeitório',
    icon: 'UtensilsCrossed',
    canCreate: ['admin', 'canteen', 'staff_servicos'],
    canEdit: ['admin', 'canteen', 'staff_servicos'],
    canDelete: ['admin', 'canteen'],
    columns: [
      { key: 'date', label: 'Data', render: (r) => r.date ? new Date(r.date).toLocaleDateString('pt-PT') : '—' },
      { key: 'meal_type', label: 'Refeição', render: (r) => {
        const labels: Record<string, string> = { lunch: 'Almoço', snack: 'Lanche', dinner: 'Jantar' };
        return labels[r.meal_type] || r.meal_type;
      } },
      { key: 'soup', label: 'Sopa', render: (r) => r.soup || '—' },
      { key: 'main_course', label: 'Prato', render: (r) => r.main_course || '—' },
      { key: 'dessert', label: 'Sobremesa', render: (r) => r.dessert || '—' },
      { key: 'price', label: 'Preço', render: (r) => `${(r.price ?? 0).toFixed(2)} €` },
    ],
    formFields: [
      { key: 'date', label: 'Data', type: 'date', required: true },
      {
        key: 'meal_type', label: 'Tipo de refeição', type: 'select', required: true,
        options: [
          { value: 'lunch', label: 'Almoço' },
          { value: 'snack', label: 'Lanche' },
          { value: 'dinner', label: 'Jantar' },
        ],
      },
      { key: 'description', label: 'Descrição', type: 'text', required: true },
      { key: 'soup', label: 'Sopa', type: 'text' },
      { key: 'main_course', label: 'Prato principal', type: 'text' },
      { key: 'dessert', label: 'Sobremesa', type: 'text' },
      { key: 'price', label: 'Preço (€)', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Ativa', type: 'checkbox' },
    ],
  },

  // ---- Reservations ----
  '/dashboard/reservations': {
    table: 'meal_reservations',
    select: '*, student:students(profile:profiles(full_name), student_number), menu:menus(date, soup, main_course)',
    title: 'Refeições Marcadas',
    description: 'Lista de refeições marcadas',
    icon: 'ListChecks',
    canEdit: ['admin', 'canteen', 'staff_servicos'],
    columns: [
      { key: 'student', label: 'Aluno', render: (r) => r.student?.profile?.full_name || '—' },
      { key: 'student', label: 'Nº', render: (r) => r.student?.student_number || '—' },
      { key: 'date', label: 'Data', render: (r) => r.date ? new Date(r.date).toLocaleDateString('pt-PT') : '—' },
      { key: 'status', label: 'Estado', render: (r) => {
        const labels: Record<string, string> = { reserved: 'Marcada', served: 'Servida', cancelled: 'Cancelada' };
        return labels[r.status] || r.status;
      } },
      { key: 'qr_validated', label: 'QR Validado', render: (r) => r.qr_validated ? 'Sim' : 'Não' },
    ],
    formFields: [
      { key: 'student_id', label: 'ID do Aluno', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'date', label: 'Data', type: 'date', required: true },
      {
        key: 'status', label: 'Estado', type: 'select', required: true,
        options: [
          { value: 'reserved', label: 'Marcada' },
          { value: 'served', label: 'Servida' },
          { value: 'cancelled', label: 'Cancelada' },
        ],
      },
    ],
  },

  // ---- Sales ----
  '/dashboard/sales': {
    table: 'sales',
    select: '*, product:products(name), student:students(profile:profiles(full_name))',
    title: 'Histórico de Vendas',
    description: 'Histórico de vendas',
    icon: 'ScrollText',
    columns: [
      { key: 'product', label: 'Produto', render: (r) => r.product?.name || '—' },
      { key: 'student', label: 'Aluno', render: (r) => r.student?.profile?.full_name || '—' },
      { key: 'outlet_type', label: 'Tipo', render: (r) => r.outlet_type || '—' },
      { key: 'quantity', label: 'Qtd' },
      { key: 'total', label: 'Total', render: (r) => `${(r.total ?? 0).toFixed(2)} €` },
      { key: 'created_at', label: 'Data', render: (r) => r.created_at ? new Date(r.created_at).toLocaleString('pt-PT') : '—' },
    ],
    formFields: [],
  },

  // ---- Homework ----
  '/dashboard/homework': {
    table: 'homework',
    select: '*, subject:subjects(name), class:classes(name)',
    title: 'Trabalhos de Casa',
    description: 'Trabalhos e tarefas',
    icon: 'FileText',
    canCreate: ['admin', 'direction', 'teacher', 'class_director'],
    canEdit: ['admin', 'direction', 'teacher', 'class_director'],
    canDelete: ['admin', 'teacher'],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'subject', label: 'Disciplina', render: (r) => r.subject?.name || '—' },
      { key: 'class', label: 'Turma', render: (r) => r.class?.name || '—' },
      { key: 'due_date', label: 'Entrega', render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString('pt-PT') : '—' },
    ],
    formFields: [
      { key: 'class_id', label: 'ID da Turma', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'subject_id', label: 'ID da Disciplina', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'description', label: 'Descrição', type: 'textarea' },
      { key: 'due_date', label: 'Data de entrega', type: 'date', required: true },
    ],
  },

  // ---- Exams ----
  '/dashboard/exams': {
    table: 'exams',
    select: '*, subject:subjects(name), class:classes(name)',
    title: 'Testes',
    description: 'Datas de testes e avaliações',
    icon: 'ClipboardCheck',
    canCreate: ['admin', 'direction', 'teacher', 'class_director'],
    canEdit: ['admin', 'direction', 'teacher', 'class_director'],
    canDelete: ['admin', 'teacher'],
    columns: [
      { key: 'title', label: 'Teste' },
      { key: 'subject', label: 'Disciplina', render: (r) => r.subject?.name || '—' },
      { key: 'class', label: 'Turma', render: (r) => r.class?.name || '—' },
      { key: 'date', label: 'Data', render: (r) => r.date ? new Date(r.date).toLocaleDateString('pt-PT') : '—' },
      { key: 'room', label: 'Sala', render: (r) => r.room || '—' },
    ],
    formFields: [
      { key: 'class_id', label: 'ID da Turma', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'subject_id', label: 'ID da Disciplina', type: 'text', required: true, placeholder: 'UUID' },
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'date', label: 'Data', type: 'date', required: true },
      { key: 'topics', label: 'Tópicos', type: 'textarea' },
      { key: 'room', label: 'Sala', type: 'text' },
    ],
  },

  // ---- Announcements ----
  '/dashboard/announcements': {
    table: 'announcements',
    select: '*',
    title: 'Avisos',
    description: 'Avisos importantes da escola',
    icon: 'Bell',
    canCreate: ['admin', 'direction'],
    canEdit: ['admin', 'direction'],
    canDelete: ['admin', 'direction'],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'priority', label: 'Prioridade', render: (r) => r.priority || 'normal' },
      { key: 'target_role', label: 'Destinatários', render: (r) => r.target_role || 'Todos' },
      { key: 'created_at', label: 'Criado em', render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString('pt-PT') : '—' },
    ],
    formFields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'content', label: 'Conteúdo', type: 'textarea', required: true },
      { key: 'target_role', label: 'Role destinatário (opcional)', type: 'text', placeholder: 'parent, student, ...' },
      {
        key: 'priority', label: 'Prioridade', type: 'select',
        options: [
          { value: 'low', label: 'Baixa' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'Alta' },
          { value: 'urgent', label: 'Urgente' },
        ],
      },
    ],
  },

  // ---- Gallery ----
  '/dashboard/gallery': {
    table: 'gallery_photos',
    select: '*',
    title: 'Galeria',
    description: 'Fotografias da galeria',
    icon: 'Image',
    canCreate: ['admin', 'direction'],
    canEdit: ['admin', 'direction'],
    canDelete: ['admin', 'direction'],
    columns: [
      { key: 'title', label: 'Título', render: (r) => r.title || '—' },
      { key: 'image_url', label: 'Imagem', render: (r) => r.image_url ? <img src={r.image_url} alt="" className="h-10 w-10 rounded object-cover" /> : '—' },
      { key: 'category', label: 'Categoria', render: (r) => r.category || '—' },
    ],
    formFields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'image_url', label: 'URL da imagem', type: 'text', required: true },
      { key: 'category', label: 'Categoria', type: 'text' },
    ],
  },

  // ---- Documents ----
  '/dashboard/documents': {
    table: 'documents',
    select: '*',
    title: 'Documentos',
    description: 'Documentos públicos',
    icon: 'FileText',
    canCreate: ['admin', 'direction'],
    canEdit: ['admin', 'direction'],
    canDelete: ['admin', 'direction'],
    columns: [
      { key: 'title', label: 'Documento' },
      { key: 'category', label: 'Categoria', render: (r) => r.category || '—' },
      { key: 'is_public', label: 'Público', render: (r) => r.is_public ? 'Sim' : 'Não' },
    ],
    formFields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'file_url', label: 'URL do ficheiro', type: 'text' },
      { key: 'category', label: 'Categoria', type: 'text' },
      { key: 'is_public', label: 'Público', type: 'checkbox' },
    ],
  },

  // ---- Useful Links ----
  '/dashboard/useful-links': {
    table: 'useful_links',
    select: '*',
    title: 'Ligações Úteis',
    description: 'Ligações úteis',
    icon: 'Link2',
    canCreate: ['admin', 'direction'],
    canEdit: ['admin', 'direction'],
    canDelete: ['admin', 'direction'],
    columns: [
      { key: 'title', label: 'Título' },
      { key: 'url', label: 'URL', render: (r) => <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.url}</a> },
      { key: 'category', label: 'Categoria', render: (r) => r.category || '—' },
    ],
    formFields: [
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'category', label: 'Categoria', type: 'text' },
    ],
  },
};

// Service-specific page configs (filtered by outlet_type)
export function getServicePageConfig(path: string, _role: string): PageConfig | null {
  if (path === '/dashboard/canteen') {
    return {
      ...pageConfigs['/dashboard/menus'],
      title: 'Refeitório',
      description: 'Gestão do refeitório - ementas e refeições',
      filterColumn: undefined,
    };
  }

  if (path === '/dashboard/bar' || path === '/dashboard/stationery') {
    const outlet = path === '/dashboard/bar' ? 'bar' : 'stationery';
    return {
      ...pageConfigs['/dashboard/products'],
      title: outlet === 'bar' ? 'Bar' : 'Papelaria',
      description: `Gestão de produtos - ${outlet === 'bar' ? 'Bar' : 'Papelaria'}`,
      filterColumn: 'outlet_type',
      filterValue: outlet,
    };
  }

  return null;
}
