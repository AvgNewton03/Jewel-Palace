import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";

// Mock data
const mockProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: `prod-${i + 1}`,
  title: [
    "Kundan Polki Bridal Choker Set",
    "Antique Gold Plated Jhumkas",
    "American Diamond Delicate Necklace",
    "Emerald Green Meenakari Bangle Set",
    "Ruby Reverse AD Choker",
    "Temple Jewellery Long Haar"
  ][i % 6],
  price: 1000 + (Math.floor(Math.random() * 50) * 100),
  originalPrice: Math.random() > 0.5 ? 5000 + (Math.floor(Math.random() * 20) * 100) : undefined,
  occasion: ["Wedding", "Heavy Festive", "Casual", "Office Wear"][i % 4],
  isNew: i < 3,
  imageUrl: `https://images.unsplash.com/photo-${[
    "1599643477877-530eb83abc8e",
    "1599643478514-4a4204b281f5",
    "1611591437281-460bfbe1220a",
    "1535632066927-ab7c9ab60908"
  ][i % 4]}?auto=format&fit=crop&q=80&w=600`
}));

export default function CollectionsPage() {
  return (
    <div className="bg-brand-bg/30 min-h-screen pt-4 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="py-8 border-b border-gray-200 mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">All Collections</h1>
          <p className="text-gray-600 max-w-2xl">
            Browse our entire range of exquisite imitation jewellery. Filter by occasion, type, or price to find your perfect piece.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-[280px] flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Product Grid Header & Content */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-gray-500 font-medium">{mockProducts.length} Products Found</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <select className="text-sm border-gray-300 rounded-md focus:ring-brand-maroon focus:border-brand-maroon p-2 bg-white border">
                  <option>Featured</option>
                  <option>New Arrivals</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {mockProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {/* Pagination Mock */}
            <div className="mt-16 flex justify-center">
              <nav className="flex items-center gap-1">
                <button className="px-4 py-2 border border-gray-200 text-gray-500 rounded hover:bg-gray-50" disabled>Previous</button>
                <button className="px-4 py-2 bg-brand-maroon text-white rounded">1</button>
                <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50">2</button>
                <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50">3</button>
                <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded hover:bg-gray-50">Next</button>
              </nav>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
