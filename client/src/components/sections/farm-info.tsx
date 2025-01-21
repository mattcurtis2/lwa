import { Card, CardContent } from "@/components/ui/card";

export default function FarmInfo() {
  return (
    <section className="py-16 bg-stone-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">About Our Farm</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Our Mission</h3>
              <p className="text-stone-600">
                Dedicated to sustainable farming practices and providing the highest quality
                produce and animal products to our local community.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">The Animals</h3>
              <p className="text-stone-600">
                Home to our wonderful Colorado Mountain Dogs and Nigerian Dwarf Goats,
                raised with love and care in a natural environment.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-4">Farmers Market</h3>
              <p className="text-stone-600">
                Fresh bread, pastries, and seasonal vegetables grown and prepared
                right here on our farm.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
