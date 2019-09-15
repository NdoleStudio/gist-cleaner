import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import Dashboard from './pages/Dashboard';
import * as serviceWorker from './serviceWorker';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import LandingPage from "./pages/LandingPage";
import Notfound from "./pages/404";


const routing = (
  <Router>
    <div>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route component={Notfound} />
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
