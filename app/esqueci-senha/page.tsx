export default function EsqueciSenhaPage() {
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

      {/* Body */}
      <section className="forgot">
        <div className="container">
          <div className="forgot__card">
            <h1 className="forgot__title">Esqueci minha senha</h1>
            <p className="muted forgot__sub">
              Informe o email da sua conta. Vamos enviar um link para redefinir sua senha.
            </p>

            <form className="forgot__form">
              <div className="forgot__field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="seu@email.com" />
              </div>

              <button type="submit" className="btn btn--primary forgot__btnFull">
                Enviar link de redefinição
              </button>

              <div className="forgot__footer">
                <a className="btn btn--ghost" href="/login">Voltar para login</a>
                <a className="btn btn--ghost" href="/">Voltar para a landing</a>

                <p className="muted">
                  Ainda não tem cadastro?{" "}
                  <a className="forgot__link" href="/signup">Criar conta</a>
                </p>
              </div>

              <p className="muted forgot__micro">
                * Por enquanto é só interface. A automação de email entra depois.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
