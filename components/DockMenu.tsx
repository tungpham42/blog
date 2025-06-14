"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Modal, Button, Spinner, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faHome,
  faPlus,
  faSignInAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./DockMenu.css";

interface DockIconProps {
  key: string;
  icon: IconDefinition;
  path?: string;
  action?: () => void;
  isActive?: boolean;
}

const DockIconComponent: React.FC<DockIconProps> = ({
  icon,
  path,
  action,
  isActive,
}) => (
  <li className="dock-item">
    {action ? (
      <div onClick={action} className={`dock-icon ${isActive ? "active" : ""}`}>
        <FontAwesomeIcon icon={icon} size="lg" />
      </div>
    ) : (
      <Link href={path!} className="dock-icon-link">
        <div className={`dock-icon ${isActive ? "active" : ""}`}>
          <FontAwesomeIcon icon={icon} size="lg" />
        </div>
      </Link>
    )}
  </li>
);

interface LogoutModalProps {
  show: boolean;
  onHide: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  show,
  onHide,
  onLogout,
  loggingOut,
}) => (
  <Modal show={show} onHide={onHide} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirm Logout</Modal.Title>
    </Modal.Header>
    <Modal.Body>Are you sure you want to log out?</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onLogout} disabled={loggingOut}>
        {loggingOut ? <Spinner animation="border" size="sm" /> : "Logout"}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default function DockMenu() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut(auth); // Use Firebase signOut
      setShowLogoutModal(false);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }, []);

  return (
    <Container fluid className="position-relative">
      <div className="dock-bar">
        <ul className="dock-list">
          <DockIconComponent
            key="home"
            icon={faHome}
            path="/"
            isActive={pathname === "/"}
          />
          {user ? (
            <>
              <DockIconComponent
                key="create"
                icon={faPlus}
                path="/create"
                isActive={pathname === "/create"}
              />
              <DockIconComponent
                key="chat"
                icon={faComments}
                path="/chat"
                isActive={pathname === "/chat"}
              />
              <DockIconComponent
                key="logout"
                icon={faSignOutAlt}
                action={handleLogout}
              />
            </>
          ) : (
            <DockIconComponent
              key="login"
              icon={faSignInAlt}
              path="/login"
              isActive={pathname === "/login"}
            />
          )}
        </ul>
      </div>
      <LogoutModal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
    </Container>
  );
}
