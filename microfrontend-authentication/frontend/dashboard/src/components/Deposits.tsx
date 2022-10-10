import React from 'react';
import Link from '@mui/material/Link';
import { makeStyles } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Title from './Title';

function preventDefault(event: any) {
  event.preventDefault();
}

export default function Deposits() {
  return (
    <React.Fragment>
      <Title>Recent Deposits</Title>
      <Typography component='p' variant='h4'>
        $3,024.00
      </Typography>
      <Typography color='textSecondary' sx={{ flex: 1 }}>
        on 15 March, 2019
      </Typography>
      <div>
        <Link color='primary' href='#' onClick={preventDefault}>
          View balance
        </Link>
      </div>
    </React.Fragment>
  );
}
