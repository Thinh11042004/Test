import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import People from './pages/People'
import Recruiting from './pages/Recruiting'
import Learning from './pages/Learning'
import Layout from './components/Layout'
import './styles/globals.css'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/people" element={<People />} />
          <Route path="/recruiting" element={<Recruiting />} />
          <Route path="/learning" element={<Learning />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App