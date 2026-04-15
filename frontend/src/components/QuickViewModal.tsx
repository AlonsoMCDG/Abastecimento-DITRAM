import React from "react";
import "../assets/css/DataTable.css";
import type { ViewSchema } from "../types/views";

interface QuickViewModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  data: T | null;
  schema: ViewSchema<T>;
  footerActions?: (item: T) => React.ReactNode;
  onEdit?: (item: T) => void;
}

export function QuickViewModal<T>({
  isOpen,
  onClose,
  data,
  schema,
  footerActions,
  onEdit,
}: QuickViewModalProps<T>) {
  if (!isOpen || !data) return null;

  return (
    <div className="dt-modal-overlay" onClick={onClose}>
      <div className="dt-modal dt-modal-lg" onClick={(e) => e.stopPropagation()}>
        
        <div className="dt-modal-header">
          <div className="dt-modal-header-text">
            {/* O Schema resolve o título passando o objeto real */}
            <h3>{schema.title(data)}</h3>
            {schema.subtitle && <p className="dt-modal-subtitle">{schema.subtitle(data)}</p>}
          </div>
          <button className="dt-modal-close" onClick={onClose} title="Fechar">
            ✕
          </button>
        </div>

        <div className="dt-modal-body">
          <div className="dt-details-grid">
            {schema.fields.map((field, index) => {
              // Lógica para extrair o valor (usa render se existir, senão usa a chave)
              let displayValue: React.ReactNode = "—";
              
              if (field.render) {
                displayValue = field.render(data);
              } else if (field.key && data[field.key] !== undefined && data[field.key] !== null) {
                displayValue = String(data[field.key]);
              }

              return (
                <div 
                  key={index} 
                  className="dt-detail-item" 
                  style={field.fullWidth ? { gridColumn: "1 / -1" } : undefined}
                >
                  <span className="dt-detail-label">{field.label}</span>
                  <span className="dt-detail-value">{displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dt-modal-footer dt-modal-footer-bordered">
          {/* Renderiza as ações extras da página (ex: botão de PDF) */}
          {footerActions && footerActions(data)}

          {/* Renderiza o botão padrão de edição se a função for passada */}
          {onEdit && (
            <button 
              className="dt-btn edit dt-btn-text" 
              onClick={() => onEdit(data)}
            >
              ✏️ Editar
            </button>
          )}

          <button className="btn-cancel" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}