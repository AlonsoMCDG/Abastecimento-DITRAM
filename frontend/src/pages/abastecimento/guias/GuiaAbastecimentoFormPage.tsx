import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import DynamicForm from "../../../components/DynamicForm"
import { guiaAbastecimentoFormSchema } from "../../../schemas/guiaAbastecimento.schema"
import { guiasApi } from "../../../api/operacao/guiasApi"
import "../../../assets/css/FormPage.css"

import type { GuiaAbastecimento } from "../../../types/models"

export default function GuiaAbastecimentoFormPage() {

  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const [data, setData] = useState<GuiaAbastecimento | null>(null)

  const secretariaParam = searchParams.get("secretaria")
  const secretariaId = secretariaParam ? Number(secretariaParam) : undefined

  const currentDateTime = (() => {
    const now = new Date();
    // Ajusta o timezone (Traz o fuso horário local, ignorando o UTC do toISOString)
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localNow.toISOString().slice(0, 16);
  })()
  
  useEffect(() => {
    if (id) {
      guiasApi.buscar(Number(id))
        .then(res => setData(res.data))
    }
  }, [id])

  async function handleSubmit(form: GuiaAbastecimento) {
    if (id) {
      await guiasApi.atualizar(Number(id), form)
    } else {
      await guiasApi.criar(form)
    }

    navigate("/abastecimento/guias")
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h2>
          {id ? "Editar" : "Nova"} Guia de Abastecimento
        </h2>
      </div>

      <div className="form-container">
        <DynamicForm<GuiaAbastecimento>
          schema={guiaAbastecimentoFormSchema}
          initialData={
            id
              ? (data || {})
              : {
                data_hora: currentDateTime,
                quantidade_oleo: 0,
                observacao: "",
                ...(typeof secretariaId === "number" && Number.isFinite(secretariaId)
                  ? { secretaria: secretariaId }
                  : {}),
                ...(data || {}),
              }
          }
          onSubmit={handleSubmit}
        />
      </div>

    </div>
  )
}
