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
  onSubmit: SubmitHandler<T>;
  onValuesChange?: (
    changedField: { name: string; value: any },
    currentValues: Partial<T>,
    setValue: UseFormSetValue<T>
  ) => void;
  warnings?: Record<string, string>;
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

  // Motor de observação que dispara o callback para o Pai
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      // name garante que não dispare na inicialização do form (onde name é undefined)
      // Removemi a trava do type === 'change' para aceitar os setValues dos custom components
      if (name && onValuesChange) {
        onValuesChange({ name, value: (value as any)[name] }, value as Partial<T>, setValue);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange, setValue]);

  // Renomeado de 'field' para 'fieldConfig' para evitar colisão com o 'field' do Controller
  const renderField = (fieldConfig: FormField) => {
    const fieldPath = fieldConfig.name as Path<T>;
    const hasError = !!errors[fieldPath];

    // 1. EARLY RETURN: Campos com Máscara (Controlados)
    if (fieldConfig.mask) {
      const maskProps: any = typeof fieldConfig.mask === 'object' 
        ? fieldConfig.mask 
        : { mask: fieldConfig.mask };
      
      return (
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
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      
      case 'checkbox':
        return (
          <input 
            type="checkbox" 
            {...commonProps}
            id={fieldConfig.name} 
          />
        );
      
      case 'select':
        if (fieldConfig.endpoint) {
          return (
            <AsyncSelect 
              field={fieldConfig} 
              control={control} 
              setValue={setValue} 
              register={register}
              error={errors[fieldConfig.name]}
            />
          );
        }
        else {
          return (
            <select {...commonProps}>
              <option value="">Selecione...</option>
              {fieldConfig.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

      case 'datalist':
        return (
          <DatalistInput
            field={fieldConfig}
            control={control}
            setValue={setValue}
            register={register}
            error={errors[fieldConfig.name]}
          />
        );

      default: // text, number, date, datetime-local
        // Renderiza o input normal
        const baseInput = (
          <input 
            type={fieldConfig.type} 
            readOnly={fieldConfig.readOnly}
            {...commonProps} 
          />
        );

        // Se tiver prefixo ou sufixo, envelopa numa estrutura
        if (fieldConfig.prefix || fieldConfig.suffix) {
          return (
            <div className={styles.inputGroup}>
              {fieldConfig.prefix && <span className={styles.prefix}>{fieldConfig.prefix}</span>}
              {baseInput}
              {fieldConfig.suffix && <span className={styles.suffix}>{fieldConfig.suffix}</span>}
            </div>
          );
        }
      
        // Se não tiver, retorna o input puro normalmente
        return baseInput;
    }
  };

  // Vai para o próximo campo ao apertar Enter
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;

    // Se a tecla for Enter e não estivermos segurando Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      
      // EXCEÇÕES: Não queremos bloquear o Enter nesses casos:
      // 1. Textarea (onde o Enter serve para quebrar linha)
      // 2. Botões (onde o Enter serve para clicar, como no botão Salvar ou no Quick Add)
      if (target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON') {
        return;
      }

      e.preventDefault(); // Bloqueia o submit automático do form

      // Pega o formulário inteiro
      const form = e.currentTarget;
      
      // Cria uma lista com todos os campos que podem receber foco (ignorando os desativados/hidden/readOnly)
      const focusableElements = Array.from(
        form.querySelectorAll(
          'input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), button[type="submit"]:not([disabled])'
        )
      ) as HTMLElement[];

      // Descobre em qual posição da lista nós estamos agora
      const currentIndex = focusableElements.indexOf(target);

      // Se achou o elemento atual e ele não for o último da lista
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleFormKeyDown}
        className={styles.formContainer}
      >
      {schema.fields.map((field) => {
        // ==========================================
        // EARLY RETURN PARA CAMPOS HIDDEN
        // Se for oculto, joga só o input na DOM e pula todo o layout!
        // ==========================================
        if (field.type === 'hidden') {
          return <input key={field.name} type="hidden" {...register(field.name as any)} />;
        }

        // CAPTURA O AVISO ESPECÍFICO PARA ESTE CAMPO
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
                {field.label} {field.required && (
                  <span className={styles.required}>*</span>
                )}
              </label>
            )}

            {/* A MÁGICA DO QUICK ADD ACONTECE AQUI */}
            <div className={field.quickActions?.length ? styles.inputWithActions : ''}>
              {renderField(field)}
              
              {field.quickActions?.map((action, index) => (
                <button
                  key={index}
                  type="button" // CRÍTICO: Evita que o botão submeta o formulário sem querer
                  className={styles.quickActionButton}
                  title={action.tooltip}
                  onClick={(e) => {
                    e.preventDefault(); // Garante que a ação padrão seja bloqueada
                    action.onClick();
                  }}
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

            {/* RENDERIZAÇÃO CONDICIONAL DE MENSAGENS (ERRO VS AVISO) */}
            {hasError ? (
              <span className={styles.error}>Este campo é obrigatório</span>
            ) : (
              warningMessage && (
                <span className={styles.warning}>{warningMessage}</span>
              )
            )}
          </div>
        );
      })}

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          Salvar
        </button>
        {extraActions}
      </div>
    </form>
    </div>
  );
};
