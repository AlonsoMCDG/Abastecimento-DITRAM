import React, { useEffect, useState, useRef } from 'react';
import { 
  useWatch, 
  type Control, 
  type UseFormSetValue, 
  type UseFormRegister, 
  type FieldValues, 
  type Path, 
  type PathValue 
} from 'react-hook-form';
import { client } from '../../api/config/apiClient';
import styles from './DynamicForm.module.css';
import type { FieldOption, FormField } from '../../types/form';

interface DatalistInputProps<T extends FieldValues> {
  field: FormField;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  register: UseFormRegister<T>;
  error?: any;
}

export const DatalistInput = <T extends FieldValues>({ 
  field, control, setValue, register, error
}: DatalistInputProps<T>) => {
  const [options, setOptions] = useState<FieldOption[]>(field.options || []);
  const [inputValue, setInputValue] = useState('');
  const mounted = useRef(false);

  const fieldPath = field.name as Path<T>;
  const dependsOnPath = (field.dependsOn || '_none_') as Path<T>;

  // Escuta o valor do PAI (para filtro em cascata)
  const parentValue = useWatch({
    control,
    name: dependsOnPath,
  });

  // Escuta o valor DESTE PRÓPRIO CAMPO (para auto-preenchimento)
  const currentValue = useWatch({
    control,
    name: fieldPath,
  });

  // 1. EFEITO DE BUSCA (Fetch API)
  useEffect(() => {
    if (!field.endpoint) return;

    const fetchOptions = async () => {
      try {
        const params = field.dependsOnParam && parentValue 
          ? { [field.dependsOnParam]: parentValue } 
          : {};
          
        const response = await client.get(field.endpoint as string, { params });
        
        setOptions(response.data);
      } catch (err) {
        console.error(`Erro no datalist ${field.name}`, err);
      }
    };

    fetchOptions();
  }, [parentValue, field.endpoint, field.dependsOnParam, field.name]);

  // 2. SINCRONIA VISUAL
  // Se o valor real mudar de fora (ex: via setValue na página), atualiza o que aparece na tela
  useEffect(() => {
    if (currentValue === undefined || currentValue === null || currentValue === '') {
      setInputValue('');
      return;
    }

    // Procura se o valor atual é o ID de alguma opção carregada
    const matchedOption = options.find(opt => String(opt.value) === String(currentValue));

    if (matchedOption) {
      // É um ID válido, exibe o nome (Label)
      if (inputValue !== matchedOption.label) {
        setInputValue(matchedOption.label);
      }
    } else {
      // Pode ser um texto livre digitado OU as opções ainda não terminaram de carregar da API
      if (inputValue !== String(currentValue)) {
        setInputValue(String(currentValue));
      }
    }
  }, [currentValue, options]); // Depender de 'options' garante que o nome atualize assim que a API responder

  // 3. EFEITO DE LIMPEZA (Reset visual e interno quando o pai muda)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    if (field.dependsOn) {
      setInputValue('');
      setValue(fieldPath, '' as PathValue<T, Path<T>>);
    }
  }, [parentValue, field.dependsOn, fieldPath, setValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Verifica se o texto digitado bate com o label de alguma opção
    // Usa toLowerCase para evitar que diferenças de maiúsculas/minúsculas quebrem a seleção
    const matchedOption = options.find(opt => String(opt.label).toLowerCase() === val.toLowerCase());
    
    if (matchedOption) {
      // Se bateu, salva o ID real no react-hook-form
      setValue(fieldPath, matchedOption.value as PathValue<T, Path<T>>, { shouldDirty: true, shouldValidate: true });
    } else {
      // Se não bateu (é um registro novo), salva o texto digitado
      setValue(fieldPath, val as PathValue<T, Path<T>>, { shouldDirty: true, shouldValidate: true });
    }
  };

  const listId = `${field.name}-datalist`;

  return (
    <>
      <input 
        type="text"
        list={listId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        placeholder={field.placeholder}
        value={inputValue}
        onChange={handleInputChange}
        disabled={field.disabled}
      />
      
      {/* Input oculto que registra o valor real (ID ou Texto) no react-hook-form */}
      <input type="hidden" {...register(fieldPath, { required: field.required })} />
      
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.label} />
        ))}
      </datalist>
    </>
  );
};