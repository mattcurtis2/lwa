import Hero from "@/components/sections/hero";
import FarmInfo from "@/components/sections/farm-info";
import AnimalCard from "@/components/cards/animal-card";
import ProductCard from "@/components/cards/product-card";
import { useQuery } from "@tanstack/react-query";
import { Animal, Product } from "@db/schema";

export default function Home() {
  const { data: dogs } = useQuery<Animal[]>({
    queryKey: ["/api/animals?type=dog"],
  });

  const { data: goats } = useQuery<Animal[]>({
    queryKey: ["/api/animals?type=goat"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="w-full">
      <Hero />
      <FarmInfo />
      
      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Our Colorado Mountain Dogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dogs?.map((dog) => (
            <AnimalCard key={dog.id} animal={dog} />
          ))}
        </div>
      </section>

      <section className="container mx-auto py-12 bg-stone-50">
        <h2 className="text-3xl font-bold mb-8">Nigerian Dwarf Goats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goats?.map((goat) => (
            <AnimalCard key={goat.id} animal={goat} />
          ))}
        </div>
      </section>

      <section className="container mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Farmers Market</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
