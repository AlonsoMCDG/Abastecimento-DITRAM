import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { DynamicForm } from '../../../../core/ui/forms/dynamic-form/DynamicForm';
import { getApiErrorMessage } from '../../../../core/api/errorHandlers';
import { processPdfBlob } from '../../../../core/utils/pdfHandler';
import { ROUTES } from '../../../../core/routes/routes';

import { guiasApi } from '../api/guias.api';
import { veiculosApi } from '../../../frota/veiculos/veiculos.api';
import { mapReadToForm, mapFormToWriteDTO } from '../api/guias.mapper';
import { guiaAbastecimentoUISchema } from '../schemas/guia.ui';
import { guiaAbastecimentoFormSchema, type GuiaAbastecimentoFormInput } from '../schemas/guia.form';

import layoutStyles from '../../../../core/ui/layouts/FormPage.module.css';

export default function GuiaAbastecimentoFormPage() {
  
  // INICIALIZAÇÃO DO REACT HOOK FORM
  const methods = useForm<GuiaAbastecimentoFormInput>({
    resolver: zodResolver(guiaAbastecimentoFormSchema),
    mode: "onChange"
  });

  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [isPrinting, setIsPrinting] = useState(false);
  const submitIntent = useRef<'save' | 'save_print'>('save');


  const { handleSubmit, reset, watch, setValue } = methods;

  // BUSCA DE DADOS
  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then(res => {
          if (res.data_hora) {
            res.data_hora = new Date(res.data_hora).toISOString().slice(0, 16);
          }
          reset(mapReadToForm(res));
        })
        .catch(err => setGlobalError(getApiErrorMessage(err, "Erro ao carregar a guia.")))
        .finally(() => setLoading(false));
    } else {
      const tzoffset = (new Date()).getTimezoneOffset() * 60000;
      const dataHora = new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
      const secretariaParam = searchParams.get("secretaria");
      
      reset({
        data_hora: dataHora,
        secretaria_id: secretariaParam ? Number(secretariaParam) : undefined,
        periodo_uso_dias: 30,
      });
    }
  }, [id, searchParams, reset]);

  // EFEITOS COLATERAIS
  const veiculoIdSelecionado = watch('veiculo');
  
  useEffect(() => {
    console.log("Selecionou veiculo "+ veiculoIdSelecionado);
    if (typeof veiculoIdSelecionado === 'number') {
      veiculosApi.buscar(veiculoIdSelecionado)
        .then(res => {
          if (res.tipo_combustivel_id) {
            setValue('tipo_combustivel_id', res.tipo_combustivel_id, { shouldValidate: true });
          }
        })
        .catch(err => console.error("Erro ao buscar veículo", err));
    }
  }, [veiculoIdSelecionado, setValue]);

  // SUBMISSÃO
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
      if (error instanceof z.ZodError) {
        setGlobalError("Verifique os campos obrigatórios.");
      } else {
        setGlobalError(getApiErrorMessage(error, "Não foi possível salvar a guia."));
      }
      submitIntent.current = 'save';
    }
  };

  if (loading) return <div className={layoutStyles.loading}>Carregando dados...</div>;

  return (
    <div className={layoutStyles.pageContainer}>
      <header className={layoutStyles.header}>
        <h1 className={layoutStyles.title}>{id ? "Editar Guia de Abastecimento" : "Nova Guia de Abastecimento"}</h1>
        <p className={layoutStyles.subtitle}>{id ? `Editando registro #${id}` : "Preencha os dados abaixo"}</p>
      </header>

      {globalError && (
        <div className={layoutStyles.alertError}>
          ⚠️ {globalError}
        </div>
      )}

      {/* O Formulário e os botões */}
      <div className={layoutStyles.card}>
        <FormProvider {...methods}>
          {/* DynamicForm gerencia apenas inputs */}
          <DynamicForm<GuiaAbastecimentoFormInput>
            uiSchema={guiaAbastecimentoUISchema}
            onSubmit={methods.handleSubmit(onSubmit)}
            isLoading={isPrinting}
          />
          
          {/* A Página gerencia as ações extras livremente */}
          <div className={layoutStyles.extraActions}>
            <button
              type="button"
              className={layoutStyles.btnSecondary}
              onClick={() => { submitIntent.current = 'save_print'; handleSubmit(onSubmit)(); }}
              disabled={isPrinting}
            >
              {isPrinting ? "Gerando PDF..." : "💾 Salvar e Imprimir"}
            </button>

            {id && (
              <button
                type="button" 
                className={layoutStyles.btnOutline}
                onClick={async () => {
                  setIsPrinting(true);
                  const pdfBlob = await guiasApi.obterPdfBlob(Number(id));
                  await processPdfBlob(pdfBlob, `Guia_${id}.pdf`, 'print');
                  setIsPrinting(false);
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
};