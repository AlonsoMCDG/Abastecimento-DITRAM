// pages/GuiaAbastecimentoFormPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import { DynamicForm } from '../../../components/DynamicForm/DynamicForm'; 
import { guiaAbastecimentoFormSchema } from '../../../schemas/guiaAbastecimento.schema';
import { guiasApi } from '../../../api/operacao/guiasApi';
import { rotaApi } from '../../../api/frota/rotasApi';
import type { GuiaAbastecimento } from '../../../types/models';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ROUTES } from '../../../routes/routes';

export const GuiaAbastecimentoFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [initialValues, setInitialValues] = useState<Partial<GuiaAbastecimento> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  // Definição dos valores padrão para novas guias
  const defaultValues = useMemo((): Partial<GuiaAbastecimento> => {
    const secretariaParam = searchParams.get("secretaria");
    return {
      data_hora: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      secretaria_id: secretariaParam ? Number(secretariaParam) : undefined,
    } as Partial<GuiaAbastecimento>;
  }, [searchParams]);
  
  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then(res => {
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
      if (id) {
        await guiasApi.atualizar(Number(id), formData);
      } else {
        await guiasApi.criar(formData);
      }
      alert('Guia salva com sucesso!');
      navigate(ROUTES.operacao.guias.list);
    } catch (error) {
      console.error('Erro ao salvar guia', error);
    }
  };

  // Escuta as mudanças do DynamicForm
  const handleValuesChange = async (
    changedField: { name: string; value: string | number },
    _currentValues: Partial<GuiaAbastecimento>,
    setValue: UseFormSetValue<GuiaAbastecimento>
  ) => {
    
    // Rota preenche Instituição e Combustível
    if (changedField.name === 'rota') {
      const isId = !isNaN(Number(changedField.value)) && changedField.value !== '';
      
      if (isId) {
        // Se for ID, o usuário escolheu uma rota existente. Buscamos os detalhes.
        try {
          const response = await rotaApi.buscar(Number(changedField.value));
          const rotaData = response.data;
          // Preenche os outros campos automaticamente
          setValue('instituicao' as keyof GuiaAbastecimento, rotaData.instituicao, { shouldValidate: true });
        } catch (err) {
          console.error('Erro ao buscar detalhes da rota', err);
        }
      } else {
        // Se for texto livre, limpamos a instituição para ele digitar manualmente
        setValue('instituicao' as keyof GuiaAbastecimento, '');
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
      onSubmit={handleSubmit}
      onValuesChange={handleValuesChange}
    />
  );
};