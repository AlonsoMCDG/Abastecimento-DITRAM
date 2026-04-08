import React, { useEffect } from 'react';
import { useForm, type SubmitHandler, type UseFormSetValue, type DefaultValues, type FieldValues, type Path } from 'react-hook-form';
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
}

export const DynamicForm = <T extends FieldValues>({
  title,
  subtitle,
  schema, 
  initialValues, 
  onSubmit,
  onValuesChange
}: DynamicFormProps<T>) => {
  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<T>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  // O motor de observação que dispara o callback para o Pai
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // type === 'change' garante que só dispare quando o usuário interagir
      if (name && type === 'change' && onValuesChange) {
        onValuesChange({ name, value: (value as any)[name] }, value as Partial<T>, setValue);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange, setValue]);

  const renderField = (field: FormField) => {
    const fieldPath = field.name as Path<T>;
    
    const commonProps = {
      ...register(fieldPath, { required: field.required }),
      id: field.name,
      className: styles.input,
      placeholder: field.placeholder,
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      
      case 'checkbox':
        return (
          <input 
            type="checkbox" 
            {...register(fieldPath, { required: field.required })} 
            id={field.name} 
          />
        );
      
      case 'select':
        if (field.endpoint) {
          return (
            <AsyncSelect 
              field={field} 
              control={control} 
              setValue={setValue} 
              register={register}
              error={errors[field.name]}
            />
          );
        }
        else {
          return (
            <select {...commonProps}>
              <option value="">Selecione...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );
        }

      case 'datalist':
        return (
          <DatalistInput
            field={field}
            control={control}
            setValue={setValue}
            register={register}
            error={errors[field.name]}
          />
        );

      default: // text, number, date, datetime-local
        // Renderiza o input normal
        const baseInput = (
          <input 
            type={field.type} 
            readOnly={field.readOnly}
            {...commonProps} 
          />
        );

        // Se tiver prefixo ou sufixo, envelopa numa estrutura
        if (field.prefix || field.suffix) {
          return (
            <div className={styles.inputGroup}>
              {field.prefix && <span className={styles.prefix}>{field.prefix}</span>}
              {baseInput}
              {field.suffix && <span className={styles.suffix}>{field.suffix}</span>}
            </div>
          );
        }
      
        // Se não tiver, retorna o input puro normalmente
        return baseInput;
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

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
      {schema.fields.map((field) => (
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

          {errors[field.name] && (
            <span className={styles.error}>Este campo é obrigatório</span>
          )}
        </div>
      ))}

      <button type="submit" className={styles.submitButton}>
        Salvar
      </button>
    </form>
    </div>
  );
};
