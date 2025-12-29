export const metadata = {
  title: "Zellador",
  description: "Zellador - gestão simples para terreiros"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f3f4f6" }}>
        {children}
      </body>
    </html>
  );
}
