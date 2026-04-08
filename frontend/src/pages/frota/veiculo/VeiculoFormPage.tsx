import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { DynamicForm } from "../../../components/DynamicForm/DynamicForm"
import { veiculoSchema } from "../../../schemas/veiculo.schema"
import { veiculosApi } from "../../../api/frota/veiculosApi"
import "../../../assets/css/FormPage.css"

import type { Veiculo } from "../../../types/models"

export default function VeiculoFormPage() {

  const navigate = useNavigate()
  const { id } = useParams()

  const [data, setData] =
    useState<Veiculo | null>(null)
  
  useEffect(() => {

    if (id) {
      veiculosApi.buscar(Number(id))
        .then(res => setData(res.data))
    }

  }, [id])

  async function handleSubmit(form: Veiculo) {

    if (id) {

      await veiculosApi.atualizar(
        Number(id),
        form
      )

    } else {

      await veiculosApi.criar(form)

    }

    navigate("/frota/veiculos")
  }

  return (

    <div className="form-page">

      <div className="form-header veiculo">
        <h2>
          {id ? "Editar" : "Novo"} Veículo
        </h2>
      </div>

      <div className="form-container">
        <DynamicForm<Veiculo>
          schema={veiculoSchema}
          initialValues={(data || {}) as Partial<Veiculo>}
          onSubmit={handleSubmit}
        />
      </div>

    </div>
  )
}
