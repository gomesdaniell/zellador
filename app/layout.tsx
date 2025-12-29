import "./globals.css";

export const metadata = {
  title: "Zellador — Gestão inteligente para terreiros",
  description: "Plataforma online para centralizar cadastros, calendário, giras, financeiro e biblioteca do terreiro.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
