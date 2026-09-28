import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getApiErrorMessage } from "../../../../core/api/errorHandlers";
import { ROUTES } from "../../../../core/routes/routes";
import { SimpleForm } from "../../../../core/ui/forms/SimpleForm";

import { veiculosApi } from "../api/veiculos.api";
import { mapReadToForm, mapFormToWriteDTO } from "../api/veiculos.mapper";
import { veiculoUISchema } from "../schemas/veiculo.ui";
import { veiculoFormSchema, type VeiculoFormInput } from "../schemas/veiculo.form";

export default function VeiculoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<VeiculoFormInput>>();
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      veiculosApi.buscar(Number(id))
        .then((res) => setInitialValues(mapReadToForm(res)))
        .catch((err) => setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados do veículo.")))
        .finally(() => setLoading(false));
    } else {
      setInitialValues({
        ativo: true,
        unidade_consumo: "KM_POR_L",
      });
      setLoading(false);
    }
  }, [id]);

  async function handleSubmit(data: VeiculoFormInput) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const formData = veiculoFormSchema.parse(data);
      const payload = mapFormToWriteDTO(formData);

      if (id) {
        await veiculosApi.atualizar(Number(id), payload);
      } else {
        await veiculosApi.criar(payload);
      }

      navigate(ROUTES.frota.veiculos.list);
    } catch (error) {
      setGlobalError(getApiErrorMessage(
        error,
        "Erro ao salvar veículo. Verifique se a placa informada já não consta no sistema."
      ));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div>Carregando dados do veículo...</div>;
  }

  return (
    <div className="page-container">
      <SimpleForm<VeiculoFormInput>
        title={id ? "Editar Veículo" : "Novo Veículo"}
        subtitle={id ? "Atualize os dados do veículo." : "Cadastre os dados do veículo."}
        uiSchema={veiculoUISchema}
        zodSchema={veiculoFormSchema}
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        onSubmit={handleSubmit}
        submitLabel="Salvar"
        onCancel={() => navigate(ROUTES.frota.veiculos.list)}
      />
    </div>
  );
}
