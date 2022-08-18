import React from 'react';
import ReactDOM from 'react-dom';
import { faker } from '@faker-js/faker';

import './index.css';

const App = () => (
  <div className='cart-container'>
    <strong>Cart:</strong>
    <div>You have {faker.datatype.number(5)} items in the cart</div>
  </div>
);
ReactDOM.render(<App />, document.getElementById('cart-dev'));
