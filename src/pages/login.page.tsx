
import { useLocation } from 'react-router-dom';
import { ReactComponent as GoogleLogo } from '../assets/google-icon-logo-svgrepo-com.svg';
import { getGoogleUrl } from '../utils/getGoogleUrl.ts';

const LoginPage = () => {
  const location = useLocation();
  let from = ((location.state as any)?.from?.pathname as string) || '/';

  return (
    <>
        <h2>
            Log in with Google
        </h2>
        <a href={getGoogleUrl(from)}>
            <GoogleLogo style={{ height: '2rem' }} />
            Google
        </a>
    </>
  );
};

export default LoginPage;