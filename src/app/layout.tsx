import { AuthSessionBootstrap } from "@/components/auth/auth-session-bootstrap";
import { Provider } from "@/components/ui/provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fleet Manager",
  description: "Fleet Manager demo with server-backed auth session",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <Provider>
          <AuthSessionBootstrap />
          {children}
        </Provider>
      </body>
    </html>
  );
}
