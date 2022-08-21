import React from 'react';
import ReactDOM from 'react-dom';
import 'products/ProductsIndex';
import 'cart/CartIndex';

import './index.css';

const App = () => (
  <div className='container'>
    <strong>Host</strong>
    <div id='products-dev'></div>
    <div id='cart-dev'></div>
  </div>
);

ReactDOM.render(<App />, document.getElementById('container'));
