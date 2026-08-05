import { NextPageContext } from 'next';
import Link from 'next/link';
import Image from 'next/image';
// import Logo from '@/app/assets/images/Screenshot 2025-01-11 090739.png'

function NotFound() {
  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center'>
      <div className='flex flex-col items-center gap-3 p-4'>
        {/* <Image src={Logo} alt='Intuitionlabs logo' className='md:w-80 md:h-20 w-36 h-12'/> */}
        <div className='flex flex-col items-center gap-1 text-center'>
          <h1>404 - Page Not Found</h1>
          <p>Oops! The page you are looking for does not exist.</p>
          <Link href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}> Go back to the homepage</Link>
        </div>
      </div>
    </div>
  );
}

// Optional: Set custom status code
NotFound.getInitialProps = ({ res }: NextPageContext) => {
  if (res) {
    res.statusCode = 404;
  }
  return {};
};
export default NotFound;
