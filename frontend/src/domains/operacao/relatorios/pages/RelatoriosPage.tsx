import { useState, useEffect, useCallback } from "react";
import { guiasApi } from "../../guias/api/guias.api";
import { secretariaApi } from "../../../organizacao/secretarias/secretarias.api";
import { tiposCombustivelApi } from "../../../frota/tipos-combustivel/tiposCombustivel.api";
import { getTodayLocalISO, getFirstDayOfMonthISO, formatDateBR } from "../../../../core/utils/dateUtils";
import type { RelatorioConsolidadoDTO } from "../../guias/schemas/guia.dto";
import type { SecretariaReadDTO } from "../../../organizacao/secretarias/schemas/secretaria.read.zod";
import type { TipoCombustivelReadDTO } from "../../../frota/tipos-combustivel/schemas/tipoCombustivel.read.zod";
import styles from "./RelatoriosPage.module.css";

export default function RelatoriosPage() {
  const [dataInicio, setDataInicio] = useState(getFirstDayOfMonthISO());
  const [dataFim, setDataFim] = useState(getTodayLocalISO());
  const [secretariaId, setSecretariaId] = useState<number | "">("");
  const [tipoCombustivelId, setTipoCombustivelId] = useState<number | "">("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("mes_atual");

  const [secretarias, setSecretarias] = useState<SecretariaReadDTO[]>([]);
  const [tiposCombustivel, setTiposCombustivel] = useState<TipoCombustivelReadDTO[]>([]);
  const [relatorio, setRelatorio] = useState<RelatorioConsolidadoDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    secretariaApi.listar({ page_size: 100, ativo: true })
      .then(res => setSecretarias(res.results || []))
      .catch(err => console.error(err));

    tiposCombustivelApi.listar({ page_size: 100, ativo: true })
      .then(res => setTiposCombustivel(res.results || []))
      .catch(err => console.error(err));
  }, []);

  const carregarRelatorio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guiasApi.obterRelatorioConsolidado({
        data_inicio: dataInicio || undefined,
        data_fim: dataFim || undefined,
        secretaria: typeof secretariaId === "number" ? secretariaId : undefined,
        tipo_combustivel: typeof tipoCombustivelId === "number" ? tipoCombustivelId : undefined,
      });
      setRelatorio(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar os dados do relatório.");
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim, secretariaId, tipoCombustivelId]);

  useEffect(() => {
    carregarRelatorio();
  }, [carregarRelatorio]);

  const handleQuickFilter = (type: string) => {
    setActiveQuickFilter(type);
    const now = new Date();
    const year = now.getFullYear();
    const today = getTodayLocalISO();
    if (type === "mes_atual") {
      const month = String(now.getMonth() + 1).padStart(2, "0");
      setDataInicio(`${year}-${month}-01`);
      setDataFim(today);
    } else if (type === "mes_anterior") {
      const prev = new Date(year, now.getMonth() - 1, 1);
      const prevY = prev.getFullYear();
      const prevM = String(prev.getMonth() + 1).padStart(2, "0");
      const lastD = new Date(year, now.getMonth(), 0).getDate();
      setDataInicio(`${prevY}-${prevM}-01`);
      setDataFim(`${prevY}-${prevM}-${String(lastD).padStart(2, "0")}`);
    } else if (type === "ultimos_30") {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      setDataInicio(past30.toISOString().split("T")[0]);
      setDataFim(today);
    } else if (type === "ano_atual") {
      setDataInicio(`${year}-01-01`);
      setDataFim(today);
    }
  };

  const formatLitros = (val?: number) => {
    if (val === undefined || val === null) return "0,00 L";
    return `${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Relatórios de Abastecimento</h1>
          <p className={styles.subtitle}>Consumo mensal e consolidado por secretaria, combustível e modalidade.</p>
        </div>
        <button type="button" className={styles.printBtn} onClick={() => window.print()}>
          🖨️ Imprimir Relatório
        </button>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.quickFilters}>
          <button type="button" className={`${styles.quickFilterBtn} ${activeQuickFilter === "mes_atual" ? styles.quickFilterBtnActive : ""}`} onClick={() => handleQuickFilter("mes_atual")}>Mês Atual</button>
          <button type="button" className={`${styles.quickFilterBtn} ${activeQuickFilter === "mes_anterior" ? styles.quickFilterBtnActive : ""}`} onClick={() => handleQuickFilter("mes_anterior")}>Mês Anterior</button>
          <button type="button" className={`${styles.quickFilterBtn} ${activeQuickFilter === "ultimos_30" ? styles.quickFilterBtnActive : ""}`} onClick={() => handleQuickFilter("ultimos_30")}>Últimos 30 Dias</button>
          <button type="button" className={`${styles.quickFilterBtn} ${activeQuickFilter === "ano_atual" ? styles.quickFilterBtnActive : ""}`} onClick={() => handleQuickFilter("ano_atual")}>Ano Atual</button>
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="data_inicio">Data Início</label>
            <input id="data_inicio" type="date" className={styles.input} value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setActiveQuickFilter("custom"); }} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="data_fim">Data Fim</label>
            <input id="data_fim" type="date" className={styles.input} value={dataFim} onChange={(e) => { setDataFim(e.target.value); setActiveQuickFilter("custom"); }} />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="secretaria">Secretaria</label>
            <select id="secretaria" className={styles.select} value={secretariaId} onChange={(e) => setSecretariaId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todas as Secretarias</option>
              {secretarias.map((s) => (<option key={s.id} value={s.id}>{s.sigla} - {s.nome}</option>))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="combustivel">Combustível</label>
            <select id="combustivel" className={styles.select} value={tipoCombustivelId} onChange={(e) => setTipoCombustivelId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Todos os Combustíveis</option>
              {tiposCombustivel.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
            </select>
          </div>
          <button type="button" className={styles.filterActionBtn} onClick={() => carregarRelatorio()}>Filtrar</button>
        </div>
      </div>

      {loading && <div className={styles.loading}>Carregando métricas e consolidados...</div>}
      {error && <div className={styles.emptyState}>⚠️ {error}</div>}

      {relatorio && !loading && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem', marginBottom: '-8px' }}>
            <span>Período analisado: <strong>{formatDateBR(relatorio.periodo.data_inicio)}</strong> até <strong>{formatDateBR(relatorio.periodo.data_fim)}</strong></span>
            <span>Emitido em: <strong>{formatDateBR(getTodayLocalISO())}</strong></span>
          </div>

          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>⛽</div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Total Combustível</span>
                <span className={styles.kpiValue}>{formatLitros(relatorio.kpis.total_combustivel)}</span>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>🛢️</div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Óleo Lubrificante</span>
                <span className={styles.kpiValue}>{formatLitros(relatorio.kpis.total_oleo)}</span>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>📄</div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Guias Emitidas</span>
                <span className={styles.kpiValue}>{relatorio.kpis.total_guias}</span>
              </div>
            </div>
            <div className={styles.kpiCard}>
              <div className={styles.kpiIcon}>🚗</div>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>Veículos Atendidos</span>
                <span className={styles.kpiValue}>{relatorio.kpis.total_veiculos}</span>
              </div>
            </div>
          </div>

          <div className={styles.tablesGrid}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}><span>🏢</span> Consumo Consolidado por Secretaria</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Secretaria</th>
                      <th>Sigla</th>
                      <th style={{ textAlign: "right" }}>Nº Guias</th>
                      <th style={{ textAlign: "right" }}>Combustível (Litros)</th>
                      <th style={{ textAlign: "right" }}>Óleo (Litros)</th>
                      <th style={{ width: "20%" }}>Participação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.por_secretaria.length === 0 ? (
                      <tr><td colSpan={6} className={styles.emptyState}>Nenhum registro encontrado.</td></tr>
                    ) : (
                      relatorio.por_secretaria.map((s) => {
                        const perc = relatorio.kpis.total_combustivel > 0
                          ? Math.round((s.total_combustivel / relatorio.kpis.total_combustivel) * 100) : 0;
                        return (
                          <tr key={s.secretaria_id}>
                            <td><strong>{s.nome}</strong></td>
                            <td><span className={styles.badgeSigla}>{s.sigla}</span></td>
                            <td style={{ textAlign: "right" }}>{s.total_guias}</td>
                            <td style={{ textAlign: "right" }}><strong>{formatLitros(s.total_combustivel)}</strong></td>
                            <td style={{ textAlign: "right" }}>{formatLitros(s.total_oleo)}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className={styles.progressBarContainer}><div className={styles.progressBar} style={{ width: `${perc}%` }} /></div>
                                <span style={{ fontSize: "12px", fontWeight: 700, minWidth: "35px" }}>{perc}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  {relatorio.por_secretaria.length > 0 && (
                    <tfoot>
                      <tr>
                        <td colSpan={2}>TOTAL GERAL</td>
                        <td style={{ textAlign: "right" }}>{relatorio.kpis.total_guias}</td>
                        <td style={{ textAlign: "right" }}>{formatLitros(relatorio.kpis.total_combustivel)}</td>
                        <td style={{ textAlign: "right" }}>{formatLitros(relatorio.kpis.total_oleo)}</td>
                        <td>100%</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* 2. Distribuição por Tipo de Combustível */}
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}><span>⛽</span> Distribuição por Tipo de Combustível</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tipo de Combustível</th>
                      <th style={{ textAlign: "right" }}>Nº Guias</th>
                      <th style={{ textAlign: "right" }}>Total Litros</th>
                      <th style={{ width: "25%" }}>Participação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.por_tipo_combustivel.length === 0 ? (
                      <tr><td colSpan={4} className={styles.emptyState}>Nenhum consumo registrado no período.</td></tr>
                    ) : (
                      relatorio.por_tipo_combustivel.map((c) => (
                        <tr key={c.tipo_combustivel_id}>
                          <td><strong>{c.nome}</strong></td>
                          <td style={{ textAlign: "right" }}>{c.total_guias}</td>
                          <td style={{ textAlign: "right" }}><strong>{formatLitros(c.total_litros)}</strong></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div className={styles.progressBarContainer}><div className={styles.progressBar} style={{ width: `${c.percentual}%`, background: "#10b981" }} /></div>
                              <span style={{ fontSize: "12px", fontWeight: 700, minWidth: "35px" }}>{c.percentual}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Distribuição por Modalidade */}
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}><span>🚜</span> Distribuição por Modalidade de Atendimento</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Modalidade / Serviço</th>
                      <th style={{ textAlign: "right" }}>Nº Guias</th>
                      <th style={{ textAlign: "right" }}>Combustível (L)</th>
                      <th style={{ textAlign: "right" }}>Óleo (L)</th>
                      <th style={{ width: "25%" }}>Participação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorio.por_modalidade.length === 0 ? (
                      <tr><td colSpan={5} className={styles.emptyState}>Nenhum registro encontrado.</td></tr>
                    ) : (
                      relatorio.por_modalidade.map((m) => (
                        <tr key={m.modalidade}>
                          <td><strong>{m.modalidade_nome}</strong></td>
                          <td style={{ textAlign: "right" }}>{m.total_guias}</td>
                          <td style={{ textAlign: "right" }}><strong>{formatLitros(m.total_litros)}</strong></td>
                          <td style={{ textAlign: "right" }}>{formatLitros(m.total_oleo)}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div className={styles.progressBarContainer}><div className={styles.progressBar} style={{ width: `${m.percentual}%`, background: "#8b5cf6" }} /></div>
                              <span style={{ fontSize: "12px", fontWeight: 700, minWidth: "35px" }}>{m.percentual}%</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
