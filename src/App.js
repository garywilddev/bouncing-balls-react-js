import React from "react";
import Animation from "./Animation";
import CanvasComponent from "./CanvasComponent";
import logo from "./logo.svg";
import "./App.css";

const radius = 3;
const width = 600;
const height = 600;
const balls = [...Array(6)].map((val, index) => ({
  radius,
  rx: radius + Math.random() * (width - radius),
  ry: radius + Math.random() * (height - radius),
  vx: 3,
  vy: 4
}));

function App() {
  return (
    <div className="App">
      <Animation />
    </div>
  );
}

export default App;
