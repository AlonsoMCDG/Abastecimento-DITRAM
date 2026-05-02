import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { instituicoesApi } from "../../../api/organizacao/instituicoesApi"; 
import { ROUTES } from "../../../routes/routes";
import { DynamicForm } from "../../../components/DynamicForm/DynamicForm";
import { instituicaoFormSchema } from "../../../schemas/organizacao/instituicao.schema";
import type { Instituicao } from "../../../types/models";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

export default function InstituicaoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<Instituicao> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  const defaultValues: Partial<Instituicao> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      instituicoesApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados da instituição.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      if (id) {
        await instituicoesApi.atualizar(Number(id), form);
      } else {
        await instituicoesApi.criar(form);
      }
      navigate(ROUTES.organizacao.instituicoes.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar instituição. Verifique os dados fornecidos."));
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <DynamicForm<Instituicao>
      title={id ? "Editar Instituição" : "Cadastrar Instituição"}
      subtitle={id ? "Atualize as informações do local." : "Registre um novo local (Escola, Creche, Posto) no sistema."}
      schema={instituicaoFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Instituição"
      onCancel={() => navigate(ROUTES.organizacao.instituicoes.list)}
    />
  );
}