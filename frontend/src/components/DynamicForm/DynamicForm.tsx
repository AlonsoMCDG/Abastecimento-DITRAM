import React, { useEffect } from 'react';
import { IMaskInput } from 'react-imask';
import { useForm, Controller, type SubmitHandler, type UseFormSetValue, type DefaultValues, type FieldValues, type Path } from 'react-hook-form';
import type { FormSchema, FormField } from '../../types/form';
import styles from './DynamicForm.module.css';

import { AsyncSelect } from './AsyncSelect';
import { DatalistInput } from './DatalistInput';

interface DynamicFormProps<T extends FieldValues> {
  title?: string;
  subtitle?: string;
  schema: FormSchema;
  initialValues?: DefaultValues<T>;
  onValuesChange?: (
    changedField: { name: string; value: any },
    currentValues: Partial<T>,
    setValue: UseFormSetValue<T>
  ) => void;
  warnings?: Record<string, string>;
  submitLabel?: string; 
  onSubmit: SubmitHandler<T>;
  cancelLabel?: string;
  onCancel?: () => void;
  extraActions?: React.ReactNode; 
}

export const DynamicForm = <T extends FieldValues>({
  title,
  subtitle,
  schema, 
  initialValues, 
  onSubmit,
  onValuesChange,
  warnings = {},
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  onCancel,
  extraActions
}: DynamicFormProps<T>) => {
  const { 
    register, 
    handleSubmit, 
    control, 
    setValue, 
    watch, 
    reset, 
    formState: { errors }
  } = useForm<T>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Não usar type === 'change', para aceitar os setValues dos custom components
      if (name && onValuesChange) {
        onValuesChange({ name, value: (value as any)[name] }, value as Partial<T>, setValue);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange, setValue]);

  const renderField = (fieldConfig: FormField) => {
    const fieldPath = fieldConfig.name as Path<T>;
    const hasError = !!errors[fieldPath];

    // Empacotador de Prefixo/Sufixo para todos os campos pertinentes
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

    // 1. Campos com Máscara (Controlados)
    if (fieldConfig.mask) {
      const maskProps: any = typeof fieldConfig.mask === 'object' ? fieldConfig.mask : { mask: fieldConfig.mask };
      
      const maskedInput = (
        <Controller
          key={fieldConfig.name}
          name={fieldPath}
          control={control}
          rules={{ required: fieldConfig.required }}
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
      
      // Retorna o input com máscara já passado pelo empacotador!
      return wrapWithAddons(maskedInput); 
    }
    
    // 2. CASO PADRÃO: Campos Nativos (Não Controlados)
    const commonProps = {
      ...register(fieldPath, { required: fieldConfig.required }),
      id: fieldConfig.name,
      className: `${styles.input} ${hasError ? styles.inputError : ''}`,
      placeholder: fieldConfig.placeholder,
      disabled: fieldConfig.disabled,
    };

    switch (fieldConfig.type) {
      case 'textarea': return <textarea {...commonProps} rows={4} />;
      case 'checkbox': return <input type="checkbox" {...commonProps} id={fieldConfig.name} />;
      case 'select':
        if (fieldConfig.endpoint) {
          return <AsyncSelect field={fieldConfig} control={control} setValue={setValue} register={register} error={errors[fieldConfig.name]} />;
        } else {
          return (
            <select {...commonProps}>
              <option value="">Selecione...</option>
              {fieldConfig.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          );
        }
      case 'datalist':
        return <DatalistInput field={fieldConfig} control={control} setValue={setValue} register={register} error={errors[fieldConfig.name]} />;
      default:
        const baseInput = <input type={fieldConfig.type} readOnly={fieldConfig.readOnly} {...commonProps} />;
        
        // Retorna o input normal já passado pelo empacotador!
        return wrapWithAddons(baseInput);
    }
  };

  // Lógica para ir par o próximo campo ao apertar Enter
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    if (e.key === 'Enter' && !e.shiftKey) {
      // EXCEÇÕES: Não queremos bloquear o Enter nesses casos:
      // 1. Textarea (onde o Enter serve para quebrar linha)
      // 2. Botões (onde o Enter serve para clicar, como no botão Salvar ou no Quick Add)
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') return;
      e.preventDefault(); 
      const form = e.currentTarget;
      
      // Cria uma lista com todos os campos que podem receber foco (ignorando os desativados/hidden/readOnly)
      const focusableElements = Array.from(
        form.querySelectorAll('input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[type="submit"]:not([disabled])')
      ) as HTMLElement[];

      // Descobre em qual posição da lista nós estamos agora
      const currentIndex = focusableElements.indexOf(target);
      if (currentIndex > -1 && currentIndex < focusableElements.length - 1) {
        // Joga o foco para o próximo elemento!
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

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className={styles.formContainer}>
        {schema.fields.map((field) => {
          if (field.type === 'hidden') {
            return <input key={field.name} type="hidden" {...register(field.name as any)} />;
          }

          const warningMessage = warnings[field.name];
          const hasError = !!errors[field.name];

          return (
            <div 
              key={field.name} 
              className={`${styles.fieldWrapper} ${field.type === 'checkbox' ? styles.checkboxWrapper : ''}`}
              style={{ '--col-span': field.colSpan || 1 } as React.CSSProperties}
            >
              {field.type !== 'checkbox' && (
                <label htmlFor={field.name} className={styles.label}>
                  {field.label} {field.required && '*'}
                </label>
              )}

              <div className={field.quickActions?.length ? styles.inputWithActions : ''}>
                {renderField(field)}
                {field.quickActions?.map((action, index) => (
                  <button
                    key={index}
                    type="button" 
                    className={styles.quickActionButton}
                    title={action.tooltip}
                    onClick={(e) => { e.preventDefault(); action.onClick(); }}
                  >
                    {action.icon}
                  </button>
                ))}
              </div>
              
              {field.type === 'checkbox' && (
                <label htmlFor={field.name} className={styles.label}>
                  {field.label} {field.required && '*'}
                </label>
              )}

              {/* RENDERIZAÇÃO DE ERROS OU AVISOS */}
              {hasError ? (
                <span className={styles.error}>Este campo é obrigatório</span>
              ) : (
                warningMessage && <span className={styles.warningMessage}>{warningMessage}</span>
              )}
            </div>
          );
        })}

        {/* CONTAINER DE AÇÕES (Botões) */}
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            {submitLabel}
          </button>
          {extraActions}
          {/* Renderiza o botão de cancelar apenas se a função for passada */}
          {onCancel && (
            <button 
              type="button" 
              className={styles.btnCancel} 
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};