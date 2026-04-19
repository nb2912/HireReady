import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Auth from './components/Auth';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <Auth />
      <Container className="mt-4">
        <h1>Welcome to HireReady Dashboard</h1>
        <p>This is your main dashboard content. Please sign in to access more features.</p>
      </Container>
    </div>
  );
}

export default App;
