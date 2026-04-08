// components/DynamicForm/DatalistInput.tsx
import React, { useEffect, useState } from 'react';
import { useWatch, type Control, type UseFormSetValue, type UseFormRegister } from 'react-hook-form';
import { client } from '../../api/config/apiClient';
import styles from './DynamicForm.module.css';
import type { FormField } from '../../types/form';

interface DatalistInputProps {
  field: FormField;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  register: UseFormRegister<any>;
}

export const DatalistInput: React.FC<DatalistInputProps> = ({ 
  field, control, setValue, register 
}) => {
  const [options, setOptions] = useState<{ value: string | number; label: string }[]>(field.options || []);
  const [inputValue, setInputValue] = useState('');

  const parentValue = useWatch({
    control,
    name: field.dependsOn || '_none_',
  });

  const isDisabled = !!field.dependsOn && !parentValue;

  useEffect(() => {
    if (!field.endpoint) return;

    // Limpa tudo do filho
    if (field.dependsOn && !parentValue) {
      setOptions([]);
      setInputValue('');
      setValue(field.name, '');
      return;
    }

    const fetchOptions = async () => {
      try {
        const queryParam = field.dependsOnParam && parentValue 
          ? `?${field.dependsOnParam}=${parentValue}` 
          : '';
          
        const response = await client.get(`${field.endpoint}${queryParam}`);
        setOptions(response.data);
      } catch (err) {
        console.error(`Erro no datalist ${field.name}`, err);
      }
    };

    fetchOptions();
  }, [parentValue, field.endpoint, field.dependsOn, field.name, setValue, field.dependsOnParam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    const matchedOption = options.find(opt => opt.label === val);
    
    if (matchedOption) {
      setValue(field.name, matchedOption.value, { shouldDirty: true, shouldValidate: true });
    } else {
      setValue(field.name, val, { shouldDirty: true, shouldValidate: true });
    }
  };

  const listId = `${field.name}-datalist`;

  return (
    <>
      <input 
        type="text"
        list={listId}
        className={styles.input}
        placeholder={field.placeholder}
        value={inputValue}
        onChange={handleInputChange}
        disabled={isDisabled}
      />
      <input type="hidden" {...register(field.name, { required: field.required })} />
      
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.label} />
        ))}
      </datalist>
    </>
  );
};