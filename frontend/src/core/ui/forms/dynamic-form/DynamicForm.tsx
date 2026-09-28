import React from 'react';
import { useFormContext, Controller, type FieldValues, type Path } from 'react-hook-form';
import { SearchableAsyncSelect } from '../SearchableAsyncSelect';
import { SearchableSelect } from '../SearchableSelect';
import { IMaskInput } from 'react-imask';
import type { FormSchema, FormField } from '../../../types/form';
import styles from './DynamicForm.module.css';

interface DynamicFormProps<T extends FieldValues> {
  uiSchema: FormSchema<T>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DynamicForm<T extends FieldValues>({ 
  uiSchema, 
  onSubmit, 
  onCancel,
  isLoading = false 
}: DynamicFormProps<T>) {
  
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<T>();
  const currentValues = watch();

  const renderInputComponent = (field: FormField<T>) => {
    const fieldPath = field.name as Path<T>;
    const commonProps = {
      id: field.name,
      className: styles.input,
      placeholder: field.placeholder,
      disabled: field.disabled || isLoading,
      readOnly: field.readOnly,
    };

    // Roteamento para Selects Customizados
    if (['select', 'datalist', 'combobox'].includes(field.type)) {
      if (field.endpoint) {
        return (
          <SearchableAsyncSelect
            field={field}
            control={control}
            setValue={setValue}
            register={register}
            error={errors[field.name as keyof T]}
            disabled={isLoading || field.disabled}
          />
        );
      }
      
      return (
        <Controller
          key={field.name}
          name={fieldPath}
          control={control}
          render={({ field: { onChange, value } }) => (
            <SearchableSelect
              options={field.options || []}
              value={value ?? ""}
              onChange={onChange}
              placeholder={field.placeholder}
              disabled={field.disabled || field.readOnly || isLoading}
            />
          )}
        />
      );
    }

    if (field.mask) {
      const maskProps = typeof field.mask === 'object' ? field.mask : { mask: field.mask };
      return (
        <Controller
          key={field.name}
          name={fieldPath}
          control={control}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <IMaskInput
              {...maskProps}
              value={String(value ?? '')}
              unmask={true}
              onAccept={(unmaskedValue) => onChange(unmaskedValue)}
              onBlur={onBlur}
              inputRef={ref}
              {...commonProps}
            />
          )}
        />
      );
    }

    if (field.type === 'textarea') {
      return <textarea {...register(fieldPath)} {...commonProps} rows={4} />;
    }

    return <input type={field.type} {...register(fieldPath)} {...commonProps} />;
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.row}>
        {uiSchema.fields.map((field) => {
          if (field.visibleIf && !field.visibleIf(currentValues)) return null;

          if (field.type === 'hidden') {
            return <input key={field.name} type="hidden" {...register(field.name as Path<T>)} />;
          }
          
          const hasError = !!errors[field.name as keyof T];

          const wrapperClass = `
            ${styles.fieldWrapper} 
            ${hasError ? styles.hasError : ''} 
            ${field.type === 'checkbox' ? styles.checkboxWrapper : ''}
          `.trim();

          return (
            <div 
              key={field.name} 
              className={wrapperClass}
              data-col-span={field.colSpan || 1}
            >
              {field.type !== 'checkbox' && (
                <label htmlFor={field.name} className={styles.label}>
                  {field.label} {field.required && <span className={styles.required}>*</span>}
                </label>
              )}

              <div className={styles.inputContainer}>
                {field.prefix && <span className={styles.prefix}>{field.prefix}</span>}

                {renderInputComponent(field)}

                {field.suffix && <span className={styles.prefix}>{field.suffix}</span>}

                {field.quickActions?.map((action, index) => (
                  <button
                    key={index}
                    type="button"
                    className={styles.quickAction}
                    title={action.tooltip}
                    onClick={action.onClick}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>

              {field.type === 'checkbox' && (
                <label htmlFor={field.name} className={`${styles.label} ${styles.labelInline}`}>
                  {field.label} {field.required && <span className={styles.required}>*</span>}
                </label>
              )}

              {hasError && (
                <span className={styles.errorMessage}>
                  {errors[field.name as keyof T]?.message as string}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Salvar'}
        </button>
        {onCancel && (
          <button type="button" className={styles.btnSecondary} onClick={onCancel} disabled={isLoading}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};