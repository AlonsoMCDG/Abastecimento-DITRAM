import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { usuarioApi } from "../usuarios.api";
import { ROUTES } from "../../../../core/routes/routes";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicFormOld";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import { usuarioUISchema } from "../schemas/usuario.schema";
import { usuarioFormSchema, type UsuarioFormData } from "../schemas/usuario.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../usuarios.mapper";

export default function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<UsuarioFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      usuarioApi.buscar(Number(id))
        .then(res => setInitialValues(mapReadToForm(res)))
        .catch(err => {
          setGlobalError(getApiErrorMessage(err, "Erro ao carregar os dados do usuário."));
        })
        .finally(() => setLoading(false));
    } else {
      setInitialValues({});
    }
  }, [id]);

  async function handleSubmit(data: UsuarioFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);
      if (!payload.password) delete payload.password;

      if (id) {
        await usuarioApi.atualizar(Number(id), payload);
      } else {
        if (!payload.password) {
          setGlobalError("A senha é obrigatória para a criação de novos usuários.");
          setIsSubmitting(false);
          return;
        }
        await usuarioApi.criar(payload);
      }
      navigate(ROUTES.sistema.usuarios.list);
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Erro ao salvar usuário. Verifique se o CPF já existe."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando dados...</div>;

  return (
    <div className="page-container">
      <DynamicForm<UsuarioFormData>
        title={id ? "Editar Usuário" : "Novo Usuário"}
        subtitle={id ? "Modifique as informações de acesso." : "Preencha os dados básicos do novo acesso."}
        
        uiSchema={usuarioUISchema}
        zodSchema={usuarioFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Salvar Usuário"
        onCancel={() => navigate(ROUTES.sistema.usuarios.list)}
      />
    </div>
  );
}