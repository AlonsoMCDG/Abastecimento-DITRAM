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
import type { FormSchema, FormField } from '../../types/form';
import styles from './DynamicForm.module.css';

import { SearchableAsyncSelect } from './SearchableAsyncSelect';
import { SearchableSelect } from './SearchableSelect';

interface DynamicFormProps<T extends FieldValues> {
  title?: string;
  subtitle?: string;
  schema: FormSchema;
  initialValues?: DefaultValues<T>;
  onValuesChange?: (
    changedField: { name: Path<T>; value: unknown },
    currentValues: Partial<T>,
    setValue: UseFormSetValue<T>
  ) => void;
  warnings?: Record<string, string>;
  globalError?: string | null; // Recebe o erro da página
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
  globalError = null,
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

  // Captura o estado global do formulário para a renderização condicional
  const currentValues = watch();

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      // Não usar type === 'change', para aceitar os setValues dos custom components
      if (name && onValuesChange) {
        const fieldName = name as Path<T>;
        const fieldValue = value[name as keyof typeof value]; 
        
        onValuesChange(
          { name: fieldName, value: fieldValue }, 
          value as Partial<T>, 
          setValue
        );
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange, setValue]);

  const renderField = (fieldConfig: FormField) => {
    const fieldPath = fieldConfig.name as Path<T>;
    const hasError = !!errors[fieldPath];

    // Empacotador de Prefixo/Sufixo para todos os campos que necessitam
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

    // Campos com Máscara (Controlados)
    if (fieldConfig.mask) {
      const maskProps: Record<string, unknown> = typeof fieldConfig.mask === 'object' 
        ? fieldConfig.mask 
        : { mask: fieldConfig.mask };
      
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
      
      return wrapWithAddons(maskedInput); 
    }
    
    // CASO PADRÃO: Props base para inputs
    const commonProps = {
      ...register(fieldPath, { required: fieldConfig.required }),
      id: fieldConfig.name,
      className: `${styles.input} ${hasError ? styles.inputError : ''}`,
      placeholder: fieldConfig.placeholder,
      disabled: fieldConfig.disabled,
    };

    // ROTEAMENTO DE COMPONENTES
    switch (fieldConfig.type) {
      case 'textarea': 
        return wrapWithAddons(<textarea {...commonProps} rows={4} />);
        
      case 'checkbox': 
        return <input type="checkbox" {...commonProps} id={fieldConfig.name} />;
        
      case 'select':
      case 'datalist':
      case 'combobox':
        const SelectComponent = fieldConfig.endpoint ? (
          // Se tem endpoint -> Busca da API (SearchableAsyncSelect)
          <SearchableAsyncSelect
            field={fieldConfig} 
            control={control} 
            setValue={setValue} 
            register={register} 
            error={errors[fieldPath]} 
          />
        ) : (
          // Se não tem endpoint (tem options locais) -> Select Customizado Síncrono
          <Controller
            key={fieldConfig.name}
            name={fieldPath}
            control={control}
            rules={{ required: fieldConfig.required }}
            render={({ field: { onChange, value } }) => (
              <SearchableSelect
                options={fieldConfig.options || []}
                value={(value as string | number) ?? ""} 
                onChange={onChange}
                placeholder={fieldConfig.placeholder}
                disabled={fieldConfig.disabled || fieldConfig.readOnly} 
              />
            )}
          />
        );
        return wrapWithAddons(SelectComponent);

      default:
        const baseInput = <input type={fieldConfig.type} readOnly={fieldConfig.readOnly} {...commonProps} />;
        return wrapWithAddons(baseInput);
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

      {/* RENDERIZAÇÃO DO ERRO GLOBAL */}
      {globalError && (
        <div className={styles.globalError}>
          ⚠️ {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleFormKeyDown} className={styles.formContainer}>
        {schema.fields.map((field) => {
          // VISIBILIDADE CONDICIONAL
          if (field.visibleIf && !field.visibleIf(currentValues)) {
            return null; // Não renderiza o campo se a condição não for satisfeita
          }

          const fieldPath = field.name as Path<T>;

          if (field.type === 'hidden') {
            return <input key={field.name} type="hidden" {...register(fieldPath)} />;
          }

          const warningMessage = warnings[field.name];
          const hasError = !!errors[fieldPath];
          const errorMessage = errors[fieldPath]?.message as string || "Este campo é obrigatório";

          return (
            <div 
              key={field.name} 
              className={`${styles.fieldWrapper} ${field.type === 'checkbox' ? styles.checkboxWrapper : ''}`}
              style={{ '--col-span': field.colSpan || 1 } as React.CSSProperties}
            >
              {field.type !== 'checkbox' && (
                <label htmlFor={field.name} className={styles.label}>
                  {field.label} {field.required && (
                    <span className={styles.required}>*</span>
                  )}
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

              {hasError ? (
                <span className={styles.error}>{errorMessage}</span>
              ) : (
                warningMessage && <span className={styles.warningMessage}>{warningMessage}</span>
              )}
            </div>
          );
        })}

        <div className={styles.formActions}>
          {/* Oculta o botão primário caso o submitLabel seja vazio (ex: tela de visualização) */}
          {submitLabel && (
            <button type="submit" className={styles.submitButton}>
              {submitLabel}
            </button>
          )}
          
          {extraActions}
          
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