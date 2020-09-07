import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Register from './screens/Register';
import Activate from './screens/Activate';
import Login from './screens/Login';
import Forget from './screens/Forget';
import Reset from './screens/Reset';

ReactDOM.render(

  <BrowserRouter>
    <Switch>
      <Route exact path='/' component={App} />
      <Route exact path='/register' component={Register} />
      <Route exact path='/login' component={Login} />
      <Route exact path='/password/forget' component={Forget} />
      <Route exact path='/password/reset/:token' component={Reset} />



      <Route exact path='/users/activate/:token' component={Activate} />


    </Switch>
  </BrowserRouter>
  ,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
