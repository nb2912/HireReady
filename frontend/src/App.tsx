import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Auth from './components/Auth';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { auth } from './firebase';
import { User } from 'firebase/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <Auth />
      <Container className="mt-5">
        {user ? (
          <Row className="justify-content-center">
            <Col md={8}>
              <Card className="shadow-sm border-0 bg-light p-4 text-center">
                <Card.Body>
                  <h1 className="display-5 mb-3">Hello, {user.displayName || 'User'}! 👋</h1>
                  <p className="lead text-muted mb-4">
                    Welcome to your HireReady Dashboard. You are successfully authenticated.
                  </p>
                  <div className="d-grid gap-2 d-md-block">
                    <Button variant="primary" size="lg" className="px-4 me-md-2">
                      Start New Interview
                    </Button>
                    <Button variant="outline-secondary" size="lg" className="px-4">
                      View History
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row className="justify-content-center text-center">
            <Col md={8}>
              <h1 className="display-4 fw-bold mb-4">Master Your Next Interview</h1>
              <p className="lead mb-5 text-secondary">
                HireReady helps you prepare for technical and behavioral interviews with AI-powered feedback.
              </p>
              <Card className="border-0 shadow-lg p-5 rounded-4">
                <h3 className="mb-3">Ready to begin?</h3>
                <p className="text-muted">Please sign in using the button in the top right corner to access your dashboard.</p>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}

export default App;
