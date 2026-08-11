import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { pessoasApi } from "../pessoas.api";
import { ROUTES } from "../../../core/routes/routes";
import { DynamicForm } from "../../../core/ui/forms/dynamic-form/DynamicFormOld";
import { getApiErrorMessage } from "../../../core/api/errorHandlers";

import { pessoaUISchema } from "../schemas/pessoa.schema";
import { pessoaFormSchema, type PessoaFormData } from "../schemas/pessoa.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../pessoas.mapper";

export default function PessoaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<PessoaFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultValues: Partial<PessoaFormData> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      pessoasApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados cadastrais."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(data: PessoaFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);

      if (id) {
        await pessoasApi.atualizar(Number(id), payload);
      } else {
        await pessoasApi.criar(payload);
      }
      navigate(ROUTES.pessoas.base.list);
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar. Verifique se o CPF já não está cadastrado em outro perfil."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div className="page-container">
      <DynamicForm<PessoaFormData>
        title={id ? "Editar Pessoa" : "Cadastrar Nova Pessoa"}
        subtitle={id ? "Atualize os dados de identificação e status." : "Preencha os dados básicos do novo cadastro."}
        
        uiSchema={pessoaUISchema}
        zodSchema={pessoaFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Cadastro"
        onCancel={() => navigate(ROUTES.pessoas.base.list)}
      />
    </div>
  );
}