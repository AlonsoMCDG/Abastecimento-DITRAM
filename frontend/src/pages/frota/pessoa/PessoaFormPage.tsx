import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { pessoasApi } from "../../../api/pessoas/pessoasApi";
import { ROUTES } from "../../../routes/routes";
import { DynamicForm } from "../../../components/DynamicForm/DynamicForm";
import { pessoaFormSchema } from "../../../schemas/pessoa.schema";
import type { Pessoa } from "../../../types/models";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

export default function PessoaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<Pessoa> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  // Todo cadastro novo já começa ativo por padrão
  const defaultValues: Partial<Pessoa> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      pessoasApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados cadastrais.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      if (id) {
        await pessoasApi.atualizar(Number(id), form);
      } else {
        await pessoasApi.criar(form);
      }
      navigate(ROUTES.pessoas.base.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar. Verifique se o CPF já não está cadastrado."));
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <DynamicForm<Pessoa>
      title={id ? "Editar Pessoa" : "Cadastrar Nova Pessoa"}
      subtitle={id ? "Atualize os dados de identificação e status." : "Preencha os dados básicos do novo cadastro."}
      schema={pessoaFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Cadastro"
      onCancel={() => navigate(ROUTES.pessoas.base.list)}
    />
  );
}