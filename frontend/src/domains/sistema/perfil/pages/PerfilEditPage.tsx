import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usuarioApi } from "../../usuarios/usuarios.api";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";
import { DynamicForm } from "../../../../core/ui/forms/dynamic-form/DynamicForm";

import { perfilUISchema } from "../../usuarios/schemas/usuario.schema";
import { perfilEditFormSchema, type PerfilEditFormData } from "../../usuarios/schemas/usuario.form.zod";
import { mapReadToForm, mapFormToWriteDTO } from "../../usuarios/usuarios.mapper";

export default function PerfilEditPage() {
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<Partial<PerfilEditFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    usuarioApi.me()
      .then(res => setInitialValues(mapReadToForm(res.data))) // Pegamos o res.data do axios direto do client.get() original
      .catch(err => setGlobalError(getApiErrorMessage(err, "Falha ao carregar perfil.")))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(data: PerfilEditFormData) {
    setIsSubmitting(true);
    setGlobalError(null);

    try {
      const payload = mapFormToWriteDTO(data);
      // O backend não precisa das senhas se elas não foram preenchidas
      if (!payload.password) delete payload.password;

      await usuarioApi.atualizarMe(payload);
      navigate("/perfil", { replace: true });
    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Falha ao atualizar perfil. Verifique os dados."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <div>Carregando seu perfil...</div>;

  return (
    <div className="page-container">
      <DynamicForm<PerfilEditFormData>
        title="Editar Meu Perfil"
        subtitle="Atualize seus dados pessoais e de acesso."
        
        uiSchema={perfilUISchema}
        zodSchema={perfilEditFormSchema}
        
        initialValues={initialValues}
        globalError={globalError}
        isLoading={isSubmitting}
        
        onSubmit={handleSubmit}
        submitLabel="💾 Atualizar Perfil"
        onCancel={() => navigate("/perfil")}
      />
    </div>
  );
}