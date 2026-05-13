import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

// Importe o seu DynamicForm atualizado
import { DynamicForm } from '../../../../core/ui/forms/dynamic-form/DynamicFormOld';
import { getApiErrorMessage } from '../../../../core/api/errorHandlers';
import { processPdfBlob } from '../../../../core/utils/pdfHandler';
import { ROUTES } from '../../../../core/routes/routes';

// Importa APIs
import { guiasApi } from '../guias.api';
import { veiculosApi } from '../../../frota/veiculos/veiculos.api';

// Importa a Inteligência do Domínio (Schemas e Mappers)
import { guiaAbastecimentoUISchema } from '../schemas/guia.schema';
import { guiaAbastecimentoFormSchema, type GuiaAbastecimentoFormData } from '../schemas/guia.form.zod';
import { mapReadToForm, mapFormToWriteDTO } from '../guias.mapper';

import styles from '../../../../core/ui/forms/dynamic-form/DynamicForm.module.css';

import { z } from 'zod';

export const GuiaAbastecimentoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<Partial<GuiaAbastecimentoFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isPrinting, setIsPrinting] = useState(false);

  // Referência silenciosa para saber qual botão disparou o formulário
  const submitIntent = useRef<'save' | 'save_print'>('save');

  const getLocalISOString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
  };
  
  // Definição dos valores padrão para novas guias
  const defaultValues = useMemo((): Partial<GuiaAbastecimentoFormData> => {
    const secretariaParam = searchParams.get("secretaria");
    return {
      data_hora: getLocalISOString(),
      secretaria_id: secretariaParam ? Number(secretariaParam) : undefined,
      periodo_uso_dias: 30,
    };
  }, [searchParams]);

  // ==========================================
  // FORMATAÇÃO DOS ERROS ZOD
  // ==========================================
  const formatZodError = (error: z.ZodError): string => {
    const mensagens = error.issues.map(issue => {
      // Pega o nome do campo (ex: "modalidade_nome") e a mensagem
      const campo = issue.path.length > 0 ? `[${issue.path.join('.')}] ` : '';
      return `• ${campo}${issue.message}`;
    });
    
    return `Falha de validação de dados:\n${mensagens.join('\n')}`;
  };
  
  // ==========================================
  // CARREGAMENTO INICIAL
  // ==========================================
  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then(res => {
          let dados = res;
          
          if (dados.data_hora) {
            dados.data_hora = new Date(dados.data_hora).toISOString().slice(0, 16);
          }
          
          // MAPPER: Converte o DTO de Leitura para o formato que o Form Zod entende
          setInitialValues(mapReadToForm(dados));
        })
        .catch(err => {
          if (err instanceof z.ZodError) {
            setGlobalError(formatZodError(err));
          } else {
            setGlobalError(getApiErrorMessage(err, "Erro ao carregar a guia."));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, defaultValues]);
  
  // ==========================================
  // SUBMIT
  // ==========================================
  const handleSubmit = async (formData: GuiaAbastecimentoFormData) => {
    setGlobalError(null);
    
    try {
      let currentId = id ? Number(id) : null;
      
      // MAPPER: Converte o Form validado pelo Zod para o Payload de Escrita
      const payload = mapFormToWriteDTO(formData);
      
      if (currentId) {
        await guiasApi.atualizar(currentId, payload);
      } else {
        const res = await guiasApi.criar(payload);
        currentId = res.id; // Lembrar que zodClient já retorna os dados diretos
      }
      
      // Fluxo de Impressão
      if (submitIntent.current === 'save_print' && currentId) {
        setIsPrinting(true);
        try {
          const pdfBlob = await guiasApi.obterPdfBlob(currentId);
          await processPdfBlob(pdfBlob, `Guia_Abastecimento_${currentId}.pdf`, 'print');
        } catch(err) {
          alert(getApiErrorMessage(err, "A guia foi salva, mas ocorreu um erro ao gerar o PDF."));
        } finally {
          setIsPrinting(false);
        }
      }

      navigate(ROUTES.operacao.guias.list);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setGlobalError(formatZodError(error));
      } else {
        setGlobalError(getApiErrorMessage(error, "Não foi possível salvar a guia."));
      }
      submitIntent.current = 'save';
    }
  };

  const handlePrintOnly = async () => {
    if (!id) return;
    setGlobalError(null);
    setIsPrinting(true);
    try {
      const pdfBlob = await guiasApi.obterPdfBlob(Number(id));
      await processPdfBlob(pdfBlob, `Guia_Abastecimento_${id}.pdf`, 'print');
    } catch (err) {
      setGlobalError(getApiErrorMessage(err, "Falha ao baixar o PDF."));
    } finally {
      setIsPrinting(false);
    }
  };
  
  // ==========================================
  // BOTÕES CUSTOMIZADOS
  // ==========================================
  const extraActions = useMemo(() => (
    <>
      <button
        type="submit"
        className={styles.btnSecondary}
        onClick={() => { submitIntent.current = 'save_print'; }}
        disabled={isPrinting || loading}
      >
        {isPrinting ? "Gerando PDF..." : "💾 Salvar e Imprimir"}
      </button>

      {id && (
        <button
          type="button" 
          className={styles.btnOutline}
          onClick={handlePrintOnly}
          disabled={isPrinting || loading}
          title="Imprime a versão que já está salva no banco de dados."
        >
          🖨️ Imprimir Versão Salva
        </button>
      )}
    </>
  ), [id, isPrinting, loading]);

  // ==========================================
  // SIDE-EFFECTS (AUTO-FILL)
  // ==========================================
  const handleValuesChange = async (
    changedField: { name: string; value: unknown },
    _currentValues: Partial<GuiaAbastecimentoFormData>,
    setValue: any // Mantido flexível para o React Hook Form injetar
  ) => {
    const { name, value } = changedField;
    if (!value) return;

    // 1. Veículo: Preenche tipo de combustível
    if (name === 'veiculo_id') {
      try {
        const res = await veiculosApi.buscar(Number(value));
        if (res.tipo_combustivel_id) {
          setValue('tipo_combustivel_id', res.tipo_combustivel_id, { shouldValidate: true });
        }
      } catch (err) {
        console.error("Erro ao buscar veículo", err);
      }
    }
  };

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <DynamicForm<GuiaAbastecimentoFormData>
        title={id ? "Editar Guia de Abastecimento" : "Nova Guia de Abastecimento"}
        subtitle={id ? `Editando registro #${id}` : "Preencha os dados para gerar uma nova guia."}
        
        // As duas chaves principais do novo motor:
        uiSchema={guiaAbastecimentoUISchema}
        zodSchema={guiaAbastecimentoFormSchema}
        
        initialValues={initialValues}
        warnings={warnings}
        globalError={globalError}
        
        onValuesChange={handleValuesChange}
        onSubmit={handleSubmit}
        
        submitLabel="💾 Salvar Guia"
        onCancel={() => navigate(ROUTES.operacao.guias.list)}
        extraActions={extraActions}
      />
    </div>
  );
};