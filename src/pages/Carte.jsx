import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { supabase } from "../supabase";
import toast from "react-hot-toast";

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const iconeOffre = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconeUtilisateur = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function CentrerCarte({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position]);
  return null;
}

export default function Carte() {
  const [offres, setOffres] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const centreAbidjan = [5.3599517, -4.0082563];

  useEffect(() => {
    chargerOffres();
    obtenirPosition();
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    }
    getUser();
  }, []);

  async function chargerOffres() {
    const { data } = await supabase
      .from("offres")
      .select("*")
      .gt("quantite", 0)
      .not("latitude", "is", null)
      .order("created_at", { ascending: false });
    setOffres(data || []);
  }

  function obtenirPosition() {
    if (!navigator.geolocation) {
      setPositionUtilisateur(centreAbidjan);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => setPositionUtilisateur([pos.coords.latitude, pos.coords.longitude]),
      () => setPositionUtilisateur(centreAbidjan)
    );
  }

  async function reserver(offre) {
    if (!userId) {
      toast.error("Tu dois être connecté pour réserver");
      window.location.href = "/connexion";
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
      toast.error("Erreur lors de la réservation");
    } else {
      await supabase.from("offres")
        .update({ quantite: offre.quantite - 1 })
        .eq("id", offre.id);
      toast.success("🎉 Réservé ! Ton code : " + code);
      chargerOffres();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white">🍱</span>
            </div>
            <span className="font-extrabold text-gray-800">
              FoodSave <span className="text-green-600">CI</span>
            </span>
          </div>
          <a href="/etudiant"
            className="text-sm text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-300 px-3 py-2 rounded-xl transition-all">
            ← Retour
          </a>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-800">🗺️ Offres autour de toi</h1>
          <p className="text-gray-400 text-sm mt-1">
            {offres.length} offre(s) disponible(s) · 🟢 Ta position · 🟠 Offres disponibles
          </p>
        </div>

        {/* CARTE */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 mb-6">
          <MapContainer
            center={positionUtilisateur || centreAbidjan}
            zoom={14}
            style={{ width: "100%", height: "450px" }}
            scrollWheelZoom={true}>

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {positionUtilisateur && (
              <>
                <CentrerCarte position={positionUtilisateur} />
                <Marker position={positionUtilisateur} icon={iconeUtilisateur}>
                  <Popup>
                    <p className="font-bold text-green-600">📍 Tu es ici</p>
                  </Popup>
                </Marker>
              </>
            )}

            {offres.map(o => (
              <Marker
                key={o.id}
                position={[Number(o.latitude), Number(o.longitude)]}
                icon={iconeOffre}>
                <Popup maxWidth={250}>
                  <div className="p-1">
                    {o.image_url && (
                      <img src={o.image_url} alt={o.nom_plat}
                        className="w-full h-24 object-cover rounded-lg mb-2" />
                    )}
                    <h3 className="font-bold text-gray-800 text-sm mb-1">{o.nom_plat}</h3>
                    {o.adresse && (
                      <p className="text-gray-400 text-xs mb-1">📍 {o.adresse}</p>
                    )}
                    <p className="text-gray-500 text-xs mb-2">{o.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-500 font-bold text-sm">
                        {Number(o.prix_reduit).toLocaleString("fr-FR")} FCFA
                      </span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-lg">
                        -{Math.round((1 - o.prix_reduit / o.prix_normal) * 100)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      ⏰ {o.heure_limite} · 📦 {o.quantite} restant(s)
                    </p>
                    <button
                      onClick={() => reserver(o)}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 rounded-lg text-sm transition-all disabled:opacity-50">
                      {loading ? "..." : "Réserver →"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* LISTE SOUS LA CARTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offres.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl p-12 text-center border border-gray-100">
              <p className="text-4xl mb-3">🗺️</p>
              <p className="text-gray-500 font-medium">Aucune offre géolocalisée pour le moment</p>
              <p className="text-gray-400 text-sm mt-1">
                Les vendeurs doivent activer leur localisation lors de la publication
              </p>
            </div>
          ) : offres.map(o => (
            <div key={o.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all flex gap-4">
              {o.image_url ? (
                <img src={o.image_url} alt={o.nom_plat}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">🍽️</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-sm">{o.nom_plat}</h3>
                {o.adresse && (
                  <p className="text-gray-400 text-xs mt-0.5">📍 {o.adresse}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-orange-500 font-bold text-sm">
                    {Number(o.prix_reduit).toLocaleString("fr-FR")} FCFA
                  </span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-lg">
                    -{Math.round((1 - o.prix_reduit / o.prix_normal) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  📦 {o.quantite} restant(s) · ⏰ {o.heure_limite}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}