// Este componente gerencia o próprio ciclo de vida de dados baseado no valor da dependência.
import { useEffect, useState } from 'react';
import { useWatch, type Control, type UseFormSetValue, type UseFormRegister, type FieldValues, type Path, type PathValue } from 'react-hook-form';
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

  const fieldPath = field.name as Path<T>;
  const dependsOnPath = (field.dependsOn || '_none_') as Path<T>;

  const parentValue = useWatch({
    control,
    name: dependsOnPath,
  });

  const isDisabled = !!field.dependsOn && !parentValue;

  useEffect(() => {
    if (field.dependsOn && !parentValue) {
      setOptions([]);
      setValue(fieldPath, "" as PathValue<T, Path<T>>); 
      return;
    }

    const fetchOptions = async () => {
      const endpoint = field.endpoint;

      if (!endpoint) return; // Impede requisições acidentais na raiz

      setLoading(true);
      try {
        const params = field.dependsOnParam && parentValue 
          ? { [field.dependsOnParam]: parentValue } 
          : {};
        
        const response = await client.get(endpoint, { params });
        setOptions(response.data);
      } catch (err) {
        console.error(`Erro ao carregar lookup de ${field.name}`, err);
      } finally {
        setLoading(false);
      }
    };

    if (!field.dependsOn || parentValue) {
      fetchOptions();
    }
  }, [parentValue, field.endpoint, field.dependsOn, fieldPath, setValue, field.dependsOnParam]);

  return (
    <>
      <select 
        {...register(fieldPath, { required: field.required })}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        disabled={isDisabled || loading}
      >
        <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {error && <span className={styles.error}>Este campo é obrigatório</span>}
    </>
  );
};