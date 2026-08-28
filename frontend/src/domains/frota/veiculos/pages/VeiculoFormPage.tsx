import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useForm,
  FormProvider,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";
import { ROUTES } from "../../../../core/routes/routes";

import { veiculosApi } from "../api/veiculos.api";
import {
  mapReadToForm,
  mapFormToWriteDTO,
} from "../api/veiculos.mapper";

import { veiculoUISchema } from "../schemas/veiculo.ui";
import {
  veiculoFormSchema,
  type VeiculoFormInput,
} from "../schemas/veiculo.form";

import layoutStyles from "../../../../core/ui/layouts/FormPage.module.css";


export default function VeiculoFormPage() {

  // --------------------------------------------------------
  // REACT HOOK FORM
  // --------------------------------------------------------

  const methods = useForm<VeiculoFormInput>({
    resolver: zodResolver(veiculoFormSchema),
    mode: "onChange",
    defaultValues: {
      ativo: true,
      unidade_consumo: "KM_POR_L",
    },
  });

  const {
    reset,
    watch,
    setValue,
  } = methods;


  // --------------------------------------------------------
  // NAVEGAÇÃO / PARÂMETROS
  // --------------------------------------------------------

  const navigate = useNavigate();
  const { id } = useParams();


  // --------------------------------------------------------
  // ESTADO
  // --------------------------------------------------------

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // --------------------------------------------------------
  // CARREGAMENTO DOS DADOS
  // --------------------------------------------------------

  useEffect(() => {
    if (id) {
      veiculosApi
        .buscar(Number(id))
        .then((res) => {
          reset(mapReadToForm(res));
        })
        .catch((err) => {
          setGlobalError(
            getApiErrorMessage(
              err,
              "Erro ao carregar os dados do veículo."
            )
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      reset({
        ativo: true,
        unidade_consumo: "KM_POR_L",
      });

      setLoading(false);
    }
  }, [id, reset]);


  // --------------------------------------------------------
  // EFEITO: UNIDADE DE CONSUMO
  // --------------------------------------------------------

  const categoria = watch("categoria");

  useEffect(() => {
    if (!categoria) return;

    const unidadeConsumo =
      categoria === "MAQUINA_PESADA"
        ? "L_POR_H"
        : "KM_POR_L";

    setValue("unidade_consumo", unidadeConsumo, {
      shouldValidate: true,
    });
  }, [categoria, setValue]);


  // --------------------------------------------------------
  // SUBMISSÃO
  // --------------------------------------------------------

  const onSubmit: SubmitHandler<VeiculoFormInput> = async (
    rawFormData
  ) => {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // O resolver já faz a validação normalmente,
      // mas fazemos o parse explicitamente para obter
      // o FormOutput transformado pelo Zod.
      const formData = veiculoFormSchema.parse(rawFormData);

      const payload = mapFormToWriteDTO(formData);

      if (id) {
        await veiculosApi.atualizar(
          Number(id),
          payload
        );
      } else {
        await veiculosApi.criar(payload);
      }

      navigate(ROUTES.frota.veiculos.list);

    } catch (error) {
      if (error instanceof z.ZodError) {
        setGlobalError(
          "Verifique os campos obrigatórios."
        );
      } else {
        setGlobalError(
          getApiErrorMessage(
            error,
            "Erro ao salvar veículo. Verifique se a placa informada já não consta no sistema."
          )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  // --------------------------------------------------------
  // LOADING
  // --------------------------------------------------------

  if (loading) {
    return (
      <div className={layoutStyles.loading}>
        Carregando dados do veículo...
      </div>
    );
  }


  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------

  return (
    <div className={layoutStyles.pageContainer}>

      <header className={layoutStyles.header}>
        <h1 className={layoutStyles.title}>
          {id ? "Editar Veículo" : "Novo Veículo"}
        </h1>

        <p className={layoutStyles.subtitle}>
          {id
            ? `Editando veículo: Placa ${watch("placa") || ""}`
            : "Cadastre os dados de um novo veículo na frota."
          }
        </p>
      </header>


      {globalError && (
        <div className={layoutStyles.alertError}>
          ⚠️ {globalError}
        </div>
      )}


      <div className={layoutStyles.card}>

        <FormProvider {...methods}>

          <DynamicForm<VeiculoFormInput>
            uiSchema={veiculoUISchema}
            onSubmit={methods.handleSubmit(onSubmit)}
            isLoading={isSubmitting}
          />

          <div className={layoutStyles.extraActions}>

            <button
              type="button"
              className={layoutStyles.btnCancel}
              onClick={() =>
                navigate(ROUTES.frota.veiculos.list)
              }
              disabled={isSubmitting}
            >
              Cancelar
            </button>

          </div>

        </FormProvider>

      </div>
    </div>
  );
}