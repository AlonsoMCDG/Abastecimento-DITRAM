from django.db import transaction
from django.core.exceptions import ValidationError
from apps.operacao.models import RegistroHodometroDiario

def registrar_hodometro_diario(dados: dict) -> RegistroHodometroDiario:
    hodometro_inicial = dados.get("hodometro_inicial")
    hodometro_final = dados.get("hodometro_final")
    guia = dados.get("guia")

    distancia = hodometro_final - hodometro_inicial
    if distancia < 0:
        raise ValidationError({"hodometro_final": "Hodômetro final não pode ser menor que o inicial."})

    with transaction.atomic():
        registro = RegistroHodometroDiario.objects.create(
            distancia_percorrida=distancia,
            **dados
        )

        if guia.veiculo:
            veiculo = guia.veiculo
            if hodometro_final > veiculo.hodometro_atual:
                veiculo.hodometro_atual = hodometro_final
                veiculo.save(update_fields=['hodometro_atual'])

        return registro
