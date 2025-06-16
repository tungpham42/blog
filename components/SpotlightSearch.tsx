"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Post } from "@/lib/types";
import { Container, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface SpotlightSearchProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SpotlightSearch: React.FC<SpotlightSearchProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch all posts on component mount
  const fetchPosts = useCallback(async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching posts for search:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPosts();
      // Focus the input when isOpen changes to true
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, fetchPosts]);

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = posts.filter(
      (post) =>
        post.title?.toLowerCase().includes(lowerQuery) ||
        (typeof post.content === "string" &&
          post.content.toLowerCase().includes(lowerQuery))
    );
    setFilteredPosts(filtered.slice(0, 5)); // Limit to 5 results for performance
  }, [searchQuery, posts]);

  // Handle Esc key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Close search on click outside
  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    },
    [setIsOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="spotlight-search position-absolute top-50 start-50 translate-middle w-100"
      style={{ maxWidth: "600px", zIndex: 1050 }}
    >
      <Container className="py-3">
        <div className="liquid-glass-card">
          <div className="input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={handleInputChange}
            />
          </div>

          {searchQuery.trim() && filteredPosts.length > 0 && (
            <ListGroup className="mt-2">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/post/${post.slug}`} passHref>
                  <ListGroup.Item
                    action
                    className="liquid-glass-card list-group-item"
                    onClick={() => setIsOpen(false)}
                  >
                    {post.title}
                  </ListGroup.Item>
                </Link>
              ))}
            </ListGroup>
          )}
          {searchQuery.trim() && filteredPosts.length === 0 && (
            <div className="text-center text-muted p-3">
              No results found for &lsquo;{searchQuery}&rsquo;
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default SpotlightSearch;
