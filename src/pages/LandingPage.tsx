import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { School, News, Event as SchoolEvent, GalleryPhoto, Document, UsefulLink, Announcement } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
  GraduationCap, Menu, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube,
  Megaphone, FileText, Link2, ChevronRight, ArrowRight,
  BookOpen, Users, Award, Building2, LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();
  const [school, setSchool] = useState<School | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [links, setLinks] = useState<UsefulLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    const { data: schoolData } = await supabase.from('schools').select('*').limit(1).maybeSingle();
    setSchool(schoolData as School | null);

    if (schoolData) {
      const [newsRes, eventsRes, annRes, galleryRes, docsRes, linksRes] = await Promise.all([
        supabase.from('news').select('*').eq('school_id', schoolData.id).eq('published', true).order('published_at', { ascending: false }).limit(6),
        supabase.from('events').select('*').eq('school_id', schoolData.id).order('start_date', { ascending: true }).limit(6),
        supabase.from('announcements').select('*').eq('school_id', schoolData.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('gallery_photos').select('*').eq('school_id', schoolData.id).order('created_at', { ascending: false }).limit(12),
        supabase.from('documents').select('*').eq('school_id', schoolData.id).eq('is_public', true).order('created_at', { ascending: false }).limit(10),
        supabase.from('useful_links').select('*').eq('school_id', schoolData.id).order('created_at', { ascending: false }).limit(10),
      ]);
      setNews(newsRes.data as News[] ?? []);
      setEvents(eventsRes.data as SchoolEvent[] ?? []);
      setAnnouncements(annRes.data as Announcement[] ?? []);
      setGallery(galleryRes.data as GalleryPhoto[] ?? []);
      setDocuments(docsRes.data as Document[] ?? []);
      setLinks(linksRes.data as UsefulLink[] ?? []);
    }
    setLoading(false);
  };

  const navItems = [
    { label: 'Início', href: '#hero' },
    { label: 'Notícias', href: '#news' },
    { label: 'Eventos', href: '#events' },
    { label: 'Escola', href: '#about' },
    { label: 'Oferta Educativa', href: '#courses' },
    { label: 'Galeria', href: '#gallery' },
    { label: 'Contactos', href: '#contacts' },
  ];

  const heroImage = school?.hero_image_url || 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1920';
  const logoUrl = school?.logo_url;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">A carregar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={school?.name} className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <span className="font-bold text-lg tracking-tight block leading-tight">{school?.name || 'Escola Digital'}</span>
              {school?.motto && <span className="text-xs text-muted-foreground hidden sm:block">{school.motto}</span>}
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/login')} className="hidden sm:flex">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <SheetDescription className="sr-only">Navegação do site</SheetDescription>
                <nav className="flex flex-col gap-1 mt-6">
                  {navItems.map((item) => (
                    <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-md">
                      {item.label}
                    </a>
                  ))}
                  <Button onClick={() => navigate('/login')} className="mt-4">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative min-h-[600px] flex items-center justify-center pt-16">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Escola" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white py-20">
          {logoUrl && <img src={logoUrl} alt={school?.name} className="h-20 w-20 rounded-xl object-cover mx-auto mb-6 shadow-xl" />}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">{school?.name || 'Escola Digital'}</h1>
          {school?.motto && <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">{school.motto}</p>}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/login')} className="bg-white text-blue-700 hover:bg-white/90">
              <LogIn className="mr-2 h-4 w-4" />
              Área Pessoal
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" asChild>
              <a href="#about">Conhecer a escola</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Announcements bar */}
      {announcements.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100 truncate">
                  {announcements[0].title}: {announcements[0].content}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About / Presentation */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Sobre a escola</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Bem-vindo à nossa escola</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {school?.landing_content?.about || 'A nossa escola compromete-se em proporcionar uma educação de excelência, formando cidadãos críticos, criativos e responsáveis, preparados para os desafios do futuro.'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">+1200 Alunos</p>
                    <p className="text-sm text-muted-foreground">Comunidade ativa</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">+80 Professores</p>
                    <p className="text-sm text-muted-foreground">Equipa qualificada</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold">+50 Anos</p>
                    <p className="text-sm text-muted-foreground">De tradição</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Campus Moderno</p>
                    <p className="text-sm text-muted-foreground">Infraestruturas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/8617715/pexels-photo-8617715.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Escola"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section id="news" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-2">Notícias</Badge>
              <h2 className="text-3xl font-bold">Últimas notícias</h2>
            </div>
          </div>
          {news.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Ainda não há notícias publicadas.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  {item.image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <CardHeader>
                    <p className="text-xs text-muted-foreground">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString('pt-PT') : ''}
                    </p>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt || item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events */}
      <section id="events" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-2">Eventos</Badge>
              <h2 className="text-3xl font-bold">Próximos eventos</h2>
            </div>
          </div>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Não há eventos agendados.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-lg p-3 min-w-16">
                        <span className="text-2xl font-bold">{new Date(event.start_date).getDate()}</span>
                        <span className="text-xs uppercase">{new Date(event.start_date).toLocaleDateString('pt-PT', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{event.title}</h3>
                        {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
                        {event.location && (
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Courses / Educational Offer */}
      <section id="courses" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Badge variant="secondary" className="mb-2">Oferta Educativa</Badge>
          <h2 className="text-3xl font-bold mb-10">Cursos e Projetos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'Ensino Básico', desc: '2º e 3º Ciclos do Ensino Básico', color: 'blue' },
              { icon: GraduationCap, title: 'Ensino Secundário', desc: 'Cursos Científico-Humanísticos', color: 'emerald' },
              { icon: Users, title: 'Projetos e Clubes', desc: 'Clube de Robótica, Teatro, Desporto', color: 'orange' },
              { icon: Award, title: 'Cursos Profissionais', desc: 'Formação profissional qualificante', color: 'violet' },
            ].map((course) => {
              const Icon = course.icon;
              return (
                <Card key={course.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className={`h-12 w-12 rounded-xl bg-${course.color}-100 dark:bg-${course.color}-900/30 flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 text-${course.color}-600 dark:text-${course.color}-400`} />
                    </div>
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <Badge variant="secondary" className="mb-2">Galeria</Badge>
            <h2 className="text-3xl font-bold mb-10">Galeria de fotografias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((photo) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
                  <img src={photo.image_url} alt={photo.title || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Documents & Useful Links */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <Badge variant="secondary" className="mb-2"><FileText className="h-3 w-3 mr-1" /> Documentos</Badge>
              <h2 className="text-3xl font-bold mb-6">Documentos públicos</h2>
              {documents.length === 0 ? (
                <p className="text-muted-foreground">Sem documentos disponíveis.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <a key={doc.id} href={doc.file_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 text-sm font-medium">{doc.title}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Badge variant="secondary" className="mb-2"><Link2 className="h-3 w-3 mr-1" /> Ligações</Badge>
              <h2 className="text-3xl font-bold mb-6">Ligações úteis</h2>
              {links.length === 0 ? (
                <p className="text-muted-foreground">Sem ligações disponíveis.</p>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1 text-sm font-medium">{link.title}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Badge variant="secondary" className="mb-2">Contactos</Badge>
          <h2 className="text-3xl font-bold mb-10">Contactos e localização</h2>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              {school?.address && (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Morada</p>
                    <p className="text-muted-foreground">{school.address}{school.postal_code ? `, ${school.postal_code}` : ''}{school.city ? `, ${school.city}` : ''}</p>
                  </div>
                </div>
              )}
              {school?.phone && (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Telefone</p>
                    <p className="text-muted-foreground">{school.phone}</p>
                  </div>
                </div>
              )}
              {school?.email && (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-muted-foreground">{school.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold">Horário de atendimento</p>
                  <p className="text-muted-foreground">Segunda a Sexta: 9h00 - 17h00</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border h-[400px] bg-muted">
              {school?.latitude && school?.longitude ? (
                <iframe
                  src={`https://www.google.com/maps?q=${school.latitude},${school.longitude}&z=15&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  title="Localização da escola"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {logoUrl ? (
                  <img src={logoUrl} alt={school?.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                )}
                <span className="font-bold text-white text-lg">{school?.name || 'Escola Digital'}</span>
              </div>
              {school?.motto && <p className="text-sm text-slate-400">{school.motto}</p>}
              <div className="flex gap-3 mt-4">
                {school?.social_links?.facebook && (
                  <a href={school.social_links.facebook} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {school?.social_links?.instagram && (
                  <a href={school.social_links.instagram} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {school?.social_links?.youtube && (
                  <a href={school.social_links.youtube} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Contactos</h3>
              <ul className="space-y-2 text-sm">
                {school?.address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {school.address}</li>}
                {school?.phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {school.phone}</li>}
                {school?.email && <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {school.email}</li>}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Informação legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Política de Privacidade</li>
                <li>Termos de Uso</li>
                <li>RGPD</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © {new Date().getFullYear()} {school?.name || 'Escola Digital'}. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
