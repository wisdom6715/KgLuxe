// components/admin/CreateProductModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { toast } from "sonner";
import { X, ChevronDown, Check, ImagePlus, Loader2 } from "lucide-react";
import { db, storage } from "@/lib/firebase.config";
import {
  CATEGORIES,
  SUBCATEGORIES,
  SIZES,
  COLORS,
  getColorHex,
  EMPTY_PRODUCT_FORM,
  EMPTY_SIZE_PRICING,
  MAX_PRODUCT_IMAGES,
  type CategoryValue,
  type ProductFormState,
  type Product,
  type SizePricing,
} from "./type";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

type ImageSlot =
  | { kind: "existing"; url: string; path: string }
  | { kind: "new"; file: File; previewUrl: string };

const productToForm = (product: Product): ProductFormState => ({
  name: product.name ?? "",
  description: product.description ?? "",
  price: String(product.price ?? ""),
  stock: String(product.stock ?? ""),
  sizes: product.sizes ?? [],
  colors: product.colors ?? [],
  category: (product.category ?? "") as CategoryValue,
  subCategory: product.subCategory ?? "",
  sizePricing: product.sizePricing ?? EMPTY_SIZE_PRICING,
});

export default function CreateProductModal({
  isOpen,
  onClose,
  product = null,
}: CreateProductModalProps) {
  const isEditMode = Boolean(product);

  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [images, setImages] = useState<ImageSlot[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<
    "category" | "subCategory" | "sizes" | "colors" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_PRODUCT_FORM);
      setImages([]);
      setRemovedPaths([]);
      setFormError("");
      setOpenDropdown(null);
      return;
    }
    if (product) {
      setForm(productToForm(product));
      const urls = product.imageUrls ?? [];
      const paths = product.imagePaths ?? [];
      setImages(
        urls.map((url, i) => ({
          kind: "existing" as const,
          url,
          path: paths[i] ?? "",
        }))
      );
    } else {
      setForm(EMPTY_PRODUCT_FORM);
      setImages([]);
    }
    setRemovedPaths([]);
    setFormError("");
  }, [isOpen, product]);

  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.kind === "new") URL.revokeObjectURL(img.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) return;
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-root]")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isOpen) return null;

  const subCategoryOptions = form.category
    ? SUBCATEGORIES[form.category as CategoryValue]
    : [];

  const handleFilesSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const room = MAX_PRODUCT_IMAGES - images.length;
    if (room <= 0) {
      toast.error(`You can only upload up to ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }
    const accepted: ImageSlot[] = [];
    for (const file of incoming) {
      if (accepted.length >= room) {
        toast.error(`Only ${MAX_PRODUCT_IMAGES} images allowed — some files were skipped.`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} isn't an image and was skipped.`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is over 10MB and was skipped.`);
        continue;
      }
      accepted.push({ kind: "new", file, previewUrl: URL.createObjectURL(file) });
    }
    if (accepted.length > 0) setImages((prev) => [...prev, ...accepted]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target.kind === "new") URL.revokeObjectURL(target.previewUrl);
      else if (target.kind === "existing" && target.path)
        setRemovedPaths((paths) => [...paths, target.path]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const toggleMulti = (field: "sizes" | "colors", value: string) => {
    setForm((f) => {
      const current = f[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...f, [field]: next };
    });
  };

  const setSizePricingField = (field: keyof SizePricing, value: string) => {
    setForm((f) => ({
      ...f,
      sizePricing: {
        ...f.sizePricing,
        [field]: value === "" ? "" : value,
      },
    }));
  };

  const validate = (): string => {
    if (!form.name.trim()) return "Product name is required.";
    if (images.length === 0) return "Please upload at least one product image.";
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) return "Enter a valid base price.";
    const stockNum = Number(form.stock);
    if (form.stock === "" || isNaN(stockNum) || stockNum < 0)
      return "Enter a valid stock quantity.";
    if (form.sizes.length === 0) return "Select at least one size.";
    if (form.colors.length === 0) return "Select at least one color.";
    if (!form.category) return "Select a category.";
    if (!form.subCategory) return "Select a subcategory.";
    if (!form.description.trim()) return "Description is required.";
    return "";
  };

  const uploadImage = async (file: File): Promise<{ url: string; path: string }> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return { url, path };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setFormError(validationError); return; }
    setFormError("");
    setSubmitting(true);

    let finalUrls: string[];
    let finalPaths: string[];
    try {
      const uploaded = await Promise.all(
        images.map(async (img) => {
          if (img.kind === "existing") return { url: img.url, path: img.path };
          return uploadImage(img.file);
        })
      );
      finalUrls = uploaded.map((u) => u.url);
      finalPaths = uploaded.map((u) => u.path);
    } catch (err) {
      console.error("Image upload failed:", err);
      const message = err instanceof Error ? err.message : "Image upload failed.";
      setFormError(message);
      toast.error("Couldn't upload the images. Please try again.");
      setSubmitting(false);
      return;
    }

    // Build sizePricing — only persist fields that have actual numbers
    const sp = form.sizePricing;
    const sizePricing: SizePricing = {
      sm:        sp.sm        !== "" && !isNaN(Number(sp.sm))        ? Number(sp.sm)        : "",
      lxl:       sp.lxl       !== "" && !isNaN(Number(sp.lxl))       ? Number(sp.lxl)       : "",
      xxlCustom: sp.xxlCustom !== "" && !isNaN(Number(sp.xxlCustom)) ? Number(sp.xxlCustom) : "",
      age2_5:    sp.age2_5    !== "" && !isNaN(Number(sp.age2_5))    ? Number(sp.age2_5)    : "",
      age6_9:    sp.age6_9    !== "" && !isNaN(Number(sp.age6_9))    ? Number(sp.age6_9)    : "",
      age10_12:  sp.age10_12  !== "" && !isNaN(Number(sp.age10_12))  ? Number(sp.age10_12)  : "",
    };

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        sizes: form.sizes,
        colors: form.colors,
        category: form.category,
        subCategory: form.subCategory,
        imageUrls: finalUrls,
        imagePaths: finalPaths,
        sizePricing,
        updatedAt: serverTimestamp(),
      };

      if (isEditMode && product) {
        await updateDoc(doc(db, "products", product.id), payload);
        toast.success(`${form.name.trim()} updated`);
      } else {
        const sku = `${form.category.slice(0, 3).toUpperCase()}-${Date.now()
          .toString()
          .slice(-6)}`;
        await addDoc(collection(db, "products"), {
          ...payload,
          sku,
          createdAt: serverTimestamp(),
        });
        toast.success(`${form.name.trim()} added to inventory`);
      }

      if (removedPaths.length > 0) {
        Promise.all(
          removedPaths.map((path) =>
            deleteObject(storageRef(storage, path)).catch((err) =>
              console.error("Failed to delete removed image:", path, err)
            )
          )
        );
      }
      onClose();
    } catch (err) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} product:`, err);
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setFormError(message);
      toast.error(`Couldn't ${isEditMode ? "update" : "create"} the product.`);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Tier detection ───────────────────────────────────────────────────────
  const hasSM        = form.sizes.some((s) => ["SM", "M"].includes(s));
  const hasLXL       = form.sizes.some((s) => ["L", "XL"].includes(s));
  const hasXXLCustom = form.sizes.some((s) => ["XXL", "CUSTOM"].includes(s));
  const hasAge2_5    = form.sizes.some((s) => ["2-3", "4-5"].includes(s));
  const hasAge6_9    = form.sizes.some((s) => ["6-7", "8-9"].includes(s));
  const hasAge10_12  = form.sizes.includes("10-12");

  const hasAdultPricing = hasSM || hasLXL || hasXXLCustom;
  const hasAgePricing   = hasAge2_5 || hasAge6_9 || hasAge10_12;
  const showSizePricing = hasAdultPricing || hasAgePricing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4">
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-xl text-gray-900">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-5 flex flex-col gap-4">
          {formError && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {formError}
            </div>
          )}

          {/* Image upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold tracking-wide text-gray-500">
                PRODUCT IMAGES
              </label>
              <span className="text-xs text-gray-400">
                {images.length}/{MAX_PRODUCT_IMAGES}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelect(e.target.files)}
            />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {images.map((img, i) => {
                const src = img.kind === "existing" ? img.url : img.previewUrl;
                return (
                  <div
                    key={img.kind === "existing" ? `${img.path}-${i}` : img.previewUrl}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Product image ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] font-medium bg-black/70 text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-white text-gray-700 rounded-full p-0.5 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
              {images.length < MAX_PRODUCT_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
                >
                  <ImagePlus size={20} strokeWidth={1.5} />
                  <span className="text-[11px]">Add</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              PNG or JPG, up to 10MB each — up to {MAX_PRODUCT_IMAGES} images. First image is the cover.
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
              PRODUCT NAME
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Classic Suit Jacket"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
          </div>

          {/* Base Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
                BASE PRICE ($)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="30000"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">Fallback if no size-based price set</p>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
                STOCK
              </label>
              <input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                placeholder="20"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
              />
            </div>
          </div>

          {/* Sizes + Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MultiSelectDropdown
              label="SIZES"
              placeholder="Select sizes"
              options={[...SIZES]}
              selected={form.sizes}
              isOpen={openDropdown === "sizes"}
              onToggleOpen={() => setOpenDropdown((d) => (d === "sizes" ? null : "sizes"))}
              onToggleValue={(v) => toggleMulti("sizes", v)}
            />
            <MultiSelectDropdown
              label="COLORS"
              placeholder="Select colors"
              options={[...COLORS]}
              selected={form.colors}
              isOpen={openDropdown === "colors"}
              onToggleOpen={() => setOpenDropdown((d) => (d === "colors" ? null : "colors"))}
              onToggleValue={(v) => toggleMulti("colors", v)}
              getSwatch={getColorHex}
            />
          </div>

          {/* Size-based pricing — appears only when relevant sizes are selected */}
          {showSizePricing && (
            <div className="border border-[#C9A96E]/30 rounded-lg p-4 bg-[#FAF8F3] flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-600 mb-1">
                  SIZE-BASED PRICING
                </p>
                <p className="text-[11px] text-gray-400">
                  Optional. Leave a tier blank to fall back to the base price.
                </p>
              </div>

              {/* Adult tiers */}
              {hasAdultPricing && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    Adult Sizes
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {hasSM && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          SM / M ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.sizePricing.sm}
                          onChange={(e) => setSizePricingField("sm", e.target.value)}
                          placeholder="e.g. 25000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all bg-white"
                        />
                      </div>
                    )}
                    {hasLXL && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          L / XL ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.sizePricing.lxl}
                          onChange={(e) => setSizePricingField("lxl", e.target.value)}
                          placeholder="e.g. 30000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all bg-white"
                        />
                      </div>
                    )}
                    {hasXXLCustom && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          XXL / Custom ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.sizePricing.xxlCustom}
                          onChange={(e) => setSizePricingField("xxlCustom", e.target.value)}
                          placeholder="e.g. 35000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Divider between sections */}
              {hasAdultPricing && hasAgePricing && (
                <hr className="border-[#C9A96E]/20" />
              )}

              {/* Age tiers */}
              {hasAgePricing && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    Age Sizes
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {hasAge2_5 && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          2–3 / 4–5 ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.sizePricing.age2_5}
                          onChange={(e) => setSizePricingField("age2_5", e.target.value)}
                          placeholder="e.g. 15000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all bg-white"
                        />
                      </div>
                    )}
                    {hasAge6_9 && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          6–7 / 8–9 ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.sizePricing.age6_9}
                          onChange={(e) => setSizePricingField("age6_9", e.target.value)}
                          placeholder="e.g. 18000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all bg-white"
                        />
                      </div>
                    )}
                    {hasAge10_12 && (
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                          10–12 ($)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.sizePricing.age10_12}
                          onChange={(e) => setSizePricingField("age10_12", e.target.value)}
                          placeholder="e.g. 20000"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SingleSelectDropdown
              label="CATEGORY"
              placeholder="Select category"
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              selected={form.category}
              isOpen={openDropdown === "category"}
              onToggleOpen={() => setOpenDropdown((d) => (d === "category" ? null : "category"))}
              onSelect={(v) =>
                setForm((f) => ({ ...f, category: v as CategoryValue, subCategory: "" }))
              }
            />
            <SingleSelectDropdown
              label="SUBCATEGORY"
              placeholder={form.category ? "Select subcategory" : "Pick a category first"}
              options={subCategoryOptions.map((s) => ({ value: s, label: s }))}
              selected={form.subCategory}
              isOpen={openDropdown === "subCategory"}
              disabled={!form.category}
              onToggleOpen={() => setOpenDropdown((d) => (d === "subCategory" ? null : "subCategory"))}
              onSelect={(v) => setForm((f) => ({ ...f, subCategory: v }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
              DESCRIPTION
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Fabric, fit, and styling details…"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-black hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Saving…" : isEditMode ? "Save Changes" : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Dropdown primitives ─────────────────────────────────────────────────── */

function MultiSelectDropdown({
  label, placeholder, options, selected, isOpen, onToggleOpen, onToggleValue, getSwatch,
}: {
  label: string; placeholder: string; options: string[]; selected: string[];
  isOpen: boolean; onToggleOpen: () => void; onToggleValue: (value: string) => void;
  getSwatch?: (value: string) => string;
}) {
  return (
    <div data-dropdown-root className="relative">
      <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={onToggleOpen}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-[#C9A96E] transition-colors"
      >
        {selected.length ? (
          <span className="flex items-center gap-1.5 flex-wrap">
            {getSwatch &&
              selected.slice(0, 5).map((v) => (
                <span
                  key={v}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: getSwatch(v) }}
                />
              ))}
            <span className="text-gray-800">{selected.join(", ")}</span>
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown size={15} className="text-gray-400 shrink-0" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onToggleValue(opt)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#FAF8F3] transition-colors text-left"
              >
                <span className="flex items-center gap-2">
                  {getSwatch && (
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
                      style={{ backgroundColor: getSwatch(opt) }}
                    />
                  )}
                  {opt}
                </span>
                {checked && <Check size={14} className="text-[#C9A96E]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SingleSelectDropdown({
  label, placeholder, options, selected, isOpen, disabled, onToggleOpen, onSelect,
}: {
  label: string; placeholder: string; options: { value: string; label: string }[];
  selected: string; isOpen: boolean; disabled?: boolean;
  onToggleOpen: () => void; onSelect: (value: string) => void;
}) {
  const selectedLabel = options.find((o) => o.value === selected)?.label;
  return (
    <div data-dropdown-root className="relative">
      <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggleOpen}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white hover:border-[#C9A96E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedLabel ? "text-gray-800" : "text-gray-400"}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown size={15} className="text-gray-400" />
      </button>
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#FAF8F3] transition-colors text-left"
            >
              {opt.label}
              {selected === opt.value && <Check size={14} className="text-[#C9A96E]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}