import { useEffect, useState, useRef } from 'react';
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
import type { FormField } from '../../types/form';

interface AsyncSelectProps<T extends FieldValues> {
  field: FormField;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  register: UseFormRegister<T>;
  error?: any;
}

export const AsyncSelect = <T extends FieldValues>({ 
  field, control, setValue, register, error
}: AsyncSelectProps<T>) => {
  const [options, setOptions] = useState<{ value: any; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(false);

  const fieldPath = field.name as Path<T>;
  const dependsOnPath = (field.dependsOn || '_none_') as Path<T>;

  // ESCUTA O VALOR DO PAI (Para o filtro em cascata)
  const parentValue = useWatch({
    control,
    name: dependsOnPath,
  });

  // ESCUTA O VALOR ATUAL DESTE PRÓPRIO CAMPO (Para sincronizar o Select na inicialização)
  const currentValue = useWatch({
    control,
    name: fieldPath,
  });

  // EFEITO DE BUSCA (Fetch API)
  useEffect(() => {
    if (!field.endpoint) return;

    let isSubscribed = true; // Proteção contra unmounted components

    const fetchOptions = async () => {
      setLoading(true);
      try {
        const params = field.dependsOnParam && parentValue 
          ? { [field.dependsOnParam]: parentValue } 
          : {};
        
        const response = await client.get(field.endpoint as string, { params });
        
        if (isSubscribed) {
          setOptions(response.data);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error(`Erro ao carregar lookup de ${field.name}`, err);
          setOptions([]); // Limpa as opções em caso de erro
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchOptions();

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [parentValue, field.endpoint, field.dependsOnParam, field.name]);

  // EFEITO DE LIMPEZA (Reset quando o pai muda)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    // Só reseta se o campo tiver um pai definido E se já estiver montado
    if (field.dependsOn) {
      setValue(fieldPath, "" as PathValue<T, Path<T>>); 
    }
  }, [parentValue, field.dependsOn, fieldPath, setValue]);

  return (
    <select 
      id={field.name}
      {...register(fieldPath, { required: field.required })}
      className={`${styles.input} ${error ? styles.inputError : ''}`}
      disabled={loading || field.disabled}
      // Força o HTML a selecionar a option correta quando elas terminarem de carregar
      value={currentValue ?? ""} 
    >
      <option value="">
        {loading 
          ? 'Carregando opções...' 
          : options.length === 0 
            ? 'Nenhuma opção disponível' 
            : 'Selecione...'}
      </option>
      
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};