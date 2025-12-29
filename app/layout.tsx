import "/styles/globals.css";

export const metadata = {
  title: "Zellador",
  description: "Gestão simples e organizada para terreiros e casas de fé.",
  metadataBase: new URL("https://zellador.com.br"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
