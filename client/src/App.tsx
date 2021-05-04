import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';

const Home = loadable(() => import('@pages/Home'));
const SignUp = loadable(() => import('@pages/SignUp'));

const App: FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/signup" component={SignUp} />
    </Switch>
  );
};

export default App;
