import { useEffect, useState, useRef } from 'react';
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
  const mounted = useRef(false); // Ref para evitar reset no primeiro render

  const fieldPath = field.name as Path<T>;
  const dependsOnPath = (field.dependsOn || '_none_') as Path<T>;

  // Observa o valor do campo pai
  const parentValue = useWatch({
    control,
    name: dependsOnPath,
  });

  // 1. EFEITO DE BUSCA (Fetch API)
  useEffect(() => {
    if (!field.endpoint) return;

    const fetchOptions = async () => {
      setLoading(true);
      try {
        // Se tem dependência E o pai tem valor, filtra. Senão, busca tudo.
        // const params = field.dependsOnParam && parentValue 
        //   ? { [field.dependsOnParam]: parentValue } 
        //   : {};
        const params = field.dependsOnParam && parentValue 
          ? `?${field.dependsOnParam}=${parentValue}`
          : ``;
        
        console.log("Consulta para", field.endpoint+params);
        // const response = await client.get(field.endpoint as string, { params });
        const response = await client.get(`${field.endpoint}${ params }`);
        setOptions(response.data);
      } catch (err) {
        console.error(`Erro ao carregar lookup de ${field.name}`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [parentValue, field.endpoint, field.dependsOnParam, field.name]);

  // 2. EFEITO DE LIMPEZA (Reset quando o pai muda)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    // Só reseta se o campo tiver um pai definido
    if (field.dependsOn) {
      setValue(fieldPath, "" as PathValue<T, Path<T>>); 
    }
  }, [parentValue, field.dependsOn, fieldPath, setValue]);

  return (
    <>
      <select 
        {...register(fieldPath, { required: field.required })}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        disabled={loading || field.disabled} // Removemos a trava do parentValue
      >
        <option value="">{loading ? 'Carregando...' : 'Selecione...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Não é necessário duplicar a mensagem de erro aqui se o DynamicForm já renderiza */}
    </>
  );
};