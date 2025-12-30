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
            <a className="btn btn--ghost" href="/login">Login</a>

            <a className="btn btn--primary" href="/login?mode=signup">Experimente grátis</a>
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
            <a className="btn btn--primary" href="/login?mode=signup">Experimente grátis por 30 dias</a>
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

      {/* Logos / statement */}
      <section className="strip">
        <div className="container strip__inner">
          <p>
            Feito para casas que precisam de <strong>organização</strong>, <strong>padrão</strong> e <strong>continuidade</strong> —
            sem travar a espiritualidade com burocracia.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="section">
        <div className="container">
          <div className="section__head">
            <h2>Recursos que resolvem dor do dia a dia</h2>
            <p>
              A proposta é a mesma que as melhores plataformas do nicho comunicam: centralizar informações e rotinas do terreiro
              (cadastros, giras e financeiro) num fluxo simples.
            </p>
          </div>

          <div className="cards">
            <article className="card">
              <h3>Cadastro inteligente</h3>
              <p>Filhos, médiuns, consulentes, histórico e status (ativo/inativo) com busca rápida.</p>
            </article>
            <article className="card">
              <h3>Calendário e giras</h3>
              <p>Agenda por mês/ano, tipos de atividade, escala e anotações por evento.</p>
            </article>
            <article className="card">
              <h3>Financeiro claro</h3>
              <p>Entradas, saídas, categorias e visão de mensalidades previstas x recebidas.</p>
            </article>
            <article className="card">
              <h3>Permissões por função</h3>
              <p>Owner/admin/editor/visualizador — cada pessoa vê só o que precisa ver.</p>
            </article>
            <article className="card">
              <h3>Biblioteca organizada</h3>
              <p>Apostilas, comunicados e regras da casa em pastas, com controle de acesso.</p>
            </article>
            <article className="card">
              <h3>Avisos prontos pro WhatsApp</h3>
              <p>Mensagem padrão gerada no app para você encaminhar no grupo sem retrabalho.</p>
            </article>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="section section--alt">
        <div className="container">
          <div className="section__head">
            <h2>Como funciona na prática</h2>
            <p>Objetivo: você implementar sem “projeto”, em poucos dias.</p>
          </div>

          <div className="steps">
            <div className="step">
              <span className="step__n">1</span>
              <h3>Você cria a casa</h3>
              <p>Define nome, responsáveis e quem pode acessar o quê.</p>
            </div>
            <div className="step">
              <span className="step__n">2</span>
              <h3>Organiza os módulos</h3>
              <p>Cadastros, calendário, financeiro e biblioteca — cada um com seu fluxo.</p>
            </div>
            <div className="step">
              <span className="step__n">3</span>
              <h3>Começa a rodar e medir</h3>
              <p>Relatórios simples e consistentes para decisões melhores (sem exposição desnecessária).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="seguranca" className="section">
        <div className="container">
          <div className="section__head">
            <h2>Segurança e continuidade</h2>
            <p>Pra não acontecer de alguém sair e continuar com acesso, e pra você manter histórico organizado.</p>
          </div>

          <div className="split">
            <div className="split__item">
              <h3>Controle de acesso por perfil</h3>
              <p>Permissões por função e por casa. Revogou, acabou. Simples e rastreável.</p>
            </div>
            <div className="split__item">
              <h3>Dados centralizados</h3>
              <p>Chega de “arquivo do fulano”, “planilha no drive” e versões desencontradas.</p>
            </div>
            <div className="split__item">
              <h3>Privacidade por padrão</h3>
              <p>Relatórios podem ser agregados (ex.: inadimplência sem nomes) quando fizer sentido.</p>
            </div>
          </div>
        </div>
      </section>

<section id="trial" className="section">
  <div className="container">
    <div className="sales">
      <div className="sales__copy">
        <h2>Experimente sem compromisso por 30 dias</h2>
        <p>
          Se você sente que a casa está “crescendo no braço”, o Zellador entra pra organizar sem travar a energia do dia a dia.
          É uma plataforma <strong>simples</strong>, <strong>amigável</strong> e <strong>intuitiva</strong> — feita pra funcionar no celular.
        </p>

        <div className="sales__bullets">
          <div className="bullet">
            <strong>Você começa pelo básico</strong>
            <span>cadastro + calendário + organização do financeiro do mês.</span>
          </div>
          <div className="bullet">
            <strong>Menos ruído no WhatsApp</strong>
            <span>informação fica no lugar certo e o grupo vira só comunicação.</span>
          </div>
          <div className="bullet">
            <strong>Controle de acesso</strong>
            <span>quem sai, perde acesso — sem “trocar link de todo mundo”.</span>
          </div>
          <div className="bullet">
            <strong>Transparência na medida certa</strong>
            <span>painéis claros sem expor lançamentos individuais quando você não quiser.</span>
          </div>
        </div>

        <div className="sales__actions">
          <a className="btn btn--primary" href="/login?mode=signup">Quero testar 30 dias grátis</a>
          <a className="btn btn--ghost" href="#como-funciona">Entender o passo a passo</a>
        </div>

        <p className="sales__micro">
          Sem compromisso: se não fizer sentido, você para. Se fizer, você ganha continuidade, histórico e rotina.
        </p>
      </div>

      <aside className="sales__card">
        <h3>O que você sente na prática</h3>
        <ul>
          <li>✓ Cadastros organizados e fáceis de achar</li>
          <li>✓ Agenda clara do mês (giras, estudos, eventos)</li>
          <li>✓ Visão do financeiro sem planilha “viva”</li>
          <li>✓ Menos retrabalho e mais padrão</li>
        </ul>

        <div className="sales__tag">
          <strong>Dica:</strong> em 1 hora você já coloca a casa “em ordem” com o mínimo padrão.
        </div>
      </aside>
    </div>
  </div>
</section>

      
      {/* Contact / CTA */}
      <section id="contato" className="cta">
        <div className="container cta__inner">
          <div className="cta__copy">
            <h2>Quer ver funcionando?</h2>
            <p>
              Me diga o tamanho da casa e o que você quer controlar primeiro (cadastro, calendário ou financeiro).
              Eu te mostro um fluxo simples e já deixo um caminho de implantação.
            </p>

            <h2>Comece agora com 30 dias grátis</h2>

<div className="cta__actions">
  <a className="btn btn--primary" href="/login?mode=signup">
    Experimente grátis
  </a>
  <a className="btn btn--ghost" href="#recursos">Ver recursos</a>
</div>


            <small className="muted">
              Dica: se você ainda não tem rotina de cadastros, eu te ajudo a criar o “mínimo padrão” pra casa rodar sem stress.
            </small>
          </div>

          <div className="cta__card">
            <h3>O que você ganha rápido</h3>
            <ul>
              <li>✓ Rotina organizada em 7 dias</li>
              <li>✓ Menos mensagens repetidas no grupo</li>
              <li>✓ Visão financeira clara do mês</li>
              <li>✓ Histórico e continuidade</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <div className="section__head">
            <h2>FAQ</h2>
            <p>As dúvidas que normalmente travam a decisão.</p>
          </div>

          <div className="faq">
            <details>
              <summary>Isso substitui o WhatsApp?</summary>
              <p>Não. O app organiza e centraliza. O WhatsApp continua como canal — só com menos ruído.</p>
            </details>
            <details>
              <summary>Dá pra usar mesmo sem ser associado?</summary>
              <p>Sim. A landing é aberta pra conhecer. O acesso ao app depende de convite/assinatura da casa.</p>
            </details>
            <details>
              <summary>Posso limitar acesso de quem saiu?</summary>
              <p>Sim. Você revoga o acesso e pronto. Sem precisar “trocar link de todo mundo”.</p>
            </details>
            <details>
              <summary>Precisa de computador?</summary>
              <p>Não. Funciona bem no celular. Você pode usar no desktop quando quiser.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__inner">
          <div>
            <strong>Zellador</strong>
            <p className="muted">Gestão inteligente para terreiros.</p>
          </div>
          <div className="footer__links">
            <a href="#recursos">Recursos</a>
            <a href="#seguranca">Segurança</a>
            <a href="#contato">Contato</a>
            <a href="/politica">Política de Privacidade</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
