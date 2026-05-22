import { envoyerEmailReservation, envoyerEmailVendeur } from "../email";
import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

export default function DashboardEtudiant() {
  const [offres, setOffres] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [onglet, setOnglet] = useState("offres");
  const [nom, setNom] = useState("");
  const [recherche, setRecherche] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Charger l'utilisateur connecté une seule fois
  useEffect(() => {
    async function init() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        toast.error("Session expirée. Reconnecte-toi.");
        window.location.href = "/connexion";
        return;
      }
      setUserId(user.id);
    }
    init();
  }, []);

  // Charger les données quand userId est disponible
  useEffect(() => {
    if (!userId) return;
    chargerProfil();
    chargerReservations();
  }, [userId]);

  // Charger les offres dès le départ (pas besoin d'être connecté pour voir)
  useEffect(() => {
    chargerOffres();
  }, []);

  async function chargerProfil() {
    const { data, error } = await supabase
      .from("utilisateurs")
      .select("nom")
      .eq("id", userId)
      .single();
    if (error) console.error("Erreur profil:", error);
    if (data) setNom(data.nom);
  }

  async function chargerOffres() {
    const { data, error } = await supabase
      .from("offres")
      .select("*")
      .gt("quantite", 0)
      .order("created_at", { ascending: false });
    if (error) console.error("Erreur offres:", error);
    setOffres(data || []);
  }

  async function chargerReservations() {
    const { data, error } = await supabase
      .from("reservations")
      .select("*, offres(nom_plat, prix_normal, prix_reduit)")
      .eq("etudiant_id", userId)
      .order("created_at", { ascending: false });
    if (error) console.error("Erreur réservations:", error);
    setReservations(data || []);
  }

 async function reserver(offre) {
  if (!userId) return toast.error("Tu dois être connecté");

  const dejaReserve = reservations.some(r => r.offre_id === offre.id);
  if (dejaReserve) {
    toast.error("Tu as déjà réservé ce plat !");
    return;
  }

  setLoading(true);
  const code = "FS-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const { error } = await supabase.from("reservations").insert({
    etudiant_id: userId,
    offre_id: offre.id,
    code_retrait: code,
  });

  if (error) {
    toast.error("Erreur lors de la réservation : " + error.message);
  } else {
    await supabase.from("offres")
      .update({ quantite: offre.quantite - 1 })
      .eq("id", offre.id);

    toast.success("🎉 Réservé ! Ton code : " + code);

    // Récupérer les infos de l'étudiant et du vendeur
    const { data: etudiant } = await supabase
      .from("utilisateurs")
      .select("nom, email")
      .eq("id", userId)
      .single();

    const { data: vendeur } = await supabase
      .from("utilisateurs")
      .select("nom, email")
      .eq("id", offre.vendeur_id)
      .single();

    // Envoyer les emails
    if (etudiant) {
      await envoyerEmailReservation({
        emailEtudiant: etudiant.email,
        nomEtudiant: etudiant.nom,
        nomPlat: offre.nom_plat,
        codeRetrait: code,
        prixReduit: Number(offre.prix_reduit).toLocaleString("fr-FR"),
        heureLimit: offre.heure_limite,
      });
    }

    if (vendeur) {
      await envoyerEmailVendeur({
        emailVendeur: vendeur.email,
        nomVendeur: vendeur.nom,
        nomPlat: offre.nom_plat,
        nomEtudiant: etudiant?.nom || "Étudiant",
        codeRetrait: code,
        prixReduit: Number(offre.prix_reduit).toLocaleString("fr-FR"),
      });
    }

    await chargerOffres();
    await chargerReservations();
    setOnglet("reservations");
  }
  setLoading(false);
}

  async function deconnexion() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const offresFiltrees = offres.filter(o =>
    o.nom_plat.toLowerCase().includes(recherche.toLowerCase()) ||
    o.description?.toLowerCase().includes(recherche.toLowerCase())
  );

  const economiesTotales = reservations.reduce((acc, r) => {
    if (!r.offres) return acc;
    return acc + (Number(r.offres.prix_normal) - Number(r.offres.prix_reduit));
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-base">🍱</span>
            </div>
            <div>
              <span className="font-extrabold text-gray-800">
                FoodSave <span className="text-green-600">CI</span>
              </span>
              <span className="ml-2 text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">
                Étudiant
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{nom || "Étudiant"}</p>
              <p className="text-xs text-gray-400">{reservations.length} réservation(s)</p>
            </div>
            <button onClick={deconnexion}
              className="text-sm text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-2 rounded-xl transition-all">
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Offres disponibles", value: offres.length, icon: "🍽️", color: "bg-orange-50 text-orange-500" },
            { label: "Mes réservations", value: reservations.length, icon: "✅", color: "bg-green-50 text-green-600" },
            { label: "Économies réalisées", value: economiesTotales.toLocaleString("fr-FR") + " FCFA", icon: "💰", color: "bg-purple-50 text-purple-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

       <div className="flex gap-2 mb-6 flex-wrap">
  {[
    { id: "offres", label: "🍽️ Offres du jour" },
    { id: "reservations", label: "✅ Mes réservations" },
  ].map(o => (
    <button key={o.id} onClick={() => setOnglet(o.id)}
      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${onglet === o.id
        ? "bg-green-600 text-white shadow-md"
        : "bg-white text-gray-500 border border-gray-200 hover:border-green-300"}`}>
      {o.label}
    </button>
  ))}
  <a href="/carte"
    className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-white text-gray-500 border border-gray-200 hover:border-green-300 hover:text-green-600">
    🗺️ Carte
  </a>
</div>

        {/* ONGLET : OFFRES */}
        {onglet === "offres" && (
          <div>
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                placeholder="Rechercher un plat..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
              />
            </div>

            {offresFiltrees.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                <p className="text-5xl mb-4">🕐</p>
                <p className="text-gray-500 font-medium">Aucune offre disponible pour le moment</p>
                <p className="text-gray-400 text-sm mt-1">
                  Reviens plus tard, les vendeurs publient en fin de journée
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offresFiltrees.map(o => {
                  const red = Math.round((1 - o.prix_reduit / o.prix_normal) * 100);
                  const dejaReserve = reservations.some(r => r.offre_id === o.id);
                  return (
                    <div key={o.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg leading-tight">{o.nom_plat}</h3>
                          <p className="text-gray-400 text-sm mt-0.5">{o.description}</p>
                        </div>
                        <span className="ml-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0">
                          -{red}%
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-extrabold text-gray-800">
                          {Number(o.prix_reduit).toLocaleString("fr-FR")} FCFA
                        </span>
                        <span className="text-gray-300 line-through text-sm">
                          {Number(o.prix_normal).toLocaleString("fr-FR")} FCFA
                        </span>
                      </div>

                      <div className="flex gap-3 mb-4">
                        <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                          ⏰ Jusqu'à {o.heure_limite}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                          📦 {o.quantite} restant(s)
                        </span>
                      </div>

                      <button
                        onClick={() => reserver(o)}
                        disabled={loading || dejaReserve}
                        className={`w-full font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60 ${
                          dejaReserve
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white hover:shadow-lg"
                        }`}>
                        {dejaReserve ? "✅ Déjà réservé" : loading ? "Réservation..." : "Réserver ce repas →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ONGLET : MES RESERVATIONS */}
        {onglet === "reservations" && (
          <div>
            {reservations.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
                <p className="text-5xl mb-4">🛒</p>
                <p className="text-gray-500 font-medium">Aucune réservation pour l'instant</p>
                <button onClick={() => setOnglet("offres")}
                  className="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all">
                  Voir les offres disponibles
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {reservations.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">
                          {r.offres?.nom_plat || "Plat réservé"}
                        </p>
                        <p className="text-gray-400 text-sm mt-0.5">
                          {new Date(r.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </p>
                        {r.offres && (
                          <p className="text-xs text-green-600 font-semibold mt-1">
                            Économie : {(Number(r.offres.prix_normal) - Number(r.offres.prix_reduit)).toLocaleString("fr-FR")} FCFA
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Code de retrait</p>
                        <div className="bg-green-600 text-white font-bold px-4 py-2 rounded-xl text-sm tracking-widest">
                          {r.code_retrait}
                        </div>
                        {r.offres?.prix_reduit && (
                          <p className="text-gray-500 font-bold text-sm mt-1">
                            {Number(r.offres.prix_reduit).toLocaleString("fr-FR")} FCFA
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}