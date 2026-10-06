import React from "react";
import Routes from "./Routes";
import { IntegrationProvider } from "./contexts/IntegrationContext";

function App() {
  return (
    <IntegrationProvider>
      <Routes />
    </IntegrationProvider>
  );
}

export default App;
