import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, Pencil, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import {
  createCmsRecord,
  deleteCmsRecord,
  fetchCmsRecords,
  updateCmsRecord,
} from '../../lib/adminRepository';
import type { CmsField, CmsRecord, CmsRecordValue, CmsResourceConfig } from '../../types/cms';

type CmsResourceManagerProps = {
  config: CmsResourceConfig;
};

function cloneRecord(record: CmsRecord): CmsRecord {
  return { ...record };
}

function normalizeValue(field: CmsField, value: CmsRecordValue | string[] | undefined): CmsRecordValue {
  if (field.type === 'number') {
    return Number(value ?? 0);
  }

  if (field.type === 'checkbox') {
    return Boolean(value);
  }

  if (value === '') {
    return field.required ? '' : null;
  }

  if (Array.isArray(value)) {
    return null;
  }

  return value ?? null;
}

function buildPayload(config: CmsResourceConfig, formRecord: CmsRecord): CmsRecord {
  return config.fields.reduce<CmsRecord>((payload, field) => {
    payload[field.name] = normalizeValue(field, formRecord[field.name]);
    return payload;
  }, {});
}

export function CmsResourceManager({ config }: CmsResourceManagerProps) {
  const [records, setRecords] = useState<CmsRecord[]>([]);
  const [formRecord, setFormRecord] = useState<CmsRecord>(() => cloneRecord(config.initialRecord));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formTitle = useMemo(
    () => (editingId ? `Editar ${config.singular}` : `Novo ${config.singular}`),
    [config.singular, editingId],
  );

  async function refreshRecords() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextRecords = await fetchCmsRecords(config);
      setRecords(nextRecords);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar dados.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshRecords();
  }, [config]);

  function updateField(field: CmsField, value: CmsRecordValue) {
    setFormRecord((current) => ({
      ...current,
      [field.name]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setFormRecord(cloneRecord(config.initialRecord));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const payload = buildPayload(config, formRecord);

      if (editingId) {
        await updateCmsRecord(config, editingId, payload);
        setStatusMessage(`${config.singular} atualizado com sucesso.`);
      } else {
        await createCmsRecord(config, payload);
        setStatusMessage(`${config.singular} criado com sucesso.`);
      }

      resetForm();
      await refreshRecords();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar.');
    } finally {
      setIsSaving(false);
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

    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await deleteCmsRecord(config, record.id);
      setStatusMessage(`${config.singular} excluído com sucesso.`);
      await refreshRecords();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir.');
    }
  }

  function renderField(field: CmsField) {
    const value = formRecord[field.name];

    if (field.type === 'textarea') {
      return (
        <textarea
          value={String(value ?? '')}
          onChange={(event) => updateField(field, event.target.value)}
          required={field.required}
          rows={4}
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
    <section className="cms-resource-section" id={config.key}>
      <header className="cms-resource-header">
        <div>
          <p className="admin-eyebrow">{config.title}</p>
          <h2>{formTitle}</h2>
          <p>{config.description}</p>
        </div>
        <button type="button" onClick={resetForm}>
          <Plus size={18} />
          Novo
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

        <div className="cms-form-actions">
          <button type="submit" disabled={isSaving}>
            <Save size={18} />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          {editingId && (
            <button className="cms-secondary-button" type="button" onClick={resetForm}>
              <RotateCcw size={18} />
              Cancelar
            </button>
          )}
        </div>
      </form>

      {(statusMessage || errorMessage) && (
        <p className={errorMessage ? 'cms-message error' : 'cms-message'}>{errorMessage ?? statusMessage}</p>
      )}

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
              </div>
              <div className="cms-record-actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(String(record.id));
                    setFormRecord(cloneRecord(record));
                  }}
                >
                  <Pencil size={17} />
                  Editar
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
  );
}
