// DynamicForm.tsx
import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import type { FormSchema, FormField } from '../../types/form';
import styles from './DynamicForm.module.css';

interface DynamicFormProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ 
  schema, 
  initialValues = {}, 
  onSubmit 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialValues,
  });

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
        return (
          <select {...commonProps}>
            <option value="">Selecione...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

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
          
          {renderField(field)}
          
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