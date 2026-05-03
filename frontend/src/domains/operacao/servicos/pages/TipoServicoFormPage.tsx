import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tiposServicoApi } from "../tipoServico.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";
import { tipoServicoFormSchema } from "../schemas/tipoServico.schema";
import type { TipoServico } from "../../../../core/types/models";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

export default function TipoServicoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<TipoServico> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  const defaultValues: Partial<TipoServico> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      tiposServicoApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados da função/serviço.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      if (id) {
        await tiposServicoApi.atualizar(Number(id), form);
      } else {
        await tiposServicoApi.criar(form);
      }
      navigate(ROUTES.operacao.tiposServico.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar. Verifique se o nome digitado já não existe no sistema."));
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <DynamicForm<TipoServico>
      title={id ? "Editar Tipo de Serviço" : "Cadastrar Tipo de Serviço"}
      subtitle={id ? "Atualize o nome ou o status da função." : "Crie uma nova função que poderá ser atribuída aos funcionários."}
      schema={tipoServicoFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Serviço"
      onCancel={() => navigate(ROUTES.operacao.tiposServico.list)}
    />
  );
}