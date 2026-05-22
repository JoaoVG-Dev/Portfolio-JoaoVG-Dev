import { FormEvent, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';

type AdminLoginPageProps = {
  authError: string | null;
  isLoading: boolean;
  onSignIn: (credentials: { email: string; password: string }) => Promise<void>;
};

export function AdminLoginPage({ authError, isLoading, onSignIn }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSignIn({ email, password });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-auth-panel">
        <div className="admin-auth-copy">
          <ShieldCheck size={34} />
          <p className="admin-eyebrow">Portfolio CMS</p>
          <h1>Entrar no painel administrativo</h1>
          <p>Use o e-mail autorizado no Supabase para editar o conteúdo público.</p>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {authError && <p className="admin-form-error">{authError}</p>}
          <button type="submit" disabled={isSubmitting || isLoading}>
            <KeyRound size={18} />
            {isSubmitting || isLoading ? 'Validando...' : 'Entrar'}
          </button>
        </form>

        <a className="admin-secondary-link" href="/">
          Voltar ao portfólio
        </a>
      </section>
    </main>
  );
}
