import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Check,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  createCmsRecord,
  deleteCmsRecord,
  fetchCmsRecords,
  fetchProjectTechnologyIds,
  fetchTechnologyOptions,
  setProjectTechnologyIds,
  updateCmsRecord,
  type TechnologyOption,
} from '../../lib/adminRepository';
import type { CmsField, CmsRecord, CmsRecordValue, CmsResourceConfig } from '../../types/cms';

type AdminResourcePageProps = {
  config: CmsResourceConfig;
};

function cloneRecord(record: CmsRecord): CmsRecord {
  return { ...record };
}

function normalizeValue(field: CmsField, value: CmsRecordValue | undefined): CmsRecordValue {
  if (field.type === 'number') {
    return Number(value ?? 0);
  }

  if (field.type === 'checkbox') {
    return Boolean(value);
  }

  if (value === '') {
    return field.required ? '' : null;
  }

  return value ?? null;
}

function buildPayload(config: CmsResourceConfig, formRecord: CmsRecord): CmsRecord {
  return config.fields.reduce<CmsRecord>((payload, field) => {
    payload[field.name] = normalizeValue(field, formRecord[field.name]);
    return payload;
  }, {});
}

export function AdminResourcePage({ config }: AdminResourcePageProps) {
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [formRecord, setFormRecord] = useState<CmsRecord>(() => cloneRecord(config.initialRecord));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [technologyOptions, setTechnologyOptions] = useState<TechnologyOption[]>([]);
  const [selectedTechnologyIds, setSelectedTechnologyIds] = useState<string[]>([]);

  const isProjectResource = config.key === 'projects';

  const formTitle = useMemo(
    () => (editingId ? `Editar ${config.singular}` : `Novo ${config.singular}`),
    [config.singular, editingId],
  );

  async function refreshRecords() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [nextRecords, technologies] = await Promise.all([
        fetchCmsRecords(config),
        isProjectResource ? fetchTechnologyOptions() : Promise.resolve([]),
      ]);

      setRecords(nextRecords);
      setTechnologyOptions(technologies);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar dados.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const shouldOpenCreateForm = new URLSearchParams(window.location.search).get('new') === '1';

    setFormRecord(cloneRecord(config.initialRecord));
    setEditingId(null);
    setIsFormOpen(shouldOpenCreateForm);
    setSelectedTechnologyIds([]);
    refreshRecords();
  }, [config]);

  function updateField(field: CmsField, value: CmsRecordValue) {
    setFormRecord((current) => ({
      ...current,
      [field.name]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setFormRecord(cloneRecord(config.initialRecord));
    setSelectedTechnologyIds([]);
    setStatusMessage(null);
    setErrorMessage(null);
    setIsFormOpen(true);
  }

  async function startEdit(record: CmsRecord) {
    setEditingId(String(record.id));
    setFormRecord(cloneRecord(record));
    setStatusMessage(null);
    setErrorMessage(null);
    setIsFormOpen(true);

    if (isProjectResource && record.id) {
      try {
        const ids = await fetchProjectTechnologyIds(String(record.id));
        setSelectedTechnologyIds(ids);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar tecnologias.');
      }
    }
  }

  function cancelForm() {
    setEditingId(null);
    setFormRecord(cloneRecord(config.initialRecord));
    setSelectedTechnologyIds([]);
    setIsFormOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const payload = buildPayload(config, formRecord);
      const savedRecord = editingId
        ? await updateCmsRecord(config, editingId, payload)
        : await createCmsRecord(config, payload);

      if (isProjectResource && savedRecord.id) {
        await setProjectTechnologyIds(String(savedRecord.id), selectedTechnologyIds);
      }

      setStatusMessage(`${config.singular} salvo com sucesso.`);
      cancelForm();
      await refreshRecords();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(record: CmsRecord) {
    if (!record.id) {
      return;
    }

    try {
      setErrorMessage(null);
      await updateCmsRecord(config, String(record.id), {
        active: !Boolean(record.active),
      });
      setStatusMessage(`${config.singular} atualizado com sucesso.`);
      await refreshRecords();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível atualizar status.');
    }
  }

  async function handleToggleFeatured(record: CmsRecord) {
    if (!isProjectResource || !record.id) {
      return;
    }

    try {
      setErrorMessage(null);
      await updateCmsRecord(config, String(record.id), {
        featured: !Boolean(record.featured),
      });
      setStatusMessage(
        Boolean(record.featured) ? 'Projeto removido dos destaques.' : 'Projeto marcado como destaque.',
      );
      await refreshRecords();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível atualizar destaque.');
    }
  }

  async function handleDelete(record: CmsRecord) {
    if (!record.id) {
      return;
    }

    const shouldDelete = window.confirm(`Excluir ${config.singular} "${config.getTitle(record)}"?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setErrorMessage(null);
      setStatusMessage(null);
      await deleteCmsRecord(config, String(record.id));
      setStatusMessage(`${config.singular} excluído com sucesso.`);
      await refreshRecords();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir.');
    }
  }

  function toggleTechnology(technologyId: string) {
    setSelectedTechnologyIds((current) =>
      current.includes(technologyId)
        ? current.filter((id) => id !== technologyId)
        : [...current, technologyId],
    );
  }

  function renderField(field: CmsField) {
    const value = formRecord[field.name];

    if (field.type === 'textarea') {
      return (
        <textarea
          value={String(value ?? '')}
          onChange={(event) => updateField(field, event.target.value)}
          required={field.required}
          rows={5}
          placeholder={field.placeholder}
        />
      );
    }

    if (field.type === 'checkbox') {
      return (
        <span className="cms-checkbox">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateField(field, event.target.checked)}
          />
          <Check size={16} />
        </span>
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={String(value ?? '')}
          onChange={(event) => updateField(field, event.target.value)}
          required={field.required}
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        value={String(value ?? '')}
        onChange={(event) =>
          updateField(field, field.type === 'number' ? Number(event.target.value) : event.target.value)
        }
        required={field.required}
        placeholder={field.placeholder}
      />
    );
  }

  return (
    <section className="admin-page-stack">
      <header className="admin-page-heading split">
        <div>
          <p className="admin-eyebrow">{config.title}</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <button className="admin-primary-action" type="button" onClick={startCreate}>
          <Plus size={18} />
          Novo {config.singular}
        </button>
      </header>

      {(statusMessage || errorMessage) && (
        <p className={errorMessage ? 'cms-message error' : 'cms-message'}>
          {errorMessage ?? statusMessage}
        </p>
      )}

      {isFormOpen && (
        <section className="admin-panel">
          <header className="admin-section-header">
            <div>
              <p className="admin-eyebrow">{editingId ? 'Edição' : 'Cadastro'}</p>
              <h2>{formTitle}</h2>
            </div>
            <button className="admin-icon-action" type="button" aria-label="Fechar formulário" onClick={cancelForm}>
              <X size={18} />
            </button>
          </header>

          <form className="cms-form" onSubmit={handleSubmit}>
            {config.fields.map((field) => (
              <label
                className={field.type === 'textarea' || field.type === 'url' ? 'cms-field wide' : 'cms-field'}
                key={field.name}
              >
                {field.label}
                {renderField(field)}
              </label>
            ))}

            {isProjectResource && (
              <fieldset className="cms-field wide cms-relation-field">
                <legend>Tecnologias associadas</legend>
                {technologyOptions.length === 0 && (
                  <p className="cms-empty-state">Cadastre tecnologias antes de associá-las ao projeto.</p>
                )}
                <div className="cms-chip-grid">
                  {technologyOptions.map((technology) => (
                    <label className="cms-relation-chip" key={technology.id}>
                      <input
                        type="checkbox"
                        checked={selectedTechnologyIds.includes(technology.id)}
                        onChange={() => toggleTechnology(technology.id)}
                      />
                      <span>{technology.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="cms-form-actions">
              <button type="submit" disabled={isSaving}>
                <Save size={18} />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
              <button className="cms-secondary-button" type="button" onClick={cancelForm}>
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-panel">
        <header className="admin-section-header">
          <div>
            <p className="admin-eyebrow">Listagem</p>
            <h2>{records.length} itens</h2>
          </div>
        </header>

        <div className="cms-record-list" aria-live="polite">
          {isLoading && <p className="cms-empty-state">Carregando {config.title.toLowerCase()}...</p>}

          {!isLoading && records.length === 0 && (
            <p className="cms-empty-state">Nenhum item cadastrado ainda.</p>
          )}

          {!isLoading &&
            records.map((record) => (
              <article className="cms-record-row" key={record.id}>
                <div>
                  <h3>{config.getTitle(record)}</h3>
                  <p>{config.getSubtitle(record)}</p>
                  <span className={record.active ? 'cms-status is-active' : 'cms-status'}>
                    {record.active ? 'Ativo' : 'Inativo'}
                  </span>
                  {isProjectResource && record.featured && (
                    <span className="cms-status is-featured">Destaque</span>
                  )}
                </div>
                <div className="cms-record-actions">
                  <button type="button" onClick={() => startEdit(record)}>
                    <Pencil size={17} />
                    Editar
                  </button>
                  {isProjectResource && (
                    <button type="button" onClick={() => handleToggleFeatured(record)}>
                      <Star size={17} />
                      {record.featured ? 'Remover destaque' : 'Destacar'}
                    </button>
                  )}
                  <button type="button" onClick={() => handleToggleActive(record)}>
                    {record.active ? <EyeOff size={17} /> : <Eye size={17} />}
                    {record.active ? 'Inativar' : 'Ativar'}
                  </button>
                  <button type="button" onClick={() => handleDelete(record)}>
                    <Trash2 size={17} />
                    Excluir
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>
    </section>
  );
}
