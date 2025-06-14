"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { Modal, Button, Spinner, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faEdit,
  faPlus,
  faSignInAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "./DockMenu.css";

interface DockItem {
  key: string;
  icon: IconDefinition;
  label: string;
  path?: string;
  requiresLogin: boolean;
  action?: () => void;
}

const STORAGE_KEY = "dockItemsOrder";

const defaultItems: DockItem[] = [
  { key: "home", icon: faHome, label: "Home", path: "/", requiresLogin: false },
  {
    key: "edit",
    icon: faEdit,
    label: "Edit",
    path: "/edit",
    requiresLogin: true,
  },
  {
    key: "create",
    icon: faPlus,
    label: "Create",
    path: "/create",
    requiresLogin: true,
  },
  {
    key: "login",
    icon: faSignInAlt,
    label: "Login",
    path: "/login",
    requiresLogin: false,
  },
  { key: "logout", icon: faSignOutAlt, label: "Logout", requiresLogin: true },
];

interface DockItemProps {
  item: DockItem;
  isActive: boolean;
  isDragged: boolean;
  isDragOver: boolean;
  onDragStart: (key: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  index: number;
}

const DockItemComponent: React.FC<DockItemProps> = ({
  item,
  isActive,
  isDragged,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => (
  <li
    className={`dock-item ${isDragged ? "dragged" : ""} ${
      isDragOver ? "drag-over" : ""
    }`}
    draggable
    onDragStart={() => onDragStart(item.key)}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onDragEnd={onDragEnd}
  >
    {item.action ? (
      <div
        onClick={item.action}
        className={`dock-icon ${isActive ? "active" : ""}`}
      >
        <FontAwesomeIcon icon={item.icon} size="lg" />
      </div>
    ) : (
      <Link href={item.path!} className="dock-icon-link">
        <div className={`dock-icon ${isActive ? "active" : ""}`}>
          <FontAwesomeIcon icon={item.icon} size="lg" />
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
  const [dockItems, setDockItems] = useState<DockItem[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const filteredItems = useMemo(() => {
    return defaultItems
      .filter((item) => {
        if (item.key === "home") return true;
        return item.requiresLogin === !!user;
      })
      .map((item) => {
        // Attach logout action if necessary
        if (item.key === "logout") {
          return {
            ...item,
            action: () => setShowLogoutModal(true),
          };
        }
        return item;
      });
  }, [user]);

  useEffect(() => {
    try {
      const storedOrder = localStorage.getItem(STORAGE_KEY);
      if (storedOrder) {
        const keys = JSON.parse(storedOrder) as string[];
        const ordered = keys
          .map((key) => filteredItems.find((item) => item.key === key))
          .filter((item): item is DockItem => !!item);
        setDockItems(ordered.length ? ordered : filteredItems);
      } else {
        setDockItems(filteredItems);
      }
    } catch (error) {
      console.error("Error loading dock items order:", error);
      setDockItems(filteredItems);
    }
  }, [filteredItems]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(dockItems.map((i) => i.key))
      );
    } catch (error) {
      console.error("Error saving dock items order:", error);
    }
  }, [dockItems]);

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

  const handleDragStart = useCallback((key: string) => {
    setDraggedItem(key);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, key: string) => {
      e.preventDefault();
      if (draggedItem !== key) {
        setDragOverItem(key);
      }
    },
    [draggedItem]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropKey: string) => {
      e.preventDefault();
      if (!draggedItem || draggedItem === dropKey) {
        setDraggedItem(null);
        setDragOverItem(null);
        return;
      }

      const draggedIndex = dockItems.findIndex(
        (item) => item.key === draggedItem
      );
      const dropIndex = dockItems.findIndex((item) => item.key === dropKey);

      if (draggedIndex === -1 || dropIndex === -1) return;

      const newItems = [...dockItems];
      const [removed] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, removed);

      setDockItems(newItems);
      setDraggedItem(null);
      setDragOverItem(null);
    },
    [dockItems, draggedItem]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
  }, []);

  return (
    <Container fluid className="position-relative">
      <div className="dock-bar">
        <ul className="dock-list">
          {dockItems.map((item, index) => (
            <DockItemComponent
              key={item.key}
              item={item}
              isActive={!!item.path && pathname === item.path}
              isDragged={draggedItem === item.key}
              isDragOver={dragOverItem === item.key}
              onDragStart={handleDragStart}
              onDragOver={(e) => handleDragOver(e, item.key)}
              onDrop={(e) => handleDrop(e, item.key)}
              onDragEnd={handleDragEnd}
              index={index}
            />
          ))}
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
