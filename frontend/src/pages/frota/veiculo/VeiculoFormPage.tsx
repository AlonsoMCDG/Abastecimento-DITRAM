import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { veiculosApi } from "../../../api/frota/veiculosApi";
import { ROUTES } from "../../../routes/routes";
import { DynamicForm } from "../../../components/DynamicForm/DynamicForm";
import { veiculoFormSchema } from "../../../schemas/veiculo.schema";
import type { Veiculo } from "../../../types/models";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

export default function VeiculoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<Veiculo> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  const defaultValues: Partial<Veiculo> = {
    ativo: true,
  };

  useEffect(() => {
    if (id) {
      veiculosApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados do veículo.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      if (id) {
        await veiculosApi.atualizar(Number(id), form);
      } else {
        await veiculosApi.criar(form);
      }
      navigate(ROUTES.frota.veiculos.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar veículo. Verifique os dados."));
    }
  }

  if (loading) return <div>Carregando dados do veículo...</div>;

  return (
    <DynamicForm<Veiculo>
      title={id ? "Editar Veículo" : "Novo Veículo"}
      subtitle={id ? `Editando registro #${id} - ${initialValues?.placa || ''}` : "Cadastre os dados de um novo veículo na frota."}
      schema={veiculoFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Veículo"
      onCancel={() => navigate(ROUTES.frota.veiculos.list)}
    />
  );
}