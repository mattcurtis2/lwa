import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimalForm from "@/components/forms/animal-form";
import ProductForm from "@/components/forms/product-form";
import { useQuery } from "@tanstack/react-query";
import { Animal, Product } from "@db/schema";
import AnimalCard from "@/components/cards/animal-card";
import ProductCard from "@/components/cards/product-card";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Animal | Product | null>(null);

  const { data: animals } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Content Management</h1>

      <Tabs defaultValue="animals">
        <TabsList>
          <TabsTrigger value="animals">Animals</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="animals">
          <div className="mb-6">
            <Button onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}>
              Add New Animal
            </Button>
          </div>

          {showForm && (
            <AnimalForm
              animal={editItem as Animal}
              onClose={() => setShowForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals?.map((animal) => (
              <AnimalCard
                key={animal.id}
                animal={animal}
                isAdmin
                onEdit={() => {
                  setEditItem(animal);
                  setShowForm(true);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products">
          <div className="mb-6">
            <Button onClick={() => {
              setEditItem(null);
              setShowForm(true);
            }}>
              Add New Product
            </Button>
          </div>

          {showForm && (
            <ProductForm
              product={editItem as Product}
              onClose={() => setShowForm(false)}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isAdmin
                onEdit={() => {
                  setEditItem(product);
                  setShowForm(true);
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
