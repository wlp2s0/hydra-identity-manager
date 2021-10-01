import { useCallback, useEffect,useState } from 'react';
import './App.css';
import axios from "axios";
function App() {
    const [isLogged, setLogged] = useState(false);

  const handleAuth = useCallback(async () => {
    try {
      await axios.get("http://localhost:8001/auth/am-i-auth");
      setLogged(true);
    } catch (error) {
      console.error(error);
      window.location.href = 'http://localhost:8001/auth/login';
    }
  }, []);

  useEffect(() => {
    handleAuth();
  }, [handleAuth]);

  return (
    <div>
     isLogged: {String(isLogged)}
    </div>
  );
}

export default App;
