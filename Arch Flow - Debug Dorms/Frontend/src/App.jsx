import { Routes, Route } from 'react-router-dom'
import HomePage from './HomePage'
import AnalysisPage from './AnalysisPage'

import { ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'

function App() {
  return (
    <ReactFlowProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Routes>
    </ReactFlowProvider>
  )
}

export default App
