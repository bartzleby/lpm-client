import logo from './logo.svg';
import './App.css';
import PokerTable from './PokerTable';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Welcome to Live Poker Mate
        </a>
        <PokerTable />
      </header>
    </div>
  );
}

export default App;
