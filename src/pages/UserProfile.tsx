import React, { useEffect, useState } from 'react';
import { ArrowLeft, Coins, CheckCircle2, Sparkles, Pencil, Camera } from 'lucide-react';
import { workerApi, supabase } from '../services/api';
import { PredictionProfile } from '../../worker/src/types';

interface UserProfileProps { username: string; onNavigate: (path: string) => void; }

export const UserProfile: React.FC<UserProfileProps> = ({ username, onNavigate }) => {
  const [profile, setProfile] = useState<PredictionProfile | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([workerApi.getProfile(username), supabase.auth.getSession()]).then(async ([p, sessionResult]) => {
      if (!active) return;
      setProfile(p);
      if (p) { setName(p.name || p.display_name || ''); setHandle(p.username); setBio(p.bio || ''); setAvatarUrl(p.avatar_url || ''); }
      if (sessionResult.data.session) {
        const portfolio = await workerApi.getPortfolio().catch(() => null);
        if (portfolio?.profile?.id) setSessionUserId(portfolio.profile.id);
        if (portfolio) setPositions([...(portfolio.openPositions || []), ...(portfolio.closedPositions || [])]);
      }
    }).catch(() => setError('Não foi possível carregar o perfil.'));
    return () => { active = false; };
  }, [username]);

  const isOwn = !!profile && profile.id === sessionUserId;
  const won = positions.filter(p => p.status === 'WON').length;
  const rate = positions.length ? Math.round((won / positions.length) * 100) : 0;

  async function save() {
    setError(''); setSaving(true);
    try {
      const updated = await workerApi.updateProfile({ display_name: name, username: handle, bio: bio });
      setProfile(updated); setEditing(false);
      if (updated.username !== username) onNavigate('/perfil/' + updated.username);
    } catch (e: any) { setError(e.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  }

  async function uploadAvatar(file: File) {
    if (!sessionUserId || !isOwn) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { setError('Escolha uma imagem de até 2 MB.'); return; }
    setError('');
    const path = `${sessionUserId}/avatar-${Date.now()}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) { setError('Não foi possível enviar a foto.'); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    try { const updated = await workerApi.updateProfile({ avatar_url: data.publicUrl }); setProfile(updated); setAvatarUrl(data.publicUrl); }
    catch (e: any) { setError(e.message || 'Não foi possível salvar a foto.'); }
  }

  if (!profile) return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-[#5F6368]">{error || 'Carregando perfil...'}</div>;

  const displayName = profile.name || profile.display_name || profile.username;
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8 pb-24">
    <button onClick={() => onNavigate('/')} className="inline-flex items-center gap-2 text-[15px] font-bold text-[#5F6368]"><ArrowLeft className="w-5 h-5"/>Voltar ao início</button>
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7E9] shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-2xl object-cover border border-[#E5E7E9]"/> : <div className="w-20 h-20 rounded-2xl bg-[#009344] text-white flex items-center justify-center font-extrabold text-3xl">{displayName[0]?.toUpperCase()}</div>}
            {isOwn && <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white border border-[#E5E7E9] flex items-center justify-center cursor-pointer"><Camera className="w-4 h-4"/><input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])}/></label>}
          </div>
          <div>
            <h1 className="font-extrabold text-2xl sm:text-3xl tracking-tight">{displayName}</h1>
            <div className="text-sm font-semibold text-[#5F6368] mt-0.5">@{profile.username}</div>
            {profile.bio && <p className="text-[16px] text-[#5F6368] mt-2 max-w-xl">{profile.bio}</p>}
          </div>
        </div>
        {isOwn && <button onClick={() => setEditing(!editing)} className="h-11 px-5 bg-[#F7F8F7] border border-[#E5E7E9] text-sm font-bold rounded-xl inline-flex items-center gap-2"><Pencil className="w-4 h-4"/>Editar perfil</button>}
      </div>
      {editing && <div className="mt-6 pt-6 border-t border-[#E5E7E9] space-y-4">
        <label className="block"><span className="block text-sm font-bold mb-2">Nome</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={80} className="w-full h-12 px-4 rounded-xl border border-[#D9DDDA]"/></label>
        <label className="block"><span className="block text-sm font-bold mb-2">@nome</span><input value={handle} onChange={e=>setHandle(e.target.value.toLowerCase())} maxLength={20} className="w-full h-12 px-4 rounded-xl border border-[#D9DDDA]"/></label>
        <label className="block"><span className="block text-sm font-bold mb-2">Bio</span><textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength={280} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#D9DDDA] resize-none"/></label>
        {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">{error}</div>}
        <button disabled={saving} onClick={save} className="h-12 px-6 rounded-xl bg-[#009344] text-white font-extrabold">{saving ? 'Salvando...' : 'Salvar alterações'}</button>
      </div>}
    </div>

    {error && !editing && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">{error}</div>}

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9]"><div className="text-xs font-bold text-[#5F6368] uppercase mb-1">Meus créditos</div><div className="text-[28px] font-extrabold text-[#009344] tabular-nums">{profile.credits_balance.toLocaleString('pt-BR')}</div></div>
      <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9]"><div className="flex items-center gap-2 text-xs font-bold text-[#5F6368] uppercase mb-1">Acertos <Sparkles className="w-4 h-4"/></div><div className="text-[28px] font-extrabold">{won}</div></div>
      <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9]"><div className="flex items-center gap-2 text-xs font-bold text-[#5F6368] uppercase mb-1">Taxa de acertos <CheckCircle2 className="w-4 h-4 text-[#009344]"/></div><div className="text-[28px] font-extrabold text-[#007A38]">{rate}%</div></div>
    </div>

    {isOwn && <div className="p-5 bg-white rounded-3xl border border-[#E5E7E9]"><div className="flex items-center gap-2 text-xs font-bold text-[#5F6368] uppercase mb-1"><Coins className="w-4 h-4"/>Saldo</div><div className="font-extrabold text-[#009344]">{profile.credits_balance.toLocaleString('pt-BR')} créditos</div></div>}

    <div className="space-y-4"><h2 className="font-extrabold text-2xl">Palpites recentes ({positions.length})</h2>{positions.length ? <div className="space-y-3">{positions.map(pos => <div key={pos.id} onClick={() => pos.market_slug && onNavigate('/mercados/'+pos.market_slug)} className="cursor-pointer p-5 bg-white rounded-2xl border border-[#E5E7E9] flex items-center justify-between"><div><div className="font-extrabold">{pos.market_title}</div><div className="text-sm text-[#5F6368] mt-1">Escolha: <strong className="text-[#202124]">{pos.option_label}</strong></div></div><span className="text-xs font-bold">{pos.status === 'WON' ? 'Acertou' : pos.status === 'LOST' ? 'Não acertou' : 'Em andamento'}</span></div>)}</div> : <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7E9] text-[#5F6368]">Nenhum palpite registrado ainda.</div>}</div>
  </div>;
};
