import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/providers/auth-provider";

export default function Admin() {
  const [, navigate] = useLocation();
  const { isLoggedIn, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return null;
  }

  // Render the existing admin content here
  return (
    // Your existing admin page content
  );
}
