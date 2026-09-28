import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { DynamicForm } from '../../../../core/ui/forms/dynamic-form/DynamicForm';
import { getApiErrorMessage } from '../../../../core/api/errorHandlers';
import { processPdfBlob } from '../../../../core/utils/pdfHandler';
import { getCurrentDateTimeLocalISO } from '../../../../core/utils/dateUtils';
import { ROUTES } from '../../../../core/routes/routes';

import { guiasApi } from '../api/guias.api';
import type { VeiculoReadDTO } from '../../../frota/veiculos/schemas/veiculo.dto';
import { veiculosApi } from '../../../frota/veiculos/api/veiculos.api';
import type { RotaReadDTO } from '../../../frota/rotas/schemas/rota.read.zod';
import { rotasApi } from '../../../frota/rotas/rotas.api';
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
  const [veiculoReferencia, setVeiculoReferencia] = useState<VeiculoReadDTO | null>(null);
  const [rotaReferencia, setRotaReferencia] = useState<RotaReadDTO | null>(null);
  const submitIntent = useRef<'save' | 'save_print'>('save');

  const { control, handleSubmit, reset, setValue } = methods;
  const veiculoSelecionado = useWatch({ control, name: 'veiculo' });
  const rotaSelecionada = useWatch({ control, name: 'rota_manual' });
  const quantidadeCombustivel = useWatch({ control, name: 'quantidade_combustivel' });

  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then((res) => {
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

  useEffect(() => {
    // Ao editar uma guia, preservamos os dados já registrados.
    // A automação abaixo vale somente para uma nova guia.
    if (id || typeof veiculoSelecionado !== 'number') {
      if (!id) setVeiculoReferencia(null);
      return;
    }

    let active = true;
    setVeiculoReferencia(null);

    veiculosApi.buscar(veiculoSelecionado)
      .then((veiculo) => {
        if (!active) return;

        setVeiculoReferencia(veiculo);

        // Dados cadastrais usados como sugestão inicial.
        setValue('tipo_combustivel_id', veiculo.tipo_combustivel_id, {
          shouldValidate: true,
          shouldDirty: true,
        });

        if (veiculo.hodometro_atual != null && Number(veiculo.hodometro_atual) > 0) {
          setValue('hodometro', Number(veiculo.hodometro_atual), {
            shouldValidate: true,
            shouldDirty: true,
          });
          setValue('hodometro_quebrado', false, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      })
      .catch(() => {
        // O cadastro do veículo é apenas uma fonte de sugestão.
        // Se falhar, o usuário continua podendo preencher manualmente.
      });

    return () => {
      active = false;
    };
  }, [id, veiculoSelecionado, setValue]);

  useEffect(() => {
    if (id || typeof rotaSelecionada !== 'number') {
      if (!id) setRotaReferencia(null);
      return;
    }

    let active = true;
    setRotaReferencia(null);

    rotasApi.buscar(rotaSelecionada)
      .then((rota) => {
        if (!active) return;
        setRotaReferencia(rota);

        const distancia = Number(rota.distancia_km);
        const consumo = veiculoReferencia
          ? Number(veiculoReferencia.consumo_estimado_combustivel)
          : NaN;

        // Só calcula quando a unidade é km/L. Para L/h ainda não há
        // uma duração em horas suficientemente precisa na guia.
        if (
          (!quantidadeCombustivel || Number(quantidadeCombustivel) <= 0) &&
          Number.isFinite(distancia) &&
          distancia > 0 &&
          Number.isFinite(consumo) &&
          consumo > 0 &&
          veiculoReferencia?.unidade_consumo === 'KM_POR_L'
        ) {
          const estimativa = Number((distancia / consumo).toFixed(3));
          setValue('quantidade_combustivel', estimativa, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      })
      .catch(() => {
        // A rota é apenas uma fonte de referência para a estimativa.
      });

    return () => {
      active = false;
    };
  }, [id, rotaSelecionada, quantidadeCombustivel, veiculoReferencia, setValue]);

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
          {(veiculoReferencia || rotaReferencia) && (
            <div className={layoutStyles.alertInfo} role="status">
              {veiculoReferencia && (
                <>
                  <strong>Referência do veículo:</strong>{' '}
                  {veiculoReferencia.consumo_estimado_combustivel != null
                    ? `consumo estimado de ${veiculoReferencia.consumo_estimado_combustivel} ${veiculoReferencia.unidade_consumo_nome}`
                    : 'consumo estimado não cadastrado'}
                  {veiculoReferencia.consumo_estimado_oleo != null
                    ? ` • óleo: ${veiculoReferencia.consumo_estimado_oleo} L`
                    : ''}
                </>
              )}
              {rotaReferencia && (
                <>
                  {veiculoReferencia ? ' • ' : ''}
                  <strong>Rota:</strong>{' '}
                  {rotaReferencia.distancia_km != null
                    ? `${rotaReferencia.distancia_km} km cadastrados`
                    : 'distância não cadastrada'}
                </>
              )}
              {' '}— os dados são referências; a quantidade da guia pode ser ajustada manualmente.
            </div>
          )}

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