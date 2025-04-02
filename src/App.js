import './App.css';
import AssignRoles from './AssignRoles';
import Home from './Home';
import AddMed from './AddMed';
import Supply from './Supply'
import Track from './Track'
import GenerateQR from './GenerateQr';
import callFunction from './CallFunction';
import ScanQr from './ScanQr';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/roles" component={AssignRoles} />
          <Route path="/addmed" component={AddMed} />
          <Route path="/supply" component={Supply} />
          <Route path="/track" component={Track} />
          <Route path="/generateqr" component={GenerateQR} />
          <Route path="/call-function" component={callFunction} />
          <Route path="/scanqr" component={ScanQr} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
