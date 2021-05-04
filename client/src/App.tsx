import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';

const Home = loadable(() => import('@pages/Home'));

const App: FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
    </Switch>
  );
};

export default App;
