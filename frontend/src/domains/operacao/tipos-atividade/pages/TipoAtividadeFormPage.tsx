import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { tiposAtividadeApi } from "../tiposAtividade.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicFormOld";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import { tipoAtividadeUISchema } from "../schemas/tipoAtividade.schema";
import { tipoAtividadeFormSchema, type TipoAtividadeFormData } from "../schemas/tipoAtividade.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../tiposAtividade.mapper";

export default function TipoAtividadeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<TipoAtividadeFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultValues: Partial<TipoAtividadeFormData> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      tiposAtividadeApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados da atividade."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(data: TipoAtividadeFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);

      if (id) {
        await tiposAtividadeApi.atualizar(Number(id), payload);
      } else {
        await tiposAtividadeApi.criar(payload);
      }
      
      navigate(ROUTES.operacao.tiposAtividade.list); // Mantive a rota antiga caso não queira mexer no routes.ts agora
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar. Verifique se o nome digitado já não existe no sistema."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div className="page-container">
      <DynamicForm<TipoAtividadeFormData>
        title={id ? "Editar Tipo de Atividade" : "Cadastrar Tipo de Atividade"}
        subtitle={id ? "Atualize o nome ou o status da atividade." : "Crie uma nova atividade que poderá ser vinculada nas guias."}
        
        uiSchema={tipoAtividadeUISchema}
        zodSchema={tipoAtividadeFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Atividade"
        onCancel={() => navigate(ROUTES.operacao.tiposAtividade.list)}
      />
    </div>
  );
}