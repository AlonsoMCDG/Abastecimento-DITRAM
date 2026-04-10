import os
from io import BytesIO
from decimal import Decimal
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm

from apps.operacao.models import Guia 


def _format_decimal(value):
    if value is None:
        return "-"
    if isinstance(value, Decimal) or isinstance(value, float):
        return f"{value:.3f}"
    return str(value)


def _format_litros(value):
    value_text = _format_decimal(value)
    if value_text == "-":
        return value_text
    return f"{value_text} L"


def _format_usuario(usuario):
    if not usuario:
        return "Sistema"
    full_name = usuario.get_full_name().strip()
    return full_name or usuario.username


def _format_decimal_min1_keep_rest(value):
    if value is None:
        return "-"
    
    # Converte para float caso venha como string do banco
    try:
        val_float = float(value)
        text = format(val_float, "f")
    except (ValueError, TypeError):
        return str(value)

    if "." not in text:
        return f"{text}.0"

    integer, frac = text.split(".", 1)
    frac_stripped = frac.rstrip("0")
    if len(frac_stripped) < 1:
        frac_stripped = frac_stripped.ljust(1, "0")
    return f"{integer}.{frac_stripped}"


def _draw_signature_line(pdf: canvas.Canvas, x_center: float, y: float, width_mm: float = 90):
    line_w = width_mm * mm
    x1 = x_center - (line_w / 2)
    x2 = x_center + (line_w / 2)
    pdf.setLineWidth(1)
    pdf.line(x1, y, x2, y)


def _draw_guia_impressao_copy(pdf: canvas.Canvas, guia: Guia, y_bottom: float, y_top: float):
    page_w, _ = A4
    x_left = 18 * mm
    x_right = page_w - 18 * mm
    x_center = page_w / 2
    
    logo_size = 22 * mm 
    y_logo = y_top - 25 * mm
    
    pdf.setLineWidth(0.5)
    line_offset = 1.5 * mm

    # Caminhos das imagens (Ajuste conforme o seu settings.BASE_DIR)
    path_brasao_esq = os.path.join(settings.BASE_DIR, 'staticfiles', 'ditram', 'assets', 'img', 'brasao_ditram.png')
    path_brasao_dir = os.path.join(settings.BASE_DIR, 'staticfiles', 'ditram', 'assets', 'img', 'brasao_prefeitura.png')

    if os.path.exists(path_brasao_esq):
        pdf.drawImage(path_brasao_esq, x_left, y_logo, width=logo_size, height=logo_size, preserveAspectRatio=True, mask='auto')
    
    if os.path.exists(path_brasao_dir):
        pdf.drawImage(path_brasao_dir, x_right - logo_size, y_logo, width=logo_size, height=logo_size, preserveAspectRatio=True, mask='auto')

    # Acesso seguro aos novos relacionamentos (ForeignKeys)
    tipo_servico_nome = guia.tipo_servico.nome if getattr(guia, 'tipo_servico', None) else (guia.tipo_servico_texto or "")
    tipo_servico_raw = tipo_servico_nome.upper().strip()
    
    tipo_combustivel_display = guia.tipo_combustivel.nome if getattr(guia, 'tipo_combustivel', None) else ""

    vehicle_services = {"CAMINHONETE", "ONIBUS", "MOTOCICLETA", "CARRO"}
    escola_services = {"CAMINHONETE", "ONIBUS", "MOTOCICLETA", "CARRO", "BARQUEIRO"}

    if tipo_servico_raw in {"ROCAGEM", "COROTE"}:
        label_servico = "Responsável"
    elif tipo_servico_raw == "BARQUEIRO":
        label_servico = "Catraeiro"
    else:
        label_servico = "Condutor"
    
    label_nome = f"Nome do {label_servico}"
    label_instituicao = "Escola Atendida" if tipo_servico_raw in escola_services else "Instituição Atendida"

    # Formatando a nova data_hora
    data_emissao = guia.data_hora.strftime("%d/%m/%Y %H:%M") if guia.data_hora else "-"
    
    # Usando o novo campo pessoa
    nome_condutor = getattr(guia.pessoa, 'nome', '-')
    instituicao = getattr(guia.instituicao, 'nome', '-')

    litros = _format_decimal_min1_keep_rest(guia.quantidade_combustivel)

    # Informações do Veículo
    if guia.veiculo:
        modelo = getattr(guia.veiculo, 'modelo', '')
        placa = getattr(guia.veiculo, 'placa', '')
        veiculo_text = f"{modelo} - {placa}".strip(" -") or "-"
    else:
        veiculo_text = "-"
        
    observacao = guia.observacao or ""
    
    # Novo formato de Hodômetro
    hodometro = f"{guia.hodometro_atual} km" if guia.hodometro_atual else "-"
    periodo = "30" if tipo_servico_raw in {"CAMINHONETE", "ONIBUS"} else ""
    
    def draw_field_with_line(pdf, x, y, label, value, font_name="Helvetica", font_size=11, line_width_extra=0):
        pdf.setFont(f"{font_name}-Bold", font_size)
        pdf.drawString(x, y, label)
        
        label_width = pdf.stringWidth(label, f"{font_name}-Bold", font_size)
        x_value = x + label_width + 2 * mm 
        
        pdf.setFont(font_name, font_size)
        pdf.drawString(x_value, y, str(value))
        
        x_end = x_right if line_width_extra == 0 else x_value + line_width_extra
        pdf.setLineWidth(0.5)
        pdf.line(x_value, y - line_offset, x_end, y - line_offset)
    
    y = y_top - 14 * mm
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawCentredString(x_center, y, "GUIA PARA LIBERAÇÃO DE ABASTECIMENTO")

    y -= 7 * mm
    pdf.setFont("Helvetica-Oblique", 11)
    pdf.drawCentredString(x_center, y, f"{tipo_servico_nome}")

    y -= 14 * mm
    draw_field_with_line(pdf, x_left, y, "Data: ", data_emissao, line_width_extra=40 * mm)

    y -= 8 * mm
    draw_field_with_line(pdf, x_left, y, f"{label_nome}: ", nome_condutor)

    if tipo_servico_raw in vehicle_services or not tipo_servico_raw:
        y -= 8 * mm
        draw_field_with_line(pdf, x_left, y, "Modelo/placa do Veículo: ", veiculo_text)

    y -= 8 * mm
    draw_field_with_line(pdf, x_left, y, f"{label_instituicao}: ", instituicao)

    y -= 8 * mm
    litros_val = f"{litros} L ({tipo_combustivel_display})"
    draw_field_with_line(pdf, x_left, y, "Quantidade de Litros: ", litros_val, line_width_extra=60 * mm)

    if tipo_servico_raw != "ROCAGEM":
        y -= 8 * mm
        draw_field_with_line(pdf, x_left, y, "Período de uso (em dias): ", periodo, line_width_extra=50 * mm)

    if tipo_servico_raw in vehicle_services or not tipo_servico_raw:
        y -= 8 * mm
        draw_field_with_line(pdf, x_left, y, "Hodômetro Atual: ", hodometro, line_width_extra=50 * mm)
    
    y -= 8 * mm
    draw_field_with_line(pdf, x_left, y, "Observação: ", observacao)

    y_sig_coord = y_bottom + 38 * mm
    pdf.setFont("Helvetica", 10)
    _draw_signature_line(pdf, x_center, y_sig_coord)
    # Recomenda-se no futuro puxar isso de uma tabela de configurações do sistema
    pdf.drawCentredString(x_center, y_sig_coord - 6 * mm, "Duan de Souza Soares")
    pdf.drawCentredString(x_center, y_sig_coord - 11 * mm, "Diretor de Transporte Municipal")

    y_sig_cond = y_bottom + 14 * mm
    _draw_signature_line(pdf, x_center, y_sig_cond)
    pdf.drawCentredString(x_center, y_sig_cond - 6 * mm, f"Assinatura do {label_servico}")


def gerar_pdf_guia(guia_id):
    """
    Gera um PDF de impressão no formato A4 com duas vias (metade superior e inferior).
    Retorna bytes do PDF.
    """
    try:
        # select_related atualizado para abranger todos os relacionamentos necessários na impressão
        guia = Guia.objects.select_related(
            "veiculo",
            "rota",
            "instituicao",
            "usuario",
            "secretaria",
            "pessoa",
            "tipo_servico",
            "tipo_combustivel"
        ).get(id=guia_id)
    except Guia.DoesNotExist:
        raise ValueError(f"Guia {guia_id} não encontrada")

    buf = BytesIO()
    pdf = canvas.Canvas(buf, pagesize=A4)
    w, h = A4
    half = h / 2

    _draw_guia_impressao_copy(pdf, guia, y_bottom=half, y_top=h)
    _draw_guia_impressao_copy(pdf, guia, y_bottom=0, y_top=half)

    # Linha pontilhada de corte no meio da página
    pdf.setDash(3, 3)
    pdf.setLineWidth(0.8)
    pdf.line(12 * mm, half, w - 12 * mm, half)
    pdf.setDash()

    pdf.showPage()
    pdf.save()
    return buf.getvalue()