import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  Check,
  Code2,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
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
import { uploadProjectImage } from '../../lib/projectImageRepository';
import { isSafeExternalUrl, isSafeImageSrc, toSafeExternalUrl, toSafeImageSrc } from '../../lib/urlSafety';
import type { CmsField, CmsRecord, CmsRecordValue, CmsResourceConfig } from '../../types/cms';

type AdminResourcePageProps = {
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

  if (field.type === 'select') {
    if (Array.isArray(value)) {
      return field.defaultValue ?? null;
    }

    const stringValue = typeof value === 'string' ? value.trim() : value == null ? '' : String(value);

    if (!stringValue) {
      return field.defaultValue ?? (field.required ? '' : null);
    }

    const isKnownOption = field.options?.some((option) => option.value === stringValue) ?? true;

    if (field.defaultValue && !isKnownOption) {
      return field.defaultValue;
    }

    return stringValue;
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
    if (field.name === 'display_order') {
      return payload;
    }

    payload[field.name] = normalizeValue(field, formRecord[field.name]);
    return payload;
  }, {});
}

function validatePayload(config: CmsResourceConfig, payload: CmsRecord) {
  for (const field of config.fields) {
    const value = payload[field.name];

    if (typeof value !== 'string' || !value.trim()) {
      continue;
    }

    if (field.type === 'url' && !isSafeExternalUrl(value)) {
      throw new Error(`${field.label}: use uma URL pública iniciada por http:// ou https://.`);
    }

    if ((field.name === 'cover_url' || field.name === 'image_url') && !isSafeImageSrc(value)) {
      throw new Error(`${field.label}: use uma imagem pública válida do projeto.`);
    }
  }
}

function getStringValue(record: CmsRecord, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value : '';
}

function getStringArray(record: CmsRecord, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function getNextDisplayOrder(records: CmsRecord[]) {
  const maxOrder = records.reduce((max, record) => {
    const value = record.display_order;
    return typeof value === 'number' && value > max ? value : max;
  }, 0);

  return maxOrder + 1;
}

function formatDate(value: CmsRecordValue | string[] | undefined) {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function ImagePreview({ alt, src }: { alt: string; src: string }) {
  const [hasError, setHasError] = useState(false);
  const safeSrc = toSafeImageSrc(src);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!safeSrc || hasError) {
    return (
      <div className="cms-image-preview is-empty">
        <ImageIcon size={22} />
        <span>{src ? 'Não foi possível carregar esta imagem.' : 'Preview da imagem aparecerá aqui.'}</span>
      </div>
    );
  }

  return (
    <div className="cms-image-preview">
      <img src={safeSrc} alt={alt} loading="lazy" decoding="async" onError={() => setHasError(true)} />
    </div>
  );
}

function readImagePreview(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Preview indisponivel.'));
    };
    reader.onerror = () => reject(new Error('Preview indisponivel.'));
    reader.readAsDataURL(file);
  });
}

function IconPreview({ name, src }: { name: string; src: string }) {
  const [hasError, setHasError] = useState(false);
  const safeSrc = toSafeImageSrc(src);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <div className="cms-icon-preview">
      {safeSrc && !hasError ? (
        <img src={safeSrc} alt={name} loading="lazy" decoding="async" onError={() => setHasError(true)} />
      ) : (
        <Code2 size={20} />
      )}
      <span>
        {src && !safeSrc
          ? 'URL de ícone inválida.'
          : src && hasError
            ? 'Não foi possível carregar o ícone.'
            : 'Preview do ícone'}
      </span>
    </div>
  );
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
  const [projectImagePreviewSrc, setProjectImagePreviewSrc] = useState<string | null>(null);
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false);
  const projectImageInputRef = useRef<HTMLInputElement | null>(null);

  const isProjectResource = config.key === 'projects';
  const isCertificateResource = config.key === 'certificates';
  const isTechnologyResource = config.key === 'technologies';

  const formTitle = useMemo(
    () => (editingId ? `Editar ${config.singular}` : `Novo ${config.singular}`),
    [config.singular, editingId],
  );

  const fieldGroups = useMemo(() => {
    const fields = config.fields.filter((field) => field.name !== 'display_order');

    if (isProjectResource) {
      return [
        {
          title: 'Informações principais',
          fields: fields.filter((field) =>
            ['title', 'slug', 'short_description', 'description', 'started_at', 'completed_at'].includes(field.name),
          ),
        },
        {
          title: 'Imagem',
          fields: fields.filter((field) => ['cover_url'].includes(field.name)),
        },
        {
          title: 'Links do projeto',
          fields: fields.filter((field) => ['deploy_url', 'github_url'].includes(field.name)),
        },
        {
          title: 'Status e publicação',
          fields: fields.filter((field) => ['status', 'featured', 'active'].includes(field.name)),
        },
      ];
    }

    if (isCertificateResource) {
      return [
        {
          title: 'Informações principais',
          fields: fields.filter((field) =>
            ['title', 'institution', 'category', 'workload', 'completed_at'].includes(field.name),
          ),
        },
        {
          title: 'Credencial',
          fields: fields.filter((field) => ['certificate_url'].includes(field.name)),
        },
        {
          title: 'Publicação',
          fields: fields.filter((field) => ['active', 'featured'].includes(field.name)),
        },
      ];
    }

    return [{ title: 'Informações', fields }];
  }, [config.fields, isCertificateResource, isProjectResource]);

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
    setProjectImagePreviewSrc(null);
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
    setFormRecord({
      ...cloneRecord(config.initialRecord),
      display_order: getNextDisplayOrder(records),
    });
    setSelectedTechnologyIds([]);
    setProjectImagePreviewSrc(null);
    setStatusMessage(null);
    setErrorMessage(null);
    setIsFormOpen(true);
  }

  async function startEdit(record: CmsRecord) {
    setEditingId(String(record.id));
    setFormRecord(cloneRecord(record));
    setSelectedTechnologyIds(getStringArray(record, 'technology_ids'));
    setProjectImagePreviewSrc(null);
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
    setProjectImagePreviewSrc(null);
    setIsFormOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const payload = buildPayload(config, formRecord);
      validatePayload(config, payload);

      if (!editingId && config.fields.some((field) => field.name === 'display_order')) {
        payload.display_order = getNextDisplayOrder(records);
      }

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
    if ((!isProjectResource && !isCertificateResource) || !record.id) {
      return;
    }

    try {
      setErrorMessage(null);
      await updateCmsRecord(config, String(record.id), {
        featured: !Boolean(record.featured),
      });
      const label = isCertificateResource ? 'Certificado' : 'Projeto';
      setStatusMessage(Boolean(record.featured) ? `${label} removido dos destaques.` : `${label} destacado.`);
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

  async function handleProjectImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsUploadingProjectImage(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      try {
        setProjectImagePreviewSrc(await readImagePreview(file));
      } catch {
        setProjectImagePreviewSrc(null);
      }

      const uploadedImage = await uploadProjectImage(file);
      setFormRecord((current) => ({
        ...current,
        cover_url: uploadedImage.value,
      }));
      setProjectImagePreviewSrc(null);
      setStatusMessage(`Imagem "${uploadedImage.label}" enviada para o Supabase Storage.`);
    } catch (error) {
      setProjectImagePreviewSrc(null);
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setIsUploadingProjectImage(false);
    }
  }

  function renderField(field: CmsField) {
    const value = formRecord[field.name];
    const fieldId = `${config.key}-${field.name}`;

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

    if (field.name === 'cover_url') {
      const selectedValue = String(value ?? '');
      const previewSrc = projectImagePreviewSrc ?? selectedValue;

      return (
        <div className="cms-project-image-field">
          <div className="cms-image-upload-actions">
            <button
              className="cms-upload-button"
              type="button"
              disabled={isUploadingProjectImage}
              onClick={() => projectImageInputRef.current?.click()}
            >
              <Upload size={17} />
              {isUploadingProjectImage ? 'Enviando imagem...' : selectedValue ? 'Trocar imagem' : 'Escolher imagem'}
            </button>
            <input
              className="cms-file-input"
              ref={projectImageInputRef}
              id={fieldId}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={isUploadingProjectImage}
              aria-label="Escolher imagem do projeto"
              onChange={handleProjectImageUpload}
            />
          </div>
          <ImagePreview
            src={previewSrc}
            alt="Preview da imagem do projeto"
          />
        </div>
      );
    }

    if (field.type === 'select') {
      let selectedValue = String(value ?? field.defaultValue ?? '');
      const selectOptions = field.options ?? [];
      let currentValueIsOption = selectOptions.some((option) => option.value === selectedValue);

      if (field.defaultValue && selectedValue && !currentValueIsOption) {
        selectedValue = field.defaultValue;
        currentValueIsOption = selectOptions.some((option) => option.value === selectedValue);
      }

      const visibleOptions =
        selectedValue && !currentValueIsOption
          ? [{ label: `Atual: ${selectedValue}`, value: selectedValue }, ...selectOptions]
          : selectOptions;

      return (
        <select
          value={selectedValue}
          onChange={(event) => updateField(field, event.target.value)}
          required={field.required}
        >
          {visibleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    const input = (
      <input
        id={fieldId}
        type={field.type}
        value={String(value ?? '')}
        onChange={(event) =>
          updateField(field, field.type === 'number' ? Number(event.target.value) : event.target.value)
        }
        required={field.required}
        placeholder={field.placeholder}
      />
    );

    if (field.name === 'cover_url' || field.name === 'image_url') {
      return (
        <>
          {input}
          <ImagePreview
            src={String(value ?? '')}
            alt={field.name === 'cover_url' ? 'Preview da imagem de capa do projeto' : 'Preview do certificado'}
          />
        </>
      );
    }

    if (field.name === 'icon_url') {
      return (
        <>
          {input}
          <IconPreview src={String(value ?? '')} name={String(formRecord.name ?? 'Tecnologia')} />
        </>
      );
    }

    return input;
  }

  function renderTechnologySelector() {
    const selectedTechnologies = technologyOptions.filter((technology) =>
      selectedTechnologyIds.includes(technology.id),
    );

    return (
      <fieldset className="cms-form-group cms-relation-field">
        <legend>Tecnologias usadas</legend>
        <p className="cms-field-hint">Selecione uma ou mais tecnologias já cadastradas para este projeto.</p>
        {technologyOptions.length === 0 && (
          <p className="cms-empty-state">Cadastre tecnologias antes de associá-las a um projeto.</p>
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
        {selectedTechnologies.length > 0 && (
          <div className="cms-selected-stack" aria-label="Tecnologias selecionadas">
            {selectedTechnologies.map((technology) => (
              <span className="cms-status is-featured" key={technology.id}>
                {technology.name}
              </span>
            ))}
          </div>
        )}
      </fieldset>
    );
  }

  function renderRecordMedia(record: CmsRecord) {
    if (!isProjectResource && !isCertificateResource && !isTechnologyResource) {
      return null;
    }

    const src = toSafeImageSrc(getStringValue(record, isProjectResource ? 'cover_url' : 'icon_url'));

    return (
      <div className={`cms-record-media${isTechnologyResource ? ' is-icon' : ''}`}>
        {isCertificateResource && <Award size={20} />}
        {isTechnologyResource && !src && <Code2 size={20} />}
        {isProjectResource && !src && <ImageIcon size={20} />}
        {src && !isCertificateResource && (
          <img
            src={src}
            alt={config.getTitle(record)}
            onError={(event) => {
              event.currentTarget.remove();
            }}
          />
        )}
      </div>
    );
  }

  function renderRecordMeta(record: CmsRecord) {
    const technologyNames = getStringArray(record, 'technology_names');
    const certificateUrl = toSafeExternalUrl(getStringValue(record, 'certificate_url'));
    const completedAt = formatDate(record.completed_at);

    return (
      <>
        {isProjectResource && (
          <div className="cms-record-badges">
            {getStringValue(record, 'status') && (
              <span className="cms-status">{getStringValue(record, 'status')}</span>
            )}
            <span className={record.active ? 'cms-status is-active' : 'cms-status'}>
              {record.active ? 'Ativo' : 'Inativo'}
            </span>
            {record.featured && <span className="cms-status is-featured">Destaque</span>}
          </div>
        )}
        {isProjectResource && technologyNames.length > 0 && (
          <div className="cms-record-badges">
            {technologyNames.map((name) => (
              <span className="cms-tech-badge" key={name}>
                {name}
              </span>
            ))}
          </div>
        )}
        {isCertificateResource && (
          <div className="cms-record-badges">
            {getStringValue(record, 'category') && (
              <span className="cms-status">{getStringValue(record, 'category')}</span>
            )}
            {completedAt && <span className="cms-status">Concluído em {completedAt}</span>}
            <span className={record.active ? 'cms-status is-active' : 'cms-status'}>
              {record.active ? 'Ativo' : 'Inativo'}
            </span>
            {record.featured && <span className="cms-status is-featured">Destaque</span>}
            {certificateUrl && (
              <a className="cms-inline-link" href={certificateUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
                Ver certificado
              </a>
            )}
          </div>
        )}
        {!isProjectResource && !isCertificateResource && (
          <span className={record.active ? 'cms-status is-active' : 'cms-status'}>
            {record.active ? 'Ativo' : 'Inativo'}
          </span>
        )}
      </>
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
            {fieldGroups.map((group) => (
              <fieldset className="cms-form-group" key={group.title}>
                <legend>{group.title}</legend>
                <div className="cms-form-grid">
                  {group.fields.map((field) => {
                    const fieldClass =
                      field.type === 'textarea' || field.type === 'url' || field.name === 'cover_url'
                        ? 'cms-field wide'
                        : 'cms-field';

                    if (field.name === 'cover_url') {
                      return (
                        <div className={fieldClass} key={field.name}>
                          <span>{field.label}</span>
                          {renderField(field)}
                          {field.hint && <span className="cms-field-hint">{field.hint}</span>}
                        </div>
                      );
                    }

                    return (
                      <label className={fieldClass} key={field.name}>
                        {field.label}
                        {renderField(field)}
                        {field.hint && <span className="cms-field-hint">{field.hint}</span>}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {isProjectResource && renderTechnologySelector()}

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
                <div className="cms-record-main">
                  {renderRecordMedia(record)}
                  <div className="cms-record-copy">
                    <h3>{config.getTitle(record)}</h3>
                    <p>{config.getSubtitle(record)}</p>
                    {renderRecordMeta(record)}
                  </div>
                </div>
                <div className="cms-record-actions">
                  <button type="button" onClick={() => startEdit(record)}>
                    <Pencil size={17} />
                    Editar
                  </button>
                  {(isProjectResource || isCertificateResource) && (
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
