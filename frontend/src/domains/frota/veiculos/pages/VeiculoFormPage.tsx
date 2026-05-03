import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { veiculosApi } from "../veiculos.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";
import { veiculoFormSchema } from "../schemas/veiculo.schema";
import type { Veiculo } from "../../../../core/types/models";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";
import type { Path, PathValue, UseFormSetValue } from "react-hook-form";
import { TIPO_VEICULO_BARCO_ID } from "../../../../constants/constants";

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

  // Escuta as mudanças do DynamicForm
  const handleValuesChange = async (
    changedField: { name: Path<Veiculo>; value: unknown },
    _currentValues: Partial<Veiculo>,
    setValue: UseFormSetValue<Veiculo>
  ) => {
    const { name, value } = changedField;  // nome do campo alterado e o novo valor dele
    const numValue = Number(value) || 0;
    
    if (name === 'tipo_veiculo_id') {
      
      const novoTipoLocomocao = (numValue === TIPO_VEICULO_BARCO_ID) ? 'FLUVIAL' : 'TERRESTRE';
      setValue('tipo_locomocao', novoTipoLocomocao as PathValue<Veiculo, "tipo_locomocao">, { shouldValidate: true })

      const novaUnidadeConsumo = (numValue === TIPO_VEICULO_BARCO_ID) ? 'L_POR_H' : 'KM_POR_L';
      setValue('unidade_consumo', novaUnidadeConsumo as PathValue<Veiculo, "unidade_consumo">, { shouldValidate: true })
      
      return;
    }
  };

  if (loading) return <div>Carregando dados do veículo...</div>;

  return (
    <DynamicForm<Veiculo>
      title={id ? "Editar Veículo" : "Novo Veículo"}
      subtitle={id ? `Editando registro #${id} - ${initialValues?.placa || ''}` : "Cadastre os dados de um novo veículo na frota."}
      schema={veiculoFormSchema}
      initialValues={initialValues}
      onValuesChange={handleValuesChange}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Veículo"
      onCancel={() => navigate(ROUTES.frota.veiculos.list)}
    />
  );
}