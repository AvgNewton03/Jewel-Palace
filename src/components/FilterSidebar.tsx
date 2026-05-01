"use client";

import { useState } from "react";
import { ChevronDown, Filter, X } from "lucide-react";

interface FilterSidebarProps {
  selectedTypes?: string[];
  selectedOccasions?: string[];
  selectedColors?: string[];
  selectedPrices?: string[];
  onTypeChange?: (type: string) => void;
  onOccasionChange?: (occasion: string) => void;
  onColorChange?: (color: string) => void;
  onPriceChange?: (price: string) => void;
  onClear?: () => void;
}

export default function FilterSidebar({
  selectedTypes = [],
  selectedOccasions = [],
  selectedColors = [],
  selectedPrices = [],
  onTypeChange = () => {},
  onOccasionChange = () => {},
  onColorChange = () => {},
  onPriceChange = () => {},
  onClear = () => {},
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filterCategories = [
    {
      id: "type",
      name: "Jewellery Type",
      options: [
        'Necklace set', 'Pendent set', 'Bangle', 'Kada', 'Ring', 'Nath', 
        'Hath pan', 'Mang tika', 'Tops', 'Earrings', 'Mangalsutra', 
        'Borla', 'Killangi', 'Chocker', 'Balli', 'Earcuff', 'Payal', 
        'West belt', 'Baju band', 'Jooda', 'Damini', 'Sheeshphool', 
        'Ghughri', 'Mala', 'Chain', 'Sindoor box', 'Groom mala'
      ],
    },
    {
      id: "occasion",
      name: "Occasion",
      options: ["Wedding", "Heavy Festive", "Casual", "Office Wear"],
    },
    {
      id: "color",
      name: "Material",
      options: [
        "American Diamond",
        "Kundan",
        "Polki",
        "Mojonite",
        "Antique",
        "Moti",
        "Oxodized",
      ],
    },
    {
      id: "price",
      name: "Price Range",
      options: [
        "Under ₹1,000",
        "₹1,000 - ₹2,500",
        "₹2,500 - ₹5,000",
        "Above ₹5,000",
      ],
    },
  ];

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        className="md:hidden flex items-center gap-2 w-full py-3 px-4 bg-white border border-gray-200 rounded-lg mb-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="h-5 w-5" />
        Filter & Sort
      </button>

      {/* Filter Sidebar overlay (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Filter Content */}
      <div
        className={`
        fixed inset-y-0 left-0 w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:w-full md:z-10 md:border md:border-gray-200 md:rounded-lg overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 md:hidden pb-[17px] sticky top-0 bg-white z-10">
          <h2 className="font-serif text-xl font-medium flex items-center gap-2">
            <Filter className="h-5 w-5 text-brand-gold" />
            Filters
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-gray-500 hover:text-brand-maroon"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-5">
          <div className="hidden md:flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-medium">Filters</h2>
            <button
              onClick={onClear}
              className="text-sm text-brand-maroon hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            {filterCategories.map((category) => (
              <div
                key={category.id}
                className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
              >
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between w-full mb-3 group outline-none"
                >
                  <h3 className="font-medium text-sm tracking-wide uppercase text-gray-900 group-hover:text-brand-maroon transition-colors">
                    {category.name}
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-brand-maroon transition-transform duration-200 ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`} />
                </button>
                {expandedCategories.includes(category.id) && (
                <div className={`space-y-2 mt-3 ${category.id === 'type' ? 'max-h-60 overflow-y-auto pr-2' : ''}`}>
                  {category.options.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-300 group-hover:border-brand-maroon transition-colors overflow-hidden">
                        <input
                          type="checkbox"
                          className="peer absolute opacity-0 w-full h-full cursor-pointer"
                          checked={
                            category.id === "type"
                              ? selectedTypes.includes(option)
                              : category.id === "occasion"
                              ? selectedOccasions.includes(option)
                              : category.id === "color"
                              ? selectedColors.includes(option)
                              : category.id === "price"
                              ? selectedPrices.includes(option)
                              : false
                          }
                          onChange={() => {
                            if (category.id === "type") onTypeChange(option);
                            if (category.id === "occasion") onOccasionChange(option);
                            if (category.id === "color") onColorChange(option);
                            if (category.id === "price") onPriceChange(option);
                          }}
                        />
                        <div className="absolute inset-0 bg-brand-maroon rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Apply Button */}
          <div className="mt-8 md:hidden">
            <button
              className="w-full bg-brand-maroon text-white py-3 rounded-lg font-medium hover:bg-brand-maroon/90 transition-colors shadow-md"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
