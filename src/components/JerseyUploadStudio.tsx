import React, { useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Trash2,
  Eye,
  Smartphone,
  Monitor,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Tag,
  Layers,
} from 'lucide-react';
import { Product, ProductSize, JerseyType, JerseyVersion } from '../types';
import { SIZES, JERSEY_TYPES, JERSEY_VERSIONS, BUSINESS_INFO } from '../lib/constants';
import { uploadJerseyImage, saveProductToSupabase } from '../lib/supabase';

interface JerseyUploadStudioProps {
  initialProduct?: Product | null;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

interface UploadedImageState {
  id: string;
  file?: File;
  url: string;
  storage_path: string;
  is_cover: boolean;
  display_order: number;
  uploading?: boolean;
  progress?: number;
}

export const JerseyUploadStudio: React.FC<JerseyUploadStudioProps> = ({
  initialProduct,
  onSuccess,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Details
  const [name, setName] = useState(initialProduct?.name || '');
  const [clubOrCountry, setClubOrCountry] = useState(initialProduct?.club_or_country || '');
  const [country, setCountry] = useState(initialProduct?.country || 'Ghana');
  const [season, setSeason] = useState(initialProduct?.season || '2025/2026');
  const [jerseyType, setJerseyType] = useState<JerseyType>(initialProduct?.jersey_type || 'Home');
  const [version, setVersion] = useState<JerseyVersion>(
    initialProduct?.version || 'Fan Version'
  );
  const [shortDesc, setShortDesc] = useState(
    initialProduct?.short_description ||
      'Official authentic match-day football jersey with high-breathability fabric, embroidered crest, and premium sponsor detailing.'
  );
  const [fullDesc, setFullDesc] = useState(
    initialProduct?.full_description ||
      'Experience ultimate comfort and match-day pride. Crafted with advanced moisture-wicking technology to keep you dry and cool whether on the pitch or cheering on the stands in Abofour. Available in genuine Fan and Player versions with official badges.'
  );
  const [tagsInput, setTagsInput] = useState(initialProduct?.tags?.join(', ') || 'epl, champions league, official kit');

  // Step 2: Images
  const [images, setImages] = useState<UploadedImageState[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) {
      return initialProduct.images.map((img, idx) => ({
        id: img.id,
        url: img.url,
        storage_path: img.storage_path,
        is_cover: img.is_cover ?? idx === 0,
        display_order: img.display_order ?? idx,
      }));
    }
    return [];
  });
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Step 3: Pricing & Stock
  const [sellingPrice, setSellingPrice] = useState<number>(
    initialProduct?.selling_price || 250
  );
  const [originalPrice, setOriginalPrice] = useState<string>(
    initialProduct?.original_price ? String(initialProduct.original_price) : ''
  );
  const [featured, setFeatured] = useState<boolean>(initialProduct?.featured || false);
  const [newArrival, setNewArrival] = useState<boolean>(initialProduct?.new_arrival || true);

  // Per-size stock
  const [enabledSizes, setEnabledSizes] = useState<Record<string, { enabled: boolean; stock: number; sku?: string }>>(() => {
    const initial: Record<string, { enabled: boolean; stock: number; sku?: string }> = {};
    SIZES.forEach((s) => {
      const found = initialProduct?.sizes?.find((sz) => sz.size_label === s);
      initial[s] = {
        enabled: found ? true : ['M', 'L', 'XL'].includes(s),
        stock: found ? found.stock_quantity : 5,
        sku: found?.sku || '',
      };
    });
    return initial;
  });

  // Step 4: Preview Device View
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Step 5: Save State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [publishedSuccessProduct, setPublishedSuccessProduct] = useState<Product | null>(null);

  // Generate URL slug from name + season
  const slug =
    initialProduct?.slug ||
    `${name}-${clubOrCountry}-${season}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Step Validation Checkers
  const validateStep1 = () => {
    return Boolean(
      name.trim() &&
      clubOrCountry.trim() &&
      season.trim() &&
      jerseyType &&
      version &&
      shortDesc.trim()
    );
  };

  const validateStep2 = () => {
    return images.length > 0;
  };

  const validateStep3 = () => {
    if (sellingPrice <= 0) return false;
    if (originalPrice && Number(originalPrice) < sellingPrice) return false;
    const hasAtLeastOneSize = Object.values(enabledSizes).some(
      (s) => s.enabled && s.stock >= 0
    );
    return hasAtLeastOneSize;
  };

  // Image Upload Handlers
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setImageError(null);

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) {
        setImageError(`File "${file.name}" is not an image.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImageError(`File "${file.name}" exceeds 10MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    for (const file of validFiles) {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      const tempUrl = URL.createObjectURL(file);

      // Add temporary state
      setImages((prev) => [
        ...prev,
        {
          id: tempId,
          file,
          url: tempUrl,
          storage_path: `uploading/${file.name}`,
          is_cover: prev.length === 0,
          display_order: prev.length,
          uploading: true,
          progress: 20,
        },
      ]);

      // Upload to Supabase Storage
      const uploaded = await uploadJerseyImage(file, (p) => {
        setImages((prev) =>
          prev.map((img) => (img.id === tempId ? { ...img, progress: p } : img))
        );
      });

      if (uploaded) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === tempId
              ? {
                  ...img,
                  url: uploaded.url,
                  storage_path: uploaded.storage_path,
                  uploading: false,
                  progress: 100,
                }
              : img
          )
        );
      } else {
        // Upload failed
        setImageError(`Failed to upload "${file.name}". Please check storage settings.`);
        setImages((prev) => prev.filter((img) => img.id !== tempId));
      }
    }
  };

  const handleSetCover = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_cover: img.id === id,
      }))
    );
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.is_cover)) {
        filtered[0].is_cover = true;
      }
      return filtered;
    });
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const reordered = [...images];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;
    reordered.forEach((img, idx) => (img.display_order = idx));
    setImages(reordered);
  };

  // Final Publish / Save Handler
  const handleSaveProduct = async (statusToSet: 'published' | 'draft') => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      setSubmitError('Please complete all required fields and upload at least one image.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const tagsArray = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const sizesArray: Array<{
        size_label: ProductSize['size_label'];
        stock_quantity: number;
        sku?: string;
      }> = Object.entries(enabledSizes)
        .filter(([_, data]) => data.enabled)
        .map(([sizeLabel, data]) => ({
          size_label: sizeLabel as ProductSize['size_label'],
          stock_quantity: Number(data.stock) || 0,
          sku: data.sku || undefined,
        }));

      const productPayload: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { id?: string } = {
        id: initialProduct?.id,
        name: name.trim(),
        slug: slug.trim(),
        club_or_country: clubOrCountry.trim(),
        country: country.trim(),
        season: season.trim(),
        jersey_type: jerseyType,
        version: version,
        short_description: shortDesc.trim(),
        full_description: fullDesc.trim(),
        selling_price: Number(sellingPrice),
        original_price: originalPrice ? Number(originalPrice) : null,
        featured,
        new_arrival: newArrival,
        status: statusToSet,
        tags: tagsArray,
      };

      const imagesArray = images.map((img, idx) => ({
        url: img.url,
        storage_path: img.storage_path,
        is_cover: img.is_cover,
        display_order: idx,
      }));

      const result = await saveProductToSupabase(productPayload, imagesArray, sizesArray);

      if (result.success && result.product) {
        setPublishedSuccessProduct(result.product);
      } else {
        setSubmitError(result.error || 'Failed to save product to database');
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : 'An unexpected error occurred';
      setSubmitError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (publishedSuccessProduct) {
    return (
      <div className="bg-[#0D121F] border border-gray-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-[#00E676] flex items-center justify-center mx-auto text-[#00E676] shadow-lg shadow-[#00E676]/20">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00E676]/20 text-[#00E676] uppercase tracking-wider">
            {publishedSuccessProduct.status === 'published' ? 'Jersey Published' : 'Saved as Draft'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
            {publishedSuccessProduct.name}
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            {publishedSuccessProduct.status === 'published'
              ? 'This jersey is now live in the store catalog and ready for Abofour fans to order.'
              : 'Your draft has been saved securely to Supabase. You can edit and publish anytime.'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#080B11] border border-gray-800 flex items-center justify-between text-xs text-left">
          <div className="flex items-center gap-3">
            <img
              src={
                publishedSuccessProduct.images?.find((i) => i.is_cover)?.url ||
                publishedSuccessProduct.images?.[0]?.url ||
                '/logo.png'
              }
              alt=""
              className="w-12 h-14 object-contain rounded-lg bg-black/50 p-1 border border-gray-800"
            />
            <div>
              <p className="font-bold text-white">{publishedSuccessProduct.name}</p>
              <p className="text-gray-400">
                {publishedSuccessProduct.club_or_country} • {publishedSuccessProduct.season}
              </p>
            </div>
          </div>
          <p className="font-bold text-[#00E676] text-sm">
            {BUSINESS_INFO.currency} {publishedSuccessProduct.selling_price.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => onSuccess(publishedSuccessProduct)}
            className="flex-1 py-3 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Product in Catalog
          </button>
          <button
            onClick={() => {
              setPublishedSuccessProduct(null);
              setCurrentStep(1);
              setName('');
              setImages([]);
            }}
            className="flex-1 py-3 rounded-xl bg-[#0F172A] border border-gray-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#00E676]" />
            Upload Another Jersey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0D15] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Studio Header & Workflow Stepper */}
      <div className="p-6 bg-gradient-to-r from-[#080B11] via-[#0E1524] to-[#080B11] border-b border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                JERSEY UPLOAD STUDIO
              </h1>
              <p className="text-xs text-gray-400">
                Interactive multi-step product publishing pipeline for Rash Hub Store
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white rounded-xl border border-gray-700 hover:bg-white/5 transition self-start sm:self-auto"
          >
            Cancel & Back
          </button>
        </div>

        {/* 5-Step Workflow Tracker */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {[
            { step: 1, label: 'Details', icon: Layers },
            { step: 2, label: 'Photos', icon: ImageIcon },
            { step: 3, label: 'Pricing & Stock', icon: Tag },
            { step: 4, label: 'Live Preview', icon: Eye },
            { step: 5, label: 'Publish', icon: CheckCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                onClick={() => setCurrentStep(item.step as 1 | 2 | 3 | 4 | 5)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2 px-1 rounded-xl text-xs font-bold transition border ${
                  isActive
                    ? 'bg-[#00E676] text-black border-[#00E676] shadow-lg shadow-[#00E676]/20'
                    : isCompleted
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/40'
                    : 'bg-[#080B11] text-gray-500 border-gray-800 hover:border-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate hidden md:inline">{item.label}</span>
                <span className="md:hidden text-[10px]">{item.step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="p-6 sm:p-8">
        {/* STEP 1: PRODUCT DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#00E676]" />
                Step 1: Jersey Details & Specifications
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Enter the official football club or national team, season, and edition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Jersey Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ghana Black Stars Home Kit 24/25"
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Club or National Team *
                </label>
                <input
                  type="text"
                  value={clubOrCountry}
                  onChange={(e) => setClubOrCountry(e.target.value)}
                  placeholder="e.g. Ghana / Real Madrid / Arsenal"
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Ghana, Spain, England"
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Season *
                </label>
                <input
                  type="text"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  placeholder="e.g. 2025/2026 or 2024/2025"
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Jersey Type *
                </label>
                <select
                  value={jerseyType}
                  onChange={(e) => setJerseyType(e.target.value as JerseyType)}
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                >
                  {JERSEY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Jersey Version *
                </label>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value as JerseyVersion)}
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                >
                  {JERSEY_VERSIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. epl, champions league, popular"
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Short Description *
                </label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Brief 1-sentence highlight for product card"
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Full Description & Fabric Technology *
                </label>
                <textarea
                  rows={4}
                  value={fullDesc}
                  onChange={(e) => setFullDesc(e.target.value)}
                  placeholder="Detailed description of material, breathability, badge embroidery..."
                  className="w-full px-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: IMAGE UPLOAD */}
        {currentStep === 2 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#00E676]" />
                Step 2: Jersey Photos & Gallery Management
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Upload clear front, back, and detail photos. High-resolution images showcase jersey quality to Abofour fans.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                isDragging
                  ? 'border-[#00E676] bg-[#00E676]/10 scale-[1.01]'
                  : 'border-gray-700 bg-[#080B11] hover:border-gray-500'
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] mb-4">
                <Upload className="w-8 h-8" />
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide uppercase">
                DROP YOUR JERSEY PHOTOS HERE OR BROWSE FILES
              </h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm">
                Supports PNG, JPG, WEBP up to 10MB each. Click or drag to add multiple images.
              </p>
            </div>

            {imageError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Uploaded Gallery Thumbnails */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Uploaded Photos ({images.length})
                  </h4>
                  <span className="text-[11px] text-gray-400">
                    Click the star to set Main Cover image
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`relative aspect-[3/4] bg-[#070A11] border rounded-2xl overflow-hidden p-2 flex flex-col justify-between group ${
                        img.is_cover
                          ? 'border-[#00E676] shadow-lg shadow-[#00E676]/10 ring-2 ring-[#00E676]/30'
                          : 'border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      {/* Image display */}
                      <img
                        src={img.url}
                        alt="Jersey preview"
                        className="w-full h-full object-contain"
                      />

                      {/* Cover Badge */}
                      {img.is_cover && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#00E676] text-black text-[9px] font-black uppercase tracking-wider shadow">
                          Cover Photo
                        </div>
                      )}

                      {/* Upload Progress Bar if still uploading */}
                      {img.uploading && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4">
                          <p className="text-xs text-white font-bold mb-2">Uploading...</p>
                          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-[#00E676] h-full transition-all duration-300"
                              style={{ width: `${img.progress || 50}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between bg-black/85 backdrop-blur-xs p-1.5 rounded-xl opacity-90 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleSetCover(img.id)}
                          className={`p-1 rounded-md transition ${
                            img.is_cover
                              ? 'text-[#00E676]'
                              : 'text-gray-400 hover:text-white'
                          }`}
                          title="Set as Cover"
                        >
                          <Star className={`w-4 h-4 ${img.is_cover ? 'fill-[#00E676]' : ''}`} />
                        </button>

                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              onClick={() => handleMoveImage(idx, 'up')}
                              className="p-1 text-gray-400 hover:text-white"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              onClick={() => handleMoveImage(idx, 'down')}
                              className="p-1 text-gray-400 hover:text-white"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveImage(img.id)}
                            className="p-1 text-gray-400 hover:text-red-400"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: PRICING & STOCK */}
        {currentStep === 3 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#00E676]" />
                Step 3: Pricing in Ghana Cedis (GH₵) & Size Inventory
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Configure selling price and separate inventory stock for each available size.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Selling Price ({BUSINESS_INFO.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-gray-400">
                    {BUSINESS_INFO.currency}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full pl-14 pr-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-base font-bold text-[#00E676] focus:outline-none focus:border-[#00E676]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Original Price ({BUSINESS_INFO.currency}) (Optional Discount)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-xs font-bold text-gray-400">
                    {BUSINESS_INFO.currency}
                  </span>
                  <input
                    type="number"
                    min={sellingPrice}
                    step="5"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="e.g. 300"
                    className="w-full pl-14 pr-4 py-3 bg-[#080B11] border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#00E676]"
                  />
                </div>
                {originalPrice && Number(originalPrice) > sellingPrice && (
                  <p className="text-[11px] text-[#00E676] mt-1 font-semibold">
                    Discount badge:{' '}
                    {Math.round(
                      ((Number(originalPrice) - sellingPrice) / Number(originalPrice)) * 100
                    )}
                    % OFF
                  </p>
                )}
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="p-4 rounded-xl bg-[#080B11] border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-700">
                <div>
                  <p className="text-xs font-bold text-white">Featured Match Jersey</p>
                  <p className="text-[11px] text-gray-400">Showcases on homepage featured reel</p>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#00E676]"
                />
              </label>

              <label className="p-4 rounded-xl bg-[#080B11] border border-gray-800 flex items-center justify-between cursor-pointer hover:border-gray-700">
                <div>
                  <p className="text-xs font-bold text-white">New Arrival Badge</p>
                  <p className="text-[11px] text-gray-400">Marks jersey as recently added</p>
                </div>
                <input
                  type="checkbox"
                  checked={newArrival}
                  onChange={(e) => setNewArrival(e.target.checked)}
                  className="w-4 h-4 accent-[#00E676]"
                />
              </label>
            </div>

            {/* Sizes & Separate Stock Matrix */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Available Sizes & Stock Quantity
                </h4>
                <span className="text-[11px] text-gray-400">
                  Toggle on the sizes currently in stock
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SIZES.map((size) => {
                  const sizeState = enabledSizes[size];
                  return (
                    <div
                      key={size}
                      className={`p-3.5 rounded-xl border transition ${
                        sizeState.enabled
                          ? 'bg-[#0E1524] border-[#00E676]/40'
                          : 'bg-[#080B11] border-gray-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                        <span className="text-sm font-black text-white">Size {size}</span>
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sizeState.enabled}
                            onChange={(e) =>
                              setEnabledSizes((prev) => ({
                                ...prev,
                                [size]: { ...prev[size], enabled: e.target.checked },
                              }))
                            }
                            className="accent-[#00E676]"
                          />
                          <span>Available</span>
                        </label>
                      </div>

                      {sizeState.enabled && (
                        <div className="mt-2.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Stock Count:</span>
                            <input
                              type="number"
                              min="0"
                              value={sizeState.stock}
                              onChange={(e) =>
                                setEnabledSizes((prev) => ({
                                  ...prev,
                                  [size]: { ...prev[size], stock: Math.max(0, parseInt(e.target.value) || 0) },
                                }))
                              }
                              className="w-20 px-2 py-1 bg-[#080B11] border border-gray-700 rounded-lg text-xs font-bold text-white text-right focus:border-[#00E676]"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Optional SKU (e.g. GHA-24-M)"
                            value={sizeState.sku || ''}
                            onChange={(e) =>
                              setEnabledSizes((prev) => ({
                                ...prev,
                                [size]: { ...prev[size], sku: e.target.value },
                              }))
                            }
                            className="w-full px-2 py-1 bg-[#080B11] border border-gray-700 rounded-lg text-[11px] text-gray-300 placeholder-gray-600 focus:border-[#00E676]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LIVE PREVIEW */}
        {currentStep === 4 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#00E676]" />
                  Step 4: Live Storefront Preview
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Preview how your jersey appears to customers before publishing.
                </p>
              </div>

              {/* Device Selector */}
              <div className="flex items-center gap-1 p-1 bg-[#080B11] border border-gray-800 rounded-xl">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    previewDevice === 'desktop'
                      ? 'bg-[#00E676] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    previewDevice === 'mobile'
                      ? 'bg-[#00E676] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>
            </div>

            {/* Simulated Store Preview Box */}
            <div className="flex justify-center">
              <div
                className={`bg-[#080B11] border border-gray-800 rounded-3xl p-6 shadow-2xl transition-all duration-300 ${
                  previewDevice === 'mobile' ? 'w-full max-w-sm' : 'w-full'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Image Column */}
                  <div className="aspect-[4/4.5] bg-[#05080E] border border-gray-800 rounded-2xl p-4 flex items-center justify-center relative">
                    <img
                      src={
                        images.find((i) => i.is_cover)?.url ||
                        images[0]?.url ||
                        '/logo.png'
                      }
                      alt={name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {newArrival && (
                        <span className="px-2 py-0.5 rounded bg-[#00E676] text-black font-extrabold text-[9px] uppercase">
                          NEW
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-black/80 text-gray-300 font-semibold text-[9px] border border-gray-700">
                        {version}
                      </span>
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase font-bold text-[#00E676] tracking-wider">
                        {clubOrCountry} • {season} • {jerseyType}
                      </p>
                      <h3 className="text-xl font-black text-white mt-1">{name || 'Jersey Title'}</h3>
                      <p className="text-xs text-gray-400 mt-2">{shortDesc}</p>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#00E676]">
                        {BUSINESS_INFO.currency} {Number(sellingPrice).toFixed(2)}
                      </span>
                      {originalPrice && Number(originalPrice) > sellingPrice && (
                        <span className="text-xs text-gray-500 line-through">
                          {BUSINESS_INFO.currency} {Number(originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Sizes preview */}
                    <div>
                      <p className="text-xs font-bold text-gray-300 mb-2">Available Sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map((sz) => {
                          const sData = enabledSizes[sz];
                          if (!sData.enabled) return null;
                          return (
                            <span
                              key={sz}
                              className="px-3 py-1.5 rounded-lg border border-gray-700 bg-[#0F172A] text-xs font-bold text-white"
                            >
                              {sz} ({sData.stock})
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full py-3 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 opacity-90 cursor-default"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart (Simulated)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PUBLISH & DEPLOY */}
        {currentStep === 5 && (
          <div className="space-y-6 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Ready to Save & Publish</h2>
              <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                All details, images, and inventory are configured. Choose whether to make this jersey live in the public catalog immediately or keep as an admin draft.
              </p>
            </div>

            {submitError && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Summary Card */}
            <div className="p-5 rounded-2xl bg-[#080B11] border border-gray-800 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Jersey Name:</span>
                <span className="font-bold text-white">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Club / Season:</span>
                <span className="text-gray-300">
                  {clubOrCountry} ({season})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Edition & Version:</span>
                <span className="text-gray-300">
                  {jerseyType} • {version}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Selling Price:</span>
                <span className="font-bold text-[#00E676]">
                  {BUSINESS_INFO.currency} {Number(sellingPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Photos Uploaded:</span>
                <span className="text-gray-300">{images.length} image(s)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveProduct('draft')}
                className="flex-1 py-3.5 rounded-xl border border-gray-700 bg-[#0F172A] text-white font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSaveProduct('published')}
                className="flex-1 py-3.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? 'Publishing...' : 'Publish Jersey Now'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Step Navigation Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4 | 5) : prev))}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white rounded-xl border border-gray-800 hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          {currentStep < 5 && (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && !validateStep1()) {
                  alert('Please fill out the Jersey Name, Club, Season, and Description.');
                  return;
                }
                if (currentStep === 2 && !validateStep2()) {
                  alert('Please upload at least one jersey photo.');
                  return;
                }
                if (currentStep === 3 && !validateStep3()) {
                  alert('Please enter a valid price and enable at least one size.');
                  return;
                }
                setCurrentStep((prev) => (prev < 5 ? ((prev + 1) as 1 | 2 | 3 | 4 | 5) : prev));
              }}
              className="px-6 py-2.5 text-xs font-extrabold rounded-xl bg-[#00E676] text-black hover:bg-[#00FF7F] transition shadow-md shadow-[#00E676]/20 flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
