import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { instituicoesApi } from "../instituicoes.api"; 
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import { instituicaoUISchema } from "../schemas/instituicao.schema";
import { instituicaoFormSchema, type InstituicaoFormData } from "../schemas/instituicao.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../instituicoes.mapper";

export default function InstituicaoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<InstituicaoFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultValues: Partial<InstituicaoFormData> = {
    ativo: true,
    tipo: 'OUTRO'
  };

  useEffect(() => {
    if (id) {
      instituicoesApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados da instituição."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(data: InstituicaoFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);

      if (id) {
        await instituicoesApi.atualizar(Number(id), payload);
      } else {
        await instituicoesApi.criar(payload);
      }
      navigate(ROUTES.organizacao.instituicoes.list);
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar instituição. Verifique se o nome já existe para esta secretaria."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div className="page-container">
      <DynamicForm<InstituicaoFormData>
        title={id ? "Editar Instituição" : "Cadastrar Instituição"}
        subtitle={id ? "Atualize as informações do local." : "Registre um novo local (Escola, Creche, Posto) no sistema."}
        
        uiSchema={instituicaoUISchema}
        zodSchema={instituicaoFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Instituição"
        onCancel={() => navigate(ROUTES.organizacao.instituicoes.list)}
      />
    </div>
  );
}