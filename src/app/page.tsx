'use client';

import { useState } from 'react';
import CollisionSystem from '../ui/CollisionSystem';
import './page.css';
import scenarii from '../scenarii';

const defaultScenarioId = 'nparticles';
const defaultParticlesNb = 20;

function App() {
  const [scenarioId, setScenarioId] = useState(defaultScenarioId);
  const [particlesNb, setParticlesNb] = useState(defaultParticlesNb);

  const handleSelectScenario = (id) => {
    setScenarioId(id);
  };
  const handleChangeParticlesNb = (nb) => {
    const parsed = parseInt(nb);
    if (!isNaN(parsed)) {
      setParticlesNb(parsed);
    }
  };

  const scenario = scenarii[scenarioId];

  return (
    <div className="App">
      <h1>Scenario</h1>
      <label htmlFor="scenario-select">Choose a scenario:</label>
      <select
        name="scenarii"
        id="scenario-select"
        onChange={(e) => {
          handleSelectScenario(e.target.value);
        }}
        defaultValue={defaultScenarioId}
      >
        {Object.keys(scenarii).map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <h2>Description</h2>
      <p>{scenario.description}</p>
      <h2>Parameters</h2>
      <label htmlFor="particlesNb">Number of particles (2-50):</label>
      <input
        disabled={!scenario.parameters?.includes('particlesNb')}
        defaultValue={defaultParticlesNb}
        type="number"
        id="particlesNb"
        name="particlesNb"
        min="2"
        max="50"
        onChange={(e) => {
          handleChangeParticlesNb(e.target.value);
        }}
      />
      <CollisionSystem scenario={scenario} particlesNb={particlesNb} />
      <p>
        Adapted by <a href="https://garysauvage.com">Gary Sauvage</a> from{' '}
        <a href="https://algs4.cs.princeton.edu/61event/">
          the Event-Driven Simulation course
        </a>{' '}
        from Robert Sedgewick and Kevin Wayne. This course is part of{' '}
        <a href="https://algs4.cs.princeton.edu/home/">
          a great Princeton series of lectures on algorithms
        </a>
        .
      </p>
    </div>
  );
}

export default App;
