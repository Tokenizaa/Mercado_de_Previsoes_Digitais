import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Home } from './pages/Home';
import { MarketDiscovery } from './pages/MarketDiscovery';
import { MarketDetail } from './pages/MarketDetail';
import { CategoryPage } from './pages/CategoryPage';
import { CreateMarket } from './pages/CreateMarket';
import { Portfolio } from './pages/Portfolio';
import { Ranking } from './pages/Ranking';
import { UserProfile } from './pages/UserProfile';
import { MyMarkets } from './pages/MyMarkets';
import { AdminDemo } from './pages/AdminDemo';
import { DocsViewer } from './pages/DocsViewer';
import { supabase, setAuthToken } from './services/api';


function AuthField({ label, value, onChange, ...props }: any) {
  return <label className="block"><span className="block text-sm font-bold text-[#202124] mb-2">{label}</span><input {...props} value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} required className="w-full h-13 px-4 rounded-2xl border border-[#D9DDDA] bg-white text-[17px] outline-none focus:border-[#009344]" /></label>;
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10"><div className="w-full max-w-md bg-white rounded-3xl border border-[#E5E7E9] p-6 sm:p-8 shadow-sm"><div className="w-12 h-12 rounded-2xl bg-[#009344] text-white flex items-center justify-center font-black text-2xl mb-5">P</div><h1 className="text-[32px] font-extrabold tracking-tight">{title}</h1><p className="text-[18px] text-[#5F6368] mt-1 mb-7">{subtitle}</p>{children}</div></div>;
}

function LoginPage({ navigate }: { navigate: (path: string) => void }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setError('');setBusy(true);const {data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});setBusy(false);if(error)return setError(error.message.includes('Invalid login')?'E-mail ou senha incorretos.':error.message);setAuthToken(data.session?.access_token||null);navigate('/');}
  return <AuthShell title="Entrar" subtitle="Entre para acompanhar seus palpites."><form onSubmit={submit} className="space-y-4"><AuthField label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email"/><AuthField label="Senha" type="password" value={password} onChange={setPassword} autoComplete="current-password"/>{error&&<div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">{error}</div>}<button disabled={busy} className="w-full h-13 rounded-2xl bg-[#009344] text-white font-extrabold text-[17px]">{busy?'Entrando...':'Entrar'}</button></form><div className="mt-5 text-center"><button onClick={()=>navigate('/recuperar-senha')} className="text-[#007A38] font-bold">Esqueci minha senha</button></div><div className="mt-7 pt-6 border-t border-[#E5E7E9] text-center text-[#5F6368]">Ainda não tem conta? <button onClick={()=>navigate('/cadastro')} className="font-extrabold text-[#009344]">Criar conta</button></div></AuthShell>;
}

function CadastroPage({ navigate }: { navigate: (path: string) => void }) {
  const [name,setName]=useState(''); const [username,setUsername]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [error,setError]=useState(''); const [success,setSuccess]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setError('');setSuccess('');const u=username.trim().toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(u))return setError('O @nome deve ter 3 a 20 caracteres e usar apenas letras, números e _.');if(password.length<6)return setError('A senha precisa ter pelo menos 6 caracteres.');if(password!==confirm)return setError('As senhas não são iguais.');setBusy(true);const {data,error}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{data:{username:u,full_name:name.trim()}}});setBusy(false);if(error)return setError(error.message.includes('already registered')?'Este e-mail já está cadastrado.':error.message);if(data.session){setAuthToken(data.session.access_token);navigate('/');}else setSuccess('Conta criada. Confira seu e-mail para confirmar o cadastro.');}
  return <AuthShell title="Criar conta" subtitle="Entre para dar e acompanhar seus palpites."><form onSubmit={submit} className="space-y-4"><AuthField label="Seu nome" value={name} onChange={setName} autoComplete="name"/><AuthField label="@nome" value={username} onChange={setUsername} autoComplete="username" maxLength={20}/><AuthField label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email"/><AuthField label="Senha" type="password" value={password} onChange={setPassword} autoComplete="new-password"/><AuthField label="Confirmar senha" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password"/>{error&&<div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">{error}</div>}{success&&<div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold">{success}</div>}<button disabled={busy} className="w-full h-13 rounded-2xl bg-[#009344] text-white font-extrabold text-[17px]">{busy?'Criando...':'Criar minha conta'}</button></form><div className="mt-6 text-center text-[#5F6368]">Já tem conta? <button onClick={()=>navigate('/login')} className="font-extrabold text-[#009344]">Entrar</button></div></AuthShell>;
}

function RecoverPage({ navigate }: { navigate: (path: string) => void }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [recovery,setRecovery]=useState(false); const [error,setError]=useState(''); const [success,setSuccess]=useState(''); const [busy,setBusy]=useState(false);
  useEffect(()=>{supabase.auth.getSession().then(({data})=>setRecovery(!!data.session));const {data}=supabase.auth.onAuthStateChange((event,s)=>{if(event==='PASSWORD_RECOVERY')setRecovery(true);});return()=>data.subscription.unsubscribe();},[]);
  async function request(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');const {error}=await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo:window.location.origin+'/recuperar-senha'});setBusy(false);if(error)setError('Não foi possível enviar o link. Tente novamente.');else setSuccess('Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.');}
  async function change(e:React.FormEvent){e.preventDefault();if(password.length<6)return setError('A senha precisa ter pelo menos 6 caracteres.');if(password!==confirm)return setError('As senhas não são iguais.');setBusy(true);const {error}=await supabase.auth.updateUser({password});setBusy(false);if(error)setError('Não foi possível alterar a senha.');else{setSuccess('Senha alterada com sucesso.');setTimeout(()=>navigate('/'),700);}}
  return <AuthShell title="Recuperar senha" subtitle={recovery?'Crie sua nova senha.':'Informe seu e-mail e enviaremos um link.'}>{recovery?<form onSubmit={change} className="space-y-4"><AuthField label="Nova senha" type="password" value={password} onChange={setPassword} autoComplete="new-password"/><AuthField label="Confirmar senha" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password"/><button disabled={busy} className="w-full h-13 rounded-2xl bg-[#009344] text-white font-extrabold">{busy?'Salvando...':'Salvar nova senha'}</button></form>:<form onSubmit={request} className="space-y-4"><AuthField label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email"/><button disabled={busy} className="w-full h-13 rounded-2xl bg-[#009344] text-white font-extrabold">{busy?'Enviando...':'Enviar link'}</button></form>}{error&&<div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">{error}</div>}{success&&<div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold">{success}</div>}<button onClick={()=>navigate('/login')} className="w-full mt-5 text-[#007A38] font-bold">Voltar para entrar</button></AuthShell>;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => { setSession(data.session); setAuthToken(data.session?.access_token ?? null); setAuthLoading(false); });
    const {data} = supabase.auth.onAuthStateChange((_event,next) => { setSession(next); setAuthToken(next?.access_token ?? null); setAuthLoading(false); });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F7F8F7] text-[#5F6368]">Carregando...</div>;

  if (currentPath === '/login') return <><Navbar currentPath={currentPath} onNavigate={navigate} /><LoginPage navigate={navigate}/></>;
  if (currentPath === '/cadastro') return <><Navbar currentPath={currentPath} onNavigate={navigate} /><CadastroPage navigate={navigate}/></>;
  if (currentPath === '/recuperar-senha') return <><Navbar currentPath={currentPath} onNavigate={navigate} /><RecoverPage navigate={navigate}/></>;

  // Roteador simples e leve baseado em URL
  const renderRoute = () => {
    const path = currentPath.split('?')[0];

    // Detalhe de mercado: /mercados/:slug
    if (path.startsWith('/mercados/') && path !== '/mercados') {
      const slug = path.replace('/mercados/', '');
      return <MarketDetail slug={slug} onNavigate={navigate} />;
    }

    // Categoria: /categorias/:slug
    if (path.startsWith('/categorias/')) {
      const catSlug = path.replace('/categorias/', '');
      return <CategoryPage categorySlug={catSlug} onNavigate={navigate} />;
    }

    // Perfil: /perfil/:username
    if (path.startsWith('/perfil/')) {
      const username = path.replace('/perfil/', '');
      return <UserProfile username={username} onNavigate={navigate} />;
    }

    if (path === '/mercados') {
      return <MarketDiscovery onNavigate={navigate} />;
    }

    if (path === '/criar') {
      return <CreateMarket onNavigate={navigate} />;
    }

    if (path === '/portfolio' && !session) { navigate('/login'); return null; }

    if (path === '/portfolio') {
      return <Portfolio onNavigate={navigate} />;
    }

    if (path === '/ranking') {
      return <Ranking onNavigate={navigate} />;
    }

    if (path === '/meus-mercados') {
      return <MyMarkets onNavigate={navigate} />;
    }

    if (path === '/admin') {
      return <AdminDemo onNavigate={navigate} />;
    }

    if (path === '/docs') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialDoc = urlParams.get('doc') || 'PRODUCT.md';
      return <DocsViewer initialDoc={initialDoc} onNavigate={navigate} />;
    }

    // Default Home
    return <Home onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F7] text-[#202124] font-sans selection:bg-[#009344] selection:text-white pb-20 md:pb-0">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">
        {renderRoute()}
      </main>
      <Footer onNavigate={navigate} />
      <PWAInstallBanner />
    </div>
  );
}
