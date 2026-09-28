import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { SearchableAsyncSelect } from '../../../../core/ui/forms/SearchableAsyncSelect';
import { getApiErrorMessage } from '../../../../core/api/errorHandlers';
import { processPdfBlob } from '../../../../core/utils/pdfHandler';
import { getCurrentDateTimeLocalISO } from '../../../../core/utils/dateUtils';
import { ROUTES } from '../../../../core/routes/routes';
import { ENDPOINTS } from '../../../../core/api/endpoints';
import type { FormField } from '../../../../core/types/form';

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
  const [loading, setLoading] = useState(!!id);
  const [isPrinting, setIsPrinting] = useState(false);
  const submitIntent = useRef<'save' | 'save_print'>('save');

  const {
    control,
    register,
    reset,
    setValue,
    handleSubmit,
    formState: { errors },
  } = methods;

  const hodometroQuebrado = useWatch({ control, name: 'hodometro_quebrado' });

  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then((res) => reset(mapReadToForm(res)))
        .catch((err) => setGlobalError(getApiErrorMessage(err, 'Erro ao carregar a guia.')))
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

    try {
      const formData = guiaAbastecimentoFormSchema.parse(rawFormData);
      const payload = mapFormToWriteDTO(formData);

      let currentId = id ? Number(id) : null;

      if (currentId) {
        await guiasApi.atualizar(currentId, payload);
      } else {
        const res = await guiasApi.criar(payload);
        currentId = res.id;
      }

      if (submitIntent.current === 'save_print' && currentId) {
        setIsPrinting(true);
        const pdfBlob = await guiasApi.obterPdfBlob(currentId);
        await processPdfBlob(pdfBlob, `Guia_Abastecimento_${currentId}.pdf`, 'print');
      }

      navigate(ROUTES.operacao.guias.list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setGlobalError('Verifique os campos obrigatórios.');
      } else {
        setGlobalError(getApiErrorMessage(error, 'Não foi possível salvar a guia.'));
      }
    } finally {
      setIsPrinting(false);
      submitIntent.current = 'save';
    }
  };

  const asyncField = (
    field: FormField<GuiaAbastecimentoFormInput>,
    name: keyof GuiaAbastecimentoFormInput,
  ) => (
    <SearchableAsyncSelect
      field={field}
      control={control}
      setValue={setValue}
      register={register}
      error={errors[name]}
      disabled={isPrinting}
    />
  );

  if (loading) {
    return <div className={styles.loading}>Carregando dados...</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>{id ? 'Editar Guia de Abastecimento' : 'Nova Guia de Abastecimento'}</h1>
        <p>{id ? `Editando registro #${id}` : 'Preencha os dados da guia.'}</p>
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
              <input id="data_hora" type="datetime-local" {...register('data_hora')} disabled={isPrinting} />
              {errors.data_hora && <span className={styles.fieldError}>{errors.data_hora.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="modalidade">Tipo de guia / operação *</label>
              <input
                id="modalidade"
                type="text"
                placeholder="Ex.: transporte escolar, saúde, roçagem"
                {...register('modalidade')}
                disabled={isPrinting}
              />
              {errors.modalidade && <span className={styles.fieldError}>{errors.modalidade.message}</span>}
            </div>

            <div className={styles.field}>
              <label>Secretaria *</label>
              {asyncField({
                name: 'secretaria_id',
                label: 'Secretaria',
                type: 'select',
                endpoint: ENDPOINTS.organizacao.secretariasLookup,
                required: true,
              }, 'secretaria_id')}
              {errors.secretaria_id && <span className={styles.fieldError}>{errors.secretaria_id.message}</span>}
            </div>

            <div className={styles.field}>
              <label>Motorista / condutor *</label>
              {asyncField({
                name: 'pessoa_id',
                label: 'Motorista / Condutor',
                type: 'select',
                endpoint: ENDPOINTS.pessoas.lookup,
                required: true,
              }, 'pessoa_id')}
              {errors.pessoa_id && <span className={styles.fieldError}>{errors.pessoa_id.message}</span>}
            </div>

            <div className={styles.field}>
              <label>Veículo / equipamento *</label>
              {asyncField({
                name: 'veiculo',
                label: 'Veículo / Equipamento',
                type: 'select',
                endpoint: ENDPOINTS.frota.veiculosLookup,
                creatable: true,
                required: true,
                placeholder: 'Selecione ou digite o equipamento',
              }, 'veiculo')}
              {errors.veiculo && <span className={styles.fieldError}>{errors.veiculo.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="tipo_veiculo">Tipo do equipamento</label>
              <input
                id="tipo_veiculo"
                type="text"
                placeholder="Ex.: roçador, corote, máquina"
                {...register('tipo_veiculo')}
                disabled={isPrinting}
              />
              {errors.tipo_veiculo && <span className={styles.fieldError}>{errors.tipo_veiculo.message}</span>}
            </div>

            <div className={styles.field}>
              <label>Instituição / local atendido</label>
              {asyncField({
                name: 'instituicao_id',
                label: 'Instituição / Local atendido',
                type: 'select',
                endpoint: ENDPOINTS.organizacao.instituicoesLookup,
              }, 'instituicao_id')}
              {errors.instituicao_id && <span className={styles.fieldError}>{errors.instituicao_id.message}</span>}
            </div>

            <div className={styles.field}>
              <label>Rota / serviço *</label>
              {asyncField({
                name: 'rota_manual',
                label: 'Rota / Serviço',
                type: 'select',
                endpoint: ENDPOINTS.frota.rotasLookup,
                dependsOn: 'secretaria_id',
                dependsOnParam: 'secretaria',
                creatable: true,
                required: true,
                placeholder: 'Selecione ou digite o serviço',
              }, 'rota_manual')}
              {errors.rota_manual && <span className={styles.fieldError}>{errors.rota_manual.message}</span>}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Abastecimento</h2>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Tipo de combustível *</label>
              {asyncField({
                name: 'tipo_combustivel_id',
                label: 'Tipo de Combustível',
                type: 'select',
                endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
                required: true,
              }, 'tipo_combustivel_id')}
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
                disabled={isPrinting}
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
                disabled={isPrinting}
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
                disabled={isPrinting}
              />
              {errors.periodo_uso_dias && <span className={styles.fieldError}>{errors.periodo_uso_dias.message}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="hodometro">Hodômetro (km)</label>
              <input
                id="hodometro"
                type="number"
                min="0"
                step="0.01"
                {...register('hodometro')}
                disabled={isPrinting || hodometroQuebrado}
              />
              {errors.hodometro && <span className={styles.fieldError}>{errors.hodometro.message}</span>}
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" {...register('hodometro_quebrado')} disabled={isPrinting} />
              Hodômetro não disponível / quebrado
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Observação</h2>
          <div className={styles.field}>
            <label htmlFor="observacao">Observação</label>
            <textarea id="observacao" rows={4} {...register('observacao')} disabled={isPrinting} />
            {errors.observacao && <span className={styles.fieldError}>{errors.observacao.message}</span>}
          </div>
        </section>

        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton} disabled={isPrinting}>
            {isPrinting ? 'Processando...' : 'Salvar'}
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            disabled={isPrinting}
            onClick={() => {
              submitIntent.current = 'save_print';
              handleSubmit(onSubmit)();
            }}
          >
            {isPrinting ? 'Gerando PDF...' : 'Salvar e imprimir'}
          </button>

          {id && (
            <button
              type="button"
              className={styles.secondaryButton}
              disabled={isPrinting}
              onClick={async () => {
                setIsPrinting(true);
                try {
                  const pdfBlob = await guiasApi.obterPdfBlob(Number(id));
                  await processPdfBlob(pdfBlob, `Guia_${id}.pdf`, 'print');
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
            disabled={isPrinting}
            onClick={() => navigate(ROUTES.operacao.guias.list)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
