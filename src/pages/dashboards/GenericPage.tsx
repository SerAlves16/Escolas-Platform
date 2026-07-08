import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatCard, EmptyState, LoadingState } from '@/components/shared/StatCard';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import {
    Users, GraduationCap, BookOpen, Award, ClipboardList, UtensilsCrossed,
    Wallet, QrCode, Package, TrendingUp, Newspaper, CalendarDays, MessageSquare,
    Bell, Settings, FileImage, ScrollText, Coffee, ShoppingBag, CalendarCheck,
    FileText, ClipboardCheck, ListChecks, DollarSign, Clock, BookMarked,
    CalendarClock, UserCog, UserCheck, BarChart3, Plus, Search, Download,
    Check, X, Mail, MapPin
} from 'lucide-react';

const pageMeta: Record<string, { title: string; description: string; icon: any }> = {
    '/dashboard/users': { title: 'Gestão de Utilizadores', description: 'Gerir todos os utilizadores da plataforma', icon: Users },
    '/dashboard/teachers': { title: 'Professores', description: 'Gestão de professores', icon: GraduationCap },
    '/dashboard/students': { title: 'Alunos', description: 'Gestão de alunos', icon: UserCheck },
    '/dashboard/parents': { title: 'Encarregados de Educação', description: 'Gestão de encarregados', icon: Users },
    '/dashboard/staff': { title: 'Funcionários', description: 'Gestão de funcionários', icon: UserCog },
    '/dashboard/classes': { title: 'Turmas', description: 'Gestão de turmas', icon: BookOpen },
    '/dashboard/subjects': { title: 'Disciplinas', description: 'Gestão de disciplinas', icon: BookMarked },
    '/dashboard/schedules': { title: 'Horários', description: 'Gestão de horários', icon: Clock },
    '/dashboard/years': { title: 'Anos Letivos', description: 'Gestão de anos letivos', icon: CalendarClock },
    '/dashboard/grades': { title: 'Notas', description: 'Gestão de notas', icon: Award },
    '/dashboard/attendance': { title: 'Faltas', description: 'Gestão de faltas e assiduidade', icon: ClipboardList },
    '/dashboard/canteen': { title: 'Refeitório', description: 'Gestão do refeitório', icon: UtensilsCrossed },
    '/dashboard/bar': { title: 'Bar', description: 'Gestão do bar', icon: Coffee },
    '/dashboard/stationery': { title: 'Papelaria', description: 'Gestão da papelaria', icon: ShoppingBag },
    '/dashboard/products': { title: 'Produtos', description: 'Gestão de produtos', icon: Package },
    '/dashboard/stocks': { title: 'Stocks', description: 'Gestão de stocks', icon: Package },
    '/dashboard/balances': { title: 'Saldos', description: 'Gestão de saldos de alunos', icon: Wallet },
    '/dashboard/meetings': { title: 'Reuniões', description: 'Gestão de reuniões', icon: CalendarCheck },
    '/dashboard/news': { title: 'Notícias', description: 'Gestão de notícias', icon: Newspaper },
    '/dashboard/events': { title: 'Eventos', description: 'Gestão de eventos', icon: CalendarDays },
    '/dashboard/messages': { title: 'Mensagens', description: 'Mensagens internas', icon: MessageSquare },
    '/dashboard/notifications': { title: 'Notificações', description: 'Centro de notificações', icon: Bell },
    '/dashboard/logs': { title: 'Logs de Atividade', description: 'Registo de atividades', icon: ScrollText },
    '/dashboard/landing': { title: 'Landing Page', description: 'Editar conteúdo da página inicial', icon: FileImage },
    '/dashboard/settings': { title: 'Definições', description: 'Configurações gerais', icon: Settings },
    '/dashboard/stats': { title: 'Estatísticas', description: 'Estatísticas e gráficos', icon: BarChart3 },
    '/dashboard/validate': { title: 'Validar QR Code', description: 'Validar QR Code do aluno', icon: QrCode },
    '/dashboard/reservations': { title: 'Refeições Marcadas', description: 'Lista de refeições marcadas', icon: ListChecks },
    '/dashboard/menus': { title: 'Ementas', description: 'Gestão de ementas', icon: UtensilsCrossed },
    '/dashboard/reports': { title: 'Relatórios', description: 'Relatórios e estatísticas', icon: TrendingUp },
    '/dashboard/sell': { title: 'Vender', description: 'Registar venda', icon: Coffee },
    '/dashboard/sales': { title: 'Histórico de Vendas', description: 'Histórico de vendas', icon: ScrollText },
    '/dashboard/children': { title: 'Os meus filhos', description: 'Consultar filhos associados', icon: Users },
    '/dashboard/assiduidade': { title: 'Assiduidade', description: 'Consultar assiduidade', icon: CalendarCheck },
    '/dashboard/schedule': { title: 'Horário', description: 'Consultar horário', icon: Clock },
    '/dashboard/calendar': { title: 'Calendário Escolar', description: 'Calendário de eventos', icon: CalendarDays },
    '/dashboard/meals': { title: 'Refeições', description: 'Marcar e cancelar refeições', icon: UtensilsCrossed },
    '/dashboard/menu': { title: 'Ementa', description: 'Consultar ementa', icon: UtensilsCrossed },
    '/dashboard/topup': { title: 'Carregar Saldo', description: 'Carregar saldo do aluno', icon: Wallet },
    '/dashboard/transactions': { title: 'Movimentos', description: 'Movimentos financeiros', icon: DollarSign },
    '/dashboard/announcements': { title: 'Avisos', description: 'Avisos importantes', icon: Bell },
    '/dashboard/qr': { title: 'O meu QR Code', description: 'QR Code pessoal', icon: QrCode },
    '/dashboard/balance': { title: 'Saldo', description: 'Consultar saldo disponível', icon: Wallet },
    '/dashboard/purchases': { title: 'Histórico de Compras', description: 'Histórico de compras', icon: ShoppingBag },
    '/dashboard/homework': { title: 'Trabalhos de Casa', description: 'Trabalhos de casa', icon: FileText },
    '/dashboard/exams': { title: 'Testes', description: 'Datas de testes', icon: ClipboardCheck },
    '/dashboard/my-class': { title: 'A minha turma', description: 'Gestão da turma', icon: BookOpen },
    '/dashboard/justifications': { title: 'Justificações', description: 'Aprovar justificações de faltas', icon: ListChecks },
};

export default function GenericPage() {
    const location = useLocation();
    const path = location.pathname;
    const meta = pageMeta[path] || { title: 'Página', description: '', icon: FileText };
    const Icon = meta.icon;

    // Route to specific page content
    if (path === '/dashboard/qr') return <QRCodePage />;
    if (path === '/dashboard/balance') return <BalancePage />;
    if (path === '/dashboard/validate') return <ValidateQRPage />;
    if (path === '/dashboard/landing') return <LandingEditorPage />;
    if (path === '/dashboard/settings') return <SettingsPage />;
    if (path === '/dashboard/messages') return <MessagesPage />;
    if (path === '/dashboard/notifications') return <NotificationsPage />;
    if (path === '/dashboard/menu') return <MenuPage />;
    if (path === '/dashboard/meals') return <MealsPage />;
    if (path === '/dashboard/topup') return <TopUpPage />;
    if (path === '/dashboard/transactions') return <TransactionsPage />;
    if (path === '/dashboard/schedule') return <ScheduleViewPage />;
    if (path === '/dashboard/calendar') return <CalendarPage />;
    if (path === '/dashboard/announcements') return <AnnouncementsPage />;
    if (path === '/dashboard/purchases') return <PurchasesPage />;
    if (path === '/dashboard/homework') return <HomeworkPage />;
    if (path === '/dashboard/exams') return <ExamsPage />;
    if (path === '/dashboard/logs') return <LogsPage />;
    if (path === '/dashboard/stats') return <StatsPage />;
    if (path === '/dashboard/sell') return <SellPage />;
    if (path === '/dashboard/reports') return <ReportsPage />;

    // Default: data table page
    return <DataTablePage path={path} title={meta.title} description={meta.description} icon={Icon} />;
}

// --- QR Code Page (Student) ---
function QRCodePage() {
    const { profile } = useAuth();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data } = await supabase.from('students').select('*').eq('profile_id', profile.id).maybeSingle();
            setStudent(data);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    const qrValue = student?.qr_token || `STUDENT:${profile?.id}`;

    return (
        <div>
            <PageHeader title="O meu QR Code" description="Apresente este código no refeitório, bar e papelaria" />
            <div className="flex flex-col items-center justify-center py-8">
                <Card className="p-8 max-w-sm w-full">
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-center">
                            <p className="font-semibold text-lg">{profile?.full_name}</p>
                            <p className="text-sm text-muted-foreground">Nº {student?.student_number || '—'}</p>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border-2 border-primary/20">
                            <QRCodeSVG value={qrValue} size={200} level="H" />
                        </div>
                        <div className="text-center">
                            <Badge variant="secondary" className="mb-2">Saldo disponível</Badge>
                            <p className="text-2xl font-bold">{student?.balance?.toFixed(2) ?? '0.00'} €</p>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => window.print()}>
                            <Download className="mr-2 h-4 w-4" /> Imprimir QR Code
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

// --- Balance Page (Student) ---
function BalancePage() {
    const { profile } = useAuth();
    const [student, setStudent] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data: studentData } = await supabase.from('students').select('*').eq('profile_id', profile.id).maybeSingle();
            setStudent(studentData);
            if (studentData) {
                const { data: txData } = await supabase.from('balance_transactions').select('*').eq('student_id', studentData.id).order('created_at', { ascending: false }).limit(20);
                setTransactions(txData ?? []);
            }
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Saldo" description="Consultar saldo e movimentos" />
            <div className="grid md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Saldo atual" value={`${(student?.balance ?? 0).toFixed(2)} €`} icon={Wallet} color="blue" />
                <StatCard title="Carregamentos" value={transactions.filter(t => t.type === 'credit').length} icon={TrendingUp} color="emerald" />
                <StatCard title="Gastos" value={transactions.filter(t => t.type === 'debit').length} icon={DollarSign} color="orange" />
            </div>
            <Card>
                <CardHeader><CardTitle className="text-base">Movimentos recentes</CardTitle></CardHeader>
                <CardContent>
                    {transactions.length === 0 ? (
                        <EmptyState icon={DollarSign} title="Sem movimentos" description="Ainda não há movimentos registados." />
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                            {tx.type === 'credit' ? <Plus className="h-4 w-4 text-emerald-600" /> : <DollarSign className="h-4 w-4 text-red-600" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{tx.description || (tx.type === 'credit' ? 'Carregamento' : 'Débito')}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString('pt-PT')}</p>
                                        </div>
                                    </div>
                                    <span className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} €
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// --- Validate QR Code (Canteen/Bar/Stationery) ---
function ValidateQRPage() {
    const [token, setToken] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleValidate = async () => {
        if (!token) return;
        setLoading(true);
        const { data: student } = await supabase.from('students').select('*, profile:profiles(*)').eq('qr_token', token).maybeSingle();
        setResult(student);
        setLoading(false);
    };

    return (
        <div>
            <PageHeader title="Validar QR Code" description="Leia ou insira o código do aluno" />
            <Card className="max-w-md mx-auto">
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="qr">Código do aluno</Label>
                        <Input id="qr" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Escaneie ou digite o código" onKeyDown={(e) => e.key === 'Enter' && handleValidate()} />
                    </div>
                    <Button onClick={handleValidate} disabled={loading || !token} className="w-full">
                        {loading ? 'A validar...' : 'Validar'}
                    </Button>
                    {result && (
                        <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold">{result.profile?.full_name}</p>
                                    <p className="text-sm text-muted-foreground">Nº {result.student_number} · Saldo: {result.balance?.toFixed(2)} €</p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                <Check className="h-3 w-3 mr-1" /> Validado
                            </Badge>
                        </div>
                    )}
                    {token && !result && !loading && (
                        <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                            <X className="h-4 w-4" /> Código não encontrado
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// --- Landing Page Editor ---
function LandingEditorPage() {
    const { profile } = useAuth();
    const [school, setSchool] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('schools').select('*').eq('id', profile.school_id).maybeSingle();
            setSchool(data);
            setLoading(false);
        })();
    }, [profile]);

    const handleSave = async () => {
        setSaving(true);
        await supabase.from('schools').update({
            name: school.name,
            motto: school.motto,
            logo_url: school.logo_url,
            hero_image_url: school.hero_image_url,
            address: school.address,
            city: school.city,
            postal_code: school.postal_code,
            phone: school.phone,
            email: school.email,
            website: school.website,
            latitude: school.latitude,
            longitude: school.longitude,
            primary_color: school.primary_color,
            secondary_color: school.secondary_color,
        }).eq('id', school.id);
        setSaving(false);
    };

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader
                title="Editar Landing Page"
                description="Personalize o website institucional da escola"
                action={<Button onClick={handleSave} disabled={saving}>{saving ? 'A guardar...' : 'Guardar alterações'}</Button>}
            />
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-base">Identidade</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da escola</Label>
                            <Input value={school?.name || ''} onChange={(e) => setSchool({ ...school, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Lema</Label>
                            <Input value={school?.motto || ''} onChange={(e) => setSchool({ ...school, motto: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>URL do logótipo</Label>
                            <Input value={school?.logo_url || ''} onChange={(e) => setSchool({ ...school, logo_url: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <Label>URL da imagem hero</Label>
                            <Input value={school?.hero_image_url || ''} onChange={(e) => setSchool({ ...school, hero_image_url: e.target.value })} placeholder="https://..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cor primária</Label>
                                <div className="flex gap-2">
                                    <Input type="color" value={school?.primary_color || '#2563eb'} onChange={(e) => setSchool({ ...school, primary_color: e.target.value })} className="h-9 w-12 p-1" />
                                    <Input value={school?.primary_color || ''} onChange={(e) => setSchool({ ...school, primary_color: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Cor secundária</Label>
                                <div className="flex gap-2">
                                    <Input type="color" value={school?.secondary_color || '#0ea5e9'} onChange={(e) => setSchool({ ...school, secondary_color: e.target.value })} className="h-9 w-12 p-1" />
                                    <Input value={school?.secondary_color || ''} onChange={(e) => setSchool({ ...school, secondary_color: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-base">Contactos e Localização</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Morada</Label>
                            <Input value={school?.address || ''} onChange={(e) => setSchool({ ...school, address: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Código Postal</Label>
                                <Input value={school?.postal_code || ''} onChange={(e) => setSchool({ ...school, postal_code: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Cidade</Label>
                                <Input value={school?.city || ''} onChange={(e) => setSchool({ ...school, city: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input value={school?.phone || ''} onChange={(e) => setSchool({ ...school, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={school?.email || ''} onChange={(e) => setSchool({ ...school, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Website</Label>
                            <Input value={school?.website || ''} onChange={(e) => setSchool({ ...school, website: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Latitude</Label>
                                <Input type="number" value={school?.latitude || ''} onChange={(e) => setSchool({ ...school, latitude: parseFloat(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Longitude</Label>
                                <Input type="number" value={school?.longitude || ''} onChange={(e) => setSchool({ ...school, longitude: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Settings Page ---
function SettingsPage() {
    const { profile, refreshProfile } = useAuth();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [phone, setPhone] = useState(profile?.phone || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile?.id);
        await refreshProfile();
        setSaving(false);
    };

    return (
        <div>
            <PageHeader title="Definições" description="Gerir o seu perfil e preferências" />
            <Card className="max-w-2xl">
                <CardHeader><CardTitle className="text-base">O meu perfil</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nome completo</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profile?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'A guardar...' : 'Guardar'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Messages Page ---
function MessagesPage() {
    const { profile } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data } = await supabase.from('messages').select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)').or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`).order('created_at', { ascending: false });
            setMessages(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Mensagens" description="Mensagens internas" action={<Button><Plus className="mr-2 h-4 w-4" /> Nova mensagem</Button>} />
            {messages.length === 0 ? (
                <Card><CardContent><EmptyState icon={MessageSquare} title="Sem mensagens" description="Ainda não tem mensagens." /></CardContent></Card>
            ) : (
                <div className="space-y-2">
                    {messages.map((msg) => (
                        <Card key={msg.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-medium text-sm">{msg.sender?.full_name || '—'}</p>
                                        <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString('pt-PT')}</span>
                                    </div>
                                    <p className="text-sm font-medium truncate">{msg.subject || '(sem assunto)'}</p>
                                    <p className="text-sm text-muted-foreground truncate">{msg.body}</p>
                                </div>
                                {!msg.read_at && msg.receiver_id === profile?.id && <Badge variant="default" className="shrink-0">Novo</Badge>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Notifications Page ---
function NotificationsPage() {
    const { profile } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data } = await supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
            setNotifications(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Notificações" description="Centro de notificações" />
            {notifications.length === 0 ? (
                <Card><CardContent><EmptyState icon={Bell} title="Sem notificações" /></CardContent></Card>
            ) : (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <Card key={n.id} className={n.read ? '' : 'border-primary/40'}>
                            <CardContent className="p-4 flex items-start gap-3">
                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${n.read ? 'bg-muted' : 'bg-primary/10'}`}>
                                    <Bell className={`h-4 w-4 ${n.read ? 'text-muted-foreground' : 'text-primary'}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-sm">{n.title}</p>
                                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString('pt-PT')}</p>
                                </div>
                                {!n.read && <Badge variant="default" className="shrink-0">Novo</Badge>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Menu Page (view ementa) ---
function MenuPage() {
    const [menus, setMenus] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from('menus').select('*').order('date', { ascending: true }).limit(14);
            setMenus(data ?? []);
            setLoading(false);
        })();
    }, []);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Ementa" description="Ementa do refeitório" />
            {menus.length === 0 ? (
                <Card><CardContent><EmptyState icon={UtensilsCrossed} title="Sem ementa" description="A ementa ainda não foi publicada." /></CardContent></Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menus.map((menu) => (
                        <Card key={menu.id}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-semibold">{new Date(menu.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                    <Badge variant="secondary">{menu.meal_type === 'lunch' ? 'Almoço' : menu.meal_type === 'snack' ? 'Lanche' : 'Jantar'}</Badge>
                                </div>
                                <div className="space-y-1 text-sm">
                                    {menu.soup && <p><span className="text-muted-foreground">Sopa:</span> {menu.soup}</p>}
                                    {menu.main_course && <p><span className="text-muted-foreground">Prato:</span> {menu.main_course}</p>}
                                    {menu.dessert && <p><span className="text-muted-foreground">Sobremesa:</span> {menu.dessert}</p>}
                                    {menu.price > 0 && <p className="font-medium pt-2">{menu.price.toFixed(2)} €</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Meals Page (Parent: mark/cancel meals) ---
function MealsPage() {
    const { profile } = useAuth();
    const [reservations, setReservations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data: parent } = await supabase.from('parents').select('id').eq('profile_id', profile.id).maybeSingle();
            if (parent) {
                const { data: rel } = await supabase.from('parent_students').select('student_id').eq('parent_id', parent.id);
                const studentIds = (rel ?? []).map(r => r.student_id);
                if (studentIds.length > 0) {
                    const { data: res } = await supabase.from('meal_reservations').select('*, student:students(*)').in('student_id', studentIds).order('date', { ascending: false });
                    setReservations(res ?? []);
                }
            }
            setLoading(false);
        })();
    }, [profile]);

    const cancelReservation = async (id: string) => {
        await supabase.from('meal_reservations').update({ status: 'cancelled' }).eq('id', id);
        setReservations(reservations.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    };

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Refeições" description="Marcar e cancelar refeições" action={<Button><Plus className="mr-2 h-4 w-4" /> Marcar refeição</Button>} />
            {reservations.length === 0 ? (
                <Card><CardContent><EmptyState icon={UtensilsCrossed} title="Sem refeições marcadas" /></CardContent></Card>
            ) : (
                <div className="space-y-2">
                    {reservations.map((res) => (
                        <Card key={res.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                        <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{new Date(res.date).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                        <p className="text-xs text-muted-foreground">{res.student?.student_number || ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant={res.status === 'reserved' ? 'default' : res.status === 'served' ? 'secondary' : 'destructive'}>
                                        {res.status === 'reserved' ? 'Marcada' : res.status === 'served' ? 'Servida' : 'Cancelada'}
                                    </Badge>
                                    {res.status === 'reserved' && (
                                        <Button variant="outline" size="sm" onClick={() => cancelReservation(res.id)}>Cancelar</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- TopUp Page (Parent: load balance) ---
function TopUpPage() {
    const { profile } = useAuth();
    const [students, setStudents] = useState<any[]>([]);
    const [amount, setAmount] = useState(10);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data: parent } = await supabase.from('parents').select('id').eq('profile_id', profile.id).maybeSingle();
            if (parent) {
                const { data: rel } = await supabase.from('parent_students').select('student:students(*, profile:profiles(*))').eq('parent_id', parent.id);
                setStudents((rel ?? []).map((r: any) => r.student));
            }
            setLoading(false);
        })();
    }, [profile]);

    const handleTopUp = async () => {
        if (!selectedStudent || amount <= 0) return;
        const { data: student } = await supabase.from('students').select('*').eq('id', selectedStudent).maybeSingle();
        if (student) {
            await supabase.from('students').update({ balance: student.balance + amount }).eq('id', selectedStudent);
            await supabase.from('balance_transactions').insert({
                school_id: student.school_id,
                student_id: selectedStudent,
                amount,
                type: 'credit',
                description: 'Carregamento de saldo',
                created_by: profile?.id,
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Carregar Saldo" description="Carregar saldo do aluno" />
            <Card className="max-w-md">
                <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                        <Label>Aluno</Label>
                        <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                            <option value="">Selecione um aluno</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>{s.profile?.full_name} (Saldo: {s.balance?.toFixed(2)} €)</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>Valor (€)</Label>
                        <Input type="number" min="1" step="0.50" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
                    </div>
                    <div className="flex gap-2">
                        {[5, 10, 20, 50].map((v) => (
                            <Button key={v} variant="outline" size="sm" onClick={() => setAmount(v)}>{v} €</Button>
                        ))}
                    </div>
                    <Button onClick={handleTopUp} disabled={!selectedStudent || amount <= 0} className="w-full">
                        <Wallet className="mr-2 h-4 w-4" /> Carregar {amount.toFixed(2)} €
                    </Button>
                    {success && <p className="text-sm text-emerald-600 text-center">Saldo carregado com sucesso!</p>}
                </CardContent>
            </Card>
        </div>
    );
}

// --- Transactions Page ---
function TransactionsPage() {
    const { profile } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data: parent } = await supabase.from('parents').select('id').eq('profile_id', profile.id).maybeSingle();
            if (parent) {
                const { data: rel } = await supabase.from('parent_students').select('student_id').eq('parent_id', parent.id);
                const studentIds = (rel ?? []).map(r => r.student_id);
                if (studentIds.length > 0) {
                    const { data: txs } = await supabase.from('balance_transactions').select('*, student:students(*)').in('student_id', studentIds).order('created_at', { ascending: false }).limit(50);
                    setTransactions(txs ?? []);
                }
            }
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Movimentos Financeiros" description="Histórico de movimentos de saldo" action={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>} />
            {transactions.length === 0 ? (
                <Card><CardContent><EmptyState icon={DollarSign} title="Sem movimentos" /></CardContent></Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                            {tx.type === 'credit' ? <Plus className="h-4 w-4 text-emerald-600" /> : <DollarSign className="h-4 w-4 text-red-600" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{tx.description || (tx.type === 'credit' ? 'Carregamento' : 'Compra')}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString('pt-PT')}</p>
                                        </div>
                                    </div>
                                    <span className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} €
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// --- Schedule View Page ---
function ScheduleViewPage() {
    const { profile } = useAuth();
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('schedules').select('*, subject:subjects(*), teacher:profiles(*)').eq('school_id', profile.school_id).order('day_of_week').order('start_time');
            setSchedules(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return (
        <div>
            <PageHeader title="Horário" description="Horário de aulas" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((day) => (
                    <Card key={day}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">{days[day]}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {schedules.filter(s => s.day_of_week === day).map((s) => (
                                <div key={s.id} className="p-2 rounded-lg border bg-muted/30">
                                    <p className="text-xs font-medium">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</p>
                                    <p className="text-sm font-semibold">{s.subject?.name}</p>
                                    {s.room && <p className="text-xs text-muted-foreground">Sala {s.room}</p>}
                                </div>
                            ))}
                            {schedules.filter(s => s.day_of_week === day).length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4">Sem aulas</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// --- Calendar Page ---
function CalendarPage() {
    const { profile } = useAuth();
    void profile;
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('events').select('*').eq('school_id', profile.school_id).order('start_date', { ascending: true });
            setEvents(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Calendário Escolar" description="Eventos e datas importantes" />
            {events.length === 0 ? (
                <Card><CardContent><EmptyState icon={CalendarDays} title="Sem eventos" /></CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {events.map((event) => (
                        <Card key={event.id}>
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg p-3 min-w-16">
                                    <span className="text-xl font-bold">{new Date(event.start_date).getDate()}</span>
                                    <span className="text-xs uppercase">{new Date(event.start_date).toLocaleDateString('pt-PT', { month: 'short' })}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{event.title}</p>
                                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                                    {event.location && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Announcements Page ---
function AnnouncementsPage() {
    const { profile } = useAuth();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('announcements').select('*').eq('school_id', profile.school_id).order('created_at', { ascending: false });
            setAnnouncements(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Avisos" description="Avisos importantes da escola" />
            {announcements.length === 0 ? (
                <Card><CardContent><EmptyState icon={Bell} title="Sem avisos" /></CardContent></Card>
            ) : (
                <div className="space-y-3">
                    {announcements.map((ann) => (
                        <Card key={ann.id} className={ann.priority === 'urgent' ? 'border-red-300 dark:border-red-800' : ''}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="font-semibold">{ann.title}</p>
                                    <Badge variant={ann.priority === 'urgent' ? 'destructive' : ann.priority === 'high' ? 'default' : 'secondary'}>
                                        {ann.priority}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{ann.content}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(ann.created_at).toLocaleDateString('pt-PT')}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Purchases Page (Student) ---
function PurchasesPage() {
    const { profile } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile) return;
            const { data: student } = await supabase.from('students').select('id').eq('profile_id', profile.id).maybeSingle();
            if (student) {
                const { data } = await supabase.from('sales').select('*, product:products(*)').eq('student_id', student.id).order('created_at', { ascending: false }).limit(30);
                setSales(data ?? []);
            }
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Histórico de Compras" description="As suas compras no bar e papelaria" />
            {sales.length === 0 ? (
                <Card><CardContent><EmptyState icon={ShoppingBag} title="Sem compras" /></CardContent></Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {sales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{sale.product?.name || 'Produto'}</p>
                                            <p className="text-xs text-muted-foreground">{sale.quantity}x · {new Date(sale.created_at).toLocaleString('pt-PT')}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold">{sale.total.toFixed(2)} €</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// --- Homework Page ---
function HomeworkPage() {
    const { profile } = useAuth();
    const [homework, setHomework] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('homework').select('*, subject:subjects(*), class:classes(*)').eq('school_id', profile.school_id).order('due_date', { ascending: true });
            setHomework(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Trabalhos de Casa" description="Trabalhos e tarefas" action={<Button><Plus className="mr-2 h-4 w-4" /> Novo trabalho</Button>} />
            {homework.length === 0 ? (
                <Card><CardContent><EmptyState icon={FileText} title="Sem trabalhos" /></CardContent></Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {homework.map((hw) => (
                        <Card key={hw.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <p className="font-semibold">{hw.title}</p>
                                    <Badge variant={new Date(hw.due_date) < new Date() ? 'destructive' : 'secondary'}>
                                        {new Date(hw.due_date).toLocaleDateString('pt-PT')}
                                    </Badge>
                                </div>
                                {hw.description && <p className="text-sm text-muted-foreground">{hw.description}</p>}
                                <p className="text-xs text-muted-foreground mt-2">{hw.subject?.name} · {hw.class?.name}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Exams Page ---
function ExamsPage() {
    const { profile } = useAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('exams').select('*, subject:subjects(*), class:classes(*)').eq('school_id', profile.school_id).order('date', { ascending: true });
            setExams(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Testes" description="Datas de testes e avaliações" action={<Button><Plus className="mr-2 h-4 w-4" /> Marcar teste</Button>} />
            {exams.length === 0 ? (
                <Card><CardContent><EmptyState icon={ClipboardCheck} title="Sem testes" /></CardContent></Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exams.map((exam) => (
                        <Card key={exam.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg p-2 min-w-12">
                                        <span className="text-lg font-bold">{new Date(exam.date).getDate()}</span>
                                        <span className="text-xs uppercase">{new Date(exam.date).toLocaleDateString('pt-PT', { month: 'short' })}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{exam.title}</p>
                                        <p className="text-xs text-muted-foreground">{exam.subject?.name} · {exam.class?.name}</p>
                                    </div>
                                </div>
                                {exam.topics && <p className="text-sm text-muted-foreground">{exam.topics}</p>}
                                {exam.room && <p className="text-xs text-muted-foreground mt-1">Sala {exam.room}</p>}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Logs Page ---
function LogsPage() {
    const { profile } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('activity_logs').select('*, user:profiles(*)').eq('school_id', profile.school_id).order('created_at', { ascending: false }).limit(100);
            setLogs(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Logs de Atividade" description="Registo de atividades do sistema" />
            {logs.length === 0 ? (
                <Card><CardContent><EmptyState icon={ScrollText} title="Sem logs" /></CardContent></Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="divide-y max-h-[600px] overflow-y-auto scrollbar-thin">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-center gap-3 p-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <ScrollText className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{log.action}</p>
                                        <p className="text-xs text-muted-foreground">{log.user?.full_name || 'Sistema'} · {new Date(log.created_at).toLocaleString('pt-PT')}</p>
                                    </div>
                                    {log.entity && <Badge variant="outline" className="shrink-0">{log.entity}</Badge>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// --- Stats Page ---
function StatsPage() {
    const [chartData] = useState(() =>
        ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'].map((m) => ({
            month: m,
            alunos: 800 + Math.floor(Math.random() * 400),
            refeicoes: 300 + Math.floor(Math.random() * 200),
            vendas: 150 + Math.floor(Math.random() * 100),
        }))
    );

    return (
        <div>
            <PageHeader title="Estatísticas" description="Estatísticas e gráficos da escola" />
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="text-base">Alunos ativos</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAl" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="alunos" stroke="#3b82f6" fill="url(#colorAl)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Refeições vs Vendas</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="refeicoes" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="vendas" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Sell Page (Bar/Stationery) ---
function SellPage() {
    const { profile } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<any[]>([]);
    const [studentToken, setStudentToken] = useState('');
    const [student, setStudent] = useState<any>(null);

    const outletType = profile?.role === 'bar' ? 'bar' : profile?.role === 'stationery' ? 'stationery' : 'bar';

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('products').select('*').eq('school_id', profile.school_id).eq('outlet_type', outletType).eq('is_active', true).order('name');
            setProducts(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    const addToCart = (product: any) => {
        const existing = cart.find((c) => c.id === product.id);
        if (existing) {
            setCart(cart.map((c) => c.id === product.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id: string) => setCart(cart.filter((c) => c.id !== id));

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const lookupStudent = async () => {
        if (!studentToken) return;
        const { data } = await supabase.from('students').select('*, profile:profiles(*)').eq('qr_token', studentToken).maybeSingle();
        setStudent(data);
    };

    const checkout = async () => {
        if (cart.length === 0) return;
        for (const item of cart) {
            await supabase.from('sales').insert({
                school_id: profile?.school_id,
                student_id: student?.id || null,
                product_id: item.id,
                outlet_type: outletType,
                quantity: item.qty,
                unit_price: item.price,
                total: item.price * item.qty,
                payment_method: student ? 'balance' : 'cash',
                served_by: profile?.id,
            });
            await supabase.from('products').update({ stock: item.stock - item.qty }).eq('id', item.id);
            if (student) {
                await supabase.from('students').update({ balance: student.balance - (item.price * item.qty) }).eq('id', student.id);
                await supabase.from('balance_transactions').insert({
                    school_id: profile?.school_id,
                    student_id: student.id,
                    amount: item.price * item.qty,
                    type: 'debit',
                    description: `Compra: ${item.name}`,
                    created_by: profile?.id,
                });
            }
        }
        setCart([]);
        setStudent(null);
        setStudentToken('');
    };

    if (loading) return <LoadingState />;

    return (
        <div>
            <PageHeader title="Vender" description={`Venda de produtos - ${outletType === 'bar' ? 'Bar' : 'Papelaria'}`} />
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {products.map((p) => (
                            <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addToCart(p)}>
                                <CardContent className="p-4 text-center">
                                    <p className="font-medium text-sm">{p.name}</p>
                                    <p className="text-lg font-bold text-primary mt-1">{p.price.toFixed(2)} €</p>
                                    <p className="text-xs text-muted-foreground">Stock: {p.stock}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <Card className="h-fit sticky top-4">
                    <CardHeader><CardTitle className="text-base">Carrinho</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <Label>Aluno (opcional)</Label>
                            <div className="flex gap-2">
                                <Input value={studentToken} onChange={(e) => setStudentToken(e.target.value)} placeholder="QR Code" />
                                <Button size="icon" onClick={lookupStudent}><Search className="h-4 w-4" /></Button>
                            </div>
                            {student && <p className="text-sm text-emerald-600">{student.profile?.full_name} · Saldo: {student.balance?.toFixed(2)} €</p>}
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.qty}x {item.price.toFixed(2)} €</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}><X className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Carrinho vazio</p>}
                        </div>
                        <div className="border-t pt-3">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold">Total</span>
                                <span className="text-xl font-bold">{total.toFixed(2)} €</span>
                            </div>
                            <Button onClick={checkout} disabled={cart.length === 0} className="w-full">
                                Finalizar venda
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// --- Reports Page ---
function ReportsPage() {
    const { profile } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!profile?.school_id) { setLoading(false); return; }
            const { data } = await supabase.from('sales').select('*, product:products(*)').eq('school_id', profile.school_id).order('created_at', { ascending: false }).limit(50);
            setSales(data ?? []);
            setLoading(false);
        })();
    }, [profile]);

    if (loading) return <LoadingState />;

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);

    return (
        <div>
            <PageHeader title="Relatórios" description="Relatórios e estatísticas de vendas" action={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar PDF</Button>} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title="Receita total" value={`${totalRevenue.toFixed(2)} €`} icon={DollarSign} color="emerald" />
                <StatCard title="Vendas" value={sales.length} icon={TrendingUp} color="blue" />
                <StatCard title="Itens vendidos" value={totalItems} icon={Package} color="orange" />
                <StatCard title="Ticket médio" value={sales.length > 0 ? `${(totalRevenue / sales.length).toFixed(2)} €` : '0.00 €'} icon={BarChart3} color="violet" />
            </div>
            <Card>
                <CardHeader><CardTitle className="text-base">Histórico de vendas</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y max-h-[500px] overflow-y-auto scrollbar-thin">
                        {sales.length === 0 ? (
                            <EmptyState icon={TrendingUp} title="Sem vendas" />
                        ) : sales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-3">
                                <div>
                                    <p className="text-sm font-medium">{sale.product?.name || 'Produto'}</p>
                                    <p className="text-xs text-muted-foreground">{sale.quantity}x · {new Date(sale.created_at).toLocaleString('pt-PT')}</p>
                                </div>
                                <span className="font-semibold">{sale.total.toFixed(2)} €</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// --- Generic Data Table Page ---
function DataTablePage({ path, title, description, icon: Icon }: { path: string; title: string; description: string; icon: any }) {
    const { profile } = useAuth();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const tableMap: Record<string, string> = {
        '/dashboard/users': 'profiles',
        '/dashboard/teachers': 'teachers',
        '/dashboard/students': 'students',
        '/dashboard/parents': 'parents',
        '/dashboard/staff': 'staff',
        '/dashboard/classes': 'classes',
        '/dashboard/subjects': 'subjects',
        '/dashboard/schedules': 'schedules',
        '/dashboard/years': 'classes',
        '/dashboard/grades': 'grades',
        '/dashboard/attendance': 'attendance',
        '/dashboard/products': 'products',
        '/dashboard/stocks': 'products',
        '/dashboard/balances': 'students',
        '/dashboard/meetings': 'meetings',
        '/dashboard/news': 'news',
        '/dashboard/events': 'events',
        '/dashboard/reservations': 'meal_reservations',
        '/dashboard/menus': 'menus',
        '/dashboard/sales': 'sales',
        '/dashboard/children': 'students',
        '/dashboard/my-class': 'classes',
        '/dashboard/justifications': 'attendance',
    };

    const table = tableMap[path];

    useEffect(() => {
        (async () => {
            if (!profile?.school_id || !table) { setLoading(false); return; }
            let query = supabase.from(table).select('*');
            if (table !== 'profiles') query = query.eq('school_id', profile.school_id);
            const { data } = await query.order('created_at', { ascending: false }).limit(50);
            setData(data ?? []);
            setLoading(false);
        })();
    }, [profile, table]);

    if (loading) return <LoadingState />;

    const filtered = data.filter((row) =>
        Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <PageHeader
                title={title}
                description={description}
                action={<Button><Plus className="mr-2 h-4 w-4" /> Adicionar</Button>}
            />
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                        <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
                    </div>
                    {filtered.length === 0 ? (
                        <EmptyState icon={Icon} title="Sem dados" description="Ainda não há registos." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        {Object.keys(filtered[0]).filter((k) => !['id', 'school_id', 'updated_at', 'created_at'].includes(k)).slice(0, 6).map((key) => (
                                            <th key={key} className="text-left p-2 font-medium text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</th>
                                        ))}
                                        <th className="text-right p-2 font-medium text-muted-foreground">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((row) => (
                                        <tr key={row.id} className="border-b hover:bg-muted/50">
                                            {Object.entries(row).filter(([k]) => !['id', 'school_id', 'updated_at', 'created_at'].includes(k)).slice(0, 6).map(([key, value]) => (
                                                <td key={key} className="p-2">
                                                    {typeof value === 'object' ? '—' : String(value ?? '—').slice(0, 50)}
                                                </td>
                                            ))}
                                            <td className="p-2 text-right">
                                                <Button variant="ghost" size="sm">Editar</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
