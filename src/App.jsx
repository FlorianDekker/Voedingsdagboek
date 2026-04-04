import { Routes, Route } from 'react-router-dom'
import { Component } from 'react'
import BottomNav from './components/layout/BottomNav'
import PageContainer from './components/layout/PageContainer'
import DagboekPage from './pages/DagboekPage'
import InvoerPage from './pages/InvoerPage'
import AnalysePage from './pages/AnalysePage'
import InstellingenPage from './pages/InstellingenPage'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ef4444' }}>Er ging iets mis</h2>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', color: '#666' }}>
            {this.state.error.message}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 10, padding: '8px 16px' }}>
            Herlaad
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen pb-24">
        <Routes>
          <Route path="/" element={<PageContainer title="Dagboek"><DagboekPage /></PageContainer>} />
          <Route path="/invoer" element={<PageContainer title="Invoer"><InvoerPage /></PageContainer>} />
          <Route path="/analyse" element={<PageContainer title="Analyse"><AnalysePage /></PageContainer>} />
          <Route path="/instellingen" element={<PageContainer title="Instellingen"><InstellingenPage /></PageContainer>} />
        </Routes>
        <BottomNav />
      </div>
    </ErrorBoundary>
  )
}

export default App
