import { hotelService } from './hotelService';
import { auth } from '../firebase';

export const seedDatabase = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const hotels = [
    {
      name: "Casa del Papa Resort & SPA",
      description: "Le paradis entre lagon et mer à Ouidah. Détente absolue en bordure de plage.",
      address: "Route de Ouidah - Plage",
      city: "Ouidah",
      managerId: user.uid,
      stars: 5,
      images: ["https://picsum.photos/seed/casapapa/800/600"],
      amenities: ["Piscine", "WiFi", "SPA", "Plage Privée", "Sport Nautique"],
    },
    {
      name: "Azalaï Hôtel Cotonou",
      description: "Le luxe au coeur du quartier diplomatique de Cotonou.",
      address: "Quartier Ganhi",
      city: "Cotonou",
      managerId: user.uid,
      stars: 5,
      images: ["https://picsum.photos/seed/azalai/800/600"],
      amenities: ["Piscine", "Restaurant Gastronomique", "WiFi", "Navette Aéroport"],
    },
    {
      name: "Bénin Royal Hôtel",
      description: "Une expérience royale pour vos séjours d'affaires et loisirs.",
      address: "Quartier Maro-Militaire",
      city: "Cotonou",
      managerId: user.uid,
      stars: 4,
      images: ["https://picsum.photos/seed/royalbenin/800/600"],
      amenities: ["WiFi", "Climatisation", "Restaurant", "Salle de Conférence"],
    }
  ];

  for (const h of hotels) {
    const hotelRef = await hotelService.createHotel(h);
    if (hotelRef) {
      await hotelService.createRoom(hotelRef.id, {
        type: "Suite Royale",
        pricePerNight: 250,
        capacity: 2,
        description: "Luxe absolu avec vue sur mer.",
        images: ["https://picsum.photos/seed/room1/800/600"],
        amenities: ["Balcon", "Mini-bar", "Jacuzzi"]
      });
      await hotelService.createRoom(hotelRef.id, {
        type: "Chambre Double Standard",
        pricePerNight: 90,
        capacity: 2,
        description: "Confortable et moderne.",
        images: ["https://picsum.photos/seed/room2/800/600"],
        amenities: ["TV", "Bureau"]
      });
    }
  }
  
  alert("Base de données initialisée avec succès !");
};
