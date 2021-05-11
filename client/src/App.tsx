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
const RoomsList = loadable(() => import('@pages/RoomsList'));
const Room = loadable(() => import('@pages/Room'));

const App: FC = () => {
  return (
    <>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/signup" component={SignUp} />
        <Route exact path="/upload" component={Upload} />
        <Route exact path="/post/:postId" component={Post} />
        <Route exact path="/post/:postId/update" component={Update} />
        <Route exact path={['/search', '/search/:nickname']} component={Search} />
        <Route exact path={'/room'} component={RoomsList} />
        <Route exact path={'/room/:roomId'} component={Room} />
      </Switch>
      <Header />
      <Global styles={globalStyle} />
    </>
  );
};

const globalStyle = css`
  html,
  body,
  #root {
    min-height: 100vh;
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
    font-family: 'Noto Sans KR', sans-serif;
    display: flex;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.1);
  }
  #root {
    width: 1280px;
    background-color: white;
    padding-bottom: 3rem;
  }
`;

export default App;
