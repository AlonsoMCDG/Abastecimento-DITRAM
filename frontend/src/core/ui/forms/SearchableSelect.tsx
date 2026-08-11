import { useState, useRef, useEffect, useMemo } from "react";
import styles from './dynamic-form/DynamicForm.module.css';

export interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Selecione ou digite...",
  disabled = false,
}: SearchableSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. SINCRONIA INICIAL: Acha o nome (label) do valor (ID) selecionado
  useEffect(() => {
    if (value === null || value === undefined || value === "") {
      setSearchTerm("");
      return;
    }
    const matchedOption = options.find((opt) => String(opt.value) === String(value));
    if (matchedOption && !isOpen) {
      setSearchTerm(matchedOption.label);
    }
  }, [value, options, isOpen]);

  // 2. CLICK OUTSIDE: Fecha a lista e reseta o texto se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const matched = options.find((opt) => String(opt.value) === String(value));
        setSearchTerm(matched ? matched.label : "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, options]);

  // 3. FILTRO LOCAL
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch)
    );
  }, [options, searchTerm]);

  const handleSelect = (opt: Option) => {
    setSearchTerm(opt.label);
    onChange(opt.value);
    setIsOpen(false);
  };

  return (
    <div className={styles.comboWrapper} ref={wrapperRef}>
      <input
        type="text"
        className={`${styles.input} ${styles.comboInput}`}
        placeholder={placeholder}
        value={searchTerm}
        disabled={disabled}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (!isOpen) setIsOpen(true);
        }}
        onClick={() => !disabled && setIsOpen(true)}
      />
      
      <span className={styles.comboChevron}>{isOpen ? "▲" : "▼"}</span>

      {isOpen && (
        <ul className={styles.comboDropdown}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                className={`${styles.comboOption} ${String(opt.value) === String(value) ? styles.comboSelected : ""}`}
                onClick={(e) => {
                  e.stopPropagation(); // Evita que o clique feche o form inteiro
                  handleSelect(opt);
                }}
              >
                {opt.label}
              </li>
            ))
          ) : (
            <li className={styles.comboEmpty}>Nenhum resultado</li>
          )}
        </ul>
      )}
    </div>
  );
};