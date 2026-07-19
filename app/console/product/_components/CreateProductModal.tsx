// components/admin/CreateProductModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { X, ChevronDown, Check, ImagePlus, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase.config";
import {
  CATEGORIES,
  SUBCATEGORIES,
  SIZES,
  COLORS,
  EMPTY_PRODUCT_FORM,
  type CategoryValue,
  type ProductFormState,
  type Product,
} from "./type";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const UPLOAD_ENDPOINT = "https://app.nexovea.com/nexoviia/v1/upload-resources";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass an existing product to open the modal in edit mode; omit/null for create mode. */
  product?: Product | null;
}

const productToForm = (product: Product): ProductFormState => ({
  name: product.name ?? "",
  description: product.description ?? "",
  price: String(product.price ?? ""),
  stock: String(product.stock ?? ""),
  sizes: product.sizes ?? [],
  colors: product.colors ?? [],
  category: (product.category ?? "") as CategoryValue,
  subCategory: product.subCategory ?? "",
});

export default function CreateProductModal({
  isOpen,
  onClose,
  product = null,
}: CreateProductModalProps) {
  const isEditMode = Boolean(product);

  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<
    "category" | "subCategory" | "sizes" | "colors" | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Populate (or reset) the form whenever the modal opens/closes, or the
  // product being edited changes.
  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_PRODUCT_FORM);
      setImageFile(null);
      setExistingImageUrl(null);
      setFormError("");
      setOpenDropdown(null);
      return;
    }

    if (product) {
      setForm(productToForm(product));
      setExistingImageUrl(product.imageUrl ?? null);
    } else {
      setForm(EMPTY_PRODUCT_FORM);
      setExistingImageUrl(null);
    }
    setImageFile(null);
    setFormError("");
  }, [isOpen, product]);

  // Build/revoke the local preview URL whenever the chosen file changes.
  // Falls back to the existing product image when there's no new file yet.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview(existingImageUrl);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile, existingImageUrl]);

  // Close any open dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) return;
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-root]")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isOpen) return null;

  const subCategoryOptions = form.category
    ? SUBCATEGORIES[form.category as CategoryValue]
    : [];

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }
    setImageFile(file);
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

  const validate = (): string => {
    if (!form.name.trim()) return "Product name is required.";
    if (!imageFile && !existingImageUrl) return "Please upload a product image.";
    const priceNum = Number(form.price);
    if (!form.price || Number.isNaN(priceNum) || priceNum <= 0)
      return "Enter a valid price.";
    const stockNum = Number(form.stock);
    if (form.stock === "" || Number.isNaN(stockNum) || stockNum < 0)
      return "Enter a valid stock quantity.";
    if (form.sizes.length === 0) return "Select at least one size.";
    if (form.colors.length === 0) return "Select at least one color.";
    if (!form.category) return "Select a category.";
    if (!form.subCategory) return "Select a subcategory.";
    if (!form.description.trim()) return "Description is required.";
    return "";
  };

  /**
   * Uploads the image to the Nexoviia S3-backed endpoint and returns the
   * permanent S3 URL. Throws if the request fails so the caller can handle it.
   */
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Upload failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as {
      message: string;
      s3_url: string;
      original_name: string;
      mime_type: string;
      size_bytes: number;
      uploaded_at: string;
    };

    return data.s3_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      // Only hit the upload endpoint if a *new* image was picked; otherwise
      // keep the product's existing S3 URL as-is.
      const imageUrl = imageFile ? await uploadImage(imageFile) : existingImageUrl!;

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        sizes: form.sizes,
        colors: form.colors,
        category: form.category,
        subCategory: form.subCategory,
        imageUrl,
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

      onClose();
    } catch (err) {
      console.error(`Failed to ${isEditMode ? "update" : "create"} product:`, err);
      setFormError("Something went wrong while saving. Please try again.");
      toast.error(`Couldn't ${isEditMode ? "update" : "create"} the product. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

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
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
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
            <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-2">
              PRODUCT IMAGE
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 text-xs font-medium bg-white/90 px-3 py-1.5 rounded-md hover:bg-white transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
              >
                <ImagePlus size={24} strokeWidth={1.5} />
                <span className="text-sm">Click to upload an image</span>
                <span className="text-xs">PNG or JPG, up to 5MB</span>
              </button>
            )}
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

          {/* Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold tracking-wide text-gray-500 mb-1.5">
                PRICE ($)
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

          {/* Sizes + Colors (multi-select dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MultiSelectDropdown
              label="SIZES"
              placeholder="Select sizes"
              options={[...SIZES]}
              selected={form.sizes}
              isOpen={openDropdown === "sizes"}
              onToggleOpen={() =>
                setOpenDropdown((d) => (d === "sizes" ? null : "sizes"))
              }
              onToggleValue={(v) => toggleMulti("sizes", v)}
            />
            <MultiSelectDropdown
              label="COLORS"
              placeholder="Select colors"
              options={[...COLORS]}
              selected={form.colors}
              isOpen={openDropdown === "colors"}
              onToggleOpen={() =>
                setOpenDropdown((d) => (d === "colors" ? null : "colors"))
              }
              onToggleValue={(v) => toggleMulti("colors", v)}
            />
          </div>

          {/* Category + Subcategory (single-select dropdowns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SingleSelectDropdown
              label="CATEGORY"
              placeholder="Select category"
              options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              selected={form.category}
              isOpen={openDropdown === "category"}
              onToggleOpen={() =>
                setOpenDropdown((d) => (d === "category" ? null : "category"))
              }
              onSelect={(v) =>
                setForm((f) => ({
                  ...f,
                  category: v as CategoryValue,
                  subCategory: "", // reset dependent field
                }))
              }
            />
            <SingleSelectDropdown
              label="SUBCATEGORY"
              placeholder={form.category ? "Select subcategory" : "Pick a category first"}
              options={subCategoryOptions.map((s) => ({ value: s, label: s }))}
              selected={form.subCategory}
              isOpen={openDropdown === "subCategory"}
              disabled={!form.category}
              onToggleOpen={() =>
                setOpenDropdown((d) => (d === "subCategory" ? null : "subCategory"))
              }
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
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
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
              {submitting
                ? "Saving…"
                : isEditMode
                ? "Save Changes"
                : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Small reusable dropdown primitives, kept local to this file so the    */
/*  modal stays a single self-contained component.                        */
/* ---------------------------------------------------------------------- */

function MultiSelectDropdown({
  label,
  placeholder,
  options,
  selected,
  isOpen,
  onToggleOpen,
  onToggleValue,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string[];
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleValue: (value: string) => void;
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
        <span className={selected.length ? "text-gray-800" : "text-gray-400"}>
          {selected.length ? selected.join(", ") : placeholder}
        </span>
        <ChevronDown size={15} className="text-gray-400" />
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
                {opt}
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
  label,
  placeholder,
  options,
  selected,
  isOpen,
  disabled,
  onToggleOpen,
  onSelect,
}: {
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  selected: string;
  isOpen: boolean;
  disabled?: boolean;
  onToggleOpen: () => void;
  onSelect: (value: string) => void;
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
              {selected === opt.value && (
                <Check size={14} className="text-[#C9A96E]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}