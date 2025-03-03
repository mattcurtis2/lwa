
import { useLocation } from "wouter";

export function NavigationExample() {
  // useLocation returns a tuple: [currentLocation, navigateFunction]
  const [location, navigate] = useLocation();
  
  return (
    <div>
      <p>Current location: {location}</p>
      <button onClick={() => navigate("/dogs")}>Go to Dogs</button>
      <button onClick={() => navigate("/admin")}>Go to Admin</button>
    </div>
  );
}
