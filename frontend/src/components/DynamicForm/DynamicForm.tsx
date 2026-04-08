// DynamicForm.tsx
import React, { useEffect } from 'react';
import { useForm, type SubmitHandler, type UseFormSetValue } from 'react-hook-form';
import type { FormSchema, FormField } from '../../types/form';
import styles from './DynamicForm.module.css';
import { AsyncSelect } from './AsyncSelect';

interface DynamicFormProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onValuesChange?: (
    changedField: { name: string; value: any },
    currentValues: Record<string, any>,
    setValue: UseFormSetValue<any>
  ) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ 
  schema, 
  initialValues = {}, 
  onSubmit,
  onValuesChange
}) => {
  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialValues,
  });

  // O motor de observação que dispara o callback para o Pai
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      // type === 'change' garante que só dispare quando o usuário interagir
      if (name && type === 'change' && onValuesChange) {
        onValuesChange({ name, value: value[name] }, value, setValue);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange, setValue]);

  const renderField = (field: FormField) => {
    const commonProps = {
      ...register(field.name, { required: field.required }),
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
            {...register(field.name, { required: field.required })} 
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
        const listId = `${field.name}-list`;
        return (
          <>
            <input list={listId} {...commonProps} />
            <datalist id={listId}>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </datalist>
          </>
        );

      default: // text, number, date, datetime-local
        return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
      {schema.fields.map((field) => (
        <div 
          key={field.name} 
          className={`${styles.fieldWrapper} ${field.type === 'checkbox' ? styles.checkboxWrapper : ''}`}
          style={{ gridColumn: `span ${field.colSpan || 1}` }}
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
  );
};