import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Home from './Home';
import Detail from './Detail';
import Wall from './Wall';
import Anon from './Anon';

function HeadFoot() {
  return (
    <>
      <a className="pointer toTop"></a>
      <a className="pointer triLeft modoruB"></a>
      <a href='/' className="pointer">BottomSlum</a>
      <a className="pointer triRight susumuB"></a>
      <a className="pointer postBtn"><b>+</b></a>
    </>
  )
}

const App = () => {
  return (
    <div>
      <Router>
      <header>
        <div className="header flexNormal spBw">
          <HeadFoot />
        </div>
      </header>
      <main>
        <div className="compoS">
          <div className="topImage">
            <img src="/static/image/kilroy.png" />
          </div>
        <Route exact path='/' component={Home}/>
        <Route path='/wall/:slug_name' render={props => <Wall key={props.match.params.slug_name} /> } />
        <Route path='/detail/:id' render={props => <Detail key={props.match.params.id} /> } />
        <Route path='/anonymous/:aid' render={props => <Anon key={props.match.params.aid} />} />
        </div>
      </main>
      <hooter>
        <div className="footerStick spBw">
          <HeadFoot />
        </div>
      </hooter>
      </Router>
    </div>
  );
};
export default App;
ReactDOM.render(<App />, document.getElementById("app"));