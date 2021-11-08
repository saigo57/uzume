import React from 'react';

import { ServerList } from "./serverList";
import { MainMenu } from "./mainMenu";
import { ContentsArea } from "./contentsArea";
import { Footer } from "./footer";

export function App() {
  return (
    <div className="container">
      <ServerList />
      <MainMenu />
      <div id="before-main" className="split-bar"></div>
      <ContentsArea />
      <Footer />
    </div>
  );
}
