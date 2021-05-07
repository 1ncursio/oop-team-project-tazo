import React, { FC } from 'react';
import { Route, Switch } from 'react-router-dom';
import loadable from '@loadable/component';
import Header from '@components/Header';
import { css, Global } from '@emotion/react';

const Home = loadable(() => import('@pages/Home'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Upload = loadable(() => import('@pages/Upload'));
const Post = loadable(() => import('@pages/Post'));
const Update = loadable(() => import('@pages/Update'));
const Search = loadable(() => import('@pages/Search'));

const App: FC = () => {
  return (
    <>
      <Header />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/upload" component={Upload} />
        <Route exact path="/post/:postId" component={Post} />
        <Route exact path="/post/:postId/update" component={Update} />
        <Route exact path={['/search', '/search/:nickname']} component={Search} />
      </Switch>
      <Global styles={globalStyle} />
    </>
  );
};

const globalStyle = css`
  html,
  body,
  #root {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  html {
    box-sizing: border-box;

    * {
      box-sizing: inherit;
    }
  }
  body {
    display: flex;
    justify-content: center;
  }
  #root {
    width: 1280px;
  }
`;

export default App;
