import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { rotaApi } from "../../../api/frota/rotasApi";
import { ROUTES } from "../../../routes/routes";
import { DynamicForm } from "../../../components/DynamicForm/DynamicForm";
import { rotaFormSchema } from "../../../schemas/rota.schema";
import type { Rota } from "../../../types/models";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

export default function RotaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<Rota> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  // Valores padrão para uma rota nova
  const defaultValues: Partial<Rota> = {
    ativa: true,
  };

  useEffect(() => {
    if (id) {
      rotaApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados da rota.");
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues(defaultValues);
    }
  }, [id]);

  async function handleSubmit(form: Rota) {
    try {
      if (id) {
        await rotaApi.atualizar(Number(id), form);
      } else {
        await rotaApi.criar(form);
      }
      navigate(ROUTES.frota.rotas.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar rota. Verifique os dados."));
    }
  }

  if (loading) return <div>Carregando dados da rota...</div>;

  return (
    <DynamicForm<Rota>
      title={id ? "Editar Rota" : "Nova Rota"}
      subtitle={id ? `Editando registro #${id}` : "Preencha os dados de distância e consumo para estimativas."}
      schema={rotaFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Rota"
      
      // Se no futuro você quiser adicionar um botão extra aqui (ex: "Ver no Mapa"), 
      // basta passar a prop extraActions={...} assim como fizemos na Guia!
    />
  );
}