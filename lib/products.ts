export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
};

export const featuredProducts: Product[] = [
  {
    id: "led-monitor-light-bar",
    name: "Lámpara LED Bar para Monitor",
    price: 49,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aluminum-laptop-stand",
    name: "Soporte para Laptop en Aluminio",
    price: 59,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "magnetic-cable-organizer",
    name: "Organizador Magnético de Cables",
    price: 24,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "minimalist-desk-mat",
    name: "Mat de Escritorio Minimalista",
    price: 35,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
  },
];
