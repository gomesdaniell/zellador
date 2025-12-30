export default function LoginPage() {
  return (
    <main className="auth">
      <div className="auth__card">
        {/* Brand */}
        <div className="auth__brand">
          <div className="brand__logo" aria-hidden>⟡</div>
          <div className="brand__text">
            <strong>Zellador</strong>
            <span>Gestão inteligente para terreiros</span>
          </div>
        </div>

        {/* Title */}
        <h1>Entrar</h1>
        <p className="muted">
          Acesse sua conta para continuar.
        </p>

        {/* Form */}
        <form className="auth__form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
            />
          </div>

          <div className="auth__links">
            <a href="/esqueci-senha">Esqueci minha senha</a>
          </div>

          <button type="submit" className="btn btn--primary btn--block">
            Confirmar
          </button>
        </form>

        {/* Footer actions */}
        <div className="auth__footer">
          <a className="btn btn--ghost" href="/">
            Voltar
          </a>

          <p className="muted">
            Ainda não tem cadastro?{" "}
            <a href="/login?mode=signup">Criar conta</a>
          </p>
        </div>
      </div>
    </main>
  );
}
