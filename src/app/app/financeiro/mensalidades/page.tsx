export default function MonthlyFeesPage() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Mensalidades</h2>
      <p className="muted">
        Base pronta. Aqui entra o UX (KPIs + filtros + tabela + modal de pagamento) conectado às suas RPCs:
        report_monthly_fees_summary, report_monthly_fees_status_counts, report_monthly_fees_ar_buckets,
        generate_monthly_fee_titles, pay_title.
      </p>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>Próximo passo técnico (sem retrabalho)</div>
        <div className="muted">
          Criar <code>financeService.ts</code> e componentes (KPI, tabela, modal). A tela só “orquestra”.
        </div>
      </div>
    </div>
  );
}
