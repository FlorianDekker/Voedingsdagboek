import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import PageContainer from './components/layout/PageContainer'
import DagboekPage from './pages/DagboekPage'
import InvoerPage from './pages/InvoerPage'
import AnalysePage from './pages/AnalysePage'
import InstellingenPage from './pages/InstellingenPage'

function App() {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Routes>
        <Route path="/" element={<PageContainer title="Dagboek"><DagboekPage /></PageContainer>} />
        <Route path="/invoer" element={<PageContainer title="Invoer"><InvoerPage /></PageContainer>} />
        <Route path="/analyse" element={<PageContainer title="Analyse"><AnalysePage /></PageContainer>} />
        <Route path="/instellingen" element={<PageContainer title="Instellingen"><InstellingenPage /></PageContainer>} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default App
