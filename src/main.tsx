import { StrictMode, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PlayerProvider } from "./state/PlayerContext";
import "./styles/index.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div className="fatal-error">
          <h1>A little turbulence in the void.</h1>
          <p>
            Your saved progress is still in this browser. Reload to continue.
          </p>
          <button className="primary" onClick={() => location.reload()}>
            Reload LUCKYVOID
          </button>
        </div>
      );
    return this.props.children;
  }
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <PlayerProvider>
        <App />
      </PlayerProvider>
    </ErrorBoundary>
  </StrictMode>,
);
