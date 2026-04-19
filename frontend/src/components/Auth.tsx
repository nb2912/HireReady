// src/components/Auth.tsx
import React, { useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { Button, Container, Navbar } from 'react-bootstrap';

const Auth: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">HireReady Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          {
            user ? (
              <>
                <Navbar.Text className="me-3">
                  Signed in as: {user.displayName || user.email}
                </Navbar.Text>
                <Button variant="outline-danger" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline-success" onClick={handleSignIn}>
                Sign In with Google
              </Button>
            )
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Auth;
