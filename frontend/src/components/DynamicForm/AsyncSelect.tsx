// Este componente gerencia o próprio ciclo de vida de dados baseado no valor da dependência.
import React, { useEffect, useState } from 'react';
import { useWatch, type Control, type UseFormSetValue, type UseFormRegister } from 'react-hook-form';
import { client } from '../../api/config/apiClient';
import styles from './DynamicForm.module.css';
import type { FormField } from '../../types/form';

interface AsyncSelectProps {
  field: FormField;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  register: UseFormRegister<any>;
  error?: any;
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({ 
  field, control, setValue, register, error
}) => {
  const [options, setOptions] = useState<{ value: any; label: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const parentValue = useWatch({
    control,
    name: field.dependsOn || '_none_',
  });

  const isDisabled = !!field.dependsOn && !parentValue;

  useEffect(() => {
    if (field.dependsOn && !parentValue) {
      setOptions([]);
      setValue(field.name, ""); 
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      try {
        const queryParam = field.dependsOnParam && parentValue 
          ? `?${field.dependsOnParam}=${parentValue}` 
          : '';
        
        const response = await client.get(`${field.endpoint}${queryParam}`);
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
  }, [parentValue, field.endpoint, field.dependsOn, field.name, setValue, field.dependsOnParam]);

  return (
    <select 
      {...register(field.name, { required: field.required })}
      className={styles.input}
      disabled={isDisabled || loading}
    >
      <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
};