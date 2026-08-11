def normalize_cpf(value):
    cpf = ''.join(filter(str.isdigit, value))
    if len(cpf) != 11:
        raise ValueError("CPF inválido")
    return cpf
