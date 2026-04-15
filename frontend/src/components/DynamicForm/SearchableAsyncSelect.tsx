import { useEffect, useState, useRef, useMemo } from 'react';
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

interface Option {
  value: string | number;
  label: string;
}

interface SearchableAsyncSelectProps<T extends FieldValues> {
  field: FormField;
  control: Control<T>;
  setValue: UseFormSetValue<T>;
  register: UseFormRegister<T>;
  error?: any;
}

export const SearchableAsyncSelect = <T extends FieldValues>({ 
  field, control, setValue, register, error
}: SearchableAsyncSelectProps<T>) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  const fieldPath = field.name as Path<T>;
  const dependsOnPath = (field.dependsOn || '_none_') as Path<T>;

  const parentValue = useWatch({ control, name: dependsOnPath });
  const currentValue = useWatch({ control, name: fieldPath });

  // 1. EFEITO DE BUSCA (Fetch API)
  useEffect(() => {
    if (!field.endpoint) return;
    let isSubscribed = true;

    const fetchOptions = async () => {
      setLoading(true);
      try {
        const params = field.dependsOnParam && parentValue 
          ? { [field.dependsOnParam]: parentValue } 
          : {};
        
        const response = await client.get(field.endpoint as string, { params });
        if (isSubscribed) setOptions(response.data);
      } catch (err) {
        if (isSubscribed) {
          console.error(`Erro ao carregar lookup de ${field.name}`, err);
          setOptions([]);
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchOptions();
    return () => { isSubscribed = false; };
  }, [parentValue, field.endpoint, field.dependsOnParam, field.name]);

  // 2. SINCRONIA VISUAL (ID salvo -> Label na tela)
  useEffect(() => {
    if (currentValue === undefined || currentValue === null || currentValue === '') {
      if (!isOpen) setSearchTerm('');
      return;
    }

    const matchedOption = options.find(opt => String(opt.value) === String(currentValue));
    
    if (matchedOption) {
      if (!isOpen) setSearchTerm(matchedOption.label);
    } else if (field.creatable) {
      // SE FOR CREATABLE: O próprio valor digitado e salvo atua como label
      if (!isOpen) setSearchTerm(String(currentValue));
    }
  }, [currentValue, options, isOpen, field.creatable]);

  // 3. LIMPEZA EM CASCATA
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (field.dependsOn) {
      setValue(fieldPath, "" as PathValue<T, Path<T>>); 
      setSearchTerm('');
    }
  }, [parentValue, field.dependsOn, fieldPath, setValue]);

  // 4. CLICK OUTSIDE INTELIGENTE
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const matched = options.find(opt => String(opt.value) === String(currentValue));
        
        if (!matched) {
          if (field.creatable && searchTerm.trim() !== '') {
            // SE FOR CREATABLE: Salva o texto livre se o usuário clicar fora
            setValue(fieldPath, searchTerm.trim() as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true });
          } else {
            // Limpa se clicou fora e não selecionou nada
            setSearchTerm('');
          }
        } else {
          setSearchTerm(matched.label);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [currentValue, options, searchTerm, field.creatable, fieldPath, setValue]);

  // 5. FILTRAGEM LOCAL
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
  }, [options, searchTerm]);

  const handleSelect = (valueToSave: string | number, labelToShow: string) => {
    setSearchTerm(labelToShow);
    setValue(fieldPath, valueToSave as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true });
    setIsOpen(false);
  };

  // Verifica se o texto digitado já corresponde exatamente a uma opção existente
  const hasExactMatch = options.some(opt => opt.label.toLowerCase() === searchTerm.trim().toLowerCase());

  return (
    <div className={styles.comboWrapper} ref={wrapperRef}>
      <input
        type="text"
        className={`${styles.input} ${error ? styles.inputError : ''} ${styles.comboInput}`}
        placeholder={loading ? "Carregando..." : field.placeholder || "Selecione ou digite..."}
        value={searchTerm}
        disabled={loading || field.disabled}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onClick={() => !field.disabled && !loading && setIsOpen(true)}
      />
      
      <span className={styles.comboChevron}>{isOpen ? "▲" : "▼"}</span>

      {/* Input oculto que realmente guarda o valor/id para o React Hook Form */}
      <input type="hidden" {...register(fieldPath, { required: field.required })} />

      {isOpen && (
        <ul className={styles.comboDropdown}>
          {filteredOptions.map((opt) => (
            <li
              key={opt.value}
              className={`${styles.comboOption} ${String(opt.value) === String(currentValue) ? styles.comboSelected : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(opt.value, opt.label);
              }}
            >
              {opt.label}
            </li>
          ))}

          {/* OPÇÃO "CRIAR NOVO": Aparece se for creatable e não houver match exato */}
          {field.creatable && searchTerm.trim() !== '' && !hasExactMatch && (
            <li
              className={`${styles.comboOption} ${styles.comboOptionCreatable}`}
              onClick={(e) => {
                e.stopPropagation();
                // Salva a própria string como valor
                handleSelect(searchTerm.trim(), searchTerm.trim());
              }}
            >
              ➕ Usar "{searchTerm.trim()}" (Nova rota)
            </li>
          )}

          {filteredOptions.length === 0 && !field.creatable && (
            <li className={styles.comboEmpty}>Nenhum resultado</li>
          )}
        </ul>
      )}
    </div>
  );
};