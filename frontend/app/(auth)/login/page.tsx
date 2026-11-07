'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useSFX } from '../../../hooks/useSFX';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { signIn, signInWithOAuth, userId } = useAuth();
  const router = useRouter();
  const sfx = useSFX();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      router.push('/world');
    }
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      sfx.playError();
      setError('Please enter your credentials.');
      return;
    }

    setLoading(true);
    setError(null);
    sfx.playClick();

    const res = await signIn(email, password);
    if (!res.success) {
      sfx.playError();
      setError(res.error || 'Identity verification failed.');
      setLoading(false);
    } else {
      sfx.playSuccess();
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'discord') => {
    setLoading(true);
    setError(null);
    sfx.playSuccess();
    
    const res = await signInWithOAuth(provider);
    if (!res.success) {
      sfx.playError();
      setError(res.error || `Failed connecting to ${provider} gate.`);
      setLoading(false);
    }
  };

  const handleHover = () => {
    sfx.playClick();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col gap-6 w-full mt-2"
    >
      {/* Alert Error Box */}
      {error && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-3 bg-red-950/30 border border-red-900/40 flex gap-2.5 items-start text-red-300 text-[11px] leading-normal font-sans"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Underline Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold font-serif text-[#b89030] uppercase tracking-widest">
            Identity Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none text-zinc-650">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              disabled={loading}
              className="w-full pl-9 pr-2 py-2.5 rpg-field-underline rounded-none text-zinc-100 placeholder-zinc-700 text-xs tracking-wide"
              required
            />
          </div>
        </div>

        {/* Password Underline Input */}
        <div className="flex flex-col gap-1 mt-1">
          <label className="text-[9px] font-bold font-serif text-[#b89030] uppercase tracking-widest">
            Secure Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none text-zinc-655">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password Key"
              disabled={loading}
              className="w-full pl-9 pr-9 py-2.5 rpg-field-underline rounded-none text-zinc-100 placeholder-zinc-700 text-xs tracking-wide"
              required
            />
            <button
              type="button"
              onClick={() => { sfx.playClick(); setShowPassword(!showPassword); }}
              className="absolute inset-y-0 right-0 pr-1.5 flex items-center text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember / Forgot options */}
        <div className="flex justify-between items-center text-[10px] font-serif text-zinc-550 mt-1 select-none">
          <label className="flex items-center gap-2 cursor-pointer hover:text-zinc-400 transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => { sfx.playClick(); setRememberMe(e.target.checked); }}
              className="rounded-none border border-zinc-800 bg-zinc-950 text-[#d4af37] focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer accent-[#d4af37]"
            />
            <span>Remember Duty</span>
          </label>
          
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); sfx.playClick(); }}
            className="text-[#b89030] hover:text-[#d4af37] transition-colors"
          >
            Recover Credentials
          </a>
        </div>

        {/* Enter Kingdom submit button */}
        <button
          type="submit"
          disabled={loading}
          onMouseEnter={handleHover}
          className="mt-6 w-full rpg-button-royal h-12 text-[11px] tracking-[0.2em] rounded-none select-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-zinc-950" />
          ) : (
            <span>Enter Kingdom</span>
          )}
        </button>
      </form>

      {/* Alternative OAuth Authentication */}
      <div className="flex flex-col gap-3.5 mt-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-[1px] bg-zinc-800/40 flex-1" />
          <span className="text-[8px] font-serif uppercase tracking-widest text-zinc-550">Or Connect Gateways</span>
          <div className="h-[1px] bg-zinc-800/40 flex-1" />
        </div>
        
        <div className="flex items-center justify-center gap-6 py-1">
          {/* Google Gate */}
          <button 
            type="button"
            disabled={loading}
            onMouseEnter={handleHover}
            onClick={() => handleOAuthSignIn('google')}
            title="Sign In with Google"
            className="transition-all hover:scale-110 active:scale-95 duration-200 cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </button>

          {/* Discord Gate */}
          <button 
            type="button"
            disabled={loading}
            onMouseEnter={handleHover}
            onClick={() => handleOAuthSignIn('discord')}
            title="Sign In with Discord"
            className="transition-all hover:scale-110 active:scale-95 duration-200 cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
          >
            <svg viewBox="0 0 127.14 96.36" className="w-8.5 h-8.5 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]" fill="#5865F2">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2.07a75.48,75.48,0,0,0,72.6,0c.82.73,1.68,1.42,2.58,2.07a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129,54.65,123.5,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.88,46,53.88,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.12,46,96.12,53,91,65.69,84.69,65.69Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="rpg-plate-inset-line" />

      {/* Secondary Button: Link to Register */}
      <Link
        href="/register"
        onMouseEnter={handleHover}
        onClick={() => sfx.playOpen()}
        className="w-full rpg-button-steel h-11 text-[10px] tracking-widest rounded-none flex items-center justify-center gap-1.5"
      >
        <span>Create Commander</span>
      </Link>
    </motion.div>
  );
}
