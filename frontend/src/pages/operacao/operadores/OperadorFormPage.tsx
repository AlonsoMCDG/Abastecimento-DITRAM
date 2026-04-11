import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { operadoresApi } from "../../../api/operacao/operadoresApi";
import { ROUTES } from "../../../routes/routes";
import { DynamicForm } from "../../../components/DynamicForm/DynamicForm";
import { operadorFormSchema } from "../../../schemas/operador.schema";
import type { OperadorVeiculo } from "../../../types/models";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

export default function OperadorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<OperadorVeiculo> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  const defaultValues: Partial<OperadorVeiculo> = {
    is_principal: false,
  };

  useEffect(() => {
    if (id) {
      operadoresApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados do vínculo.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      if (id) {
        await operadoresApi.atualizar(Number(id), form);
      } else {
        await operadoresApi.criar(form);
      }
      navigate(ROUTES.operacao.operadoresVeiculo.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar o vínculo. Verifique se este motorista já não está atrelado a este veículo."));
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <DynamicForm<OperadorVeiculo>
      title={id ? "Editar Vínculo" : "Novo Vínculo de Operador"}
      subtitle="Defina qual pessoa está autorizada a conduzir determinado veículo da frota."
      schema={operadorFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Vínculo"
      onCancel={() => navigate(ROUTES.operacao.operadoresVeiculo.list)}
    />
  );
}