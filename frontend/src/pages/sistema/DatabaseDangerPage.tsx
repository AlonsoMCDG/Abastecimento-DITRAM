import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/FormPage.css";
import { coreApi } from "../../api/core/coreApi";
import { getApiErrorMessage } from "../../api/config/errorHandlers";
import { useAuth } from "../../auth/AuthContext";

type DbStats = {
  database_engine?: string;
  is_sqlite?: boolean;
  counts?: Record<string, number>;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function DatabaseDangerPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Ref para o input de arquivo (para podermos limpá-lo após o envio)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmText, setConfirmText] = useState("");
  // Adicionado o estado 'upload_json'
  const [loading, setLoading] = useState<
    null | "seed" | "reset" | "flush" | "backup_json" | "backup_sqlite" | "stats" | "upload_json"
  >(null);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [stats, setStats] = useState<DbStats | null>(null);
  
  // Novo estado para armazenar os arquivos selecionados
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const canDestructive = confirmText.trim().toUpperCase() === "APAGAR TUDO";
  const isSqlite = Boolean(stats?.is_sqlite);

  const countsText = useMemo(() => {
    const c = stats?.counts;
    if (!c) return "";
    return [
      `Secretarias: ${c.secretarias ?? 0}`,
      `Instituições: ${c.instituicoes ?? 0}`,
      `Rotas: ${c.rotas ?? 0}`,
      `Condutores: ${c.condutores ?? 0}`,
      `Veículos: ${c.veiculos ?? 0}`,
      `Lotações: ${c.lotacoes ?? 0}`,
      `Guias: ${c.guias_abastecimento ?? 0}`,
      `Usuários: ${c.usuarios ?? 0}`,
    ].join(" | ");
  }, [stats]);

  async function refreshStats() {
    setLoading("stats");
    try {
      const res = await coreApi.stats();
      setStats(res.data as DbStats);
    } catch {
      setStats(null);
    } finally {
      setLoading(null);
    }
  }

  useEffect(() => {
    refreshStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FUNÇÕES DE EXPORTAÇÃO ---
  
  async function handleBackupJson() {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading("backup_json");
    try {
      const res = await coreApi.backupDumpdata();
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      downloadBlob(res.data as Blob, `backup_dumpdata_${ts}.json`);
      setSuccessMsg("Backup (JSON) baixado.");
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao gerar backup (JSON)."));
    } finally {
      setLoading(null);
    }
  }

  async function handleBackupSqlite() {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading("backup_sqlite");
    try {
      const res = await coreApi.backupSqlite();
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      downloadBlob(res.data as Blob, `db_backup_${ts}.sqlite3`);
      setSuccessMsg("Backup (SQLite) baixado.");
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao gerar backup do arquivo do banco."));
    } finally {
      setLoading(null);
    }
  }

  // --- FUNÇÕES DE IMPORTAÇÃO ---

  async function handleSeedForce() {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading("seed");
    try {
      const res = await coreApi.seedForce();
      setSuccessMsg(res.data?.detail || "Seed carregado.");
      refreshStats();
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao carregar seed."));
    } finally {
      setLoading(null);
    }
  }

  // Nova função para envio dos arquivos
  async function handleUploadFiles() {
    if (selectedFiles.length === 0) return;
    
    setErrorMsg("");
    setSuccessMsg("");
    setLoading("upload_json");
    
    try {
      const formData = new FormData();
      // O nome 'files' deve corresponder ao que o backend Django espera no request.FILES
      selectedFiles.forEach((file) => {
        formData.append("files", file); 
      });

      const res = await coreApi.uploadSeedFiles(formData);
      setSuccessMsg(res.data?.detail || `${selectedFiles.length} arquivo(s) processado(s) com sucesso.`);
      
      // Limpa os arquivos após o sucesso
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      refreshStats();
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao enviar os arquivos JSON."));
    } finally {
      setLoading(null);
    }
  }

  // --- FUNÇÕES DESTRUTIVAS ---

  async function handleFlushOnly() {
    setErrorMsg("");
    setSuccessMsg("");
    if (!canDestructive) {
      setErrorMsg('Digite "APAGAR TUDO" para habilitar esta ação.');
      return;
    }

    setLoading("flush");
    try {
      const res = await coreApi.flushOnly();
      setSuccessMsg(res.data?.detail || "Banco apagado.");
      setConfirmText("");
      logout();
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao apagar o banco."));
    } finally {
      setLoading(null);
    }
  }

  async function handleResetAndSeed() {
    setErrorMsg("");
    setSuccessMsg("");
    if (!canDestructive) {
      setErrorMsg('Digite "APAGAR TUDO" para habilitar esta ação.');
      return;
    }

    setLoading("reset");
    try {
      const res = await coreApi.resetAndSeed();
      setSuccessMsg(res.data?.detail || "Banco resetado e seed carregado.");
      setConfirmText("");
      logout();
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setErrorMsg(getApiErrorMessage(err, "Falha ao resetar banco e carregar seed."));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <h2>Sistema: Gerenciamento do Banco de Dados</h2>
      </div>

      <div className="alert alert-warning">
        <strong>Área Restrita:</strong> Estas ações alteram a estrutura fundamental do sistema. Após apagar/resetar, você será desconectado. Disponível apenas para superadmin.
      </div>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="form-container">
        {/* STATUS DO BANCO */}
        <div className="alert alert-info" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 12, flexWrap: "wrap" }}>
            <div>
              <strong>Engine:</strong>&nbsp;{stats?.database_engine || "—"}
              {countsText ? <div style={{ marginTop: 6, fontSize: '0.9em' }}>{countsText}</div> : null}
            </div>
            <button className="btn btn-secondary btn-small" type="button" disabled={loading !== null} onClick={refreshStats}>
              Atualizar Status
            </button>
          </div>
        </div>

        {/* SESSÃO 1: EXPORTAÇÃO */}
        <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontSize: '1.1em', marginBottom: 16, color: '#333' }}>📥 Exportação & Backup</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-secondary" type="button" disabled={loading !== null} onClick={handleBackupJson}>
              {loading === "backup_json" ? <><span className="spinner" /> Gerando...</> : "Baixar Backup (JSON)"}
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              disabled={loading !== null || !isSqlite}
              onClick={handleBackupSqlite}
              title={isSqlite ? "Baixar arquivo do banco SQLite" : "Disponível apenas quando o banco é SQLite"}
            >
              {loading === "backup_sqlite" ? <><span className="spinner" /> Gerando...</> : "Baixar Arquivo (SQLite)"}
            </button>
          </div>
        </div>

        {/* SESSÃO 2: IMPORTAÇÃO E SEEDS */}
        <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontSize: '1.1em', marginBottom: 16, color: '#333' }}>📤 Importação de Dados</h3>
          
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".json"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles(Array.from(e.target.files));
                  }
                }}
                className="form-input"
                disabled={loading !== null}
              />
              {selectedFiles.length > 0 && (
                <div style={{ marginTop: 8, fontSize: '0.85em', color: '#666' }}>
                  {selectedFiles.length} arquivo(s) selecionado(s).
                </div>
              )}
            </div>
            
            <button 
              className="btn btn-primary" 
              type="button" 
              disabled={loading !== null || selectedFiles.length === 0} 
              onClick={handleUploadFiles}
            >
              {loading === "upload_json" ? <><span className="spinner" /> Enviando...</> : "Enviar JSONs Customizados"}
            </button>
          </div>

          <button className="btn btn-secondary" type="button" disabled={loading !== null} onClick={handleSeedForce}>
            {loading === "seed" ? <><span className="spinner" /> Carregando...</> : "Carregar Seeds Padrão (Scripts Internos)"}
          </button>
        </div>

        {/* SESSÃO 3: ZONA DE PERIGO */}
        <div>
          <h3 style={{ fontSize: '1.1em', marginBottom: 16, color: '#d32f2f' }}>⚠️ Zona de Perigo</h3>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label className="form-label">Confirmação de Segurança</label>
              <input
                className="form-input"
                placeholder='Digite "APAGAR TUDO" para liberar as ações abaixo'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-secondary" style={{ borderColor: canDestructive ? '#d32f2f' : '', color: canDestructive ? '#d32f2f' : '' }} type="button" disabled={!canDestructive || loading !== null} onClick={handleFlushOnly}>
              {loading === "flush" ? <><span className="spinner" /> Apagando...</> : "Limpar Banco (Manter Superadmin)"}
            </button>

            <button className="btn btn-primary" style={{ backgroundColor: canDestructive ? '#d32f2f' : '', borderColor: canDestructive ? '#d32f2f' : '' }} type="button" disabled={!canDestructive || loading !== null} onClick={handleResetAndSeed}>
              {loading === "reset" ? <><span className="spinner" /> Resetando...</> : "Destruição Total & Recarregar Padrão"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}