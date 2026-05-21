import { FormEvent, useEffect, useState } from 'react';
import { RotateCcw, Save, Settings } from 'lucide-react';
import {
  fetchAdminProfile,
  updateAdminProfile,
  type ProfileSettingsRecord,
} from '../../lib/adminRepository';

const emptyProfile: ProfileSettingsRecord = {
  id: '',
  name: '',
  title: '',
  bio: '',
  avatar_url: '',
  github_url: '',
  linkedin_url: '',
  whatsapp_url: '',
  email: '',
};

export function AdminProfileSettings() {
  const [profile, setProfile] = useState<ProfileSettingsRecord>(emptyProfile);
  const [initialProfile, setInitialProfile] = useState<ProfileSettingsRecord>(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadProfile() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextProfile = await fetchAdminProfile();

      if (!nextProfile) {
        setErrorMessage('Profile admin não encontrado. Crie o usuário admin e rode o seed novamente.');
        return;
      }

      setProfile(nextProfile);
      setInitialProfile(nextProfile);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar o perfil.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateField(field: keyof ProfileSettingsRecord, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const { id: _id, ...payload } = profile;
      const savedProfile = await updateAdminProfile(payload);
      setProfile(savedProfile);
      setInitialProfile(savedProfile);
      setStatusMessage('Perfil atualizado com sucesso.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="admin-page-stack">
      <header className="admin-page-heading">
        <p className="admin-eyebrow">Configurações</p>
        <h1>Perfil do portfólio</h1>
        <p>Edite as informações principais exibidas no portfólio público.</p>
      </header>

      {(statusMessage || errorMessage) && (
        <p className={errorMessage ? 'cms-message error' : 'cms-message'}>
          {errorMessage ?? statusMessage}
        </p>
      )}

      <section className="admin-panel">
        <header className="admin-section-header">
          <div>
            <p className="admin-eyebrow">Dados públicos</p>
            <h2>Informações principais</h2>
          </div>
          <Settings size={22} />
        </header>

        {isLoading ? (
          <p className="cms-empty-state">Carregando perfil...</p>
        ) : (
          <form className="cms-form" onSubmit={handleSubmit}>
            <label className="cms-field">
              Nome
              <input value={profile.name} onChange={(event) => updateField('name', event.target.value)} required />
            </label>
            <label className="cms-field">
              Título
              <input value={profile.title} onChange={(event) => updateField('title', event.target.value)} required />
            </label>
            <label className="cms-field wide">
              Bio
              <textarea
                value={profile.bio}
                onChange={(event) => updateField('bio', event.target.value)}
                rows={6}
                required
              />
            </label>
            <label className="cms-field wide">
              Avatar URL
              <input
                type="url"
                value={profile.avatar_url}
                onChange={(event) => updateField('avatar_url', event.target.value)}
              />
            </label>
            <label className="cms-field wide">
              GitHub
              <input
                type="url"
                value={profile.github_url}
                onChange={(event) => updateField('github_url', event.target.value)}
              />
            </label>
            <label className="cms-field wide">
              LinkedIn
              <input
                type="url"
                value={profile.linkedin_url}
                onChange={(event) => updateField('linkedin_url', event.target.value)}
              />
            </label>
            <label className="cms-field wide">
              WhatsApp
              <input
                type="url"
                value={profile.whatsapp_url}
                onChange={(event) => updateField('whatsapp_url', event.target.value)}
              />
            </label>
            <label className="cms-field">
              E-mail
              <input
                type="email"
                value={profile.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </label>

            <div className="cms-form-actions">
              <button type="submit" disabled={isSaving}>
                <Save size={18} />
                {isSaving ? 'Salvando...' : 'Salvar perfil'}
              </button>
              <button
                className="cms-secondary-button"
                type="button"
                onClick={() => setProfile(initialProfile)}
              >
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>
    </section>
  );
}
