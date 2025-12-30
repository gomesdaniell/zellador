export default function LoginPage() {
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

      {/* Login body (novo bloco com padrão visual) */}
      <section className="login">
        <div className="container">
          <div className="login__card">
            <h1 className="login__title">Entrar</h1>
            <p className="login__sub muted">Acesse sua conta para continuar.</p>

            <form className="login__form">
              <div className="login__field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="seu@email.com" />
              </div>

              <div className="login__field">
                <label htmlFor="senha">Senha</label>
                <input id="senha" type="password" placeholder="••••••••" />
              </div>

              <div className="login__links">
                <a href="/esqueci-senha">Esqueci minha senha</a>
              </div>

              <button type="submit" className="btn btn--primary login__btnFull">
                Confirmar
              </button>

              <div className="login__footer">
                <a className="btn btn--ghost" href="/">Voltar</a>

                <p className="muted">
                  Ainda não tem cadastro? <a className="login__link" href="/signup">Criar conta</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
