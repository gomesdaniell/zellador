import Link from "next/link";

export default function SettingsHome() {
  return (
    <div className="page">
      <div className="pageHeader">
        <h1>Configurações</h1>
        <p>Ajustes gerais do sistema e da sua casa.</p>
      </div>

      <div className="grid2">
        <Link className="cardLink" href="/settings/onboarding">
          <div className="cardLink__icon">🧾</div>
          <div>
            <strong>Onboarding</strong>
            <div className="muted">
              Regras da casa, LGPD e contrato (opcional) antes do aceite final.
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

