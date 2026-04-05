import { useNavigate, useParams } from "react-router-dom"

import DynamicForm from "../../components/DynamicForm"
import { alocacaoFormSchema } from "../../schemas/alocacao.schema"
import { alocacoesApi } from "../../api/operacao/alocacoesApi"
import "../../assets/css/FormPage.css"
import { ROUTES } from "../../routes/routes"

import type { AlocacaoServico } from "../../types/models"

export default function AlocacaoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  async function handleSubmit(form: AlocacaoServico) {
    if (id) {
      await alocacoesApi.atualizar(Number(id), form)
    } else {
      await alocacoesApi.criar(form)
    }
    navigate(ROUTES.operacao.alocacoesServico.list)
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h2>{id ? "Editar" : "Nova"} Lotação</h2>
      </div>

      <div className="form-container">
        <DynamicForm<AlocacaoServico>
          schema={alocacaoFormSchema}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
