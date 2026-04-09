import { Navigate } from 'react-router-dom';

export default function WithdrawalPage() {
  return <Navigate to="/account?tab=withdrawal" replace />;
}
