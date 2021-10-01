import { useEffect,useState } from 'react';
import './App.css';
import axios from "axios";
function App() {
    const [isLogged, setLogged] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8001/auth/am-i-auth')
      .then(function (response) {
        if (!response.data?.user) {
          axios.get('http://localhost:8001/auth/login');
      } else {
        setLogged(true)
      }
  })
  }, [])
  return (
    <div>
     isLogged:{isLogged}
    </div>
  );
}

export default App;
