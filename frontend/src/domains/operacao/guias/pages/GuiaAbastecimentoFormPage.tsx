import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { BackendSelect } from '../../../../core/ui/forms/BackendSelect';
import { getApiErrorMessage } from '../../../../core/api/errorHandlers';
import { processPdfBlob } from '../../../../core/utils/pdfHandler';
import { getCurrentDateTimeLocalISO } from '../../../../core/utils/dateUtils';
import { ROUTES } from '../../../../core/routes/routes';
import { ENDPOINTS } from '../../../../core/api/endpoints';
import { veiculosApi } from '../../../frota/veiculos/api/veiculos.api';

import { guiasApi } from '../api/guias.api';
import { mapReadToForm, mapFormToWriteDTO } from '../api/guias.mapper';
import {
  guiaAbastecimentoFormSchema,
  type GuiaAbastecimentoFormInput,
} from '../schemas/guia.form';

import styles from './GuiaAbastecimentoFormPage.module.css';

export default function GuiaAbastecimentoFormPage() {
  const methods = useForm<GuiaAbastecimentoFormInput>({
    resolver: zodResolver(guiaAbastecimentoFormSchema),
    mode: 'onChange',
    defaultValues: {
      data_hora: getCurrentDateTimeLocalISO(),
      hodometro_quebrado: false,
    },
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loadFailure, setLoadFailure] = useState<{ id: string; message: string } | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [isPrinting, setIsPrinting] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(id ? Number(id) : null);
  const submitIntent = useRef<'save' | 'save_print'>('save');
  const fuelLookupRequest = useRef(0);

  const {
    control,
    register,
    reset,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const hodometroQuebrado = useWatch({ control, name: 'hodometro_quebrado' });
  const secretariaId = useWatch({ control, name: 'secretaria_id' });
  const instituicoesEndpoint = secretariaId
    ? `${ENDPOINTS.organizacao.instituicoesLookup}?secretaria=${secretariaId}`
    : ENDPOINTS.organizacao.instituicoesLookup;
  const rotasEndpoint = secretariaId
    ? `${ENDPOINTS.frota.rotasLookup}?secretaria=${secretariaId}`
    : ENDPOINTS.frota.rotasLookup;
  const busy = isSubmitting || isPrinting;

  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then((res) => reset(mapReadToForm(res)))
        .catch((err) => setLoadFailure({ id, message: getApiErrorMessage(err, 'Erro ao carregar a guia.') }))
        .finally(() => setLoading(false));
      return;
    }

    const secretariaParam = searchParams.get('secretaria');

    reset({
      data_hora: getCurrentDateTimeLocalISO(),
      secretaria_id: secretariaParam ? Number(secretariaParam) : undefined,
      hodometro_quebrado: false,
    });

    setLoading(false);
  }, [id, searchParams, reset]);

  const onSubmit: SubmitHandler<GuiaAbastecimentoFormInput> = async (rawFormData) => {
    setGlobalError(null);
    const shouldPrint = submitIntent.current === 'save_print';
    submitIntent.current = 'save';
    let saved = false;

    try {
      const formData = guiaAbastecimentoFormSchema.parse(rawFormData);
      const payload = mapFormToWriteDTO(formData);

      let currentId = savedId;

      if (currentId) {
        await guiasApi.atualizar(currentId, payload);
      } else {
        const res = await guiasApi.criar(payload);
        currentId = res.id;
        setSavedId(res.id);
      }
      saved = true;

      if (shouldPrint && currentId) {
        setIsPrinting(true);
        const pdfBlob = await guiasApi.obterPdfBlob(currentId);
        await processPdfBlob(pdfBlob, `Guia_Abastecimento_${currentId}.pdf`, 'print');
      }

      navigate(ROUTES.operacao.guias.list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setGlobalError('Verifique os campos obrigatórios.');
      } else {
        setGlobalError(saved
          ? `A guia foi salva, mas não foi possível gerar o PDF. ${getApiErrorMessage(error, '')}`.trim()
          : getApiErrorMessage(error, 'Não foi possível salvar a guia.'));
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const lookupField = (
    name: 'secretaria_id' | 'pessoa_id' | 'veiculo' | 'instituicao_id' | 'rota_manual' | 'tipo_combustivel_id',
    endpoint: string,
    allowManual = false,
    placeholder?: string,
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <BackendSelect
          key={endpoint}
          id={name}
          endpoint={endpoint}
          value={field.value as string | number | null | undefined}
          onChange={(value) => {
            if (name === 'secretaria_id' && value !== field.value) {
              setValue('instituicao_id', null, { shouldDirty: true, shouldValidate: true });
              if (typeof getValues('rota_manual') === 'number') {
                setValue('rota_manual', '', { shouldDirty: true, shouldValidate: true });
              }
            }

            field.onChange(value);

            if (name === 'veiculo') {
              const request = ++fuelLookupRequest.current;
              if (typeof value === 'number') {
                const previousFuel = getValues('tipo_combustivel_id');
                void veiculosApi.buscar(value).then((vehicle) => {
                  if (fuelLookupRequest.current === request &&
                      getValues('veiculo') === value &&
                      getValues('tipo_combustivel_id') === previousFuel) {
                    setValue('tipo_combustivel_id', vehicle.tipo_combustivel_id, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }).catch(() => {
                  // O campo continua editável caso a consulta do veículo falhe.
                });
              }
            }
          }}
          onBlur={field.onBlur}
          disabled={busy}
          allowManual={allowManual}
          placeholder={placeholder}
        />
      )}
    />
  );

  if (loading) {
    return <div className={styles.loading}>Carregando dados...</div>;
  }

  if (id && loadFailure?.id === id) {
    return (
      <div className={styles.page}>
        <div className={styles.errorAlert} role="alert">{loadFailure.message}</div>
        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={() => navigate(ROUTES.operacao.guias.list)}>
            Voltar para guias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{savedId ? 'Editar Guia de Abastecimento' : 'Nova Guia de Abastecimento'}</h1>
        <p>{savedId ? `Editando registro #${savedId}` : 'Preencha os dados da guia.'}</p>
      </header>

      {globalError && (
        <div className={styles.errorAlert} role="alert">
          {globalError}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className={styles.section}>
          <h2>Dados da guia</h2>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="data_hora">Data e hora *</label>
              <input id="data_hora" type="datetime-local" {...register('data_hora')} disabled={busy} />
              {errors.data_hora && <span className={styles.fieldError}>{errors.data_hora.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="modalidade">Tipo de guia / operação *</label>
              <input
                id="modalidade"
                type="text"
                placeholder="Ex.: transporte escolar, saúde, roçagem"
                {...register('modalidade')}
                disabled={busy}
              />
              {errors.modalidade && <span className={styles.fieldError}>{errors.modalidade.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="secretaria_id">Secretaria *</label>
              {lookupField('secretaria_id', ENDPOINTS.organizacao.secretariasLookup)}
              {errors.secretaria_id && <span className={styles.fieldError}>{errors.secretaria_id.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="pessoa_id">Motorista / condutor *</label>
              {lookupField('pessoa_id', ENDPOINTS.pessoas.lookup)}
              {errors.pessoa_id && <span className={styles.fieldError}>{errors.pessoa_id.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="veiculo">Veículo / equipamento *</label>
              {lookupField('veiculo', ENDPOINTS.frota.veiculosLookup, true, 'Selecione o veículo ou informe manualmente')}
              {errors.veiculo && <span className={styles.fieldError}>{errors.veiculo.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="tipo_veiculo">Tipo do equipamento</label>
              <input
                id="tipo_veiculo"
                type="text"
                placeholder="Ex.: roçador, corote, máquina"
                maxLength={50}
                {...register('tipo_veiculo')}
                disabled={busy}
              />
              {errors.tipo_veiculo && <span className={styles.fieldError}>{errors.tipo_veiculo.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="instituicao_id">Instituição / local atendido</label>
              {lookupField('instituicao_id', instituicoesEndpoint)}
              {errors.instituicao_id && <span className={styles.fieldError}>{errors.instituicao_id.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="rota_manual">Rota / serviço *</label>
              {lookupField('rota_manual', rotasEndpoint, true, 'Selecione a rota ou informe manualmente')}
              {errors.rota_manual && <span className={styles.fieldError}>{errors.rota_manual.message}</span>}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Abastecimento</h2>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label htmlFor="tipo_combustivel_id">Tipo de combustível *</label>
              {lookupField('tipo_combustivel_id', ENDPOINTS.frota.tiposCombustivelLookup)}
              {errors.tipo_combustivel_id && <span className={styles.fieldError}>{errors.tipo_combustivel_id.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="quantidade_combustivel">Quantidade de combustível (L) *</label>
              <input
                id="quantidade_combustivel"
                type="number"
                min="0"
                step="0.001"
                {...register('quantidade_combustivel')}
                disabled={busy}
              />
              {errors.quantidade_combustivel && <span className={styles.fieldError}>{errors.quantidade_combustivel.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="quantidade_oleo">Quantidade de óleo (L)</label>
              <input
                id="quantidade_oleo"
                type="number"
                min="0"
                step="0.001"
                {...register('quantidade_oleo')}
                disabled={busy}
              />
              {errors.quantidade_oleo && <span className={styles.fieldError}>{errors.quantidade_oleo.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="periodo_uso_dias">Período de uso (dias)</label>
              <input
                id="periodo_uso_dias"
                type="number"
                min="0"
                step="1"
                {...register('periodo_uso_dias')}
                disabled={busy}
              />
              {errors.periodo_uso_dias && <span className={styles.fieldError}>{errors.periodo_uso_dias.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="hodometro">Hodômetro (km)</label>
              <input
                id="hodometro"
                type="number"
                min="0"
                step="1"
                {...register('hodometro')}
                disabled={busy || hodometroQuebrado}
              />
              {errors.hodometro && <span className={styles.fieldError}>{errors.hodometro.message}</span>}
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" {...register('hodometro_quebrado', {
                onChange: (event) => {
                  if (event.target.checked) setValue('hodometro', null, { shouldValidate: true });
                },
              })} disabled={busy} />
              Hodômetro não disponível / quebrado
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Observação</h2>
          <div className={styles.field}>
            <label htmlFor="observacao">Observação</label>
            <textarea id="observacao" rows={4} {...register('observacao')} disabled={busy} />
            {errors.observacao && <span className={styles.fieldError}>{errors.observacao.message}</span>}
          </div>
        </section>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton} disabled={busy}>
            {busy ? 'Processando...' : 'Salvar'}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled={busy}
            onClick={() => {
              submitIntent.current = 'save_print';
              handleSubmit(onSubmit, () => { submitIntent.current = 'save'; })();
            }}
          >
            {busy ? 'Processando...' : 'Salvar e imprimir'}
          </button>

          {savedId && (
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={busy}
              onClick={async () => {
                setIsPrinting(true);
                try {
                  const pdfBlob = await guiasApi.obterPdfBlob(savedId);
                  await processPdfBlob(pdfBlob, `Guia_${savedId}.pdf`, 'print');
                } catch (error) {
                  setGlobalError(getApiErrorMessage(error, 'Não foi possível imprimir a guia.'));
                } finally {
                  setIsPrinting(false);
                }
              }}
            >
              Imprimir versão salva
            </button>
          )}

          <button
            type="button"
            className={styles.cancelButton}
            disabled={busy}
            onClick={() => navigate(ROUTES.operacao.guias.list)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
