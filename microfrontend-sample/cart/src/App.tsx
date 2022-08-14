import React from 'react';
import ReactDOM from 'react-dom';
import faker from 'faker';

import './index.css';

const App = () => (
  <div className='cart-container'>
    <strong>Cart:</strong>
    <div>You have {faker.random.number(10)} items in the cart</div>
  </div>
);
ReactDOM.render(<App />, document.getElementById('cart-dev'));
