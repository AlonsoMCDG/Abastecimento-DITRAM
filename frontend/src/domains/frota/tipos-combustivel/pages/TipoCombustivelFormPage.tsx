import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { tiposCombustivelApi } from "../tiposCombustivel.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import { tipoCombustivelUISchema } from "../schemas/tipoCombustivel.schema";
import { tipoCombustivelFormSchema, type TipoCombustivelFormData } from "../schemas/tipoCombustivel.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../tiposCombustivel.mapper";

export default function TipoCombustivelFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<TipoCombustivelFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultValues: Partial<TipoCombustivelFormData> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      tiposCombustivelApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados do combustível."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(data: TipoCombustivelFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);

      if (id) {
        await tiposCombustivelApi.atualizar(Number(id), payload);
      } else {
        await tiposCombustivelApi.criar(payload);
      }
      navigate(ROUTES.frota.tiposCombustivel.list);
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar. Verifique se o nome digitado já não existe."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div className="page-container">
      <DynamicForm<TipoCombustivelFormData>
        title={id ? "Editar Combustível" : "Cadastrar Combustível"}
        subtitle={id ? "Atualize o nome ou o status do combustível." : "Adicione um novo tipo de combustível ao sistema."}
        
        uiSchema={tipoCombustivelUISchema}
        zodSchema={tipoCombustivelFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Combustível"
        onCancel={() => navigate(ROUTES.frota.tiposCombustivel.list)}
      />
    </div>
  );
}