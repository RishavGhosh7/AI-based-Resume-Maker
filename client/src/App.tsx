import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Resume Maker</h1>
        <p>Welcome to the AI-powered Resume Maker application!</p>
        <div className="status">
          <span className="status-indicator status-online"></span>
          <span>Application is running</span>
        </div>
      </header>
      <main className="App-main">
        <section className="feature-section">
          <h2>Features</h2>
          <ul>
            <li>AI-powered resume generation</li>
            <li>Multiple resume templates</li>
            <li>Real-time preview</li>
            <li>Export to multiple formats</li>
          </ul>
        </section>
        <section className="health-section">
          <h2>System Status</h2>
          <p>Backend API: <a href="/api/v1/health" target="_blank" rel="noopener noreferrer">/api/v1/health</a></p>
        </section>
      </main>
    </div>
  )
}

export default App