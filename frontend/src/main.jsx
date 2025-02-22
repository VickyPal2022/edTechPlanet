import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51QqSnzENzykHwBPBF2gUYhEYrXe1IH6STMZB7ZnotyqR23sARen3pCXr79NhXIbk7YGC7Q81d4lbQZGbRc896vbl00Rb4JjkIX"
);


createRoot(document.getElementById('root')).render(
  
  <Elements stripe={stripePromise}>
    <HashRouter>
      <App />
    </HashRouter>
  </Elements>
 
)
