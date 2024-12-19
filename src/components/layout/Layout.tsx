import { ReactNode } from 'react';
import { Container } from './Container';
import { Logo } from './Logo';
import { ThemeToggle } from '../ThemeToggle';
import { BottomNav } from '../navigation/BottomNav';
import { ProfileHeader } from './ProfileHeader';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Container>
      <ThemeToggle />
      <Logo />
      <ProfileHeader />
      {children}
      <BottomNav />
    </Container>
  );
}