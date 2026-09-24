import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { DynamicForm } from '../../../../core/ui/forms/dynamic-form/DynamicForm';
import { getApiErrorMessage } from '../../../../core/api/errorHandlers';
import { processPdfBlob } from '../../../../core/utils/pdfHandler';
import { getCurrentDateTimeLocalISO } from '../../../../core/utils/dateUtils';
import { ROUTES } from '../../../../core/routes/routes';

import { guiasApi } from '../api/guias.api';
import { mapReadToForm, mapFormToWriteDTO } from '../api/guias.mapper';
import { guiaAbastecimentoUISchema } from '../schemas/guia.ui';
import { guiaAbastecimentoFormSchema, type GuiaAbastecimentoFormInput } from '../schemas/guia.form';

import layoutStyles from '../../../../core/ui/layouts/FormPage.module.css';

export default function GuiaAbastecimentoFormPage() {
  const methods = useForm<GuiaAbastecimentoFormInput>({
    resolver: zodResolver(guiaAbastecimentoFormSchema),
    mode: 'onChange',
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [isPrinting, setIsPrinting] = useState(false);
  const submitIntent = useRef<'save' | 'save_print'>('save');

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then((res) => {
          if (res.data_hora) res.data_hora = new Date(res.data_hora).toISOString().slice(0, 16);
          reset(mapReadToForm(res));
        })
        .catch((err) => setGlobalError(getApiErrorMessage(err, 'Erro ao carregar a guia.')))
        .finally(() => setLoading(false));
      return;
    }

    const secretariaParam = searchParams.get('secretaria');
    reset({
      data_hora: getCurrentDateTimeLocalISO(),
      secretaria_id: secretariaParam ? Number(secretariaParam) : undefined,
      periodo_uso_dias: 30,
      hodometro_quebrado: false,
    });
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
        setIsPrinting(false);
      }

      navigate(ROUTES.operacao.guias.list);
    } catch (error) {
      setIsPrinting(false);
      if (error instanceof z.ZodError) {
        setGlobalError('Verifique os campos obrigatórios.');
      } else {
        setGlobalError(getApiErrorMessage(error, 'Não foi possível salvar a guia.'));
      }
      submitIntent.current = 'save';
    }
  };

  if (loading) return <div className={layoutStyles.loading}>Carregando dados...</div>;

  return (
    <div className={layoutStyles.pageContainer}>
      <header className={layoutStyles.header}>
        <h1 className={layoutStyles.title}>
          {id ? 'Editar Guia de Abastecimento' : 'Nova Guia de Abastecimento'}
        </h1>
        <p className={layoutStyles.subtitle}>
          {id ? `Editando registro #${id}` : 'Preencha os dados da guia'}
        </p>
      </header>

      {globalError && <div className={layoutStyles.alertError}>⚠️ {globalError}</div>}

      <div className={layoutStyles.card}>
        <FormProvider {...methods}>
          <DynamicForm<GuiaAbastecimentoFormInput>
            uiSchema={guiaAbastecimentoUISchema}
            onSubmit={methods.handleSubmit(onSubmit)}
            isLoading={isPrinting}
          />

          <div className={layoutStyles.extraActions}>
            <button
              type="button"
              className={layoutStyles.btnSecondary}
              onClick={() => {
                submitIntent.current = 'save_print';
                handleSubmit(onSubmit)();
              }}
              disabled={isPrinting}
            >
              {isPrinting ? 'Gerando PDF...' : '💾 Salvar e Imprimir'}
            </button>

            {id && (
              <button
                type="button"
                className={layoutStyles.btnOutline}
                onClick={async () => {
                  setIsPrinting(true);
                  try {
                    const pdfBlob = await guiasApi.obterPdfBlob(Number(id));
                    await processPdfBlob(pdfBlob, `Guia_${id}.pdf`, 'print');
                  } finally {
                    setIsPrinting(false);
                  }
                }}
                disabled={isPrinting}
              >
                🖨️ Imprimir Versão Salva
              </button>
            )}

            <button
              type="button"
              className={layoutStyles.btnCancel}
              onClick={() => navigate(ROUTES.operacao.guias.list)}
            >
              Cancelar
            </button>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}