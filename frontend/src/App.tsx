import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ResultPage from './pages/ResultPage';
import History from './pages/History';
export default function App() {
  return (
    <div className="min-h-screen bg-bg text-slate-100">
      <Navbar />
      <main className="pb-24 sm:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-bg/95 backdrop-blur z-40">
        <div className="grid grid-cols-4 text-xs">
          <a href="/" className="py-3 text-center text-slate-300">Home</a>
          <a href="/" className="py-3 text-center text-slate-300">Scan</a>
          <a href="/history" className="py-3 text-center text-slate-300">History</a>
          <a href="/" className="py-3 text-center text-slate-300">About</a>
        </div>
      </nav>
    </div>
  );
}
