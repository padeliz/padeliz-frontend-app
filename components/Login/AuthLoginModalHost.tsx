/**
 * Renders the shared LoginModal from auth context.
 * Kept outside AuthProvider's module so LoginOptions → useAuth does not cycle
 * through a static LoginModal import in context/auth.tsx.
 */
import { useAuth } from '@/context/auth';
import LoginModal from '@/components/Login/LoginModal';

export default function AuthLoginModalHost() {
  const {
    loginModalVisible,
    loginModalReason,
    closeLoginModal,
  } = useAuth();

  const sessionCopy = loginModalReason === 'session';

  return (
    <LoginModal
      visible={loginModalVisible}
      onClose={closeLoginModal}
      title={sessionCopy ? 'Session expired' : undefined}
      subtitle={
        sessionCopy
          ? 'Sign in again to continue. You will stay on this screen after signing in.'
          : undefined
      }
    />
  );
}
