import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div className="relative h-[600px] bg-cover bg-center" style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1611501807352-03324d70054c')`
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-5xl font-bold mb-6">Welcome to Little Way Acres</h1>
          <p className="text-xl mb-8">
            Experience the charm of sustainable farming, meet our beloved animals,
            and enjoy fresh, locally grown produce at our farmers market.
          </p>
          <div className="flex gap-4">
            <Button size="lg" variant="default">
              Visit Our Farm
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
