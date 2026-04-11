import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { alocacoesApi } from "../../api/operacao/alocacoesApi";
import { ROUTES } from "../../routes/routes";
import { DynamicForm } from "../../components/DynamicForm/DynamicForm";
import { alocacaoFormSchema } from "../../schemas/alocacao.schema";
import type { AlocacaoServico } from "../../types/models";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

export default function AlocacaoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<AlocacaoServico> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  // Valores padrão para uma nova alocação
  const defaultValues: Partial<AlocacaoServico> = {
    is_principal: false,
  };

  useEffect(() => {
    if (id) {
      alocacoesApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados da alocação.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      if (id) {
        await alocacoesApi.atualizar(Number(id), form);
      } else {
        await alocacoesApi.criar(form);
      }
      navigate(ROUTES.operacao.alocacoesServico.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar alocação. Verifique os dados."));
    }
  }

  if (loading) return <div>Carregando dados da alocação...</div>;

  return (
    <DynamicForm<AlocacaoServico>
      title={id ? "Editar Alocação" : "Nova Alocação de Serviço"}
      subtitle="Vincule um funcionário a um tipo de serviço e defina sua lotação."
      schema={alocacaoFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Alocação"
      onCancel={() => navigate(ROUTES.operacao.alocacoesServico.list)}
    />
  );
}