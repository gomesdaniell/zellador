export default function SignupPage() {
  return (
    <main>
      {/* Top bar (mesma da landing) */}
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
            <a href="/#recursos">Recursos</a>
            <a href="/#como-funciona">Como funciona</a>
            <a href="/#seguranca">Segurança</a>
            <a href="/#faq">FAQ</a>
          </nav>

          <div className="topbar__cta">
            <a className="btn btn--ghost" href="/#contato">Quero conhecer</a>
            <a className="btn btn--ghost" href="/login">Login</a>
            <a className="btn btn--primary" href="/signup">Experimente grátis</a>
          </div>
        </div>
      </header>

      {/* Cadastro */}
      <section className="signup">
        <div className="container">
          <div className="signup__card">
            <h1 className="signup__title">Criar conta e começar o teste grátis</h1>
            <p className="muted signup__sub">
              Preencha os dados básicos do terreiro. Depois a gente ajusta o resto dentro do sistema.
            </p>

            <form className="signup__form">
              {/* DADOS DO TERREIRO */}
              <div className="signup__section">
                <div className="signup__sectionHead">
                  <h2>Dados do terreiro</h2>
                  <p className="muted">Informações institucionais e do responsável.</p>
                </div>

                <div className="signup__grid">
                  <div className="signup__field">
                    <label htmlFor="nomeTerreiro">Nome do Terreiro</label>
                    <input id="nomeTerreiro" placeholder="Ex.: Filhos do Sagrado" />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="razaoSocial">Razão Social</label>
                    <input id="razaoSocial" placeholder="Ex.: Associação Religiosa ..." />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="cnpj">CNPJ</label>
                    <input id="cnpj" placeholder="00.000.000/0000-00" />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="dataFundacao">Data Fundação</label>
                    <input id="dataFundacao" type="date" />
                  </div>

                  <div className="signup__field signup__field--full">
                    <label htmlFor="responsavel">Nome do Responsável</label>
                    <input id="responsavel" placeholder="Nome e sobrenome" />
                  </div>
                </div>
              </div>

              {/* ENDEREÇO */}
              <div className="signup__section">
                <div className="signup__sectionHead">
                  <h2>Endereço</h2>
                  <p className="muted">Onde o terreiro funciona.</p>
                </div>

                <div className="signup__grid">
                  <div className="signup__field">
                    <label htmlFor="cep">CEP</label>
                    <input id="cep" placeholder="00000-000" />
                  </div>

                  <div className="signup__field signup__field--full">
                    <label htmlFor="logradouro">Logradouro</label>
                    <input id="logradouro" placeholder="Rua / Avenida" />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="numero">Número</label>
                    <input id="numero" placeholder="Ex.: 123" />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="complemento">Complemento</label>
                    <input id="complemento" placeholder="Ex.: Sala, casa, fundos..." />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="bairro">Bairro</label>
                    <input id="bairro" placeholder="Ex.: Centro" />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="cidade">Cidade</label>
                    <input id="cidade" defaultValue="Manaus" />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="estado">Estado</label>
                    <input id="estado" placeholder="AM" />
                  </div>
                </div>
              </div>

              {/* CONTATO */}
              <div className="signup__section">
                <div className="signup__sectionHead">
                  <h2>Contato</h2>
                  <p className="muted">Como a gente fala com você e/ou com a casa.</p>
                </div>

                <div className="signup__grid">
                  <div className="signup__field">
                    <label htmlFor="whatsapp">WhatsApp</label>
                    <input id="whatsapp" placeholder="(92) 9xxxx-xxxx" />
                  </div>

                  <div className="signup__field">
                    <label htmlFor="celular">Celular</label>
                    <input id="celular" placeholder="(92) 9xxxx-xxxx" />
                  </div>

                  <div className="signup__field signup__field--full">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                </div>
              </div>

              {/* CAMPOS SUGERIDOS (mínimo útil) */}
              <div className="signup__section">
                <div className="signup__sectionHead">
                  <h2>Informações rápidas</h2>
                  <p className="muted">Opcional (mas ajuda a configurar melhor o sistema).</p>
                </div>

                <div className="signup__grid">
                  <div className="signup__field">
                    <label htmlFor="tamanhoCasa">Tamanho da casa</label>
                    <select id="tamanhoCasa">
                      <option value="">Selecione</option>
                      <option value="pequena">Pequena (até 30 pessoas)</option>
                      <option value="media">Média (31 a 80 pessoas)</option>
                      <option value="grande">Grande (81+ pessoas)</option>
                    </select>
                  </div>

                  <div className="signup__field">
                    <label htmlFor="girasSemana">Giras/atividades por semana</label>
                    <select id="girasSemana">
                      <option value="">Selecione</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>

                  <div className="signup__field signup__field--full">
                    <label htmlFor="site">Instagram / Site (se tiver)</label>
                    <input id="site" placeholder="https://instagram.com/..." />
                  </div>
                </div>
              </div>

              {/* AÇÕES */}
              <div className="signup__actions">
                <button type="submit" className="btn btn--primary signup__btnFull">
                  Criar conta e iniciar teste
                </button>

                <div className="signup__footer">
                  <a className="btn btn--ghost" href="/login">Já tenho conta (Login)</a>
                  <a className="btn btn--ghost" href="/">Voltar</a>
                </div>

                <p className="muted signup__micro">
                  * Por enquanto isso é só tela. A lógica de criação/validação entra depois.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
