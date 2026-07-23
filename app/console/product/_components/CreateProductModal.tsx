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
  EMPTY_PRODUCT_FORM,
  MAX_PRODUCT_IMAGES,
  type CategoryValue,
  type ProductFormState,
  type Product,
} from "./type";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB per image

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass an existing product to open the modal in edit mode; omit/null for create mode. */
  product?: Product | null;
}

// A single image slot in the modal — either one already saved on the
// product (existing) or a freshly picked file waiting to be uploaded (new).
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
});

export default function CreateProductModal({
  isOpen,
  onClose,
  product = null,
}: CreateProductModalProps) {
  const isEditMode = Boolean(product);

  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [images, setImages] = useState<ImageSlot[]>([]);
  // Storage paths for existing images the user removed in this session —
  // only actually deleted from Storage once the save succeeds.
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
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

  // Revoke local object URLs for any "new" slots when the modal unmounts/closes
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.kind === "new") URL.revokeObjectURL(img.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
      accepted.push({
        kind: "new",
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted]);
    }
    // allow re-selecting the same file later
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target.kind === "new") {
        URL.revokeObjectURL(target.previewUrl);
      } else if (target.kind === "existing" && target.path) {
        setRemovedPaths((paths) => [...paths, target.path]);
      }
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

  const validate = (): string => {
    if (!form.name.trim()) return "Product name is required.";
    if (images.length === 0) return "Please upload at least one product image.";
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
   * Uploads a single image to Firebase Storage under products/ and returns
   * both its download URL and storage path (path is kept so we can delete
   * it later without a backend endpoint).
   */
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
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");
    setSubmitting(true);

    // ── Step 1: upload any new images (existing ones are already on Storage) ──
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
      const message = err instanceof Error ? err.message : "Image upload failed. Please try again.";
      setFormError(message);
      toast.error("Couldn't upload the images. Please try again.");
      setSubmitting(false);
      return; // don't attempt the save without valid images
    }

    // ── Step 2: save product ──
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

      // Clean up any images the user removed during editing — do this last,
      // and don't let a cleanup failure block the save from being reported.
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
      const message = err instanceof Error ? err.message : "Something went wrong while saving. Please try again.";
      setFormError(message);
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
                    <img
                      src={src}
                      alt={`Product image ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
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