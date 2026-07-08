import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { StatCard, LoadingState } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/types';
import {
    Users, GraduationCap, BookOpen, DollarSign, UtensilsCrossed,
    TrendingUp, Award, ClipboardList, CalendarCheck, Wallet, QrCode,
    Newspaper, CalendarDays, Package, Coffee, ShoppingBag
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardHome() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Record<string, number>>({});
    const [chartData, setChartData] = useState<any[]>([]);
    const [pieData, setPieData] = useState<any[]>([]);

    useEffect(() => {
        if (profile) loadDashboardData();
    }, [profile]);

    const loadDashboardData = async () => {
        if (!profile?.school_id) {
            setLoading(false);
            return;
        }
        const sid = profile.school_id;

        const [studentsRes, teachersRes, classesRes, parentsRes, newsRes, eventsRes, productsRes] = await Promise.all([
            supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', sid),
            supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', sid),
            supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', sid),
            supabase.from('parents').select('*', { count: 'exact', head: true }).eq('school_id', sid),
            supabase.from('news').select('*', { count: 'exact', head: true }).eq('school_id', sid),
            supabase.from('events').select('*', { count: 'exact', head: true }).eq('school_id', sid),
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('school_id', sid),
        ]);

        setStats({
            students: studentsRes.count ?? 0,
            teachers: teachersRes.count ?? 0,
            classes: classesRes.count ?? 0,
            parents: parentsRes.count ?? 0,
            news: newsRes.count ?? 0,
            events: eventsRes.count ?? 0,
            products: productsRes.count ?? 0,
        });

        // Mock chart data for demo
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
        setChartData(months.map((m) => ({
            month: m,
            refeicoes: 400 + Math.floor(Math.random() * 200),
            vendas: 200 + Math.floor(Math.random() * 150),
        })));

        setPieData([
            { name: 'Alunos', value: studentsRes.count ?? 0, color: '#3b82f6' },
            { name: 'Professores', value: teachersRes.count ?? 0, color: '#10b981' },
            { name: 'Encarregados', value: parentsRes.count ?? 0, color: '#f59e0b' },
            { name: 'Funcionários', value: 15, color: '#8b5cf6' },
        ]);

        setLoading(false);
    };

    if (loading) return <LoadingState />;

    const role = profile?.role;
    const firstName = profile?.full_name?.split(' ')[0] ?? '';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Olá, {firstName}!</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Bem-vindo à sua área pessoal · <Badge variant="secondary">{profile ? ROLE_LABELS[profile.role] : ''}</Badge>
                </p>
            </div>

            {/* Stats grid - adapts to role */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {role === 'admin' || role === 'direction' ? (
                    <>
                        <StatCard title="Alunos" value={stats.students ?? 0} icon={GraduationCap} color="blue" />
                        <StatCard title="Professores" value={stats.teachers ?? 0} icon={Users} color="emerald" />
                        <StatCard title="Turmas" value={stats.classes ?? 0} icon={BookOpen} color="orange" />
                        <StatCard title="Encarregados" value={stats.parents ?? 0} icon={Users} color="violet" />
                    </>
                ) : role === 'teacher' || role === 'class_director' ? (
                    <>
                        <StatCard title="Turmas" value={stats.classes ?? 0} icon={BookOpen} color="blue" />
                        <StatCard title="Alunos" value={stats.students ?? 0} icon={GraduationCap} color="emerald" />
                        <StatCard title="Avaliações" value="—" icon={Award} color="orange" />
                        <StatCard title="Reuniões" value="—" icon={CalendarCheck} color="violet" />
                    </>
                ) : role === 'parent' ? (
                    <>
                        <StatCard title="Filhos" value="—" icon={Users} color="blue" />
                        <StatCard title="Saldo total" value="—" icon={Wallet} color="emerald" />
                        <StatCard title="Refeições" value="—" icon={UtensilsCrossed} color="orange" />
                        <StatCard title="Avisos" value="—" icon={Newspaper} color="violet" />
                    </>
                ) : role === 'student' ? (
                    <>
                        <StatCard title="Saldo" value="—" icon={Wallet} color="blue" />
                        <StatCard title="Notas" value="—" icon={Award} color="emerald" />
                        <StatCard title="Faltas" value="—" icon={ClipboardList} color="orange" />
                        <StatCard title="QR Code" value="Ativo" icon={QrCode} color="violet" />
                    </>
                ) : role === 'canteen' ? (
                    <>
                        <StatCard title="Refeições hoje" value="—" icon={UtensilsCrossed} color="orange" />
                        <StatCard title="Validadas" value="—" icon={QrCode} color="emerald" />
                        <StatCard title="Ementa" value="Ativa" icon={CalendarDays} color="blue" />
                        <StatCard title="Relatório" value="—" icon={TrendingUp} color="violet" />
                    </>
                ) : role === 'bar' || role === 'stationery' ? (
                    <>
                        <StatCard title="Vendas hoje" value="—" icon={role === 'bar' ? Coffee : ShoppingBag} color="orange" />
                        <StatCard title="Produtos" value={stats.products ?? 0} icon={Package} color="blue" />
                        <StatCard title="Stock baixo" value="—" icon={Package} color="red" />
                        <StatCard title="Receita" value="—" icon={DollarSign} color="emerald" />
                    </>
                ) : null}
            </div>

            {/* Charts */}
            {(role === 'admin' || role === 'direction') && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base">Atividade mensal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRefeicoes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                                    <Area type="monotone" dataKey="refeicoes" name="Refeições" stroke="#3b82f6" fill="url(#colorRefeicoes)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#10b981" fill="url(#colorVendas)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Distribuição</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                                        {pieData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {(role === 'canteen' || role === 'bar' || role === 'stationery') && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Vendas da semana</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="month" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="vendas" name="Vendas" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
