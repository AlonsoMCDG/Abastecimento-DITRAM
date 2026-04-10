import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { DynamicForm } from '../../../components/DynamicForm/DynamicForm'; 
import { guiaAbastecimentoFormSchema } from '../../../schemas/guiaAbastecimento.schema';
import { guiasApi } from '../../../api/operacao/guiasApi';
import { rotaApi } from '../../../api/frota/rotasApi';
import type { GuiaAbastecimento } from '../../../types/models';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes';
import { veiculosApi } from '../../../api/frota/veiculosApi';
import styles from '../../../components/DynamicForm/DynamicForm.module.css'

export const GuiaAbastecimentoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const [initialValues, setInitialValues] = useState<Partial<GuiaAbastecimento> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  const [isPrinting, setIsPrinting] = useState(false);

  // Referência silenciosa para saber qual botão disparou o formulário
  const submitIntent = useRef<'save' | 'save_print'>('save');

  const getLocalISOString = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000; // offset em milissegundos
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
          setInitialValues(res.data);
        })
        .catch(err => console.error("Erro ao carregar guia:", err))
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id, defaultValues]);
  
  const handleSubmit = async (formData: GuiaAbastecimento) => {
    try {
      let currentId = id ? Number(id) : null;
      
      if (currentId) {
        await guiasApi.atualizar(currentId, formData);
      } else {
        const res = await guiasApi.criar(formData);
        currentId = res.data.id; // Captura o ID da guia que acabou de nascer no banco!
      }
      
      // Se o usuário clicou no botão "Salvar e Imprimir"
      if (submitIntent.current === 'save_print' && currentId) {
        setIsPrinting(true);
        try {
          await guiasApi.imprimirPdfDireto(currentId);
        } catch(err) {
          alert("A guia foi salva, mas ocorreu um erro de conexão ao gerar o PDF.");
        } finally {
          setIsPrinting(false);
        }
      } else {
        // Fluxo normal
        alert('Guia salva com sucesso!');
      }

      // Por padrão, terminada a ação, volta para a listagem
      navigate(ROUTES.operacao.guias.list);
    } catch (error) {
      console.error('Erro ao salvar guia', error);
      alert('Erro ao salvar. Verifique os dados e tente novamente.');
    }
  };

  // Botão 3: Imprimir a versão que já está no banco sem alterar nada
  const handlePrintOnly = async () => {
    if (!id) return;
    setIsPrinting(true);
    try {
      await guiasApi.imprimirPdfDireto(Number(id));
    } catch (err) {
      alert("Erro ao imprimir PDF.");
    } finally {
      setIsPrinting(false);
    }
  };
  
  // Construção dos botões Extras
  const extraActions = useMemo(() => {
    return (
      <>
        {/* BOTÃO 2: É um botão de "submit" que altera a intenção de salvar antes de disparar */}
        <button
          type="submit"
          className={styles.btnSecondary}
          onClick={() => { submitIntent.current = 'save_print'; }}
          disabled={isPrinting || loading}
        >
          {isPrinting ? "Gerando PDF..." : "💾 Salvar e Imprimir"}
        </button>

        {/* BOTÃO 3: type="button" é crucial para NÃO acionar a validação e salvamento do form */}
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
    changedField: { name: string; value: string | number },
    _currentValues: Partial<GuiaAbastecimento>,
    setValue: UseFormSetValue<GuiaAbastecimento>
  ) => {
    const { name, value } = changedField;
    
    // =======================================================
    // BLOCO 1: REGRAS MATEMÁTICAS E AVISOS
    // =======================================================

    if (name === 'hodometro_atual' || name === 'hodometro_anterior') {
      const hodometroAtual = name === 'hodometro_atual' ? Number(value) : Number(_currentValues.hodometro_atual);
      const hodometroAnterior = name === 'hodometro_anterior' ? Number(value) : Number(_currentValues.hodometro_anterior);

      if (!hodometroAtual || !hodometroAnterior || hodometroAtual <= hodometroAnterior) {
        setValue('distancia_percorrida', null, { shouldValidate: true, shouldDirty: true });
        
        // Remove o aviso se os campos forem limpos
        setWarnings(prev => {
          const next = { ...prev };
          delete next.distancia_percorrida;
          return next;
        });
        return; 
      }

      // Calcula e define a distância
      const percorrida = hodometroAtual - hodometroAnterior;
      setValue('distancia_percorrida', percorrida, { shouldValidate: true, shouldDirty: true });
      
      // Validação com a Rota (se existir)
      const rotaDistancia = Number(_currentValues.rota_distancia_km) || 0;

      if (rotaDistancia > 0) {
        const diferenca = percorrida - rotaDistancia;
        const diferencaAbsoluta = Math.abs(diferenca);

        if (diferencaAbsoluta > 2) { // Margem de tolerância de 2km
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
      const valorDigitado = Number(value) || 0;
      
      // Descobre qual dos dois estamos avaliando para pegar o gabarito correto
      const isCombustivel = name === 'quantidade_combustivel';
      const chaveGabarito = isCombustivel ? 'rota_consumo_combustivel' : 'rota_consumo_oleo';
      const valorRota = Number(_currentValues[chaveGabarito as keyof GuiaAbastecimento]) || 0;

      if (valorRota > 0 && valorDigitado > 0) {
        const diferenca = valorDigitado - valorRota;
        const diferencaAbsoluta = Math.abs(diferenca);

        // Tolerância (ex: avisa se passar de 0.5 Litros de diferença). Ajuste como quiser!
        if (diferencaAbsoluta > 0.5) { 
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
        
        // Aplica as regras de auto-preenchimento
        if (res.data.tipo_combustivel_id) {
          setValue('tipo_combustivel_id', res.data.tipo_combustivel_id, { shouldValidate: true });
        }
        if (res.data.tipo_veiculo_id) {
          console.log("Tipo veiculo, id=",res.data.tipo_veiculo_id, "display=", res.data.tipo_veiculo_nome)
          setValue('tipo_veiculo_id', res.data.tipo_veiculo_id, { shouldValidate: true });
        }
        if (res.data.hodometro_atual) {
          setValue('hodometro_anterior', res.data.hodometro_atual, { shouldValidate: true });
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

          // 2. Salva a distância oficial da rota num campo oculto para o cálculo acima
          if (res.data.distancia_km) {
            setValue('rota_distancia_km' as any, Number(res.data.distancia_km));
          }
          if (res.data.instituicao_id) {
            setValue('instituicao_id', res.data.instituicao_id, { shouldValidate: true });
          }

          // SALVANDO O GABARITO E AUTO-PREENCHENDO O COMBUSTÍVEL
          if (res.data.consumo_estimado_combustivel) {
            const combustivelEstimado = Number(res.data.consumo_estimado_combustivel);
            setValue('rota_consumo_combustivel', combustivelEstimado);
            setValue('quantidade_combustivel', combustivelEstimado, { shouldValidate: true });
          }
          
          // SALVANDO O GABARITO E AUTO-PREENCHENDO O ÓLEO
          if (res.data.consumo_estimado_oleo) {
            const oleoEstimado = Number(res.data.consumo_estimado_oleo);
            setValue('rota_consumo_oleo', oleoEstimado);
            setValue('quantidade_oleo', oleoEstimado, { shouldValidate: true });
          }
        } catch (err) {
          console.error('Erro ao buscar detalhes da rota', err);
        }
      }
    }
  };

  if (loading) return <div>Carregando dados...</div>;

  return (
    <DynamicForm 
      title={id ? "Editar Guia de Abastecimento" : "Nova Guia de Abastecimento"}
      subtitle={id ? `Editando registro #${id}` : "Preencha os dados para gerar uma nova guia."}
      schema={guiaAbastecimentoFormSchema}
      initialValues={initialValues}
      warnings={warnings}
      onValuesChange={handleValuesChange}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Guia"
      extraActions={extraActions}
    />
  );
};