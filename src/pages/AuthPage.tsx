import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Mail, Lock, User, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else if (mode === 'register') {
      const { error } = await signUp(email, password, fullName);
      if (error) setError(error);
      else {
        setMessage('Conta de Encarregado de Educação criada com sucesso! Pode iniciar sessão.');
        setMode('login');
      }
    } else if (mode === 'reset') {
      const { error } = await resetPassword(email);
      if (error) setError(error);
      else setMessage('Email de recuperação enviado.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <GraduationCap className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Escola Digital</h1>
          <p className="text-sm text-muted-foreground mt-1">Plataforma de Gestão Escolar</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">
              {mode === 'login' ? 'Iniciar Sessão' : mode === 'register' ? 'Criar Conta de Encarregado' : 'Recuperar Palavra-passe'}
            </CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Aceda à sua área pessoal'
                : mode === 'register'
                ? 'Registo exclusivo para Encarregados de Educação'
                : 'Receba um link de recuperação por email'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-9"
                        placeholder="O seu nome"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      O registo público é exclusivo para Encarregados de Educação. Professores, funcionários e alunos são criados pela Secretaria ou Administrador.
                    </p>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Palavra-passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Registar como Encarregado' : 'Enviar email'}
              </Button>
              <div className="flex flex-col gap-1 text-sm text-center w-full">
                {mode === 'login' && (
                  <>
                    <button type="button" onClick={() => { setMode('reset'); setError(null); setMessage(null); }} className="text-muted-foreground hover:text-primary transition-colors">
                      Esqueceu a palavra-passe?
                    </button>
                    <button type="button" onClick={() => { setMode('register'); setError(null); setMessage(null); }} className="text-muted-foreground hover:text-primary transition-colors">
                      É Encarregado de Educação? Registar
                    </button>
                  </>
                )}
                {mode !== 'login' && (
                  <button type="button" onClick={() => { setMode('login'); setError(null); setMessage(null); }} className="text-muted-foreground hover:text-primary transition-colors">
                    Voltar ao login
                  </button>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} Escola Digital. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
