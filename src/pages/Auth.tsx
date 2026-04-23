import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import arcanineLogo from '@/assets/arcanine-logo.png';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // SEO
  useEffect(() => {
    document.title = mode === 'signin' ? 'Sign in — Arcanine' : 'Create account — Arcanine';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'Sign in or create your Arcanine trading account to start trading and managing your balance.');
  }, [mode]);

  if (!loading && user) return <Navigate to="/trade" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back');
          navigate('/trade', { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, displayName || undefined);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Check your inbox to confirm your email');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: '#111118' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-[420px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col items-center pt-8 pb-4">
          <img src={arcanineLogo} alt="Arcanine logo" className="w-12 h-12 mb-2" />
          <h1 className="text-xl font-bold text-foreground font-display">Arcanine</h1>
          <p className="text-xs text-muted-foreground mt-1">Web Trading Platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mx-6 mb-6 p-1 rounded-xl bg-secondary/60 border border-border">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="px-6 pb-6 space-y-3">
          {mode === 'signup' && (
            <Field icon={<UserIcon size={16} />} label="Display name">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Trader"
                className="bg-transparent flex-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Field>
          )}

          <Field icon={<Mail size={16} />} label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="bg-transparent flex-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <Field icon={<Lock size={16} />} label="Password">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="bg-transparent flex-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-accent text-primary-foreground font-bold text-sm transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
                <ArrowRight size={15} />
              </>
            )}
          </button>

          <p className="text-[11px] text-muted-foreground text-center mt-3">
            {mode === 'signin' ? "Don't have an account? " : 'Already registered? '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </form>
      </motion.div>
    </main>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-secondary/40 focus-within:border-primary/50 transition-colors">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}
