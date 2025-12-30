export default function OnboardingPlaceholder({ params }: { params: { token: string } }) {
  return (
    <div style={{ padding: 40 }}>
      <h1>Onboarding em construção</h1>
      <p>Token recebido:</p>
      <pre>{params.token}</pre>
      <p>Esta tela será usada para o cadastro do membro.</p>
    </div>
  );
}
