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
import { client } from '../../api/apiClient';
import styles from './dynamic-form/DynamicForm.module.css';
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
  
  // NAVEGAÇÃO POR TECLADO
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
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

  // 2. SINCRONIA VISUAL
  useEffect(() => {
    if (currentValue === undefined || currentValue === null || currentValue === '') {
      if (!isOpen) setSearchTerm('');
      return;
    }

    const matchedOption = options.find(opt => String(opt.value) === String(currentValue));
    
    if (matchedOption) {
      if (!isOpen) setSearchTerm(matchedOption.label);
    } else if (field.creatable) {
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
            setValue(fieldPath, searchTerm.trim() as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true });
          } else {
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

  const hasExactMatch = options.some(opt => opt.label.toLowerCase() === searchTerm.trim().toLowerCase());
  const showCreatableOption = field.creatable && searchTerm.trim() !== '' && !hasExactMatch;

  // 6. RESET DO ÍNDICE AO DIGITAR
  useEffect(() => {
    if (isOpen) {
      // Sempre que a lista for filtrada, seleciona o primeiro item automaticamente
      setHighlightedIndex(filteredOptions.length > 0 || showCreatableOption ? 0 : -1);
    }
  }, [searchTerm, filteredOptions.length, showCreatableOption, isOpen]);

  // 7. ROLAGEM AUTOMÁTICA (Scroll Into View)
  useEffect(() => {
    if (isOpen && dropdownRef.current && highlightedIndex >= 0) {
      const activeElement = dropdownRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        // 'nearest' garante que a tela só role o mínimo necessário
        activeElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (valueToSave: string | number, labelToShow: string) => {
    setSearchTerm(labelToShow);
    setValue(fieldPath, valueToSave as PathValue<T, Path<T>>, { shouldValidate: true, shouldDirty: true });
    setIsOpen(false);
  };

  // 8. O MOTOR DO TECLADO
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = filteredOptions.length + (showCreatableOption ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } 
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } 
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0) {
        if (highlightedIndex < filteredOptions.length) {
          // Selecionou um item existente
          const opt = filteredOptions[highlightedIndex];
          handleSelect(opt.value, opt.label);
        } else if (showCreatableOption) {
          // Selecionou o "Criar Novo" (que sempre fica por último no array virtual)
          handleSelect(searchTerm.trim(), searchTerm.trim());
        }
      }
    } 
    else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

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
        onKeyDown={handleKeyDown} // Vincula as ações do teclado
      />
      
      <span className={styles.comboChevron}>{isOpen ? "▲" : "▼"}</span>

      <input type="hidden" {...register(fieldPath, { required: field.required })} />

      {isOpen && (
        <ul className={styles.comboDropdown} ref={dropdownRef}>
          {filteredOptions.map((opt, index) => (
            <li
              key={opt.value}
              className={`
                ${styles.comboOption} 
                ${String(opt.value) === String(currentValue) ? styles.comboSelected : ''}
                ${index === highlightedIndex ? styles.comboHighlighted : ''} 
              `}
              onMouseEnter={() => setHighlightedIndex(index)} // Sincroniza o mouse com o teclado
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(opt.value, opt.label);
              }}
            >
              {opt.label}
            </li>
          ))}

          {showCreatableOption && (
            <li
              // O índice da opção de criação é sempre o final da lista
              className={`
                ${styles.comboOption} 
                ${styles.comboOptionCreatable}
                ${highlightedIndex === filteredOptions.length ? styles.comboHighlighted : ''}
              `}
              onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
              onClick={(e) => {
                e.stopPropagation();
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