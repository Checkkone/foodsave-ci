import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Accueil from "./pages/Accueil";
import Inscription from "./pages/Inscription";
import Connexion from "./pages/Connexion";
import DashboardVendeur from "./pages/DashboardVendeur";
import DashboardEtudiant from "./pages/DashboardEtudiant";
import Chatbot from "./pages/Chatbot";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Chatbot />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/vendeur" element={<DashboardVendeur />} />
        <Route path="/etudiant" element={<DashboardEtudiant />} />
      </Routes>
    </BrowserRouter>
  );
}