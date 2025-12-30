export default function HomePage() {
  return (
    <main>
      {/* Top bar */}
      <header className="topbar">
        <div className="container topbar__inner">
          <div className="brand">
            <div className="brand__logo" aria-hidden>⟡</div>
            <div className="brand__text">
              <strong>Zellador</strong>
              <span>Gestão inteligente para terreiros</span>
            </div>
          </div>

          <nav className="nav">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#seguranca">Segurança</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="topbar__cta">
            <a className="btn btn--ghost" href="#contato">Quero conhecer</a>

            {/* BOTÃO LOGIN — INSERIDO */}
            <a className="btn btn--ghost" href="/login">
              Login
            </a>

            <a className="btn btn--primary" href="/login?mode=signup">
              Experimente grátis
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="pill">100% online • simples • feito para a rotina real do terreiro</p>
            <h1>
              Organize a casa. Ganhe tempo.
              <span className="accent"> Traga clareza</span> para a gestão.
            </h1>
            <p className="lead">
              Uma plataforma para centralizar cadastro, calendário, giras, contribuições e visão financeira —
              sem planilhas espalhadas, sem perda de histórico e com acesso por perfil.
            </p>

            <div className="hero__actions">
              <a className="btn btn--primary" href="/login?mode=signup">
                Experimente grátis por 30 dias
              </a>
              <a className="btn btn--ghost" href="#recursos">Ver recursos</a>
            </div>

            <p className="hero__fineprint">
              30 dias grátis • sem compromisso • você pode cancelar quando quiser
            </p>

            <div className="hero__proof">
              <div className="proof">
                <strong>Menos ruído</strong>
                <span>Informação no lugar certo</span>
              </div>
              <div className="proof">
                <strong>Mais controle</strong>
                <span>Permissões por função</span>
              </div>
              <div className="proof">
                <strong>Mais transparência</strong>
                <span>Visão financeira clara</span>
              </div>
            </div>
          </div>

          {/* Mockup */}
          <div className="mock">
            <div className="mock__window">
              <div className="mock__top">
                <span />
                <span />
                <span />
              </div>

              <div className="mock__content">
                <div className="mock__kpi">
                  <div>
                    <small>Giras no mês</small>
                    <strong>8</strong>
                  </div>
                  <div>
                    <small>Atendimentos</small>
                    <strong>126</strong>
                  </div>
                  <div>
                    <small>Saldo do mês</small>
                    <strong>R$ 4.820</strong>
                  </div>
                </div>

                <div className="mock__grid">
                  <div className="mock__card">
                    <h3>Calendário</h3>
                    <ul>
                      <li>• Sábado — Gira (18:30)</li>
                      <li>• Terça — Estudo (20:00)</li>
                      <li>• Domingo — Ação social</li>
                    </ul>
                  </div>
                  <div className="mock__card">
                    <h3>Financeiro</h3>
                    <ul>
                      <li>• Entradas: R$ 9.300</li>
                      <li>• Saídas: R$ 4.480</li>
                      <li>• Inadimplência: 12%</li>
                    </ul>
                  </div>
                  <div className="mock__card">
                    <h3>Cadastros</h3>
                    <ul>
                      <li>• Filhos ativos: 73</li>
                      <li>• Consulentes: 412</li>
                      <li>• Novos: +18/mês</li>
                    </ul>
                  </div>
                  <div className="mock__card">
                    <h3>Biblioteca</h3>
                    <ul>
                      <li>• Regras da casa</li>
                      <li>• Apostilas</li>
                      <li>• Orientações</li>
                    </ul>
                  </div>
                </div>

                <div className="mock__note">
                  <strong>Ideia central:</strong> tudo em um lugar só, com trilha de organização e histórico.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TODO: restante do código permanece exatamente igual */}
    </main>
  );
}
