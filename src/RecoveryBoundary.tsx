import { Component, type ReactNode } from "react";
export class RecoveryBoundary extends Component<
  { children: ReactNode },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  componentDidMount() {
    window.addEventListener("keydown", this.recover);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.recover);
  }
  recover = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.state.error)
      this.setState({ error: "" });
  };
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="recovery-screen">
        <h1>The preview stopped</h1>
        <p>
          Your saved project stays on this browser. Return to the editor to
          check the last change.
        </p>
        <pre>{this.state.error}</pre>
        <button onClick={() => this.setState({ error: "" })}>
          Return to editor
        </button>
        <p>Or press Escape.</p>
      </main>
    );
  }
}
