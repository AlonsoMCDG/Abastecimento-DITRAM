import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { rotasApi } from "../rotas.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import { rotaUISchema } from "../schemas/rota.schema";
import { rotaFormSchema, type RotaFormData } from "../schemas/rota.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../rotas.mapper";

export default function RotaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<RotaFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultValues: Partial<RotaFormData> = {
    ativa: true,
  };

  useEffect(() => {
    if (id) {
      rotasApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados da rota."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(data: RotaFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);

      if (id) {
        await rotasApi.atualizar(Number(id), payload);
      } else {
        await rotasApi.criar(payload);
      }
      navigate(ROUTES.frota.rotas.list);
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar rota. Verifique se já não existe uma rota com este nome para esta secretaria."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando dados da rota...</div>;

  return (
    <div className="page-container">
      <DynamicForm<RotaFormData>
        title={id ? "Editar Rota" : "Nova Rota"}
        subtitle={id ? `Atualize o trajeto ou os detalhes da rota.` : "Adicione caminhos e trajetos frequentes para auto-completar nas guias."}
        
        uiSchema={rotaUISchema}
        zodSchema={rotaFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Rota"
        onCancel={() => navigate(ROUTES.frota.rotas.list)}
      />
    </div>
  );
}