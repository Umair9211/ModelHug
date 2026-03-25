
import "./globals.css";



export const metadata = {
  title: "Model Hug",
  description: "Model Hug",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body>{children}</body>
    </html>
  );
}
