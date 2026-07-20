export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  description: string;
  benefits: string[];
};

export const featuredProducts: Product[] = [
  {
    id: "led-monitor-light-bar",
    name: "Lámpara LED Bar para Monitor",
    price: 49,
    rating: 4.8,
    reviewCount: 96,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80",
    category: "PARABOX Desk & Focus",
    description:
      "Ilumina tu escritorio sin reflejos ni fatiga visual. Se acopla a la parte superior de tu monitor y proyecta una luz uniforme y cálida, pensada para sesiones largas de trabajo o creación.",
    benefits: [
      "Iluminación asimétrica sin reflejos en pantalla",
      "Control táctil de brillo y temperatura de color",
      "Diseño ultra delgado en aluminio anodizado",
      "Plug & Play vía USB-C",
    ],
  },
  {
    id: "aluminum-laptop-stand",
    name: "Soporte para Laptop en Aluminio",
    price: 59,
    rating: 4.9,
    reviewCount: 142,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80",
    category: "PARABOX Desk & Focus",
    description:
      "Eleva tu pantalla a la altura ideal para una postura correcta. Fabricado en aluminio sólido con acabado mate, plegable y portátil para llevar tu setup a cualquier lugar.",
    benefits: [
      "Materiales de alta calidad en aluminio sólido",
      "Diseño ergonómico ajustable en altura",
      "Plegable y portátil, ideal para viajar",
      "Compatible con laptops de 10\" a 17\"",
    ],
  },
  {
    id: "magnetic-cable-organizer",
    name: "Organizador Magnético de Cables",
    price: 24,
    rating: 4.7,
    reviewCount: 78,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
    category: "PARABOX Desk & Focus",
    description:
      "Dile adiós al caos de cables. Este organizador magnético mantiene cada cable en su lugar con un cierre discreto que se integra perfectamente a la estética de tu escritorio.",
    benefits: [
      "Cierre magnético de alta resistencia",
      "Set de 6 unidades en silicona premium",
      "Plug & Play, sin herramientas ni instalación",
      "Diseño minimalista en negro mate",
    ],
  },
  {
    id: "minimalist-desk-mat",
    name: "Mat de Escritorio Minimalista",
    price: 35,
    rating: 4.9,
    reviewCount: 61,
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80",
    category: "PARABOX Desk & Focus",
    description:
      "Una base uniforme para tu teclado, mouse y taza de café. Cuero vegano premium con superficie resistente al agua que define visualmente tu espacio de trabajo.",
    benefits: [
      "Cuero vegano premium resistente al agua",
      "Diseño ergonómico de bordes cosidos",
      "Base antideslizante de alta durabilidad",
      "Disponible en negro y gris piedra",
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return featuredProducts.find((product) => product.id === id);
}
