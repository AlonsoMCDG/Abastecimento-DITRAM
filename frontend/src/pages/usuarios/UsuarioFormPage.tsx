import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usuarioApi } from "../../api/usuarios/usuariosApi";
import { ROUTES } from "../../routes/routes";
import { DynamicForm } from "../../components/DynamicForm/DynamicForm";
import { usuarioFormSchema } from "../../schemas/usuario.schema";
import type { Usuario } from "../../types/models";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

export default function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [initialValues, setInitialValues] = useState<Partial<Usuario> | undefined>(undefined);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      usuarioApi.buscar(Number(id))
        .then(res => setInitialValues(res.data))
        .catch(err => {
          console.error(err);
          alert("Erro ao carregar os dados do usuário.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  async function handleSubmit(form: any) {
    try {
      // Como a senha no backend não pode ir vazia na criação, mas pode ir vazia na edição:
      const payload = { ...form };
      if (!payload.password) delete payload.password; // Limpa para o PATCH não quebrar

      if (id) {
        await usuarioApi.atualizar(Number(id), payload);
      } else {
        // Validação básica manual no frontend para criação
        if (!form.password) {
          alert("A senha é obrigatória para novos usuários.");
          return;
        }
        await usuarioApi.criar(payload);
      }
      navigate(ROUTES.sistema.usuarios.list);
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Erro ao salvar usuário. Verifique os dados."));
    }
  }

  if (loading) return <div>Carregando dados do usuário...</div>;

  return (
    <DynamicForm<Usuario>
      title={id ? "Editar Usuário" : "Novo Usuário"}
      subtitle={id ? "Modifique as informações de acesso." : "Preencha os dados básicos do novo acesso."}
      schema={usuarioFormSchema}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      submitLabel="💾 Salvar Usuário"
      onCancel={() => navigate(ROUTES.sistema.usuarios.list)} // Botão Cancelar Inteligente!
    />
  );
}