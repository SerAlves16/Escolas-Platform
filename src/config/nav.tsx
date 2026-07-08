import { Role } from '@/types';
import {
  LayoutDashboard, Users, GraduationCap, UserCog, BookOpen, ClipboardList,
  DollarSign, UtensilsCrossed, Coffee, ShoppingBag, Newspaper, CalendarDays, FileImage,
  Settings, BarChart3, ScrollText, MessageSquare, Bell, QrCode, Wallet, CalendarCheck,
  ListChecks, ClipboardCheck, Package, TrendingUp, Award, Clock, FileText,
  UserCheck, BookMarked, CalendarClock, UserPlus, FileCheck, FileSearch,
  ClipboardList as Clipboard
} from 'lucide-react';
import { NavSection } from '@/components/DashboardLayout';

export const navConfig: Record<Role, NavSection[]> = {
  admin: [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Estatísticas', icon: BarChart3, path: '/dashboard/stats' },
        { label: 'Logs de Atividade', icon: ScrollText, path: '/dashboard/logs' },
      ],
    },
    {
      title: 'Gestão de Pessoas',
      items: [
        { label: 'Utilizadores', icon: Users, path: '/dashboard/users' },
        { label: 'Criar Utilizador', icon: UserPlus, path: '/dashboard/create-user' },
        { label: 'Professores', icon: GraduationCap, path: '/dashboard/teachers' },
        { label: 'Alunos', icon: UserCheck, path: '/dashboard/students' },
        { label: 'Encarregados', icon: Users, path: '/dashboard/parents' },
        { label: 'Funcionários', icon: UserCog, path: '/dashboard/staff' },
      ],
    },
    {
      title: 'Académico',
      items: [
        { label: 'Turmas', icon: BookOpen, path: '/dashboard/classes' },
        { label: 'Disciplinas', icon: BookMarked, path: '/dashboard/subjects' },
        { label: 'Horários', icon: Clock, path: '/dashboard/schedules' },
        { label: 'Anos Letivos', icon: CalendarClock, path: '/dashboard/years' },
        { label: 'Notas', icon: Award, path: '/dashboard/grades' },
        { label: 'Faltas', icon: ClipboardList, path: '/dashboard/attendance' },
      ],
    },
    {
      title: 'Serviços',
      items: [
        { label: 'Refeitório', icon: UtensilsCrossed, path: '/dashboard/canteen' },
        { label: 'Bar', icon: Coffee, path: '/dashboard/bar' },
        { label: 'Papelaria', icon: ShoppingBag, path: '/dashboard/stationery' },
        { label: 'Produtos', icon: Package, path: '/dashboard/products' },
        { label: 'Stocks', icon: Package, path: '/dashboard/stocks' },
        { label: 'Saldos', icon: Wallet, path: '/dashboard/balances' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { label: 'Reuniões', icon: CalendarCheck, path: '/dashboard/meetings' },
        { label: 'Notícias', icon: Newspaper, path: '/dashboard/news' },
        { label: 'Eventos', icon: CalendarDays, path: '/dashboard/events' },
        { label: 'Mensagens', icon: MessageSquare, path: '/dashboard/messages' },
        { label: 'Notificações', icon: Bell, path: '/dashboard/notifications' },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { label: 'Landing Page', icon: FileImage, path: '/dashboard/landing' },
        { label: 'Definições', icon: Settings, path: '/dashboard/settings' },
      ],
    },
  ],
  direction: [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Estatísticas', icon: BarChart3, path: '/dashboard/stats' },
      ],
    },
    {
      title: 'Académico',
      items: [
        { label: 'Turmas', icon: BookOpen, path: '/dashboard/classes' },
        { label: 'Professores', icon: GraduationCap, path: '/dashboard/teachers' },
        { label: 'Alunos', icon: UserCheck, path: '/dashboard/students' },
        { label: 'Notas', icon: Award, path: '/dashboard/grades' },
        { label: 'Faltas', icon: ClipboardList, path: '/dashboard/attendance' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { label: 'Reuniões', icon: CalendarCheck, path: '/dashboard/meetings' },
        { label: 'Notícias', icon: Newspaper, path: '/dashboard/news' },
        { label: 'Eventos', icon: CalendarDays, path: '/dashboard/events' },
        { label: 'Mensagens', icon: MessageSquare, path: '/dashboard/messages' },
      ],
    },
  ],
  secretaria: [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Inscrições Pendentes', icon: FileSearch, path: '/dashboard/enrollments' },
        { label: 'Matrículas', icon: FileCheck, path: '/dashboard/matriculas' },
      ],
    },
    {
      title: 'Gestão',
      items: [
        { label: 'Alunos', icon: UserCheck, path: '/dashboard/students' },
        { label: 'Encarregados', icon: Users, path: '/dashboard/parents' },
        { label: 'Turmas', icon: BookOpen, path: '/dashboard/classes' },
        { label: 'Professores', icon: GraduationCap, path: '/dashboard/teachers' },
      ],
    },
    {
      title: 'Académico',
      items: [
        { label: 'Notas', icon: Award, path: '/dashboard/grades' },
        { label: 'Faltas', icon: ClipboardList, path: '/dashboard/attendance' },
        { label: 'Horários', icon: Clock, path: '/dashboard/schedules' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { label: 'Mensagens', icon: MessageSquare, path: '/dashboard/messages' },
        { label: 'Notificações', icon: Bell, path: '/dashboard/notifications' },
      ],
    },
  ],
  teacher: [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Horário', icon: Clock, path: '/dashboard/schedule' },
      ],
    },
    {
      title: 'Turmas',
      items: [
        { label: 'As minhas turmas', icon: BookOpen, path: '/dashboard/classes' },
        { label: 'Lançar notas', icon: Award, path: '/dashboard/grades' },
        { label: 'Marcar faltas', icon: ClipboardList, path: '/dashboard/attendance' },
        { label: 'Trabalhos', icon: FileText, path: '/dashboard/homework' },
        { label: 'Testes', icon: ClipboardCheck, path: '/dashboard/exams' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { label: 'Mensagens', icon: MessageSquare, path: '/dashboard/messages' },
        { label: 'Reuniões', icon: CalendarCheck, path: '/dashboard/meetings' },
      ],
    },
  ],
  class_director: [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'A minha turma', icon: BookOpen, path: '/dashboard/my-class' },
        { label: 'Estatísticas', icon: BarChart3, path: '/dashboard/stats' },
      ],
    },
    {
      title: 'Académico',
      items: [
        { label: 'Notas', icon: Award, path: '/dashboard/grades' },
        { label: 'Faltas', icon: ClipboardList, path: '/dashboard/attendance' },
        { label: 'Justificações', icon: ListChecks, path: '/dashboard/justifications' },
        { label: 'Trabalhos', icon: FileText, path: '/dashboard/homework' },
        { label: 'Testes', icon: ClipboardCheck, path: '/dashboard/exams' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { label: 'Mensagens', icon: MessageSquare, path: '/dashboard/messages' },
        { label: 'Reuniões', icon: CalendarCheck, path: '/dashboard/meetings' },
      ],
    },
  ],
  canteen: [
    {
      title: 'Refeitório',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Validar QR Code', icon: QrCode, path: '/dashboard/validate' },
        { label: 'Refeições marcadas', icon: ListChecks, path: '/dashboard/reservations' },
        { label: 'Ementas', icon: UtensilsCrossed, path: '/dashboard/menus' },
        { label: 'Relatórios', icon: TrendingUp, path: '/dashboard/reports' },
      ],
    },
  ],
  bar: [
    {
      title: 'Bar',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Validar QR Code', icon: QrCode, path: '/dashboard/validate' },
        { label: 'Vender', icon: Coffee, path: '/dashboard/sell' },
        { label: 'Produtos', icon: Package, path: '/dashboard/products' },
        { label: 'Stock', icon: Package, path: '/dashboard/stocks' },
        { label: 'Histórico', icon: ScrollText, path: '/dashboard/sales' },
        { label: 'Relatórios', icon: TrendingUp, path: '/dashboard/reports' },
      ],
    },
  ],
  stationery: [
    {
      title: 'Papelaria',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Validar QR Code', icon: QrCode, path: '/dashboard/validate' },
        { label: 'Vender', icon: ShoppingBag, path: '/dashboard/sell' },
        { label: 'Produtos', icon: Package, path: '/dashboard/products' },
        { label: 'Stock', icon: Package, path: '/dashboard/stocks' },
        { label: 'Histórico', icon: ScrollText, path: '/dashboard/sales' },
        { label: 'Relatórios', icon: TrendingUp, path: '/dashboard/reports' },
      ],
    },
  ],
  staff_servicos: [
    {
      title: 'Serviços',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Validar QR Code', icon: QrCode, path: '/dashboard/validate' },
        { label: 'Vender', icon: ShoppingBag, path: '/dashboard/sell' },
        { label: 'Produtos', icon: Package, path: '/dashboard/products' },
        { label: 'Stock', icon: Package, path: '/dashboard/stocks' },
        { label: 'Histórico', icon: ScrollText, path: '/dashboard/sales' },
        { label: 'Relatórios', icon: TrendingUp, path: '/dashboard/reports' },
      ],
    },
  ],
  parent: [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Os meus filhos', icon: Users, path: '/dashboard/children' },
        { label: 'Nova Inscrição', icon: FileText, path: '/dashboard/enroll' },
        { label: 'Inscrições', icon: Clipboard, path: '/dashboard/my-enrollments' },
      ],
    },
    {
      title: 'Académico',
      items: [
        { label: 'Notas', icon: Award, path: '/dashboard/grades' },
        { label: 'Faltas', icon: ClipboardList, path: '/dashboard/attendance' },
        { label: 'Assiduidade', icon: CalendarCheck, path: '/dashboard/assiduidade' },
        { label: 'Horário', icon: Clock, path: '/dashboard/schedule' },
        { label: 'Calendário', icon: CalendarDays, path: '/dashboard/calendar' },
      ],
    },
    {
      title: 'Serviços',
      items: [
        { label: 'Refeições', icon: UtensilsCrossed, path: '/dashboard/meals' },
        { label: 'Ementa', icon: UtensilsCrossed, path: '/dashboard/menu' },
        { label: 'Carregar saldo', icon: Wallet, path: '/dashboard/topup' },
        { label: 'Movimentos', icon: DollarSign, path: '/dashboard/transactions' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { label: 'Avisos', icon: Bell, path: '/dashboard/announcements' },
        { label: 'Mensagens', icon: MessageSquare, path: '/dashboard/messages' },
        { label: 'Reuniões', icon: CalendarCheck, path: '/dashboard/meetings' },
      ],
    },
  ],
  student: [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'O meu QR Code', icon: QrCode, path: '/dashboard/qr' },
        { label: 'Saldo', icon: Wallet, path: '/dashboard/balance' },
      ],
    },
    {
      title: 'Académico',
      items: [
        { label: 'Horário', icon: Clock, path: '/dashboard/schedule' },
        { label: 'Notas', icon: Award, path: '/dashboard/grades' },
        { label: 'Faltas', icon: ClipboardList, path: '/dashboard/attendance' },
        { label: 'Trabalhos', icon: FileText, path: '/dashboard/homework' },
        { label: 'Testes', icon: ClipboardCheck, path: '/dashboard/exams' },
        { label: 'Calendário', icon: CalendarDays, path: '/dashboard/calendar' },
      ],
    },
    {
      title: 'Serviços',
      items: [
        { label: 'Ementa', icon: UtensilsCrossed, path: '/dashboard/menu' },
        { label: 'Compras', icon: ShoppingBag, path: '/dashboard/purchases' },
      ],
    },
    {
      title: 'Comunicação',
      items: [
        { label: 'Notificações', icon: Bell, path: '/dashboard/notifications' },
        { label: 'Mensagens', icon: MessageSquare, path: '/dashboard/messages' },
      ],
    },
  ],
};
