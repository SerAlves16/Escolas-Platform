import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from '@/components/ui/dialog';
import { EmptyState, LoadingState } from '@/components/shared/StatCard';
import { useToast } from '@/hooks/use-toast';
import { PageConfig, FormField, pageConfigs, getServicePageConfig } from '@/config/pages';
import { Role, ROLE_LABELS } from '@/types';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

// =====================================================
// CRUD Modal
// =====================================================
interface CrudModalProps {
  open: boolean;
  onClose: () => void;
  config: PageConfig;
  editingRow: any | null;
  schoolId: string;
  onSaved: () => void;
}

function CrudModal({ open, onClose, config, editingRow, schoolId, onSaved }: CrudModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (editingRow) {
      setFormData({ ...editingRow });
    } else {
      const defaults: Record<string, any> = {};
      config.formFields.forEach((f) => {
        if (f.defaultValue !== undefined) defaults[f.key] = f.defaultValue;
        if (f.type === 'checkbox') defaults[f.key] = false;
      });
      setFormData(defaults);
    }
  }, [editingRow, config, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build data object from form fields only
      let data: Record<string, any> = {};
      config.formFields.forEach((f) => {
        if (formData[f.key] !== undefined) {
          data[f.key] = formData[f.key];
        }
      });

      // Add school_id for school-scoped tables
      if (config.table !== 'profiles') {
        data.school_id = schoolId;
      }

      // Apply transform if defined
      if (config.transformOnSave) {
        data = config.transformOnSave(data, !!editingRow);
      }

      // Remove fields that shouldn't be sent (id, created_at, updated_at, and joined fields)
      delete data.id;
      delete data.created_at;
      delete data.updated_at;
      delete data.profile;
      delete data.class;
      delete data.subject;
      delete data.teacher;
      delete data.student;
      delete data.enrollments;
      delete data.documents;
      delete data.parent;
      delete data.menu;
      delete data.school;
      delete data.class_director;

      let error;
      if (editingRow) {
        ({ error } = await supabase.from(config.table).update(data).eq('id', editingRow.id));
      } else {
        ({ error } = await supabase.from(config.table).insert(data));
      }

      if (error) throw error;

      toast({
        title: editingRow ? 'Registo atualizado' : 'Registo criado',
        description: 'Os dados foram guardados com sucesso.',
      });
      onSaved();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Erro ao guardar dados.',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  const renderField = (field: FormField) => {
    const value = formData[field.key];

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder}
          />
        );
      case 'select':
        return (
          <Select
            value={String(value ?? '')}
            onValueChange={(v) => setFormData({ ...formData, [field.key]: v })}
          >
            <SelectTrigger><SelectValue placeholder={field.placeholder || 'Selecionar'} /></SelectTrigger>
            <SelectContent>
              {field.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm">{field.label}</span>
          </div>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: parseFloat(e.target.value) })}
            placeholder={field.placeholder}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value ? (typeof value === 'string' ? value.slice(0, 10) : '') : ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
          />
        );
      case 'time':
        return (
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
          />
        );
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRow ? 'Editar' : 'Adicionar'} - {config.title}</DialogTitle>
          <DialogDescription>
            {editingRow ? 'Edite os dados e clique em Guardar.' : 'Preencha os dados e clique em Guardar.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {config.formFields.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este registo não pode ser criado diretamente.</p>
          ) : (
            config.formFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                {field.type !== 'checkbox' && (
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                {renderField(field)}
              </div>
            ))
          )}
        </div>
        {config.formFields.length > 0 && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// Delete confirmation modal
// =====================================================
function DeleteModal({ open, onClose, onConfirm, title }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string }) {
  const [deleting, setDeleting] = useState(false);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmar eliminação</DialogTitle>
          <DialogDescription>
            Tem a certeza que pretende eliminar "{title}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false); onClose(); }}
          >
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================
// Config-driven DataTablePage
// =====================================================
export function ConfigDrivenPage({ path }: { path: string }) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Determine config
  const serviceConfig = getServicePageConfig(path, profile?.role || '');
  const config = serviceConfig || pageConfigs[path];

  useEffect(() => {
    if (config && profile?.school_id) loadData();
    else setLoading(false);
  }, [config, profile, path]);

  const loadData = async () => {
    if (!profile?.school_id || !config) { setLoading(false); return; }
    setLoading(true);
    let query = supabase.from(config.table).select(config.select);
    if (config.table !== 'profiles') query = query.eq('school_id', profile.school_id);
    if (config.filterColumn && config.filterValue) query = query.eq(config.filterColumn, config.filterValue);
    const { data: result } = await query.order('created_at', { ascending: false }).limit(100);
    setData(result ?? []);
    setLoading(false);
  };

  if (!config) {
    return (
      <div>
        <PageHeader title="Página não configurada" description="Esta página ainda não tem configuração." />
        <Card><CardContent><EmptyState icon={Plus} title="Sem configuração" /></CardContent></Card>
      </div>
    );
  }

  if (loading) return <LoadingState />;

  const role = profile?.role as Role;
  const canCreate = !config.canCreate || config.canCreate.includes(role);
  const canEdit = !config.canEdit || config.canEdit.includes(role);
  const canDelete = !config.canDelete || config.canDelete.includes(role);

  // Filter data
  let filtered = data;
  if (search) {
    filtered = filtered.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
    );
  }
  if (path === '/dashboard/users' && roleFilter !== 'all') {
    filtered = filtered.filter((r) => r.role === roleFilter);
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from(config.table).delete().eq('id', deleteTarget.id);
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Registo eliminado', description: 'O registo foi removido com sucesso.' });
      loadData();
    }
  };

  return (
    <div>
      <PageHeader
        title={config.title}
        description={config.description}
        action={canCreate && config.formFields.length > 0 ? (
          <Button onClick={() => { setEditingRow(null); setModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        ) : undefined}
      />

      <Card>
        <CardContent className="p-4">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {path === '/dashboard/users' && (
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Filtrar por role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as roles</SelectItem>
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <EmptyState icon={Plus} title="Sem dados" description="Ainda não há registos." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {config.columns.map((col) => (
                      <th key={col.key + col.label} className={`text-left p-2 font-medium text-muted-foreground ${col.className || ''}`}>
                        {col.label}
                      </th>
                    ))}
                    {(canEdit || canDelete) && <th className="text-right p-2 font-medium text-muted-foreground">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={row.id || i} className="border-b hover:bg-muted/50 transition-colors">
                      {config.columns.map((col) => (
                        <td key={col.key + col.label + (row.id || i)} className="p-2">
                          {col.render ? col.render(row) : (row[col.key] ?? '—')}
                        </td>
                      ))}
                      {(canEdit || canDelete) && (
                        <td className="p-2 text-right whitespace-nowrap">
                          {canEdit && config.formFields.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => { setEditingRow(row); setModalOpen(true); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CRUD Modal */}
      {modalOpen && profile?.school_id && (
        <CrudModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingRow(null); }}
          config={config}
          editingRow={editingRow}
          schoolId={profile.school_id}
          onSaved={loadData}
        />
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={deleteTarget.full_name || deleteTarget.name || deleteTarget.title || 'registo'}
        />
      )}
    </div>
  );
}
