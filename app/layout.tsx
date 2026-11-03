import type { Metadata } from 'next';
import './styles.css';
export const metadata: Metadata = {
  title: 'Autometa ? Admin console',
  description: 'Platform operations',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
