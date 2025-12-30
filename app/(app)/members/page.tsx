import Link from "next/link";

export default function MembersHome() {
  return (
    <div className="page">
      <div className="pageHeader">
        <h1>Membros</h1>
        <p>Gerencie Médiuns e Consulentes do terreiro.</p>
      </div>

      <div className="grid2">
        <Link className="cardLink" href="/members/mediuns">
          <div className="cardLink__icon">🧑‍🦳</div>
          <div>
            <strong>Médiuns</strong>
            <div className="muted">Cadastros, status, contatos e filtros.</div>
          </div>
        </Link>

        <Link className="cardLink" href="/members/consulentes">
          <div className="cardLink__icon">🪪</div>
          <div>
            <strong>Consulentes</strong>
            <div className="muted">Cadastros e histórico de atendimento.</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
