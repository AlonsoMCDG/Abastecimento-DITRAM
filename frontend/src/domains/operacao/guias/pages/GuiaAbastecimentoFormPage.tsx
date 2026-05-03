import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormSetValue, Path, PathValue } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { DynamicForm } from '../../../../core/ui/forms/dynamic-form/DynamicForm'; 
import { guiaAbastecimentoFormSchema } from '../schemas/guia.schema';
import { guiasApi } from '../guias.api';
import { rotaApi } from '../../../frota/rotas/rotas.api';
import { veiculosApi } from '../../../frota/veiculos/veiculos.api';
import { getApiErrorMessage } from '../../../../core/api/errorHandlers';
import { processPdfBlob } from '../../../../core/utils/pdfHandler';
import { ROUTES } from '../../../../core/routes/routes';
import type { GuiaAbastecimento } from '../../../../core/types/models';

import styles from '../../../components/DynamicForm/DynamicForm.module.css';

export const GuiaAbastecimentoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [initialValues, setInitialValues] = useState<Partial<GuiaAbastecimento> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  const [isPrinting, setIsPrinting] = useState(false);

  // Referência silenciosa para saber qual botão disparou o formulário
  const submitIntent = useRef<'save' | 'save_print'>('save');

  const getLocalISOString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
    return localISOTime;
  };
  
  // Definição dos valores padrão para novas guias
  const defaultValues = useMemo((): Partial<GuiaAbastecimento> => {
    const secretariaParam = searchParams.get("secretaria");
    return {
      data_hora: getLocalISOString(),
      secretaria_id: secretariaParam ? Number(secretariaParam) : undefined,
      periodo_uso_dias: 30,
    } as Partial<GuiaAbastecimento>;
  }, [searchParams]);
  
  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then(res => {
          const dados = res.data;
          // Garante que a data está no formato que o input aceita (16 primeiros caracteres)
          if (dados.data_hora) {
            dados.data_hora = new Date(dados.data_hora).toISOString().slice(0, 16);
          }
          setInitialValues(dados);
        })
        .catch(err => setGlobalError(getApiErrorMessage(err, "Erro ao carregar a guia. O servidor pode estar inacessível.")))
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, defaultValues]);
  
  const handleSubmit = async (formData: GuiaAbastecimento) => {
    setGlobalError(null); // Limpa erros antigos antes de tentar salvar
    
    try {
      let currentId = id ? Number(id) : null;
      
      if (currentId) {
        await guiasApi.atualizar(currentId, formData);
      } else {
        const res = await guiasApi.criar(formData);
        currentId = res.data.id; // Captura o ID da guia que acabou de nascer no banco!
      }
      
      // Se a intenção era Salvar e Imprimir
      if (submitIntent.current === 'save_print' && currentId) {
        setIsPrinting(true);
        try {
          const response = await guiasApi.obterPdfBlob(currentId);
          await processPdfBlob(
            response.data, 
            `Guia_Abastecimento_${currentId}.pdf`, 
            'print'
          );
        } catch(err) {
          // Captura erro específico da falha do PDF, mas não impede a navegação pois já salvou
          alert(getApiErrorMessage(err, "A guia foi salva, mas ocorreu um erro ao gerar o PDF."));
        } finally {
          setIsPrinting(false);
        }
      }

      // Sucesso: Retorna à lista
      navigate(ROUTES.operacao.guias.list);
    } catch (error) {
      // ✅ CORREÇÃO: Tratamento rigoroso de erro em vez de alert genérico
      console.error('Erro ao salvar guia:', error);
      setGlobalError(getApiErrorMessage(error, "Não foi possível salvar a guia. Verifique sua conexão com o servidor."));
      
      // Reseta a intenção para evitar bugs se o usuário tentar clicar no botão normal de salvar depois
      submitIntent.current = 'save';
    }
  };

  const handlePrintOnly = async () => {
    if (!id) return;
    setGlobalError(null);
    setIsPrinting(true);
    try {
      const response = await guiasApi.obterPdfBlob(Number(id));
      await processPdfBlob(
        response.data, 
        `Guia_Abastecimento_${id}.pdf`, 
        'print'
      );
    } catch (err) {
      // Extração de erro detalhada no print
      setGlobalError(getApiErrorMessage(err, "Falha ao baixar o PDF da guia. O servidor pode estar inativo."));
    } finally {
      setIsPrinting(false);
    }
  };
  
  // Construção dos botões Extras
  const extraActions = useMemo(() => {
    return (
      <>
        {/* É um botão de "submit" que altera a intenção de salvar antes de disparar */}
        <button
          type="submit"
          className={styles.btnSecondary}
          onClick={() => { submitIntent.current = 'save_print'; }}
          disabled={isPrinting || loading}
        >
          {isPrinting ? "Gerando PDF..." : "💾 Salvar e Imprimir"}
        </button>

        {/* type="button" é crucial para NÃO acionar a validação e salvamento do form */}
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
    );
  }, [id, isPrinting, loading]);

  // Escuta as mudanças do DynamicForm
  const handleValuesChange = async (
    changedField: { name: Path<GuiaAbastecimento>; value: unknown },
    _currentValues: Partial<GuiaAbastecimento>,
    setValue: UseFormSetValue<GuiaAbastecimento>
  ) => {
    const { name, value } = changedField;
    const numValue = Number(value) || 0;
    
    // =======================================================
    // BLOCO 1: REGRAS MATEMÁTICAS E AVISOS
    // =======================================================
    if (name === 'hodometro_atual' || name === 'hodometro_anterior') {
      const hodometroAtual = name === 'hodometro_atual' ? numValue : Number(_currentValues.hodometro_atual);
      const hodometroAnterior = name === 'hodometro_anterior' ? numValue : Number(_currentValues.hodometro_anterior);

      if (!hodometroAtual || !hodometroAnterior || hodometroAtual <= hodometroAnterior) {
        setValue('distancia_percorrida', null as PathValue<GuiaAbastecimento, "distancia_percorrida">, { shouldValidate: true, shouldDirty: true });
        
        setWarnings(prev => {
          const next = { ...prev };
          delete next.distancia_percorrida;
          return next;
        });
        return; 
      }

      const percorrida = hodometroAtual - hodometroAnterior;
      
      // ✅ Correção: Usando PathValue para forçar a tipagem sem usar 'as any'
      setValue('distancia_percorrida', percorrida as PathValue<GuiaAbastecimento, "distancia_percorrida">, { shouldValidate: true, shouldDirty: true });
      
      const rotaDistancia = Number(_currentValues.rota_distancia_km) || 0;

      if (rotaDistancia > 0) {
        const diferenca = percorrida - rotaDistancia;
        const diferencaAbsoluta = Math.abs(diferenca);

        if (diferencaAbsoluta > 2) { 
          const status = diferenca > 0 ? "a mais" : "a menos";
          const formata = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
          
          setWarnings(prev => ({
            ...prev,
            distancia_percorrida: `⚠️ ${formata(diferencaAbsoluta)} km ${status} que a rota padrão (${rotaDistancia} km).`
          }));
        } else {
          setWarnings(prev => {
            const next = { ...prev };
            delete next.distancia_percorrida;
            return next;
          });
        }
      }
      return;
    }

    // =======================================================
    // VALIDAÇÃO DE COMBUSTÍVEL E ÓLEO
    // =======================================================
    if (name === 'quantidade_combustivel' || name === 'quantidade_oleo') {
      const isCombustivel = name === 'quantidade_combustivel';
      const chaveGabarito = isCombustivel ? 'rota_consumo_combustivel' : 'rota_consumo_oleo';
      const valorRota = Number(_currentValues[chaveGabarito as keyof GuiaAbastecimento]) || 0;

      if (valorRota > 0 && numValue > 0) {
        const diferenca = numValue - valorRota;
        const diferencaAbsoluta = Math.abs(diferenca);

        // Tolerância (ex: avisa se passar de 0.1 Litros de diferença). Ajuste como quiser!
        if (diferencaAbsoluta > 0.1) { 
          const status = diferenca > 0 ? "a mais" : "a menos";
          const formata = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1 });
          
          setWarnings(prev => ({
            ...prev,
            [name]: `⚠️ ${formata(diferencaAbsoluta)} L ${status} que a rota padrão (${formata(valorRota)} L).`
          }));
        } else {
          // Remove o aviso se estiver dentro da tolerância
          setWarnings(prev => {
            const next = { ...prev };
            delete next[name];
            return next;
          });
        }
      } else {
        // Remove o aviso se o usuário apagar o campo
        setWarnings(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
      return;
    }

    // Se o campo foi limpo, não fazemos requisições
    if (!value) return;

    // =========================================================
    // BLOCO 2: BUSCAS NA API
    // =========================================================
    // Regra: Veículo preenche Combustível e Hodômetro
    if (name === 'veiculo_id') {
      try {
        const res = await veiculosApi.buscar(Number(value));
        
        if (res.data.tipo_combustivel_id) {
          setValue('tipo_combustivel_id', res.data.tipo_combustivel_id as PathValue<GuiaAbastecimento, "tipo_combustivel_id">, { shouldValidate: true });
        }
        if (res.data.tipo_veiculo_id) {
          setValue('tipo_veiculo_id', res.data.tipo_veiculo_id as PathValue<GuiaAbastecimento, "tipo_veiculo_id">, { shouldValidate: true });
        }
        if (res.data.hodometro_atual) {
          setValue('hodometro_anterior', res.data.hodometro_atual as PathValue<GuiaAbastecimento, "hodometro_anterior">, { shouldValidate: true });
        }
      } catch (err) {
        console.error("Erro ao buscar veículo", err);
      }
    }
    
    if (name === 'rota_id') {
      const isId = !isNaN(Number(value)) && value !== '';

      if (isId) {
        try {
          const res = await rotaApi.buscar(Number(value));

          // Salva a distância oficial da rota num campo oculto para o cálculo acima
          if (res.data.distancia_km) {
            setValue('rota_distancia_km' as Path<GuiaAbastecimento>, Number(res.data.distancia_km) as PathValue<GuiaAbastecimento, Path<GuiaAbastecimento>>);
          }
          if (res.data.instituicao_id) {
            setValue('instituicao_id', res.data.instituicao_id as PathValue<GuiaAbastecimento, "instituicao_id">, { shouldValidate: true });
          }

          // SALVANDO O GABARITO E AUTO-PREENCHENDO O COMBUSTÍVEL
          if (res.data.consumo_estimado_combustivel) {
            const combustivelEstimado = Number(res.data.consumo_estimado_combustivel);
            setValue('rota_consumo_combustivel' as Path<GuiaAbastecimento>, combustivelEstimado as PathValue<GuiaAbastecimento, Path<GuiaAbastecimento>>);
            setValue('quantidade_combustivel', combustivelEstimado as PathValue<GuiaAbastecimento, "quantidade_combustivel">, { shouldValidate: true });
          }
          
          // SALVANDO O GABARITO E AUTO-PREENCHENDO O ÓLEO
          if (res.data.consumo_estimado_oleo) {
            const oleoEstimado = Number(res.data.consumo_estimado_oleo);
            setValue('rota_consumo_oleo' as Path<GuiaAbastecimento>, oleoEstimado as PathValue<GuiaAbastecimento, Path<GuiaAbastecimento>>);
            setValue('quantidade_oleo', oleoEstimado as PathValue<GuiaAbastecimento, "quantidade_oleo">, { shouldValidate: true });
          }
        } catch (err) {
          console.error('Erro ao buscar detalhes da rota', err);
        }
      }
    }
  };

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <DynamicForm<GuiaAbastecimento> 
        title={id ? "Editar Guia de Abastecimento" : "Nova Guia de Abastecimento"}
        subtitle={id ? `Editando registro #${id}` : "Preencha os dados para gerar uma nova guia."}
        schema={guiaAbastecimentoFormSchema}
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