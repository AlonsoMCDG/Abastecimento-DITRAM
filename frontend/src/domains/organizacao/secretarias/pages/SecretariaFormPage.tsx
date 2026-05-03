import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { secretariaApi } from "../secretarias.api"; // Ajuste o caminho se necessário
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";
import { secretariaFormSchema } from "../../../schemas/secretaria.schema";
import type { Secretaria } from "../../../../core/types/models";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

export default function SecretariaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<Secretaria> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  // Secretarias recém-criadas são ativas por padrão
  const defaultValues: Partial<Secretaria> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      secretariaApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados da secretaria.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      if (id) {
        await secretariaApi.atualizar(Number(id), form);
      } else {
        await secretariaApi.criar(form);
      }
      navigate(ROUTES.organizacao.secretarias.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar secretaria. Verifique os dados fornecidos."));
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <DynamicForm<Secretaria>
      title={id ? "Editar Secretaria" : "Cadastrar Secretaria"}
      subtitle={id ? "Atualize as informações organizacionais." : "Registre uma nova secretaria ou autarquia no sistema."}
      schema={secretariaFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Secretaria"
      onCancel={() => navigate(ROUTES.organizacao.secretarias.list)}
    />
  );
}