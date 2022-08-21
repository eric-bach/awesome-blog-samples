import React from 'react';
import ReactDOM from 'react-dom';
import { faker } from '@faker-js/faker';

import './index.css';

let products: any = [];
for (let i = 0; i < 5; i++) {
  const name = faker.commerce.productName();
  products.push(name);
}

const App = () => (
  <div className='products-container'>
    <strong>Products:</strong>
    {products.map((p) => {
      return <div key={p}>{p}</div>;
    })}
  </div>
);

ReactDOM.render(<App />, document.getElementById('products-dev'));
