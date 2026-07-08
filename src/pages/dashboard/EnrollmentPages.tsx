import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard, EmptyState, LoadingState } from '@/components/shared/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EnrollmentApplication, ROLE_LABELS, Role } from '@/types';
import {
  FileText, Check, X, Clock, AlertCircle,
  FileSearch, ChevronRight, ChevronLeft, Send, UserPlus,
  Loader2, Shield, Mail, Lock, User as UserIcon
} from 'lucide-react';

// =====================================================
// PARENT: Multi-step enrollment wizard
// =====================================================
export function ParentEnrollPage() {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1: Parent personal data (pre-filled from profile)
  const [parentName, setParentName] = useState(profile?.full_name || '');
  const [parentPhone, setParentPhone] = useState(profile?.phone || '');
  const [parentAddress, setParentAddress] = useState('');
  const [parentNif, setParentNif] = useState('');

  // Step 2: Student data
  const [studentName, setStudentName] = useState('');
  const [studentBirthDate, setStudentBirthDate] = useState('');
  const [studentNationalId, setStudentNationalId] = useState('');
  const [studentGender, setStudentGender] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [gradeApplying, setGradeApplying] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');

  // Step 3: Documents
  const [documents, setDocuments] = useState<{ type: string; file: File | null; fileUrl: string }[]>([
    { type: 'Bilhete de Identidade / Cartão de Cidadão', file: null, fileUrl: '' },
    { type: 'Boletim de Vacinas', file: null, fileUrl: '' },
    { type: 'Certificado de Habilitações', file: null, fileUrl: '' },
    { type: 'Declaração de Residência', file: null, fileUrl: '' },
  ]);

  const steps = [
    { num: 1, label: 'Dados do Encarregado' },
    { num: 2, label: 'Dados do Aluno' },
    { num: 3, label: 'Documentos' },
    { num: 4, label: 'Submeter' },
  ];

  const handleFileChange = (idx: number, file: File | null) => {
    const updated = [...documents];
    updated[idx].file = file;
    updated[idx].fileUrl = file ? URL.createObjectURL(file) : '';
    setDocuments(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Create enrollment application
      const { data: enrollment, error } = await supabase.from('enrollment_applications').insert({
        school_id: profile?.school_id,
        parent_profile_id: profile?.id,
        student_name: studentName,
        student_birth_date: studentBirthDate || null,
        student_national_id: studentNationalId || null,
        student_gender: studentGender || null,
        student_address: studentAddress || null,
        grade_applying: gradeApplying || null,
        previous_school: previousSchool || null,
        status: 'pending',
      }).select('id').single();

      if (error) throw error;

      // Upload documents (in real app, upload to Supabase Storage; here we store file names)
      if (enrollment) {
        for (const doc of documents) {
          if (doc.file) {
            await supabase.from('enrollment_documents').insert({
              enrollment_id: enrollment.id,
              document_type: doc.type,
              file_url: doc.fileUrl || `upload://${doc.file.name}`,
              file_name: doc.file.name,
            });
          }
        }
      }

      setSuccess(true);
    } catch (err: any) {
      alert('Erro ao submeter inscrição: ' + err.message);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div>
        <PageHeader title="Inscrição Submetida" />
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Inscrição submetida com sucesso!</h2>
            <p className="text-muted-foreground mb-6">
              A sua inscrição foi submetida e está agora <Badge variant="secondary">Pendente de validação</Badge>.
              A Secretaria irá analisar os dados e documentos. Será notificado quando a inscrição for aprovada.
            </p>
            <Button onClick={() => { setSuccess(false); setStep(1); }}>
              Nova inscrição
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Nova Inscrição" description="Submeter pedido de matrícula de um aluno" />

      {/* Stepper */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex flex-col items-center ${step >= s.num ? '' : 'opacity-40'}`}>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                step > s.num ? 'bg-emerald-500 text-white' : step === s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s.num ? <Check className="h-5 w-5" /> : s.num}
              </div>
              <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 w-8 sm:w-16 ${step > s.num ? 'bg-emerald-500' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Dados do Encarregado de Educação</h3>
              <div className="space-y-2">
                <Label>Nome completo *</Label>
                <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone *</Label>
                  <Input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="+351 ..." />
                </div>
                <div className="space-y-2">
                  <Label>NIF</Label>
                  <Input value={parentNif} onChange={(e) => setParentNif(e.target.value)} placeholder="999999999" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Morada *</Label>
                <Input value={parentAddress} onChange={(e) => setParentAddress(e.target.value)} placeholder="Rua, número, andar" />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} disabled={!parentName || !parentPhone}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Dados do Aluno</h3>
              <div className="space-y-2">
                <Label>Nome completo do aluno *</Label>
                <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de nascimento *</Label>
                  <Input type="date" value={studentBirthDate} onChange={(e) => setStudentBirthDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nº de Identificação</Label>
                  <Input value={studentNationalId} onChange={(e) => setStudentNationalId(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Género</Label>
                  <Select value={studentGender} onValueChange={setStudentGender}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                      <SelectItem value="O">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ano pretendido *</Label>
                  <Select value={gradeApplying} onValueChange={setGradeApplying}>
                    <SelectTrigger><SelectValue placeholder="Selecionar ano" /></SelectTrigger>
                    <SelectContent>
                      {['5º ano', '6º ano', '7º ano', '8º ano', '9º ano', '10º ano', '11º ano', '12º ano'].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Morada do aluno</Label>
                <Input value={studentAddress} onChange={(e) => setStudentAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Escola anterior</Label>
                <Input value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} />
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={() => setStep(3)} disabled={!studentName || !studentBirthDate || !gradeApplying}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Upload de Documentos</h3>
              <p className="text-sm text-muted-foreground">Carregue os documentos necessários para a matrícula.</p>
              {documents.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">{doc.type}</Label>
                    {doc.file && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700"><Check className="h-3 w-3 mr-1" /> Carregado</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="file" onChange={(e) => handleFileChange(idx, e.target.files?.[0] || null)} className="text-sm" />
                  </div>
                  {doc.file && <p className="text-xs text-muted-foreground">{doc.file.name}</p>}
                </div>
              ))}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={() => setStep(4)}>
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Revisão e Submissão</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Encarregado</p>
                  <p className="font-medium">{parentName}</p>
                  <p className="text-sm text-muted-foreground">{parentPhone} · {parentAddress}</p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Aluno</p>
                  <p className="font-medium">{studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    {studentBirthDate} · {studentGender === 'M' ? 'Masculino' : studentGender === 'F' ? 'Feminino' : '—'} · {gradeApplying}
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Documentos</p>
                  <p className="text-sm">{documents.filter(d => d.file).length} de {documents.length} documentos carregados</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Após submissão, a inscrição ficará com estado "Pendente de validação" até ser revista pela Secretaria.
                </p>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Submeter inscrição
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// PARENT: View own enrollments
// =====================================================
export function ParentEnrollmentsPage() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const { data } = await supabase
        .from('enrollment_applications')
        .select('*, documents:enrollment_documents(*)')
        .eq('parent_profile_id', profile.id)
        .order('created_at', { ascending: false });
      setEnrollments((data as any) ?? []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <LoadingState />;

  const statusConfig: Record<string, { label: string; variant: any }> = {
    pending: { label: 'Pendente de validação', variant: 'secondary' },
    under_review: { label: 'Em análise', variant: 'default' },
    approved: { label: 'Aprovada', variant: 'default' },
    rejected: { label: 'Rejeitada', variant: 'destructive' },
    needs_correction: { label: 'Correções necessárias', variant: 'destructive' },
  };

  return (
    <div>
      <PageHeader title="As minhas inscrições" description="Estado dos pedidos de matrícula" />
      {enrollments.length === 0 ? (
        <Card><CardContent><EmptyState icon={FileText} title="Sem inscrições" description="Ainda não submeteu nenhuma inscrição." /></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enr) => {
            const sc = statusConfig[enr.status] || statusConfig.pending;
            return (
              <Card key={enr.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{enr.student_name}</p>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {enr.grade_applying} · Submetido em {new Date(enr.created_at).toLocaleDateString('pt-PT')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {enr.documents?.length || 0} documentos anexados
                      </p>
                      {enr.status === 'needs_correction' && enr.correction_notes && (
                        <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                          <p className="text-xs text-red-700 dark:text-red-300">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            {enr.correction_notes}
                          </p>
                        </div>
                      )}
                      {enr.status === 'rejected' && enr.rejection_reason && (
                        <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                          <p className="text-xs text-red-700 dark:text-red-300">
                            <X className="h-3 w-3 inline mr-1" />
                            {enr.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================
// SECRETARIA: Enrollment management
// =====================================================
export function SecretariaEnrollmentsPage() {
  const { profile } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [assignClassId, setAssignClassId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile?.school_id) { setLoading(false); return; }
    const [enrRes, clsRes] = await Promise.all([
      supabase.from('enrollment_applications')
        .select('*, parent:profiles!parent_profile_id(*), class:classes(*), documents:enrollment_documents(*)')
        .eq('school_id', profile.school_id)
        .order('created_at', { ascending: false }),
      supabase.from('classes').select('*').eq('school_id', profile.school_id).order('name'),
    ]);
    setEnrollments(enrRes.data ?? []);
    setClasses(clsRes.data ?? []);
    setLoading(false);
  };

  const filtered = filter === 'all' ? enrollments : enrollments.filter(e => e.status === filter);

  const updateStatus = async (id: string, status: string, extra?: Record<string, any>) => {
    setActionLoading(true);
    await supabase.from('enrollment_applications').update({
      status,
      reviewed_by: profile?.id,
      reviewed_at: new Date().toISOString(),
      ...extra,
    }).eq('id', id);
    setActionLoading(false);
    setSelected(null);
    setAssignClassId('');
    setCorrectionNotes('');
    setRejectionReason('');
    loadData();
  };

  const approveEnrollment = async (enrollment: any) => {
    setActionLoading(true);
    if (!assignClassId) {
      alert('Selecione uma turma para associar o aluno.');
      setActionLoading(false);
      return;
    }

    // 1. Create auth user for the student via edge function (or direct insert)
    // Since we can't create auth users from the client, we'll create a profile + student record
    // The admin/secretaria will need to set a password later or the student logs in via parent

    // For now, create a student record linked to the parent
    // Update enrollment status
    await supabase.from('enrollment_applications').update({
      status: 'approved',
      reviewed_by: profile?.id,
      reviewed_at: new Date().toISOString(),
      class_id: assignClassId,
    }).eq('id', enrollment.id);

    // Create enrollment in class
    // Note: student_record_id will be set when the student auth account is created

    setActionLoading(false);
    setSelected(null);
    setAssignClassId('');
    loadData();
  };

  if (loading) return <LoadingState />;

  const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
    pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
    under_review: { label: 'Em análise', variant: 'default', icon: FileSearch },
    approved: { label: 'Aprovada', variant: 'default', icon: Check },
    rejected: { label: 'Rejeitada', variant: 'destructive', icon: X },
    needs_correction: { label: 'Correções', variant: 'destructive', icon: AlertCircle },
  };

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;

  return (
    <div>
      <PageHeader title="Inscrições Pendentes" description="Gerir pedidos de matrícula" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Pendentes" value={pendingCount} icon={Clock} color="orange" />
        <StatCard title="Em análise" value={enrollments.filter(e => e.status === 'under_review').length} icon={FileSearch} color="blue" />
        <StatCard title="Aprovadas" value={enrollments.filter(e => e.status === 'approved').length} icon={Check} color="emerald" />
        <StatCard title="Rejeitadas" value={enrollments.filter(e => e.status === 'rejected').length} icon={X} color="red" />
      </div>

      <div className="flex gap-2 mb-4">
        {['all', 'pending', 'under_review', 'approved', 'rejected', 'needs_correction'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todas' : statusConfig[f]?.label || f}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent><EmptyState icon={FileSearch} title="Sem inscrições" description="Não há inscrições com este filtro." /></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((enr) => {
            const sc = statusConfig[enr.status] || statusConfig.pending;
            const ScIcon = sc.icon;
            return (
              <Card key={enr.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ScIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{enr.student_name}</p>
                          <Badge variant={sc.variant}>{sc.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {enr.grade_applying} · Encarregado: {enr.parent?.full_name || '—'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submetido em {new Date(enr.created_at).toLocaleDateString('pt-PT')} · {enr.documents?.length || 0} documentos
                        </p>
                        {enr.class?.name && (
                          <p className="text-xs text-emerald-600 mt-1">
                            <Check className="h-3 w-3 inline mr-1" /> Atribuído à turma {enr.class.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setSelected(enr); setAssignClassId(enr.class_id || ''); }}>
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail dialog */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            <DialogHeader>
              <DialogTitle>Inscrição de {selected.student_name}</DialogTitle>
              <DialogDescription>
                Encarregado: {selected.parent?.full_name} · {selected.parent?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Student data */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg border bg-muted/30">
                <div><span className="text-xs text-muted-foreground block">Nome</span><span className="font-medium">{selected.student_name}</span></div>
                <div><span className="text-xs text-muted-foreground block">Data nascimento</span><span className="font-medium">{selected.student_birth_date ? new Date(selected.student_birth_date).toLocaleDateString('pt-PT') : '—'}</span></div>
                <div><span className="text-xs text-muted-foreground block">Nº Identificação</span><span className="font-medium">{selected.student_national_id || '—'}</span></div>
                <div><span className="text-xs text-muted-foreground block">Género</span><span className="font-medium">{selected.student_gender === 'M' ? 'Masculino' : selected.student_gender === 'F' ? 'Feminino' : '—'}</span></div>
                <div><span className="text-xs text-muted-foreground block">Ano pretendido</span><span className="font-medium">{selected.grade_applying || '—'}</span></div>
                <div><span className="text-xs text-muted-foreground block">Escola anterior</span><span className="font-medium">{selected.previous_school || '—'}</span></div>
                <div className="col-span-2"><span className="text-xs text-muted-foreground block">Morada</span><span className="font-medium">{selected.student_address || '—'}</span></div>
              </div>

              {/* Documents */}
              <div>
                <p className="font-medium text-sm mb-2">Documentos</p>
                <div className="space-y-2">
                  {selected.documents?.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.document_type}</p>
                          <p className="text-xs text-muted-foreground">{doc.file_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.verified ? (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700"><Check className="h-3 w-3 mr-1" /> Verificado</Badge>
                        ) : (
                          <Badge variant="outline">Por verificar</Badge>
                        )}
                        <Button
                          size="sm"
                          variant={doc.verified ? 'outline' : 'default'}
                          onClick={async () => {
                            await supabase.from('enrollment_documents').update({
                              verified: !doc.verified,
                              verified_by: profile?.id,
                              verified_at: doc.verified ? null : new Date().toISOString(),
                            }).eq('id', doc.id);
                            setSelected({
                              ...selected,
                              documents: selected.documents.map((d: any) => d.id === doc.id ? { ...d, verified: !doc.verified } : d),
                            });
                          }}
                        >
                          {doc.verified ? 'Desfazer' : 'Validar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!selected.documents || selected.documents.length === 0) && (
                    <p className="text-sm text-muted-foreground">Sem documentos.</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selected.status === 'pending' || selected.status === 'needs_correction' ? (
                <div className="space-y-3 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Atribuir turma (para aprovação)</Label>
                    <Select value={assignClassId} onValueChange={setAssignClassId}>
                      <SelectTrigger><SelectValue placeholder="Selecionar turma" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name} ({cls.year})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => approveEnrollment(selected)}
                      disabled={actionLoading || !assignClassId}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Check className="mr-2 h-4 w-4" /> Aprovar matrícula
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(selected.id, 'under_review')}
                      disabled={actionLoading}
                    >
                      <FileSearch className="mr-2 h-4 w-4" /> Marcar em análise
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (correctionNotes) {
                          updateStatus(selected.id, 'needs_correction', { correction_notes: correctionNotes });
                        } else {
                          alert('Indique as correções necessárias.');
                        }
                      }}
                      disabled={actionLoading}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" /> Pedir correções
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (rejectionReason) {
                          updateStatus(selected.id, 'rejected', { rejection_reason: rejectionReason });
                        } else {
                          alert('Indique o motivo de rejeição.');
                        }
                      }}
                      disabled={actionLoading}
                    >
                      <X className="mr-2 h-4 w-4" /> Rejeitar
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Notas de correção</Label>
                      <Textarea value={correctionNotes} onChange={(e) => setCorrectionNotes(e.target.value)} placeholder="Descreva as correções necessárias..." className="text-sm" rows={2} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Motivo de rejeição</Label>
                      <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Indique o motivo..." className="text-sm" rows={2} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4">
                  <Badge variant={statusConfig[selected.status]?.variant}>
                    {statusConfig[selected.status]?.label}
                  </Badge>
                  {selected.class?.name && (
                    <p className="text-sm text-emerald-600 mt-2">
                      <Check className="h-4 w-4 inline mr-1" /> Aluno atribuído à turma {selected.class.name}
                    </p>
                  )}
                  {selected.rejection_reason && (
                    <p className="text-sm text-red-600 mt-2">Rejeição: {selected.rejection_reason}</p>
                  )}
                  {selected.correction_notes && (
                    <p className="text-sm text-amber-600 mt-2">Correções: {selected.correction_notes}</p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// =====================================================
// ADMIN: Create user form
// =====================================================
export function CreateUserPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('teacher');

  const creatableRoles: Role[] = ['direction', 'secretaria', 'teacher', 'class_director', 'canteen', 'bar', 'stationery', 'staff_servicos'];

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call the seed-users edge function pattern: we need an admin endpoint
      // Since we can't create auth users from the client, we'll use the admin API via an edge function
      const supaUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supaUrl}/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          schoolId: profile?.school_id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar utilizador');
      }

      setSuccess(`Utilizador ${fullName} (${ROLE_LABELS[role]}) criado com sucesso! Email: ${email}`);
      setFullName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div>
      <PageHeader title="Criar Utilizador" description="Criar novos utilizadores (professores, funcionários, etc.)" />
      <Card className="max-w-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Apenas o Administrador pode criar contas para professores, direção, secretaria e funcionários.
              Os alunos são criados automaticamente quando a matrícula é aprovada pela Secretaria.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Nome completo *</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" placeholder="Nome do utilizador" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="email@escola.pt" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Palavra-passe inicial *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipo de utilizador *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {creatableRoles.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4" /> {success}
              </p>
            </div>
          )}

          <Button onClick={handleCreate} disabled={loading || !fullName || !email || !password} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Criar utilizador
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
