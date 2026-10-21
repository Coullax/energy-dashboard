import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "SLSEA · Energy Intelligence",
  description:
    "Sri Lanka Energy Balance Dashboard. Interactive concept with synthetic demonstration data.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
