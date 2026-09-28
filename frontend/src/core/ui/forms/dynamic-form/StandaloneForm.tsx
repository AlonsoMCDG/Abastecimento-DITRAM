import React, { useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { 
  useForm, 
  Controller, 
  type SubmitHandler, 
  type UseFormSetValue, 
  type DefaultValues, 
  type FieldValues, 
  type Path,
} from 'react-hook-form';
import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FormSchema, FormField } from '../../../types/form';
import styles from './DynamicForm.module.css';
import { SearchableAsyncSelect } from '../SearchableAsyncSelect';
import { SearchableSelect } from '../SearchableSelect';

export interface StandaloneFormProps<T extends FieldValues> {
  title?: string;
  subtitle?: string;
  uiSchema: FormSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zodSchema: z.ZodType<any>;
  initialValues?: DefaultValues<T>;
  onValuesChange?: (
    changedField: { name: Path<T>; value: unknown },
    currentValues: Partial<T>,
    setValue: UseFormSetValue<T>
  ) => void;
  warnings?: Record<string, string>;
  globalError?: string | null;
  isLoading?: boolean;
  submitLabel?: string;
  onSubmit: SubmitHandler<T>;
  cancelLabel?: string;
  onCancel?: () => void;
  extraActions?: React.ReactNode;
}

export function StandaloneForm<T extends FieldValues>({
  title,
  subtitle,
  uiSchema,
  zodSchema,
  initialValues, 
  onSubmit,
  onValuesChange,
  warnings = {},
  globalError = null,
  submitLabel = "Salvar",
  isLoading = false,
  cancelLabel = "Cancelar",
  onCancel,
  extraActions
}: StandaloneFormProps<T>) {
  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(zodSchema as any),
    defaultValues: initialValues,
    mode: "onChange",
  });

  const currentValues = watch();

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && onValuesChange) {
        onValuesChange({ name: name as Path<T>, value: value[name as keyof typeof value] }, value as Partial<T>, setValue);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange, setValue]);

  const renderField = (fieldConfig: FormField) => {
    const fieldPath = fieldConfig.name as Path<T>;
    const hasError = !!errors[fieldPath];

    const wrapWithAddons = (inputElement: React.ReactNode) => {
      if (fieldConfig.prefix || fieldConfig.suffix) {
        return (
          <div className={styles.inputGroup}>
            {fieldConfig.prefix && <span className={styles.prefix}>{fieldConfig.prefix}</span>}
            {inputElement}
            {fieldConfig.suffix && <span className={styles.suffix}>{fieldConfig.suffix}</span>}
          </div>
        );
      }
      return inputElement;
    };

    if (fieldConfig.mask) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maskProps: Record<string, any> = typeof fieldConfig.mask === 'object' 
        ? fieldConfig.mask 
        : { mask: fieldConfig.mask };
      
      return wrapWithAddons(
        <Controller
          key={fieldConfig.name}
          name={fieldPath}
          control={control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <IMaskInput
              {...maskProps}
              value={value === null || value === undefined ? '' : String(value)}
              unmask={true} 
              onAccept={(unmaskedValue) => onChange(unmaskedValue)}
              onBlur={onBlur}
              inputRef={ref}
              id={fieldConfig.name}
              className={`${styles.input} ${hasError ? styles.inputError : ''}`}
              placeholder={fieldConfig.placeholder || ''}
              disabled={fieldConfig.disabled}
              readOnly={fieldConfig.readOnly}
            />
          )}
        />
      );
    }
    
    const commonProps = {
      ...register(fieldPath),
      id: fieldConfig.name,
      className: `${styles.input} ${hasError ? styles.inputError : ''}`,
      placeholder: fieldConfig.placeholder,
      disabled: fieldConfig.disabled || isLoading,
    };

    switch (fieldConfig.type) {
      case 'textarea': 
        return wrapWithAddons(<textarea {...commonProps} rows={4} />);
      case 'checkbox': 
        return <input type="checkbox" {...commonProps} id={fieldConfig.name} />;
      case 'select':
      case 'datalist':
      case 'combobox': {
        const SelectComponent = fieldConfig.endpoint ? (
          <SearchableAsyncSelect
            field={fieldConfig}
            control={control}
            setValue={setValue}
            register={register}
            error={errors[fieldPath]}
            disabled={isLoading}
          />
        ) : (
          <Controller
            key={fieldConfig.name}
            name={fieldPath}
            control={control}
            render={({ field: { onChange, value } }) => (
              <SearchableSelect
                options={fieldConfig.options || []}
                value={(value as string | number) ?? ""}
                onChange={onChange}
                placeholder={fieldConfig.placeholder}
                disabled={fieldConfig.disabled || fieldConfig.readOnly || isLoading}
              />
            )}
          />
        );
        return wrapWithAddons(SelectComponent);
      }
      default:
        return wrapWithAddons(<input type={fieldConfig.type} readOnly={fieldConfig.readOnly} {...commonProps} />);
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === 'Enter' && !e.shiftKey) {
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
      e.preventDefault(); 
      const form = e.currentTarget;
      const focusableElements = Array.from(
        form.querySelectorAll('input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[type="submit"]:not([disabled])')
      ) as HTMLElement[];
      const currentIndex = focusableElements.indexOf(target);
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      }
    }
  };

  return (
    <div className={styles.layoutContainer}>
      {(title || subtitle) && (
        <header className={styles.layoutHeader}>
          {title && <h1 className={styles.layoutTitle}>{title}</h1>}
          {subtitle && <p className={styles.layoutSubtitle}>{subtitle}</p>}
        </header>
      )}
      {globalError && <div className={styles.globalError}>⚠️ {globalError}</div>}
      <form onSubmit={handleSubmit((data, ev) => !isLoading && onSubmit(data, ev))} onKeyDown={handleFormKeyDown} className={styles.formCard} noValidate>
        <div className={styles.formGrid}>
          {uiSchema.fields.map((field) => {
            if (field.visibleIf && !field.visibleIf(currentValues)) return null;
            const fieldPath = field.name as Path<T>;
            const errorMessage = errors[fieldPath]?.message as string | undefined;
            const warningMessage = warnings[field.name];
            const colSpanClass = field.colSpan ? styles[`colSpan${field.colSpan}`] : '';

            return (
              <div key={field.name} className={`${styles.fieldGroup} ${colSpanClass || ''}`}>
                <label htmlFor={field.name} className={styles.label}>
                  {field.label}
                  {field.required && <span className={styles.requiredAsterisk}>*</span>}
                </label>
                {renderField(field)}
                {warningMessage && !errorMessage && <span className={styles.warningMessage}>⚠️ {warningMessage}</span>}
                {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
              </div>
            );
          })}
        </div>

        <footer className={styles.footerActions}>
          <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
            {isLoading ? "Salvando..." : submitLabel}
          </button>
          {extraActions}
          {onCancel && (
            <button type="button" onClick={onCancel} className={styles.btnSecondary} disabled={isLoading}>
              {cancelLabel}
            </button>
          )}
        </footer>
      </form>
    </div>
  );
}

export const DynamicForm = StandaloneForm;
