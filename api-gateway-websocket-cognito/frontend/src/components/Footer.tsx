import { Typography } from '@mui/material';

import '../index.css';

const Footer: React.FC = () => {
  return (
    <footer className='footer'>
      <Typography variant='body1'>For demonstration purposes only</Typography>
      <Typography variant='body2' sx={{ mt: 1 }}>{`${new Date().getFullYear()} | Powered by Amazon Web Services`}</Typography>
    </footer>
  );
};

export default Footer;
