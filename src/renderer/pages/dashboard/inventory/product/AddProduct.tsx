import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import {
  Plus,
  X,
  Barcode,
  Tag,
  Package,
  Ruler,
  Boxes,
  AlertCircle,
  Building2,
  MapPin,
  CheckCircle2,
  ImagePlus,
  Banknote,
  Loader2,
  Tags,
} from "lucide-react";
import { PageHeader } from "@/renderer/components/dashboard/PageHeader";
import { FormSection } from "@/renderer/components/common/FormSection";
import { FormField } from "@/renderer/components/common/FormField";
import { InputGroup } from "@/renderer/components/common/InputGroup";
import { Callout } from "@/renderer/components/ui/callout";
import { cn } from "@/renderer/lib/utils";
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Textarea } from "@/renderer/components/ui/textarea";
import { Badge } from "@/renderer/components/ui/badge";
import { SwitchRow } from "@/renderer/components/common/SwitchRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/renderer/components/ui/select";

// FLAG(money): costPrice/sellingPrice are form strings parsed with parseFloat for the
// margin preview. Must become integer minor units when this form is wired to IPC.
interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  description: string;
  unit: string;
  costPrice: string;
  sellingPrice: string;
  taxRate: string;
  stockQuantity: string;
  minStockLevel: string;
  maxStockLevel: string;
  supplier: string;
  location: string;
  weight: string;
  dimensions: { length: string; width: string; height: string };
  status: string;
  trackInventory: boolean;
  allowDecimal: boolean;
}

type ProductFormErrors = Partial<Record<keyof ProductFormData, string | null>>;

const AddProduct = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productTags, setProductTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    brand: "",
    description: "",
    unit: "piece",
    costPrice: "",
    sellingPrice: "",
    taxRate: "0",
    stockQuantity: "",
    minStockLevel: "5",
    maxStockLevel: "",
    supplier: "",
    location: "",
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    status: "active",
    trackInventory: true,
    allowDecimal: false,
  });

  const [errors, setErrors] = useState<ProductFormErrors>({});

  const handleInputChange = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleDimensionChange = (dimension: keyof ProductFormData["dimensions"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dimension]: value },
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // readAsDataURL always yields a string result.
        setImagePreview(typeof reader.result === "string" ? reader.result : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTag = () => {
    if (newTag.trim() && !productTags.includes(newTag.trim())) {
      setProductTags([...productTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductTags(productTags.filter((tag) => tag !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: ProductFormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.sellingPrice)
      newErrors.sellingPrice = "Selling price is required";
    if (!formData.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Product created:", {
        ...formData,
        tags: productTags,
        image: imagePreview,
      });
      alert("Product created successfully!");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Home & Garden",
    "Sports & Outdoors",
    "Health & Beauty",
    "Toys & Games",
    "Books & Media",
    "Automotive",
    "Office Supplies",
    "Other",
  ];

  const units = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "g", label: "Gram (g)" },
    { value: "lb", label: "Pound (lb)" },
    { value: "oz", label: "Ounce (oz)" },
    { value: "l", label: "Liter (L)" },
    { value: "ml", label: "Milliliter (ml)" },
    { value: "m", label: "Meter (m)" },
    { value: "ft", label: "Foot (ft)" },
    { value: "box", label: "Box" },
    { value: "pack", label: "Pack" },
    { value: "set", label: "Set" },
  ];

  const taxRates = [
    { value: "0", label: "No Tax (0%)" },
    { value: "5", label: "5%" },
    { value: "10", label: "10%" },
    { value: "15", label: "15%" },
    { value: "20", label: "20%" },
    { value: "25", label: "25%" },
  ];

  const inputClass = (field: keyof ProductFormData) =>
    cn(errors[field] && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/15");

  // Accessibility wiring for a validated control: invalid state + link to its error message.
  const errorProps = (field: keyof ProductFormData) =>
    errors[field] ? { "aria-invalid": true as const, "aria-describedby": `${field}-error` } : {};

  const fieldLabels: Partial<Record<keyof ProductFormData, string>> = {
    name: "Product name",
    sku: "SKU",
    sellingPrice: "Selling price",
    category: "Category",
  };
  const invalidFields = (Object.keys(errors) as (keyof ProductFormData)[]).filter((field) => errors[field]);

  // FLAG(money): float preview only, see the note on ProductFormData.
  const hasPrices = Boolean(formData.costPrice && formData.sellingPrice);
  const profit = parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice);
  const margin = (profit / parseFloat(formData.sellingPrice)) * 100;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl">
        <form onSubmit={handleSubmit}>
          <PageHeader
            title="Add Product"
            description="Create a new product for your inventory"
            actions={
              <>
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 aria-hidden="true" className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus aria-hidden="true" />
                      Create Product
                    </>
                  )}
                </Button>
              </>
            }
          />

          {invalidFields.length > 0 && (
            <Callout
              tone="danger"
              role="alert"
              className="mb-6"
              title={`Fix ${invalidFields.length} ${invalidFields.length === 1 ? "field" : "fields"} before saving`}
            >
              {invalidFields.map((field) => fieldLabels[field] ?? field).join(", ")} {invalidFields.length === 1 ? "is" : "are"}{" "}
              required.
            </Callout>
          )}

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            {/* Main product details */}
            <div className="space-y-6 lg:col-span-2">
              <FormSection icon={Package} title="Basic information" description="What the product is and how you find it at the counter.">
                <FormField htmlFor="name" label="Product name" required error={errors.name}>
                  <Input
                    id="name"
                    placeholder="e.g. Basmati Rice 5kg"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={inputClass("name")}
                    {...errorProps("name")}
                  />
                </FormField>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField htmlFor="sku" label="SKU" required error={errors.sku} hint="Unique code for this product.">
                    <InputGroup leading={<Tag />}>
                      <Input
                        id="sku"
                        placeholder="PROD-001"
                        value={formData.sku}
                        onChange={(e) => handleInputChange("sku", e.target.value)}
                        className={inputClass("sku")}
                        {...errorProps("sku")}
                      />
                    </InputGroup>
                  </FormField>

                  <FormField htmlFor="barcode" label="Barcode" optional>
                    <InputGroup leading={<Barcode />}>
                      <Input
                        id="barcode"
                        placeholder="Scan or enter barcode"
                        value={formData.barcode}
                        onChange={(e) => handleInputChange("barcode", e.target.value)}
                      />
                    </InputGroup>
                  </FormField>

                  <FormField htmlFor="category" label="Category" required error={errors.category}>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger id="category" className={cn("w-full", inputClass("category"))} {...errorProps("category")}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField htmlFor="brand" label="Brand" optional>
                    <Input
                      id="brand"
                      placeholder="Enter brand name"
                      value={formData.brand}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                    />
                  </FormField>

                  <FormField htmlFor="unit" label="Unit of measure">
                    <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                      <SelectTrigger id="unit" className="w-full">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField htmlFor="description" label="Description" optional>
                  <Textarea
                    id="description"
                    placeholder="Short description shown on invoices and search..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </FormField>
              </FormSection>

              <FormSection icon={Banknote} title="Pricing" description="What it costs you, what you sell it for, and the tax applied.">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <FormField htmlFor="costPrice" label="Cost price" optional>
                    <InputGroup leading="Rs">
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.costPrice}
                        onChange={(e) => handleInputChange("costPrice", e.target.value)}
                        className="tabular-nums"
                      />
                    </InputGroup>
                  </FormField>

                  <FormField htmlFor="sellingPrice" label="Selling price" required error={errors.sellingPrice}>
                    <InputGroup leading="Rs">
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.sellingPrice}
                        onChange={(e) => handleInputChange("sellingPrice", e.target.value)}
                        className={cn("tabular-nums", inputClass("sellingPrice"))}
                        {...errorProps("sellingPrice")}
                      />
                    </InputGroup>
                  </FormField>

                  <FormField htmlFor="taxRate" label="Tax rate">
                    <Select value={formData.taxRate} onValueChange={(value) => handleInputChange("taxRate", value)}>
                      <SelectTrigger id="taxRate" className="w-full">
                        <SelectValue placeholder="Select tax rate" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxRates.map((tax) => (
                          <SelectItem key={tax.value} value={tax.value}>
                            {tax.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                {hasPrices &&
                  (profit >= 0 ? (
                    <Callout tone="success" compact title={`${margin.toFixed(1)}% margin`}>
                      You make Rs {profit.toFixed(2)} on each unit sold.
                    </Callout>
                  ) : (
                    <Callout tone="warning" compact title="Selling below cost">
                      You lose Rs {Math.abs(profit).toFixed(2)} on each unit sold ({margin.toFixed(1)}% margin).
                    </Callout>
                  ))}
              </FormSection>

              <FormSection icon={Boxes} title="Inventory" description="Opening stock, reorder alerts and where it comes from.">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <FormField htmlFor="stockQuantity" label="Opening stock">
                    <Input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.stockQuantity}
                      onChange={(e) => handleInputChange("stockQuantity", e.target.value)}
                      className="tabular-nums"
                    />
                  </FormField>

                  <FormField htmlFor="minStockLevel" label="Low-stock alert at" hint="Warn when stock drops to this.">
                    <Input
                      id="minStockLevel"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={formData.minStockLevel}
                      onChange={(e) => handleInputChange("minStockLevel", e.target.value)}
                      className="tabular-nums"
                      aria-describedby="minStockLevel-hint"
                    />
                  </FormField>

                  <FormField htmlFor="maxStockLevel" label="Max stock level" optional>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      min="0"
                      placeholder="100"
                      value={formData.maxStockLevel}
                      onChange={(e) => handleInputChange("maxStockLevel", e.target.value)}
                      className="tabular-nums"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField htmlFor="supplier" label="Supplier" optional>
                    <InputGroup leading={<Building2 />}>
                      <Input
                        id="supplier"
                        placeholder="Enter supplier name"
                        value={formData.supplier}
                        onChange={(e) => handleInputChange("supplier", e.target.value)}
                      />
                    </InputGroup>
                  </FormField>

                  <FormField htmlFor="location" label="Warehouse / location" optional>
                    <InputGroup leading={<MapPin />}>
                      <Input
                        id="location"
                        placeholder="e.g. Shelf B3"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                      />
                    </InputGroup>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <SwitchRow
                    id="trackInventory"
                    label="Track inventory"
                    description="Count stock as you sell and restock."
                    checked={formData.trackInventory}
                    onCheckedChange={(checked) => handleInputChange("trackInventory", checked)}
                  />
                  <SwitchRow
                    id="allowDecimal"
                    label="Allow decimal quantity"
                    description="Sell fractions, e.g. 1.5 kg."
                    checked={formData.allowDecimal}
                    onCheckedChange={(checked) => handleInputChange("allowDecimal", checked)}
                  />
                </div>

                {!formData.trackInventory && (
                  <Callout tone="info" compact>
                    Stock won't be counted for this product, so low-stock alerts won't fire.
                  </Callout>
                )}
              </FormSection>

              <FormSection icon={Ruler} title="Size & weight" description="Used for storage and delivery. Skip for counter-only items.">
                <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                  <FormField htmlFor="weight" label="Weight" optional>
                    <InputGroup trailing="kg">
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="tabular-nums"
                      />
                    </InputGroup>
                  </FormField>
                  {(["length", "width", "height"] as const).map((dimension) => (
                    <FormField key={dimension} htmlFor={dimension} label={dimension.charAt(0).toUpperCase() + dimension.slice(1)} optional>
                      <InputGroup trailing="cm">
                        <Input
                          id={dimension}
                          type="number"
                          step="0.1"
                          min="0"
                          placeholder="0"
                          value={formData.dimensions[dimension]}
                          onChange={(e) => handleDimensionChange(dimension, e.target.value)}
                          className="tabular-nums"
                        />
                      </InputGroup>
                    </FormField>
                  ))}
                </div>
              </FormSection>
            </div>

            {/* Side column: stays in view while the main column scrolls */}
            <div className="space-y-6 lg:sticky lg:top-6">
              <FormSection icon={ImagePlus} title="Product image" description="Helps cashiers pick the right item.">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Product preview" className="h-48 w-full rounded-xl border object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      aria-label="Remove image"
                      className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/85 shadow-sm backdrop-blur transition-colors hover:bg-background"
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center rounded-xl border-2 border-dashed border-border bg-field/50 px-6 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none"
                  >
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ImagePlus aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-semibold">Click to upload</span>
                    <span className="mt-1 text-xs text-muted-foreground">PNG, JPG or GIF, up to 5 MB</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </FormSection>

              <FormSection icon={Tags} title="Status & tags">
                <FormField htmlFor="status" label="Status">
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField htmlFor="newTag" label="Tags" hint="Press Enter to add.">
                  <div className="flex gap-2">
                    <Input
                      id="newTag"
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          // Enter adds the tag; without this it would also submit the whole form.
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      aria-describedby="newTag-hint"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={addTag} aria-label="Add tag" className="shrink-0">
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                  {productTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {productTags.map((tag) => (
                        <Badge key={tag} asChild variant="secondary" className="gap-1 py-1 pr-1.5">
                          <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                            {tag}
                            <X aria-hidden="true" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormField>
              </FormSection>

              <Callout tone="tip" title="Quick tips">
                <ul className="list-disc space-y-1 pl-4 text-xs">
                  <li>Keep each SKU unique.</li>
                  <li>Set a low-stock alert so you reorder in time.</li>
                  <li>Add weight if you deliver.</li>
                  <li>Tags make products easier to filter.</li>
                </ul>
              </Callout>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/** A bordered on/off option: label and description on the left, switch on the right. */
export default AddProduct;
