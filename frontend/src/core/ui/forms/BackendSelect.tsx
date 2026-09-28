import { useEffect, useState } from 'react';
import { client } from '../../api/apiClient';

interface Option {
  value: string | number;
  label: string;
}

interface BackendSelectProps {
  id: string;
  endpoint: string;
  value?: string | number | null;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  allowManual?: boolean;
}

export function BackendSelect({
  id, endpoint, value, onChange, onBlur, disabled, placeholder,
  className, allowManual = false,
}: BackendSelectProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [manualSelected, setManualSelected] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    client.get<Option[]>(endpoint, { signal: controller.signal })
      .then(({ data }) => {
        setOptions(Array.isArray(data) ? data : []);
        setLoadError(!Array.isArray(data));
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error(`Erro ao carregar opções de ${endpoint}`, error);
          setLoadError(true);
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [endpoint]);

  const manualValue = allowManual && typeof value === 'string' && value !== '';
  const showManual = allowManual && (manualSelected || manualValue);
  const selected = showManual ? '__manual__' : String(value ?? '');
  const currentOptionMissing = selected !== '' && selected !== '__manual__' &&
    !options.some((option) => String(option.value) === selected);

  return (
    <>
      <select id={id} value={selected} className={className} onBlur={onBlur}
        disabled={disabled || loading} onChange={(event) => {
          const next = event.target.value;
          if (next === '__manual__') {
            setManualSelected(true);
            onChange('');
          } else {
            setManualSelected(false);
            onChange(options.find((option) => String(option.value) === next)?.value ?? '');
          }
        }}>
        <option value="">{loading ? 'Carregando opções...' : placeholder || 'Selecione...'}</option>
        {currentOptionMissing && <option value={selected}>Valor atual ({selected})</option>}
        {options.map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}
        {allowManual && <option value="__manual__">Informar manualmente</option>}
      </select>
      {showManual && (
        <input type="text" className={className} value={typeof value === 'string' ? value : ''}
          aria-label={`${id} informado manualmente`} placeholder="Digite o valor"
          disabled={disabled} onBlur={onBlur} onChange={(event) => onChange(event.target.value)} />
      )}
      {loadError && <span role="alert">Não foi possível carregar as opções. Tente novamente mais tarde.</span>}
    </>
  );
}
