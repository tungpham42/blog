"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faHome,
  faSignInAlt,
  faSignOutAlt,
  faPencil,
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "@/styles/dock.css";

const ADMIN_EMAILS = ["tung.42@gmail.com"];

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
    <Modal.Header closeButton className="border-0">
      <Modal.Title className="text-center w-100">Confirm Logout</Modal.Title>
    </Modal.Header>
    <Modal.Body className="text-center">
      Are you sure you want to log out?
    </Modal.Body>
    <Modal.Footer className="border-0 justify-content-center">
      <Button variant="secondary" onClick={onHide} className="btn">
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={onLogout}
        disabled={loggingOut}
        className="btn btn-primary"
      >
        {loggingOut ? <Spinner animation="border" size="sm" /> : "Logout"}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default function DockMenu() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setIsAdmin(ADMIN_EMAILS.includes(user.email.toLowerCase()));
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      setShowLogoutModal(false);
      console.log("User logged out");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoggingOut(false);
    }
  }, []);

  const isEditRoute = pathname.startsWith("/post/");

  const createEditIconProps = isEditRoute
    ? {
        key: "edit",
        icon: faPencil,
        path: pathname.replace("/post/", "/edit/"),
        isActive: pathname.startsWith("/post/"),
      }
    : {
        key: "create",
        icon: faCirclePlus,
        path: "/create",
        isActive: pathname === "/create",
      };

  return (
    <div className="position-relative">
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
              {isAdmin && <DockIconComponent {...createEditIconProps} />}
              <DockIconComponent
                key="chat"
                icon={faComments}
                path="/chat"
                isActive={pathname === "/chat"}
              />
              <DockIconComponent
                key="logout"
                icon={faSignOutAlt}
                action={() => setShowLogoutModal(true)}
              />
            </>
          ) : (
            <>
              <DockIconComponent
                key="chat"
                icon={faComments}
                path="/chat"
                isActive={pathname === "/chat"}
              />
              <DockIconComponent
                key="login"
                icon={faSignInAlt}
                path="/login"
                isActive={pathname === "/login"}
              />
            </>
          )}
        </ul>
      </div>
      <LogoutModal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />
    </div>
  );
}
