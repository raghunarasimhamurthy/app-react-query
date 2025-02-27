import React from 'react';
import Sendpost from './components/Sendpost';
import OptimisticPost from './components/OptimisticUpdates';

import './App.css';
import InfinitePosts from './components/InfiniteQuery';

function App() {
  return (
    <div className="App">
      <InfinitePosts />
    </div>
  );
}

export default App;
