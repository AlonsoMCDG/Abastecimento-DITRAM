import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Path, PathValue, UseFormSetValue } from "react-hook-form";

import { veiculosApi } from "../veiculos.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicFormOld";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import { veiculoUISchema } from "../schemas/veiculo.schema";
import { veiculoFormSchema, type VeiculoFormData } from "../schemas/veiculo.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../veiculos.mapper";

export default function VeiculoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<VeiculoFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const defaultValues: Partial<VeiculoFormData> = {
    ativo: true,
    unidade_consumo: 'KM_POR_L'
  };

  useEffect(() => {
    if (id) {
      veiculosApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados do veículo."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(data: VeiculoFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);

      if (id) {
        await veiculosApi.atualizar(Number(id), payload);
      } else {
        await veiculosApi.criar(payload);
      }
      navigate(ROUTES.frota.veiculos.list);
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar veículo. Verifique se a placa informada já não consta no sistema."));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Intercepta mudanças para auto-preencher dados de máquinas pesadas
  const handleValuesChange = async (
    changedField: { name: Path<VeiculoFormData>; value: unknown },
    _currentValues: Partial<VeiculoFormData>,
    setValue: UseFormSetValue<VeiculoFormData>
  ) => {
    const { name, value } = changedField;
    
    if (name === 'categoria') {
      const novaUnidadeConsumo = (value === 'MAQUINA_PESADA') ? 'L_POR_H' : 'KM_POR_L';
      setValue('unidade_consumo', novaUnidadeConsumo as PathValue<VeiculoFormData, "unidade_consumo">, { shouldValidate: true })
    }
  };

  if (loading) return <div>Carregando dados do veículo...</div>;

  return (
    <div className="page-container">
      <DynamicForm<VeiculoFormData>
        title={id ? "Editar Veículo" : "Novo Veículo"}
        subtitle={id ? `Editando veículo: Placa ${initialValues?.placa || ''}` : "Cadastre os dados de um novo veículo na frota."}
        
        uiSchema={veiculoUISchema}
        zodSchema={veiculoFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onValuesChange={handleValuesChange}
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Veículo"
        onCancel={() => navigate(ROUTES.frota.veiculos.list)}
      />
    </div>
  );
}