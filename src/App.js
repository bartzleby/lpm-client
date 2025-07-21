import './App.css';
import { Routes, Route } from 'react-router-dom';
import PokerTable from './components/PokerTable';
import LoginPage from './pages/login.page.tsx';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PokerTable />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;