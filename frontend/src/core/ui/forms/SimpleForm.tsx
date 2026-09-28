import { useEffect } from 'react';
import { Controller, useForm, type DefaultValues, type FieldValues, type Path, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import type { FormSchema } from '../../types/form';
import { BackendSelect } from './BackendSelect';
import styles from './SimpleForm.module.css';

interface SimpleFormProps<T extends FieldValues> {
  title?: string;
  subtitle?: string;
  uiSchema: FormSchema<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zodSchema: z.ZodType<any>;
  initialValues?: DefaultValues<T>;
  globalError?: string | null;
  isLoading?: boolean;
  submitLabel?: string;
  onSubmit: SubmitHandler<T>;
  onCancel?: () => void;
}

export function SimpleForm<T extends FieldValues>({
  title, subtitle, uiSchema, zodSchema, initialValues, globalError,
  isLoading = false, submitLabel = 'Salvar', onSubmit, onCancel,
}: SimpleFormProps<T>) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(zodSchema as any),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  if (!initialValues) {
    return <div className={styles.layoutContainer} role={globalError ? 'alert' : 'status'}>{globalError || 'Carregando dados...'}</div>;
  }

  return (
    <div className={styles.layoutContainer}>
      {(title || subtitle) && (
        <header className={styles.layoutHeader}>
          {title && <h1>{title}</h1>}
          {subtitle && <p>{subtitle}</p>}
        </header>
      )}
      {globalError && <div className={styles.globalError} role="alert">{globalError}</div>}
      <form className={styles.formCard} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formGrid}>
          {uiSchema.fields.map((field) => {
            const path = field.name as Path<T>;
            const error = errors[path]?.message as string | undefined;
            const isCheckbox = field.type === 'checkbox';
            const input = field.type === 'select' ? (
              <Controller
                name={path}
                control={control}
                render={({ field: controlled }) => (
                  <BackendSelect
                    id={field.name}
                    endpoint={field.endpoint!}
                    value={controlled.value as string | number | null | undefined}
                    onChange={controlled.onChange}
                    onBlur={controlled.onBlur}
                    disabled={field.disabled || isLoading}
                    placeholder={field.placeholder}
                    className={styles.input}
                  />
                )}
              />
            ) : field.type === 'textarea' ? (
              <textarea id={field.name} className={styles.input} rows={4} placeholder={field.placeholder}
                readOnly={field.readOnly} disabled={field.disabled || isLoading} {...register(path)} />
            ) : (
              <input id={field.name} className={isCheckbox ? styles.checkbox : styles.input}
                type={field.type} placeholder={field.placeholder} readOnly={field.readOnly}
                disabled={field.disabled || isLoading} step={field.type === 'number' ? 'any' : undefined}
                inputMode={field.name === 'cpf' ? 'numeric' : undefined} {...register(path)} />
            );

            return (
              <div key={field.name} className={`${styles.fieldGroup} ${field.colSpan ? styles[`colSpan${field.colSpan}`] : ''}`}>
                <label htmlFor={field.name} className={isCheckbox ? styles.checkboxLabel : styles.label}>
                  {isCheckbox && input}
                  {field.label}{field.required && <span className={styles.requiredAsterisk}> *</span>}
                </label>
                {!isCheckbox && input}
                {error && <span className={styles.errorMessage} role="alert">{error}</span>}
              </div>
            );
          })}
        </div>
        <footer className={styles.footerActions}>
          <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
            {isLoading ? 'Salvando...' : submitLabel}
          </button>
          {onCancel && <button type="button" className={styles.btnSecondary} onClick={onCancel} disabled={isLoading}>Cancelar</button>}
        </footer>
      </form>
    </div>
  );
}
