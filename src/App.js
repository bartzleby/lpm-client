import logo from './logo.svg';
import './App.css';
import PokerTable from './PokerTable';
import ActionBar from './ActionBar';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <PokerTable />
        <ActionBar />
      </header>
    </div>
  );
}

export default App;
