import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { secretariaApi } from "../secretarias.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicFormOld";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import { secretariaUISchema } from "../schemas/secretaria.schema";
import { secretariaFormSchema, type SecretariaFormData } from "../schemas/secretaria.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../secretarias.mapper";

export default function SecretariaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<SecretariaFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultValues: Partial<SecretariaFormData> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      secretariaApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados da secretaria."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(data: SecretariaFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);

      if (id) {
        await secretariaApi.atualizar(Number(id), payload);
      } else {
        await secretariaApi.criar(payload);
      }
      
      navigate(ROUTES.organizacao.secretarias.list);
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar secretaria. Verifique se a sigla já não está em uso."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div className="page-container">
      <DynamicForm<SecretariaFormData>
        title={id ? "Editar Secretaria" : "Cadastrar Secretaria"}
        subtitle={id ? "Atualize as informações organizacionais." : "Registre uma nova secretaria ou autarquia no sistema."}
        
        uiSchema={secretariaUISchema}
        zodSchema={secretariaFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Secretaria"
        onCancel={() => navigate(ROUTES.organizacao.secretarias.list)}
      />
    </div>
  );
}