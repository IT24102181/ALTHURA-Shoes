import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FilterPanelProps {
  brands: string[];
  categories: string[];
  selectedBrands: string[];
  selectedCategories: string[];
  onBrandChange: (brand: string, checked: boolean) => void;
  onCategoryChange: (category: string, checked: boolean) => void;
  onClear: () => void;
}

export function FilterPanel({
  brands,
  categories,
  selectedBrands,
  selectedCategories,
  onBrandChange,
  onCategoryChange,
  onClear,
}: FilterPanelProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">Filters</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => onBrandChange(brand, checked === true)}
              />
              <Label
                htmlFor={`brand-${brand}`}
                className="text-sm cursor-pointer"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => onCategoryChange(category, checked === true)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
