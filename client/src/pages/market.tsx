import MarketSections from "@/components/market/market-section";

export default function Market() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Farmers Market</h1>
        <MarketSections />
      </div>
    </div>
  );
}
