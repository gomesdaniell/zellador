export default function MinhaAssinaturaPage() {
  // UI-only (mock). Depois pluga no backend.
  const terreiro = {
    nome: "TUFDS",
    fundacao: "—",
    cadastradoPor: "Daniel Gomes",
    cadastradoEm: "29/12/2025",
    ultimaAtualizacao: "29/12/2025",
  };

  const assinatura = {
    nome: "—",
    codigo: "—",
    status: "Período Teste",
    periodo: "—",
  };

  const transacoes: Array<{
    venc: string;
    pgto: string;
    boleto: string;
    tipo: string;
    valor: string;
    status: string;
  }> = []; // vazio por enquanto (igual print)

  return (
    <div className="subsc">
      <div className="subsc__head">
        <h1 className="appTitle">Minha assinatura</h1>
      </div>

      <div className="subsc__grid">
        {/* Coluna esquerda */}
        <aside className="subsc__left">
          <div className="subsc__card">
            <div className="subsc__cardTitle">{terreiro.nome}</div>

            <div className="subsc__kv">
              <div className="subsc__k">Fundação</div>
              <div className="subsc__v">{terreiro.fundacao}</div>
            </div>

            <div className="subsc__kv">
              <div className="subsc__k">Cadastrado por:</div>
              <div className="subsc__v">{terreiro.cadastradoPor}</div>
            </div>

            <div className="subsc__kv">
              <div className="subsc__k">Cadastrado em:</div>
              <div className="subsc__v">{terreiro.cadastradoEm}</div>
            </div>

            <div className="subsc__kv">
              <div className="subsc__k">Última atualização:</div>
              <div className="subsc__v">{terreiro.ultimaAtualizacao}</div>
            </div>
          </div>
        </aside>

        {/* Coluna direita */}
        <section className="subsc__right">
          <div className="subsc__card subsc__card--pad">
            <div className="subsc__sectionTitle">Dados da assinatura</div>

            <div className="subsc__infoGrid">
              <div className="subsc__infoRow">
                <div className="subsc__k">Nome:</div>
                <div className="subsc__v">{assinatura.nome}</div>
              </div>

              <div className="subsc__infoRow">
                <div className="subsc__k">Código assinatura:</div>
                <div className="subsc__v">{assinatura.codigo}</div>
              </div>

              <div className="subsc__infoRow">
                <div className="subsc__k">Status assinatura:</div>
                <div className="subsc__v">
                  <span className="subsc__status">{assinatura.status}</span>
                </div>
              </div>

              <div className="subsc__infoRow">
                <div className="subsc__k">Período da assinatura:</div>
                <div className="subsc__v">{assinatura.periodo}</div>
              </div>
            </div>

            <div className="subsc__divider" />

            <div className="subsc__sectionTitle">Minhas transações</div>

            <div className="subsc__table">
              <div className="subsc__thead">
                <div>Vencto</div>
                <div>Pgto.</div>
                <div>Link do boleto</div>
                <div>Tipo</div>
                <div>Valor R$</div>
                <div>Status</div>
              </div>

              {transacoes.length === 0 ? (
                <div className="subsc__empty">
                  <div className="subsc__emptyTitle">Nenhuma transação ainda</div>
                  <div className="muted">Quando houver cobrança/pagamento, aparecerá aqui.</div>
                </div>
              ) : (
                <div className="subsc__tbody">
                  {transacoes.map((t, i) => (
                    <div key={i} className="subsc__tr">
                      <div>{t.venc}</div>
                      <div>{t.pgto}</div>
                      <div className="subsc__link">{t.boleto}</div>
                      <div>{t.tipo}</div>
                      <div>{t.valor}</div>
                      <div>{t.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
