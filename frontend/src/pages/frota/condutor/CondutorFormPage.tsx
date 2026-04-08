import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { DynamicForm } from "../../../components/DynamicForm/DynamicForm"
import { condutorFormSchema } from "../../../schemas/condutor.schema"
import { pessoasApi } from "../../../api/pessoas/pessoasApi"
import "../../../assets/css/FormPage.css"

import type { Pessoa } from "../../../types/models"

export default function CondutorFormPage() {

  const navigate = useNavigate()
  const { id } = useParams()

  const [data, setData] =
    useState<Pessoa | null>(null)
  
  useEffect(() => {

    if (id) {
      pessoasApi.buscar(Number(id))
        .then(res => setData(res.data))
    }

  }, [id])

  async function handleSubmit(form: Pessoa) {

    if (id) {

      await pessoasApi.atualizar(
        Number(id),
        form
      )

    } else {

      await pessoasApi.criar(form)

    }

    navigate("/frota/condutores")
  }

  return (

    <div className="form-page">

      <div className="form-header condutor">
        <h2>
          {id ? "Editar" : "Novo"} Pessoa
        </h2>
      </div>

      <div className="form-container">
        <DynamicForm<Pessoa>
          schema={condutorFormSchema}
          initialValues={(data || {}) as Partial<Pessoa>}
          onSubmit={handleSubmit}
        />
      </div>

    </div>
  )
}
