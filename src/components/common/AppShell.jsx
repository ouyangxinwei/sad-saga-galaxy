import StarField from './StarField';
import BottomNav from './BottomNav';

export default function AppShell({ children, hideNav = false }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarField />
      <div className="relative z-10">{children}</div>
      {hideNav ? null : <BottomNav />}
    </div>
  );
}