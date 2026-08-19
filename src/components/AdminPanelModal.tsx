import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Save,
  KeyRound,
  Building2,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  Upload,
  RefreshCw,
  LogOut,
  Sliders,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  ArrowUp,
  ArrowDown,
  MessageSquareQuote,
  FileText,
  Check,
  ExternalLink,
  Navigation,
  BookOpen,
  Eye,
  Crop,
  Info,
  Database,
  AlertTriangle,
  Copy,
  Terminal,
  Server,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useFalconStore } from '../context/StoreContext';
import { Product, Category, QuoteRequest, CataloguePage } from '../types';
import { ProductVisual } from './ProductVisual';
import { compressImageFile, compressImageDataUrl } from '../utils/imageCompressor';
import { ImageCropperModal } from './ImageCropperModal';
import { testSupabaseConnection } from '../services/supabaseService';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const {
    companyDetails,
    heroContent,
    logoImageUrl,
    products,
    categories,
    whyChooseUs,
    adminCredentials,
    logoutAdmin,
    updateCompanyDetails,
    updateHeroContent,
    updateLogoImage,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    updateWhyChooseUs,
    updateAdminCredentials,
    resetToDefaults,
    isFirebaseConnected,
    quotes,
    updateQuoteStatus,
    deleteQuote,
    catalogueSettings,
    updateCatalogueSettings,
    updateCataloguePages,
    updateSingleCataloguePage,
    syncAllDataToSupabase,
  } = useFalconStore();

  const [activeTab, setActiveTab] = useState<'LOGOS' | 'COMPANY' | 'PRODUCTS' | 'CATEGORIES' | 'WHY_US' | 'CATALOGUE' | 'SECURITY' | 'DATABASE'>('CATALOGUE');
  const [successMsg, setSuccessMsg] = useState('');
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [newSubCatText, setNewSubCatText] = useState('');

  // Supabase Database Connection & Migration Diagnostic State
  const [dbDiagnostic, setDbDiagnostic] = useState<{
    tested: boolean;
    connected: boolean;
    tablesExist: boolean;
    message: string;
    errorDetail?: string;
  }>({
    tested: false,
    connected: true,
    tablesExist: false,
    message: 'Testing connection...',
  });
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const runDbTest = async () => {
    setIsTestingDb(true);
    try {
      const res = await testSupabaseConnection();
      setDbDiagnostic({
        tested: true,
        connected: res.connected,
        tablesExist: res.tablesExist,
        message: res.message,
        errorDetail: res.errorDetail,
      });
    } catch (err: any) {
      setDbDiagnostic({
        tested: true,
        connected: false,
        tablesExist: false,
        message: 'Connection check failed: ' + (err?.message || err),
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDbTest();
    }
  }, [isOpen]);

  // Interactive Image Cropper Dialog State
  const [cropperConfig, setCropperConfig] = useState<{
    isOpen: boolean;
    imageSrc: string;
    title: string;
    targetLabel: string;
    aspectRatio: number | null;
    recommendedSizeText: string;
    onCropComplete: (dataUrl: string) => void | Promise<void>;
  }>({
    isOpen: false,
    imageSrc: '',
    title: 'Crop & Center Image',
    targetLabel: 'Product Photo',
    aspectRatio: 1,
    recommendedSizeText: 'Best fit: 800 x 800 px (Square 1:1 ratio)',
    onCropComplete: () => {},
  });

  const openCropper = (params: {
    imageSrc: string;
    title?: string;
    targetLabel?: string;
    aspectRatio?: number | null;
    recommendedSizeText?: string;
    onCropComplete: (dataUrl: string) => void | Promise<void>;
  }) => {
    setCropperConfig({
      isOpen: true,
      imageSrc: params.imageSrc,
      title: params.title || 'Crop & Center Image',
      targetLabel: params.targetLabel || 'Image',
      aspectRatio: params.aspectRatio !== undefined ? params.aspectRatio : 1,
      recommendedSizeText: params.recommendedSizeText || 'Best fit: 800 x 800 px (Square 1:1 ratio)',
      onCropComplete: params.onCropComplete,
    });
  };

  const closeCropper = () => {
    setCropperConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Image URL Link input states
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [headerBannerUrlInput, setHeaderBannerUrlInput] = useState('');
  const [heroUrlInput, setHeroUrlInput] = useState('');
  const [productImgUrlInput, setProductImgUrlInput] = useState('');
  const [categoryImgUrlInput, setCategoryImgUrlInput] = useState('');
  const [pageImgUrlInputs, setPageImgUrlInputs] = useState<Record<number, string>>({});

  // Editable Form Local States
  const [editingCompany, setEditingCompany] = useState(companyDetails);
  const [editingHero, setEditingHero] = useState(heroContent);
  const [editingCreds, setEditingCreds] = useState({ email: adminCredentials.email, password: '' });
  const [editingCatalogue, setEditingCatalogue] = useState(catalogueSettings);

  // Sync form states with live Firestore snapshot updates
  useEffect(() => {
    setEditingCompany(companyDetails);
  }, [companyDetails]);

  useEffect(() => {
    setEditingHero(heroContent);
  }, [heroContent]);

  useEffect(() => {
    setEditingCreds({ email: adminCredentials.email, password: '' });
  }, [adminCredentials]);

  useEffect(() => {
    setEditingCatalogue(catalogueSettings);
  }, [catalogueSettings]);

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Category Add/Edit Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [catForm, setCatForm] = useState<Partial<Category>>({
    title: '',
    subtitle: '',
    description: '',
    badge: 'POPULAR',
    icon: 'Flame',
    image: 'fan-regulator-5step',
    bgColor: 'bg-gradient-to-br from-[#101124] to-[#1E203C]',
  });

  // New/Editing Product Form State
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    name: '',
    category: 'summer',
    categoryName: 'Summer Switches',
    price: '₹150',
    amps: '16 Amp',
    voltage: '240V AC',
    steps: '5 Step',
    material: 'FR Polycarbonate',
    description: '',
    features: ['Hum-free operation', 'Flame retardant casing'],
    image: 'fan-regulator-5step',
    isTopPick: true,
    rating: 4.8,
    badge: 'Popular',
  });

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatForm({
      title: '',
      subtitle: '',
      description: '',
      badge: 'POPULAR',
      icon: 'Flame',
      image: 'fan-regulator-5step',
      imageUrl: '',
      subCategories: [],
      bgColor: 'bg-gradient-to-br from-[#101124] to-[#1E203C]',
      borderColor: 'border-slate-700',
      textColor: 'text-white',
      iconName: 'Flame',
    });
    setIsCategoryModalOpen(true);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const [movedItem] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, movedItem);

    reorderCategories(newCategories);
    showToast(`Reordered: "${movedItem.title}" moved ${direction}!`);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    const existingImg =
      cat.imageUrl ||
      (cat.image && (cat.image.startsWith('http') || cat.image.startsWith('data:') || cat.image.includes('/'))
        ? cat.image
        : '');
    setCatForm({
      ...cat,
      imageUrl: existingImg,
      image: cat.image || 'fan-regulator-5step',
      subCategories: cat.subCategories || [],
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.title) return;

    try {
      const rawImg = catForm.imageUrl || catForm.image || 'fan-regulator-5step';

      if (editingCategory?.id) {
        await updateCategory(editingCategory.id, {
          ...catForm,
          image: rawImg,
          imageUrl: rawImg,
          subCategories: catForm.subCategories || [],
        });
        showToast('Category updated and saved to Firebase!');
      } else {
        await addCategory({
          title: catForm.title || 'New Category',
          subtitle: catForm.subtitle || '',
          description: catForm.description || '',
          badge: catForm.badge || 'NEW',
          icon: catForm.icon || 'Flame',
          iconName: catForm.iconName || 'Flame',
          borderColor: catForm.borderColor || 'border-slate-700',
          textColor: catForm.textColor || 'text-white',
          image: rawImg,
          imageUrl: rawImg,
          subCategories: catForm.subCategories || [],
          bgColor: catForm.bgColor || 'bg-gradient-to-br from-[#101124] to-[#1E203C]',
        });
        showToast('New Category added & saved to Firebase!');
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      alert('❌ Failed to save Category to Firebase: ' + (err?.message || err));
    }
  };

  // Image File Upload Helper with Automatic High-Quality Compression & Cropping Support
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void | Promise<void>,
    label = 'Image',
    slotKey = label,
    cropOptions?: {
      aspectRatio?: number | null;
      recommendedSizeText?: string;
      title?: string;
    }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`[AdminUpload] Starting upload for "${label}" (Slot: ${slotKey}) | File: "${file.name}" | Size: ${(file.size / 1024).toFixed(1)} KB | MIME: ${file.type}`);

    // 25MB upper safety limit before client-side canvas compression
    if (file.size > 25 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      alert(`❌ ${label} file is too large (${sizeMb} MB). Please choose an image under 25 MB.`);
      e.target.value = '';
      return;
    }

    setUploadingMap((prev) => ({ ...prev, [slotKey]: true }));
    try {
      const isLogo = label.toLowerCase().includes('logo');
      const dataUrl = await compressImageFile(file, {
        maxWidth: isLogo ? 800 : 1400,
        maxHeight: isLogo ? 800 : 1400,
        quality: 0.88,
      });

      if (dataUrl) {
        if (cropOptions) {
          // Open Interactive Cropper Dialog directly
          openCropper({
            imageSrc: dataUrl,
            title: cropOptions.title || `Crop & Center ${label}`,
            targetLabel: label,
            aspectRatio: cropOptions.aspectRatio !== undefined ? cropOptions.aspectRatio : 1,
            recommendedSizeText: cropOptions.recommendedSizeText || 'Best fit: 800 x 800 px (Square 1:1 ratio)',
            onCropComplete: async (croppedUrl) => {
              closeCropper();
              await onSuccess(croppedUrl);
              showToast(`✅ ${label} cropped, centered & saved to database!`);
            },
          });
        } else {
          console.log(`[AdminUpload] Compress/Read completed for "${label}". Calling database persistence handler...`);
          await onSuccess(dataUrl);
          console.log(`[AdminUpload] ✅ Successfully saved "${label}" to Firestore!`);
          showToast(`✅ ${label} uploaded & saved to database!`);
        }
      } else {
        console.error(`[AdminUpload ERROR] Received empty dataUrl for "${label}"`);
        alert(`❌ Failed to process ${label} file.`);
      }
    } catch (err: any) {
      console.error(`[AdminUpload ERROR] Failed to upload ${label}:`, err);
      alert(`❌ Failed to upload ${label}: ` + (err?.message || err));
    } finally {
      setUploadingMap((prev) => {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      });
      e.target.value = '';
    }
  };

  // Save Handlers
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCompanyDetails(editingCompany);
      showToast('Company & Contact details saved to Firebase Database!');
    } catch (err: any) {
      alert('❌ Failed to save Company Details to Firebase: ' + (err?.message || err));
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateHeroContent(editingHero);
      showToast('Hero section content saved to Firebase Database!');
    } catch (err: any) {
      alert('❌ Failed to save Hero content to Firebase: ' + (err?.message || err));
    }
  };

  const handleSaveCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreds.password || editingCreds.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    try {
      await updateAdminCredentials(editingCreds.email, editingCreds.password);
      setEditingCreds({ ...editingCreds, password: '' });
      showToast('Admin email and password updated securely!');
    } catch (err: any) {
      alert('❌ Failed to save Admin credentials to Firebase: ' + (err?.message || err));
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name) return;

    try {
      const primaryImg =
        prodForm.images && prodForm.images.length > 0
          ? prodForm.images[0]
          : prodForm.image || 'fan-regulator-5step';
      const allImgs =
        prodForm.images && prodForm.images.length > 0
          ? prodForm.images
          : [primaryImg];

      const productPayload = {
        ...prodForm,
        image: primaryImg,
        images: allImgs,
      };

      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, productPayload);
        showToast('Product updated & saved to Firebase!');
      } else {
        await addProduct({
          name: prodForm.name || 'New Switch Product',
          category: prodForm.category || 'summer',
          categoryName: prodForm.categoryName || 'Summer Switches',
          price: prodForm.price || '₹100',
          amps: prodForm.amps || '16 Amp',
          voltage: prodForm.voltage || '240V',
          steps: prodForm.steps || '',
          material: prodForm.material || 'Polycarbonate',
          description: prodForm.description || '',
          features: prodForm.features || [],
          image: primaryImg,
          images: allImgs,
          perPiecePrice: prodForm.perPiecePrice || '',
          customSpecs: prodForm.customSpecs || [],
          isTopPick: prodForm.isTopPick ?? true,
          rating: prodForm.rating || 4.8,
          badge: prodForm.badge || 'New',
        });
        showToast('New Product added & saved to Firebase!');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      alert('❌ Failed to save Product to Firebase: ' + (err?.message || err));
    }
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm(prod);
    setIsProductModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category: 'summer',
      categoryName: 'Summer Switches',
      price: '₹150',
      amps: '16 Amp',
      voltage: '240V AC',
      steps: '5 Step',
      material: 'FR Polycarbonate',
      description: 'Heavy duty electrical switch designed for high reliability.',
      features: ['Long electrical life', 'Flame retardant body'],
      image: 'fan-regulator-5step',
      isTopPick: true,
      rating: 4.8,
      badge: 'Popular',
    });
    setIsProductModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full selection:bg-[#E0183D] selection:text-white pb-16">
      {/* Standalone Page Top Header Bar */}
      <header className="bg-[#101124] px-3 py-2.5 sm:px-6 sm:py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 sticky top-0 z-40 shadow-xl">
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-[#E0183D] rounded-xl text-white shadow-md shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-black text-white leading-tight">
                Falcon Admin Control
              </h1>
              <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border mt-0.5 ${
                isFirebaseConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{isFirebaseConnected ? 'Cloud Sync Active' : 'Connecting DB...'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={onClose}
              className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 border border-slate-700 shadow-sm"
              title="Return to Main Website"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Website</span>
            </button>
            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="text-[10px] font-bold bg-red-950/80 hover:bg-red-900 text-red-300 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 border border-red-900/80 shadow-sm"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={onClose}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-700 shadow-sm active:scale-95"
            title="Return to Main Website"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] sm:text-xs">Back to Website</span>
          </button>

          <button
            onClick={() => {
              logoutAdmin();
              onClose();
            }}
            className="text-xs font-bold bg-red-950/80 hover:bg-red-900 text-red-300 px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-red-900/80 shadow-sm active:scale-95"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="text-[11px] sm:text-xs">Logout</span>
          </button>
        </div>
      </header>

      {/* Live Notification Toast */}
      {successMsg && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 sticky top-[57px] sm:top-[65px] z-30 backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Responsive Tab Navigation Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md px-3 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 sticky top-[57px] sm:top-[65px] z-30 shadow-md">
        <button
          onClick={() => setActiveTab('CATALOGUE')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'CATALOGUE'
              ? 'bg-[#E0183D] text-white shadow-md ring-2 ring-[#E0183D]/50'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Product Catalogue ({editingCatalogue?.pages?.length || 11} Pages)</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGOS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'LOGOS'
              ? 'bg-[#E0183D] text-white shadow-md ring-2 ring-[#E0183D]/50'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#E0183D]" />
          <span>Logos & Hero Photo</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPANY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'COMPANY'
              ? 'bg-[#E0183D] text-white shadow-md ring-2 ring-[#E0183D]/50'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Header, Footer & Contact</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'PRODUCTS'
              ? 'bg-[#E0183D] text-white shadow-md ring-2 ring-[#E0183D]/50'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-blue-400" />
          <span>Products Range ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'CATEGORIES'
              ? 'bg-[#E0183D] text-white shadow-md ring-2 ring-[#E0183D]/50'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SECURITY')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'SECURITY'
              ? 'bg-[#E0183D] text-white shadow-md ring-2 ring-[#E0183D]/50'
              : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-purple-400" />
          <span>Admin Security</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('DATABASE');
            runDbTest();
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            activeTab === 'DATABASE'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md ring-2 ring-cyan-500/50'
              : 'bg-slate-950/60 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cloud Database & Sync</span>
          {dbDiagnostic.tested && (
            <span
              className={`w-2 h-2 rounded-full ${
                dbDiagnostic.tablesExist ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          )}
        </button>
      </div>

      {/* Main Admin Body Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3.5 sm:p-6 space-y-5">
        {/* Mobile-Friendly Storage & Permanence Info Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-slate-200 text-[12px] sm:text-xs">
                Permanent Cloud Storage Active (No 24-Hour Expiry)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                All photos, logos & catalogue pages are permanently stored in Supabase Storage. Supports images up to <strong className="text-white">25 MB</strong> with automatic high-speed WebP compression.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Max 25 MB / Photo
            </span>
          </div>
        </div>
          {/* TAB 1: LOGOS & HERO IMAGE */}
          {activeTab === 'LOGOS' && (
            <div className="space-y-6">
              {/* FEATURE 1: Full Custom Header Brand Banner (Combined Logo + Stylized Colorful Name) */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-red-900/50 space-y-4 shadow-lg ring-1 ring-red-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-[#E0183D] border border-red-500/30 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Full Header Banner Mode</span>
                    </div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#E0183D]" />
                      Custom Header Brand Banner (Combined Logo + Stylized Name Image)
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                      Upload a single complete image designed in Canva/Photoshop containing your custom Logo, colorful stylized Brand Name, and Taglines. It replaces the default vector icon and plain text across the top header.
                    </p>
                  </div>

                  {editingCompany.customHeaderBannerUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        const updated = { ...editingCompany, customHeaderBannerUrl: '', hideLogoText: false };
                        setEditingCompany(updated);
                        await updateCompanyDetails(updated);
                        showToast('Removed Custom Header Banner — Restored default Logo + Text!');
                      }}
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 underline shrink-0 flex items-center gap-1 self-start sm:self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Banner & Restore Default</span>
                    </button>
                  )}
                </div>

                {/* Size & Format Specifications Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-amber-400 block uppercase text-[10px] tracking-wider">
                      Recommended Resolution
                    </span>
                    <span className="text-white font-bold text-xs block">400 × 100 px <span className="text-slate-400 font-normal text-[10px]">(or 800 × 200 px HD)</span></span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-blue-400 block uppercase text-[10px] tracking-wider">
                      Aspect Ratio
                    </span>
                    <span className="text-white font-bold text-xs block">4:1 Ratio <span className="text-slate-400 font-normal text-[10px]">(Horizontal Banner)</span></span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-emerald-400 block uppercase text-[10px] tracking-wider">
                      Format & Transparency
                    </span>
                    <span className="text-white font-bold text-xs block">PNG (Transparent) <span className="text-slate-400 font-normal text-[10px]">or JPG / WebP</span></span>
                  </div>
                </div>

                {/* Live Header Preview Box */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block">
                    Live Header Appearance Preview:
                  </span>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-inner flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {editingCompany.customHeaderBannerUrl ? (
                        <div className="h-10 sm:h-12 max-w-[280px] sm:max-w-[360px] flex items-center">
                          <img
                            src={editingCompany.customHeaderBannerUrl}
                            alt="Header Banner Preview"
                            className="h-full w-auto max-w-full object-contain object-left"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E0183D] to-[#B00E2E] flex items-center justify-center text-white text-[10px] font-black">
                            FE
                          </div>
                          <div>
                            <span className="text-[14px] font-black text-slate-900 block leading-tight">
                              {editingCompany.brandName || 'Falcon Electrics'}
                            </span>
                            <span className="text-[8px] font-extrabold text-[#E0183D] uppercase tracking-wider block">
                              {editingCompany.logoTagline || 'Switch to excellence'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 hidden sm:inline-block">
                      {editingCompany.customHeaderBannerUrl ? 'Active Custom Banner' : 'Default Logo & Text'}
                    </span>
                  </div>
                </div>

                {/* Upload & Link Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  {/* File Upload Option */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-200 block">
                      1. Upload Designed Image File
                    </span>
                    <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow flex items-center justify-center gap-2 w-full active:scale-98">
                      <Upload className="w-4 h-4" />
                      <span>
                        {uploadingMap['Header Banner']
                          ? 'Uploading & Applying...'
                          : 'Select & Upload Header Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingMap['Header Banner'] === true}
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            async (url) => {
                              const updated = {
                                ...editingCompany,
                                customHeaderBannerUrl: url,
                                hideLogoText: true,
                              };
                              setEditingCompany(updated);
                              await updateCompanyDetails(updated);
                              showToast('Custom Header Banner uploaded & applied live to website header!');
                            },
                            'Header Banner',
                            'Header Banner'
                          )
                        }
                        className="hidden"
                      />
                    </label>
                    {uploadingMap['Header Banner'] && (
                      <span className="text-[11px] font-bold text-amber-400 block animate-pulse text-center">
                        Processing image & updating header in real-time...
                      </span>
                    )}
                  </div>

                  {/* Direct Link Option */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-200 block">
                      2. Or Paste Image URL Link
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={headerBannerUrlInput}
                        onChange={(e) => setHeaderBannerUrlInput(e.target.value)}
                        placeholder="Paste image link e.g. https://.../header-banner.png"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const trimmed = headerBannerUrlInput.trim();
                          if (trimmed) {
                            const updated = {
                              ...editingCompany,
                              customHeaderBannerUrl: trimmed,
                              hideLogoText: true,
                            };
                            setEditingCompany(updated);
                            await updateCompanyDetails(updated);
                            setHeaderBannerUrlInput('');
                            showToast('Custom Header Banner applied from Link!');
                          }
                        }}
                        className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow shrink-0"
                      >
                        Apply Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Standard Website Logo Section (Single Icon & Text Mode) */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#E0183D]" />
                      Standard Separate Logo Icon & Text Mode
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      If you prefer a square/circular logo icon alongside editable text & taglines
                    </p>
                  </div>
                  {logoImageUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        await updateLogoImage('');
                        showToast('Reset to default vector logo!');
                      }}
                      className="text-[10px] font-bold text-red-400 hover:text-red-300 underline"
                    >
                      Reset to Default Logo
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  {/* Logo Preview */}
                  <div className="w-24 h-24 rounded-2xl bg-[#101124] border border-slate-700 flex flex-col items-center justify-center p-2 shrink-0 relative overflow-hidden">
                    {logoImageUrl ? (
                      <img
                        src={logoImageUrl}
                        alt="Custom Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E0183D] to-[#B00E2E] flex items-center justify-center mx-auto text-white">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-300 block">FALCON</span>
                      </div>
                    )}
                    {uploadingMap['Website Logo'] && (
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-1 text-center">
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-1"></div>
                        <span className="text-[8px] font-bold text-white">Uploading...</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-3 flex-1 w-full">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block mb-1">
                        Upload Logo Icon (PNG / JPG / WebP)
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>
                            {uploadingMap['Website Logo']
                              ? 'Uploading & Saving...'
                              : 'Select & Upload Logo Icon'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingMap['Website Logo'] === true}
                            onChange={(e) =>
                              handleFileUpload(e, async (url) => await updateLogoImage(url), 'Website Logo', 'Website Logo')
                            }
                            className="hidden"
                          />
                        </label>
                        {uploadingMap['Website Logo'] && (
                          <span className="text-xs font-bold text-amber-400 animate-pulse">
                            Processing & saving to database...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-slate-300 font-bold block">Or Paste Image URL / Link:</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={logoUrlInput || (logoImageUrl.startsWith('data:') ? '' : logoImageUrl)}
                          onChange={(e) => setLogoUrlInput(e.target.value)}
                          placeholder="Paste image link e.g. https://.../logo.png"
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const trimmed = logoUrlInput.trim();
                            if (trimmed) {
                              await updateLogoImage(trimmed);
                              showToast('Website Logo updated from URL Link!');
                              setLogoUrlInput('');
                            }
                          }}
                          className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow shrink-0"
                        >
                          Apply Link
                        </button>
                      </div>
                    </div>

                    {/* Logo Tagline & Hide Text Settings */}
                    <div className="pt-3 border-t border-slate-800 space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Logo Tagline / Subtitle Text (e.g. &quot;Switch to excellence&quot;)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingCompany.logoTagline || ''}
                            onChange={(e) => setEditingCompany({ ...editingCompany, logoTagline: e.target.value })}
                            placeholder="e.g. Switch to excellence"
                            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await updateCompanyDetails({
                                  ...editingCompany,
                                  logoTagline: editingCompany.logoTagline || 'Switch to excellence',
                                });
                                showToast('Logo Tagline subtitle updated & saved!');
                              } catch (err: any) {
                                alert('Error saving tagline: ' + (err?.message || err));
                              }
                            }}
                            className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow shrink-0"
                          >
                            Save Tagline
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          This subtitle is displayed directly beneath the Falcon Electrics brand logo on the desktop header.
                        </p>
                      </div>

                      {/* Hide Brand Name Text Toggle */}
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Hide Brand Name Text (Image Only)
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            If enabled, only your uploaded logo image will show, hiding the textual &quot;Falcon Electrics&quot; words.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            const nextVal = !editingCompany.hideLogoText;
                            const updated = { ...editingCompany, hideLogoText: nextVal };
                            setEditingCompany(updated);
                            try {
                              await updateCompanyDetails(updated);
                              showToast(nextVal ? 'Brand name text hidden!' : 'Brand name text visible!');
                            } catch (err: any) {
                              alert('Error updating logo text visibility: ' + (err?.message || err));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                            editingCompany.hideLogoText
                              ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                          }`}
                        >
                          {editingCompany.hideLogoText ? 'Text: Hidden (Image Only)' : 'Text: Visible (Default)'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Section Switch Photo & Multi-Image Slider Section */}
              <form onSubmit={handleSaveHero} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#E0183D]" />
                      Hero Section Switch Photos & Auto-Slider
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Upload 1 to 4+ photos of switches/appliances. They will automatically transition in the Hero banner.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-4">
                  {/* Current Active Hero Images Gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">
                        Active Hero Photos ({(editingHero.switchImages && editingHero.switchImages.length > 0 ? editingHero.switchImages : [editingHero.switchImageUrl || 'hero-fan-regulator']).length} Active)
                      </span>
                      <span className="text-[10px] text-amber-400 font-semibold">
                        Auto-changes every 3 seconds on Home
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {(editingHero.switchImages && editingHero.switchImages.length > 0
                        ? editingHero.switchImages
                        : [editingHero.switchImageUrl || 'hero-fan-regulator']
                      ).map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="bg-slate-950 rounded-xl border border-slate-800 p-2 relative flex flex-col items-center justify-center group"
                        >
                          <div className="w-20 h-20 flex items-center justify-center">
                            <ProductVisual type={imgUrl} size="md" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[9px] font-bold text-slate-400">Photo #{imgIdx + 1}</span>
                            {/* Crop / Adjust Image Button */}
                            {imgUrl && (imgUrl.startsWith('data:') || imgUrl.startsWith('http') || imgUrl.includes('/')) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openCropper({
                                    imageSrc: imgUrl,
                                    title: `Crop Hero Photo #${imgIdx + 1}`,
                                    targetLabel: `Hero Photo #${imgIdx + 1}`,
                                    aspectRatio: 1,
                                    recommendedSizeText: '800 x 800 px (Square 1:1 ratio, transparent cutout)',
                                    onCropComplete: async (croppedUrl) => {
                                      closeCropper();
                                      const current = editingHero.switchImages || [editingHero.switchImageUrl || 'hero-fan-regulator'];
                                      const updated = [...current];
                                      updated[imgIdx] = croppedUrl;
                                      setEditingHero((prev) => ({
                                        ...prev,
                                        switchImageUrl: updated[0],
                                        switchImages: updated,
                                      }));
                                      await updateHeroContent({
                                        switchImageUrl: updated[0],
                                        switchImages: updated,
                                      });
                                      showToast('Hero photo cropped & updated!');
                                    },
                                  })
                                }
                                className="p-1 bg-slate-800 hover:bg-[#E0183D] text-slate-300 hover:text-white rounded-md transition text-[9px] flex items-center gap-0.5"
                                title="Crop & Center Photo"
                              >
                                <Crop className="w-3 h-3 text-amber-400" />
                                <span>Crop</span>
                              </button>
                            )}
                          </div>

                          {/* Delete Photo Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const current = editingHero.switchImages || [editingHero.switchImageUrl || 'hero-fan-regulator'];
                              const filtered = current.filter((_, i) => i !== imgIdx);
                              const updatedImages = filtered.length > 0 ? filtered : [];
                              const updatedPrimary = updatedImages[0] || '';
                              setEditingHero({
                                ...editingHero,
                                switchImageUrl: updatedPrimary,
                                switchImages: updatedImages,
                              });
                              updateHeroContent({
                                switchImageUrl: updatedPrimary,
                                switchImages: updatedImages,
                              });
                              showToast('Photo removed from Hero Slider!');
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white rounded-md transition shadow"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    {/* Size Guidelines Badge */}
                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-slate-300">
                          <strong className="text-white">Recommended Size:</strong> 800 × 800 px (Square 1:1 Ratio, Transparent PNG or clean photo)
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold text-[10px]">Pure Contain Display (No Cropping)</span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-300 block mb-1">
                        Add & Upload New Hero Photo (PNG / JPG / WebP)
                      </span>
                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>
                            {uploadingMap['Hero Switch Photo']
                              ? 'Uploading & Saving...'
                              : '+ Upload & Add Photo to Slider'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingMap['Hero Switch Photo'] === true}
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                async (url) => {
                                  const current = editingHero.switchImages && editingHero.switchImages.length > 0
                                    ? editingHero.switchImages
                                    : editingHero.switchImageUrl
                                    ? [editingHero.switchImageUrl]
                                    : [];
                                  const newImages = [...current, url];
                                  setEditingHero((prev) => ({
                                    ...prev,
                                    switchImageUrl: newImages[0],
                                    switchImages: newImages,
                                  }));
                                  await updateHeroContent({
                                    switchImageUrl: newImages[0],
                                    switchImages: newImages,
                                  });
                                },
                                'Hero Switch Photo',
                                'Hero Switch Photo',
                                {
                                  aspectRatio: 1,
                                  title: 'Crop Hero Showcase Photo',
                                  recommendedSizeText: '800 × 800 px (Square 1:1, Transparent Cutout PNG)',
                                }
                              )
                            }
                            className="hidden"
                          />
                        </label>
                        {uploadingMap['Hero Switch Photo'] && (
                          <span className="text-xs font-bold text-amber-400 animate-pulse">
                            Processing & saving to database...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-slate-300 font-bold block">Or Paste Photo Link / URL:</span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={heroUrlInput}
                          onChange={(e) => setHeroUrlInput(e.target.value)}
                          placeholder="Paste image link e.g. https://.../switch.png"
                          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const trimmed = heroUrlInput.trim();
                            if (trimmed) {
                              const current = editingHero.switchImages && editingHero.switchImages.length > 0
                                ? editingHero.switchImages
                                : editingHero.switchImageUrl
                                ? [editingHero.switchImageUrl]
                                : [];
                              const newImages = [...current, trimmed];
                              setEditingHero((prev) => ({
                                ...prev,
                                switchImageUrl: newImages[0],
                                switchImages: newImages,
                              }));
                              await updateHeroContent({
                                switchImageUrl: newImages[0],
                                switchImages: newImages,
                              });
                              showToast('Photo added to Hero Slider via URL Link!');
                              setHeroUrlInput('');
                            }
                          }}
                          className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow shrink-0"
                        >
                          + Add Link
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHero({
                            ...editingHero,
                            switchImageUrl: '',
                            switchImages: [],
                          });
                          updateHeroContent({
                            switchImageUrl: '',
                            switchImages: [],
                          });
                          showToast('Reset hero photos to default visual!');
                        }}
                        className="text-[10px] font-bold text-red-400 hover:underline block"
                      >
                        Reset to Default Switch Graphic
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hero Image Background Design Controls */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <label className="text-xs font-bold text-white block">
                        Hero Image Background Design (Red Shape & Dot Matrix)
                      </label>
                      <p className="text-[10px] text-slate-400">
                        Toggle ON/OFF or change color of the red background shape behind the hero image
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = editingHero.showHeroBgShape === false ? true : false;
                        setEditingHero({ ...editingHero, showHeroBgShape: nextVal });
                        updateHeroContent({ showHeroBgShape: nextVal });
                        showToast(nextVal ? 'Hero background card enabled!' : 'Hero background card disabled!');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border ${
                        editingHero.showHeroBgShape !== false
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${editingHero.showHeroBgShape !== false ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                      <span>{editingHero.showHeroBgShape !== false ? 'Background Shape: ON' : 'Background Shape: OFF'}</span>
                    </button>
                  </div>

                  {editingHero.showHeroBgShape !== false && (
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-400">Card Color Theme:</span>
                      {[
                        { id: 'red', label: 'Red (Default)', bg: 'bg-red-600' },
                        { id: 'blue', label: 'Royal Blue', bg: 'bg-blue-600' },
                        { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-600' },
                        { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-600' },
                        { id: 'purple', label: 'Deep Purple', bg: 'bg-purple-600' },
                        { id: 'dark', label: 'Dark Slate', bg: 'bg-slate-700' },
                      ].map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => {
                            setEditingHero({ ...editingHero, heroBgColor: color.id });
                            updateHeroContent({ heroBgColor: color.id });
                            showToast(`Hero card color updated to ${color.label}!`);
                          }}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                            (editingHero.heroBgColor || 'red') === color.id
                              ? 'border-white text-white bg-slate-800'
                              : 'border-slate-800 text-slate-400 hover:text-white bg-slate-950'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${color.bg}`}></span>
                          <span>{color.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Editable Hero Headline, Subtitle & Badge Tag */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-[11px] font-bold uppercase text-slate-300">Hero Section Badge Tag</label>
                        <p className="text-[10px] text-slate-400">Controls the red accent pill above the main headline</p>
                      </div>
                      {/* Show/Hide Toggle Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextVal = editingHero.showBadge === false ? true : false;
                          const updated = { ...editingHero, showBadge: nextVal };
                          setEditingHero(updated);
                          try {
                            await updateHeroContent(updated);
                            showToast(nextVal ? '✅ Hero Badge is now Visible!' : '🚫 Hero Badge is now Hidden!');
                          } catch (err: any) {
                            console.warn('Auto-save error on toggle:', err);
                          }
                        }}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                          editingHero.showBadge !== false
                            ? 'bg-emerald-950/90 border-emerald-600 text-emerald-300 hover:bg-emerald-900/80 shadow-sm'
                            : 'bg-rose-950/80 border-rose-700 text-rose-300 hover:bg-rose-900/70 shadow-sm'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${editingHero.showBadge !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                        <span>{editingHero.showBadge !== false ? 'Badge: Visible (ON)' : 'Badge: Hidden (OFF)'}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="e.g. DIRECT FACTORY MANUFACTURER (Leave empty or toggle OFF to hide)"
                        value={editingHero.badge ?? ''}
                        onChange={(e) => setEditingHero({ ...editingHero, badge: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                      />
                      <p className="text-[10px] text-slate-500">
                        {editingHero.showBadge === false || !editingHero.badge?.trim()
                          ? '🚫 Badge is currently hidden on the website'
                          : '✅ Badge is active and visible'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Hero Headline Title</label>
                    <input
                      type="text"
                      value={editingHero.headline}
                      onChange={(e) => setEditingHero({ ...editingHero, headline: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Hero Subtitle Description</label>
                    <textarea
                      rows={2}
                      value={editingHero.subtitle}
                      onChange={(e) => setEditingHero({ ...editingHero, subtitle: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#E0183D] hover:bg-[#c01233] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Hero Banner Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: COMPANY & CONTACT DETAILS */}
          {activeTab === 'COMPANY' && (
            <form onSubmit={handleSaveCompany} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#E0183D]" />
                  Header, Footer & Contact Info Editor
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">Updates entire site in real-time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Website Header Color Theme Selector */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 sm:col-span-2">
                  <div>
                    <label className="text-xs font-extrabold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      Website Main Header Color Theme
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Choose background color for top navigation header. White option is active by default.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                    {[
                      { id: 'white', label: 'Clean White', bg: 'bg-white text-slate-900 border-slate-300' },
                      { id: 'dark', label: 'Dark Black', bg: 'bg-[#101124] text-white border-slate-700' },
                      { id: 'navy', label: 'Royal Navy', bg: 'bg-slate-900 text-white border-slate-700' },
                      { id: 'red', label: 'Crimson Red', bg: 'bg-[#E0183D] text-white border-red-500' },
                      { id: 'slate', label: 'Slate Gray', bg: 'bg-slate-800 text-white border-slate-600' },
                    ].map((themeOpt) => {
                      const isSelected = (editingCompany.headerTheme || 'white') === themeOpt.id;
                      return (
                        <button
                          key={themeOpt.id}
                          type="button"
                          onClick={async () => {
                            const updatedCompany = { ...editingCompany, headerTheme: themeOpt.id };
                            setEditingCompany(updatedCompany);
                            try {
                              await updateCompanyDetails(updatedCompany);
                              showToast(`Header color changed to ${themeOpt.label} & saved!`);
                            } catch (err: any) {
                              console.error('Failed to update header theme:', err);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 shadow-sm ${
                            isSelected
                              ? 'ring-2 ring-red-500 border-white font-extrabold bg-slate-800 text-white'
                              : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600 hover:text-white'
                          }`}
                        >
                          <div className={`w-full h-6 rounded-lg ${themeOpt.bg} border flex items-center justify-center text-[10px] font-black`}>
                            Header
                          </div>
                          <span className="text-[10px] text-center">{themeOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Website Logo Section in Company Details Tab */}
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-extrabold text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#E0183D]" />
                        Website Main Logo (Header & Footer)
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Upload custom logo image to reflect on top header and bottom footer
                      </p>
                    </div>
                    {logoImageUrl && (
                      <button
                        type="button"
                        onClick={async () => {
                          await updateLogoImage('');
                          showToast('Reset to default vector logo!');
                        }}
                        className="text-[10px] font-bold text-red-400 hover:text-red-300 underline"
                      >
                        Reset Logo
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="w-16 h-16 rounded-xl bg-[#101124] border border-slate-700 flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden">
                      {logoImageUrl ? (
                        <img src={logoImageUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-[9px] font-black text-slate-400">FALCON</span>
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow inline-flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingMap['Logo'] ? 'Uploading...' : 'Upload Logo Image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingMap['Logo'] === true}
                            onChange={(e) =>
                              handleFileUpload(e, async (url) => await updateLogoImage(url), 'Logo', 'Logo')
                            }
                            className="hidden"
                          />
                        </label>
                        {uploadingMap['Logo'] && (
                          <span className="text-[11px] font-bold text-amber-400 block animate-pulse">
                            Processing & saving logo...
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold block">Or enter Image URL / Link:</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={logoUrlInput || (logoImageUrl.startsWith('data:') ? '' : logoImageUrl)}
                            onChange={(e) => setLogoUrlInput(e.target.value)}
                            placeholder="Paste link e.g. https://.../logo.png"
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const trimmed = logoUrlInput.trim();
                              if (trimmed) {
                                await updateLogoImage(trimmed);
                                showToast('Logo updated from Link!');
                                setLogoUrlInput('');
                              }
                            }}
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shrink-0"
                          >
                            Apply Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Brand Name</label>
                  <input
                    type="text"
                    value={editingCompany.brandName}
                    onChange={(e) => setEditingCompany({ ...editingCompany, brandName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Logo Subtitle / Tagline (Desktop Header)</label>
                  <input
                    type="text"
                    value={editingCompany.logoTagline || ''}
                    onChange={(e) => setEditingCompany({ ...editingCompany, logoTagline: e.target.value })}
                    placeholder="e.g. Switch to excellence"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Hide Brand Name Text (Image Only)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Hide the textual words &quot;Falcon Electrics&quot; and display only the uploaded logo graphic image.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCompany({ ...editingCompany, hideLogoText: !editingCompany.hideLogoText });
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
                      editingCompany.hideLogoText
                        ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                    }`}
                  >
                    {editingCompany.hideLogoText ? 'Text: Hidden (Image Only)' : 'Text: Visible (Default)'}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Company Name</label>
                  <input
                    type="text"
                    value={editingCompany.companyName}
                    onChange={(e) => setEditingCompany({ ...editingCompany, companyName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    value={editingCompany.phone}
                    onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">WhatsApp Number</label>
                  <input
                    type="text"
                    value={editingCompany.whatsapp}
                    onChange={(e) => setEditingCompany({ ...editingCompany, whatsapp: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Sales Email</label>
                  <input
                    type="email"
                    value={editingCompany.email}
                    onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">GSTIN Number</label>
                  <input
                    type="text"
                    value={editingCompany.gstin}
                    onChange={(e) => setEditingCompany({ ...editingCompany, gstin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Factory & Office Address</label>
                  <textarea
                    rows={2}
                    value={editingCompany.address}
                    onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                {/* Google Maps Configuration Card */}
                <div className="sm:col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <label className="text-xs font-extrabold text-white flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-[#E0183D]" />
                      Google Maps & Location Settings
                    </label>
                    <span className="text-[10px] text-slate-400">Real-time update</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">
                        Map Search Query / Location Name
                      </label>
                      <input
                        type="text"
                        value={editingCompany.mapQuery || ''}
                        onChange={(e) => setEditingCompany({ ...editingCompany, mapQuery: e.target.value })}
                        placeholder="Leave blank to use address automatically"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                      />
                      <p className="text-[10px] text-slate-400">
                        Customize what Google Maps searches for (e.g. your landmark or building name).
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase text-slate-400">
                        Custom Directions / Share Link (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingCompany.googleMapsDirectionsUrl || ''}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, googleMapsDirectionsUrl: e.target.value })
                        }
                        placeholder="e.g. https://maps.app.goo.gl/..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                      />
                      <p className="text-[10px] text-slate-400">
                        Direct URL opened when users click the &quot;Directions&quot; button.
                      </p>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold uppercase text-slate-400">
                        Custom Google Maps Embed Code or Iframe URL (Optional)
                      </label>
                      <input
                        type="text"
                        value={editingCompany.googleMapsEmbedUrl || ''}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, googleMapsEmbedUrl: e.target.value })
                        }
                        placeholder="Paste Google Maps embed &lt;iframe...&gt; code or direct URL"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                      />
                    </div>
                  </div>

                  {/* Live Map Preview in Admin Panel */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Live Map Preview
                    </span>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 relative">
                      <iframe
                        title="Admin Map Preview"
                        src={
                          editingCompany.googleMapsEmbedUrl?.trim()
                            ? editingCompany.googleMapsEmbedUrl.includes('<iframe')
                              ? editingCompany.googleMapsEmbedUrl.match(/src=["']([^"']+)["']/)?.[1] ||
                                editingCompany.googleMapsEmbedUrl
                              : editingCompany.googleMapsEmbedUrl
                            : `https://maps.google.com/maps?q=${encodeURIComponent(
                                editingCompany.mapQuery?.trim() ||
                                  `${editingCompany.companyName} ${editingCompany.address}`
                              )}&t=&z=${editingCompany.location?.zoom || 15}&ie=UTF8&iwloc=&output=embed`
                        }
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Business Hours</label>
                  <input
                    type="text"
                    value={editingCompany.businessHours}
                    onChange={(e) => setEditingCompany({ ...editingCompany, businessHours: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Facebook Page URL</label>
                  <input
                    type="text"
                    value={editingCompany.facebook}
                    onChange={(e) => setEditingCompany({ ...editingCompany, facebook: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Instagram Profile URL</label>
                  <input
                    type="text"
                    value={editingCompany.instagram}
                    onChange={(e) => setEditingCompany({ ...editingCompany, instagram: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Founder Name & Year</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCompany.founder}
                      onChange={(e) => setEditingCompany({ ...editingCompany, founder: e.target.value })}
                      className="w-2/3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                    />
                    <input
                      type="number"
                      value={editingCompany.foundedYear}
                      onChange={(e) =>
                        setEditingCompany({ ...editingCompany, foundedYear: parseInt(e.target.value) || 2005 })
                      }
                      className="w-1/3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400">Founder Quote (About Section)</label>
                  <textarea
                    rows={2}
                    value={editingCompany.quote}
                    onChange={(e) => setEditingCompany({ ...editingCompany, quote: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                {/* About Us Section Visiting Card / Factory Certificate Image */}
                <div className="sm:col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <label className="text-xs font-extrabold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#E0183D]" />
                      About Us Section — Visiting Card / Factory Certificate Image
                    </label>
                    {editingCompany.visitingCardImageUrl && (
                      <button
                        type="button"
                        onClick={() => setEditingCompany({ ...editingCompany, visitingCardImageUrl: '' })}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload your visiting card, GST verification, or factory picture to show in the right column of the About Us section on desktop. If left empty, the section remains normal.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex gap-2">
                        <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 px-3 rounded-xl cursor-pointer flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95">
                          <Upload className="w-3.5 h-3.5 text-[#E0183D]" />
                          <span>Upload Visiting Card / Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(
                                e,
                                (url) => setEditingCompany((prev) => ({ ...prev, visitingCardImageUrl: url })),
                                'Visiting Card'
                              )
                            }
                            className="hidden"
                          />
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Or paste Direct Image URL..."
                        value={editingCompany.visitingCardImageUrl || ''}
                        onChange={(e) =>
                          setEditingCompany({ ...editingCompany, visitingCardImageUrl: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                      />
                    </div>

                    {editingCompany.visitingCardImageUrl && (
                      <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center relative shrink-0">
                        <img
                          src={editingCompany.visitingCardImageUrl}
                          alt="Visiting Card Preview"
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#E0183D] hover:bg-[#c01233] text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Company Details</span>
              </button>
            </form>
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'PRODUCTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Products Catalogue</h3>
                  <p className="text-[11px] text-slate-400">Add, edit prices, specs, features or delete products</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Product Cards Table/Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex gap-3 items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center p-1 shrink-0">
                        <ProductVisual type={prod.image} size="sm" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-extrabold text-[#E0183D] uppercase bg-red-950/80 px-1.5 py-0.5 rounded border border-red-900">
                            {prod.categoryName}
                          </span>
                          {prod.badge && (
                            <span className="text-[9px] font-extrabold text-yellow-400 bg-yellow-950/80 px-1.5 py-0.5 rounded border border-yellow-800">
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-extrabold text-white leading-tight mt-1 line-clamp-1">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-bold text-red-400">{prod.price}</span>
                          <span>•</span>
                          <span>{prod.amps}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete product "${prod.name}"?`)) {
                            deleteProduct(prod.id);
                            showToast('Product deleted!');
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-xl transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'CATEGORIES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Categories Management</h3>
                  <p className="text-[11px] text-slate-400">Add new categories, edit details, icons, badges or delete categories</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>

              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          <ProductVisual type={cat.imageUrl || cat.image || 'fan-regulator-5step'} size="sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-[#E0183D] uppercase bg-red-950 px-2 py-0.5 rounded border border-red-900">
                              {cat.badge}
                            </span>
                            <h4 className="text-xs font-black text-white">{cat.title}</h4>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{cat.subtitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {/* Order Position Actions */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveCategory(idx, 'up')}
                          className="px-2 py-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-lg transition flex items-center gap-1 text-[10px] font-bold"
                          title="Move Category Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden sm:inline">Move Up</span>
                        </button>
                        <button
                          type="button"
                          disabled={idx === categories.length - 1}
                          onClick={() => handleMoveCategory(idx, 'down')}
                          className="px-2 py-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 rounded-lg transition flex items-center gap-1 text-[10px] font-bold"
                          title="Move Category Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                          <span className="hidden sm:inline">Move Down</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete category "${cat.title}"?`)) {
                              deleteCategory(cat.id);
                              showToast('Category deleted!');
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug">{cat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PRODUCT CATALOGUE (Images Uploader & Management) */}
          {activeTab === 'CATALOGUE' && (
            <div className="space-y-6">
              {/* Header Box & Global Settings */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await updateCatalogueSettings(editingCatalogue);
                    showToast('✅ Catalogue details saved to Database!');
                  } catch (err: any) {
                    alert('❌ Failed to save Catalogue: ' + (err?.message || err));
                  }
                }}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        Catalogue Settings & Range Brochure
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Customize the heading and WhatsApp inquiry message. Upload your catalogue page images below.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Settings</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Page Heading / Title</label>
                    <input
                      type="text"
                      value={editingCatalogue.title || ''}
                      onChange={(e) => setEditingCatalogue({ ...editingCatalogue, title: e.target.value })}
                      placeholder="e.g. Our Range Products and Details"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={editingCatalogue.subtitle || ''}
                      onChange={(e) => setEditingCatalogue({ ...editingCatalogue, subtitle: e.target.value })}
                      placeholder="e.g. Complete switchgear and electrical accessories range"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase text-slate-400">WhatsApp Inquiry Default Message</label>
                    <input
                      type="text"
                      value={editingCatalogue.whatsappMessage || ''}
                      onChange={(e) => setEditingCatalogue({ ...editingCatalogue, whatsappMessage: e.target.value })}
                      placeholder="e.g. Hello Falcon Electrics, I am viewing your product catalogue and want to inquire about bulk ordering..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                    />
                  </div>

                  {/* Page Numbers Toggle */}
                  <div className="space-y-1 sm:col-span-2 bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Show Page Numbers on Images
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Display an elegant &quot;Page 1&quot;, &quot;Page 2&quot; badge in the top-right corner of each catalogue photo.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const newVal = editingCatalogue.showPageNumbers === false ? true : false;
                        const updated = { ...editingCatalogue, showPageNumbers: newVal };
                        setEditingCatalogue(updated);
                        await updateCatalogueSettings({ showPageNumbers: newVal });
                        showToast(newVal ? '✅ Page numbers enabled on Catalogue!' : 'Page numbers hidden on Catalogue!');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                        editingCatalogue.showPageNumbers !== false
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {editingCatalogue.showPageNumbers !== false ? 'Numbers: ON (Visible)' : 'Numbers: OFF (Hidden)'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Catalogue Images List Uploader */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-red-400" />
                      <span>Catalogue Images ({(editingCatalogue.pages || []).length} Total Images)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Upload your catalogue photos in order. They will be displayed in full vertical view on the website.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const currentPages = editingCatalogue.pages || [];
                      const newPageNum = currentPages.length + 1;
                      const newPage: CataloguePage = {
                        id: `cat_page_${Date.now()}_${newPageNum}`,
                        pageNumber: newPageNum,
                        imageUrl: '',
                        image: '',
                        title: `Page ${newPageNum}`,
                      };
                      const updated = [...currentPages, newPage];
                      setEditingCatalogue({ ...editingCatalogue, pages: updated });
                      try {
                        await updateCataloguePages(updated);
                        showToast(`✅ Added image slot #${newPageNum}!`);
                      } catch (err: any) {
                        alert('❌ Error adding slot: ' + (err?.message || err));
                      }
                    }}
                    className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Photo Slot</span>
                  </button>
                </div>

                {/* Size Recommendation Banner */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-slate-300">
                      <strong className="text-white">Best Fit Size:</strong> 1200 × 1600 px (Portrait 3:4 or Standard A4 Brochure Page).
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px]">
                    Automatic mobile responsive fit • No stretching
                  </span>
                </div>

                {/* Grid of Image Upload Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(editingCatalogue.pages || []).map((page, pIdx) => {
                    const imgUrl = page.imageUrl || page.image;
                    const hasCustomImage = Boolean(imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('data:') || imgUrl.includes('/')));

                    return (
                      <div
                        key={page.id || pIdx}
                        className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition relative"
                      >
                        <div>
                          {/* Top Controls: Slot Number, Move Up/Down, Delete */}
                          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-900">
                            <span className="text-[11px] font-black text-[#E0183D] bg-red-950/80 px-2 py-0.5 rounded-md border border-red-900/60">
                              Image #{pIdx + 1}
                            </span>

                            <div className="flex items-center gap-1">
                              {hasCustomImage && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openCropper({
                                      imageSrc: imgUrl,
                                      title: `Crop Catalogue Image #${pIdx + 1}`,
                                      targetLabel: `Catalogue Image #${pIdx + 1}`,
                                      aspectRatio: 3 / 4,
                                      recommendedSizeText: '1200 × 1600 px (Portrait 3:4 / Free Aspect)',
                                      onCropComplete: async (croppedUrl) => {
                                        closeCropper();
                                        const pageId = editingCatalogue.pages?.[pIdx]?.id || `cat_page_${pIdx + 1}`;
                                        const updatedPage: CataloguePage = {
                                          ...(editingCatalogue.pages?.[pIdx] || {
                                            id: pageId,
                                            pageNumber: pIdx + 1,
                                          }),
                                          id: pageId,
                                          pageNumber: pIdx + 1,
                                          imageUrl: croppedUrl,
                                          image: croppedUrl,
                                        };
                                        const updated = [...(editingCatalogue.pages || [])];
                                        updated[pIdx] = updatedPage;
                                        setEditingCatalogue({ ...editingCatalogue, pages: updated });
                                        await updateSingleCataloguePage(updatedPage);
                                        showToast(`✅ Cropped Catalogue Image #${pIdx + 1}`);
                                      },
                                    })
                                  }
                                  className="p-1.5 text-amber-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition flex items-center gap-1 text-[10px] font-bold"
                                  title="Crop / Center Image"
                                >
                                  <Crop className="w-3.5 h-3.5" />
                                  <span>Crop</span>
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={pIdx === 0}
                                onClick={async () => {
                                  const updated = [...(editingCatalogue.pages || [])];
                                  const [moved] = updated.splice(pIdx, 1);
                                  updated.splice(pIdx - 1, 0, moved);
                                  const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
                                  setEditingCatalogue({ ...editingCatalogue, pages: renumbered });
                                  await updateCataloguePages(renumbered);
                                  showToast(`Moved to position ${pIdx + 1}!`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-20 rounded-lg transition"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={pIdx === (editingCatalogue.pages || []).length - 1}
                                onClick={async () => {
                                  const updated = [...(editingCatalogue.pages || [])];
                                  const [moved] = updated.splice(pIdx, 1);
                                  updated.splice(pIdx + 1, 0, moved);
                                  const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
                                  setEditingCatalogue({ ...editingCatalogue, pages: renumbered });
                                  await updateCataloguePages(renumbered);
                                  showToast(`Moved to position ${pIdx + 2}!`);
                                }}
                                className="p-1.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-20 rounded-lg transition"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Image Slot */}
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete Image #${pIdx + 1}?`)) {
                                    const updated = (editingCatalogue.pages || []).filter((_, i) => i !== pIdx);
                                    const renumbered = updated.map((p, i) => ({ ...p, pageNumber: i + 1 }));
                                    setEditingCatalogue({ ...editingCatalogue, pages: renumbered });
                                    try {
                                      await updateCataloguePages(renumbered);
                                      showToast(`✅ Deleted Image #${pIdx + 1}`);
                                    } catch (err: any) {
                                      alert('❌ Error deleting image: ' + (err?.message || err));
                                    }
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-red-950/60 rounded-lg transition"
                                title="Delete Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Image Preview Box */}
                          <div className="mt-3 w-full h-56 bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800/80 flex items-center justify-center relative shadow-inner">
                            {hasCustomImage ? (
                              <img
                                src={imgUrl}
                                alt={`Catalogue ${pIdx + 1}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="p-4 text-center flex flex-col items-center justify-center text-slate-500">
                                <ImageIcon className="w-8 h-8 mb-2 text-slate-600" />
                                <span className="text-xs font-semibold text-slate-400">No Image Uploaded</span>
                                <span className="text-[10px] text-slate-500 mt-0.5">Click Upload below to add photo</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upload & Link Controls */}
                        <div className="space-y-2 pt-2 border-t border-slate-900">
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingMap[`cat_page_${pIdx + 1}`] ? 'Uploading...' : hasCustomImage ? 'Replace Image' : 'Upload Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                disabled={uploadingMap[`cat_page_${pIdx + 1}`] === true}
                                className="hidden"
                                onChange={(e) => {
                                  const pageSlotKey = `cat_page_${pIdx + 1}`;
                                  handleFileUpload(
                                    e,
                                    async (url) => {
                                      const pageId = editingCatalogue.pages?.[pIdx]?.id || pageSlotKey;
                                      const updatedPage: CataloguePage = {
                                        ...(editingCatalogue.pages?.[pIdx] || {
                                          id: pageId,
                                          pageNumber: pIdx + 1,
                                        }),
                                        id: pageId,
                                        pageNumber: pIdx + 1,
                                        imageUrl: url,
                                        image: url,
                                      };
                                      const updated = [...(editingCatalogue.pages || [])];
                                      updated[pIdx] = updatedPage;
                                      setEditingCatalogue({ ...editingCatalogue, pages: updated });
                                      await updateSingleCataloguePage(updatedPage);
                                    },
                                    `Catalogue Page ${pIdx + 1}`,
                                    pageSlotKey,
                                    {
                                      aspectRatio: 3 / 4,
                                      title: `Crop Catalogue Image #${pIdx + 1}`,
                                      recommendedSizeText: '1200 × 1600 px (Portrait 3:4 ratio)',
                                    }
                                  );
                                }}
                              />
                            </label>

                            {hasCustomImage && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const pageId = editingCatalogue.pages?.[pIdx]?.id || `cat_page_${pIdx + 1}`;
                                  const clearedPage: CataloguePage = {
                                    ...(editingCatalogue.pages?.[pIdx] || {
                                      id: pageId,
                                      pageNumber: pIdx + 1,
                                    }),
                                    id: pageId,
                                    imageUrl: '',
                                    image: '',
                                  };
                                  const updated = [...(editingCatalogue.pages || [])];
                                  updated[pIdx] = clearedPage;
                                  setEditingCatalogue({ ...editingCatalogue, pages: updated });
                                  await updateSingleCataloguePage(clearedPage);
                                  showToast(`Image cleared for slot #${pIdx + 1}`);
                                }}
                                className="text-xs text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-slate-800 px-3 py-2 rounded-xl font-semibold border border-slate-800 transition"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {/* URL Paste option */}
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={pageImgUrlInputs[pIdx] || ''}
                              onChange={(e) =>
                                setPageImgUrlInputs({
                                  ...pageImgUrlInputs,
                                  [pIdx]: e.target.value,
                                })
                              }
                              placeholder="Or paste image link..."
                              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#E0183D]"
                            />
                            <button
                              type="button"
                              onClick={async () => {
                                const trimmed = (pageImgUrlInputs[pIdx] || '').trim();
                                if (trimmed) {
                                  const pageId = editingCatalogue.pages?.[pIdx]?.id || `cat_page_${pIdx + 1}`;
                                  const urlPage: CataloguePage = {
                                    ...(editingCatalogue.pages?.[pIdx] || {
                                      id: pageId,
                                      pageNumber: pIdx + 1,
                                    }),
                                    id: pageId,
                                    imageUrl: trimmed,
                                    image: trimmed,
                                  };
                                  const updated = [...(editingCatalogue.pages || [])];
                                  updated[pIdx] = urlPage;
                                  setEditingCatalogue({ ...editingCatalogue, pages: updated });
                                  setPageImgUrlInputs({ ...pageImgUrlInputs, [pIdx]: '' });
                                  await updateSingleCataloguePage(urlPage);
                                  showToast(`Image URL applied to slot #${pIdx + 1}!`);
                                }
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-700"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {(editingCatalogue.pages || []).length === 0 && (
                  <div className="bg-slate-950 rounded-2xl p-8 border border-slate-800 text-center text-slate-400">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-bold text-white">No catalogue image slots created yet.</p>
                    <p className="text-xs text-slate-500 mt-1 mb-4">
                      Click the button below to add your first catalogue image slot.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        const newPage: CataloguePage = {
                          id: `cat_page_${Date.now()}_1`,
                          pageNumber: 1,
                          imageUrl: '',
                          image: '',
                          title: 'Page 1',
                        };
                        const updated = [newPage];
                        setEditingCatalogue({ ...editingCatalogue, pages: updated });
                        await updateCataloguePages(updated);
                        showToast('✅ Added Image Slot #1');
                      }}
                      className="bg-[#E0183D] hover:bg-[#c01233] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add First Image Slot</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ADMIN SECURITY CREDENTIALS */}
          {activeTab === 'SECURITY' && (
            <form onSubmit={handleSaveCreds} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-lg mx-auto">
              <div className="pb-2 border-b border-slate-800 text-center">
                <div className="w-12 h-12 bg-red-950/80 rounded-2xl border border-red-900 flex items-center justify-center mx-auto text-[#E0183D] mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-extrabold text-white">
                  Update Admin Login Credentials
                </h3>
                <p className="text-[11px] text-slate-400">
                  Change the Email ID & Password required to access this Admin Panel
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">New Admin Email</label>
                  <input
                    type="email"
                    required
                    value={editingCreds.email}
                    onChange={(e) => setEditingCreds({ ...editingCreds, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-slate-400">New Admin Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={editingCreds.password}
                    onChange={(e) => setEditingCreds({ ...editingCreds, password: e.target.value })}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#E0183D]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E0183D] hover:bg-[#c01233] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow transition"
              >
                <Save className="w-4 h-4" />
                <span>Save New Login Credentials</span>
              </button>

              <div className="pt-4 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset all website data, products and credentials to original factory settings?')) {
                      resetToDefaults();
                      setEditingCompany(companyDetails);
                      setEditingHero(heroContent);
                      setEditingCreds({ email: adminCredentials.email, password: '' });
                      showToast('Site restored to initial factory defaults!');
                    }
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-red-400 flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset All Data to Factory Defaults</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 8: CLOUD DATABASE & REALTIME SYNC */}
          {activeTab === 'DATABASE' && (
            <div className="space-y-6">
              {/* Header & Connection Status Banner */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider mb-1">
                      <Database className="w-3 h-3" />
                      <span>Supabase Cloud Integration</span>
                    </div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyan-400" />
                      Live Database Sync & Realtime Diagnostics
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target Project: <span className="font-mono text-cyan-300">https://ywgosjrealgcbanelfei.supabase.co</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={runDbTest}
                    disabled={isTestingDb}
                    className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                    <span>{isTestingDb ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>

                {/* Diagnostic Result Card */}
                {dbDiagnostic.tested ? (
                  dbDiagnostic.tablesExist ? (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-emerald-300">
                          Database is 100% Active & Real-Time Syncing
                        </h4>
                        <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                          All 5 Supabase tables (<span className="font-mono text-white">store_settings</span>, <span className="font-mono text-white">products</span>, <span className="font-mono text-white">categories</span>, <span className="font-mono text-white">quotes</span>, <span className="font-mono text-white">catalogue_pages</span>) are active. Any changes you make in this Admin Panel sync instantly to visitors on all devices.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-950/50 border border-amber-500/50 p-4 rounded-xl space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-amber-300">
                            Action Required: SQL Tables Need to be Created in Supabase
                          </h4>
                          <p className="text-[11px] text-amber-200/90 leading-relaxed">
                            Aapka Supabase account connect hai, lekin database ke andar tables abhi tak create nahi hui hain. Is wajah se aap jo bhi changes karte hain, woh sirf aapke current browser mein save hoti hain aur dusre devices par live nahi jaati.
                          </p>
                        </div>
                      </div>

                      {/* 3-Step Simple Guide */}
                      <div className="bg-slate-900/90 border border-amber-500/30 p-3.5 rounded-lg space-y-2.5">
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-amber-400" />
                          <span>Sirf 2 Minute Ka Setup (Follow these 3 Steps):</span>
                        </div>
                        <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside">
                          <li>
                            Niche diye gaye <span className="font-bold text-white">"Copy Full SQL Schema"</span> button par click karke SQL script copy karein.
                          </li>
                          <li>
                            Apne Supabase dashboard ke SQL Editor page ko kholein:{' '}
                            <a
                              href="https://supabase.com/dashboard/project/ywgosjrealgcbanelfei/sql/new"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 underline font-bold inline-flex items-center gap-0.5 ml-1"
                            >
                              <span>Open Supabase SQL Editor</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </li>
                          <li>
                            Wahan SQL script paste karein aur green <span className="font-bold text-emerald-400">"RUN"</span> button dabayein.
                          </li>
                        </ol>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="bg-slate-900 p-4 rounded-xl flex items-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Checking Supabase table status...</span>
                  </div>
                )}
              </div>

              {/* Force Push All Data to Supabase Button */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      Sync All Current Products & Changes to Supabase
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-xl">
                      Aapke browser mein mojood sabhi products ({products.length}), categories ({categories.length}), catalogue pages ({catalogueSettings?.pages?.length || 0}) aur branding settings ko ek click mein Supabase par upload karein.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsSyncingAll(true);
                      const res = await syncAllDataToSupabase();
                      setIsSyncingAll(false);
                      if (res.success) {
                        showToast('✅ All data successfully synced to Supabase Cloud!');
                        runDbTest();
                      } else {
                        alert('❌ Sync failed: ' + res.message + '\n\nPlease verify that you have executed the SQL Schema in Supabase SQL Editor.');
                      }
                    }}
                    disabled={isSyncingAll}
                    className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    <Upload className={`w-4 h-4 ${isSyncingAll ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingAll ? 'Syncing Data...' : 'Push All Data to Cloud Now'}</span>
                  </button>
                </div>
              </div>

              {/* SQL Schema Copy Box */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      Supabase SQL Schema (Tables + RLS + Realtime)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Copy this and execute in Supabase SQL Editor once:
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const sql = `-- FALCON ELECTRICS SQL SCHEMA
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY,
    company_details JSONB DEFAULT '{}'::jsonb,
    hero_content JSONB DEFAULT '{}'::jsonb,
    logo_image_url TEXT DEFAULT '',
    why_choose_us JSONB DEFAULT '[]'::jsonb,
    catalogue_settings JSONB DEFAULT '{}'::jsonb,
    admin_auth JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    image_fit TEXT DEFAULT 'contain',
    bg_color TEXT DEFAULT '',
    border_color TEXT DEFAULT '',
    text_color TEXT DEFAULT '',
    icon_name TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    badge TEXT DEFAULT '',
    order_index INTEGER DEFAULT 0,
    sub_categories JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_name TEXT DEFAULT '',
    sub_category TEXT DEFAULT '',
    price TEXT DEFAULT '',
    per_piece_price TEXT DEFAULT '',
    amps TEXT DEFAULT '',
    voltage TEXT DEFAULT '',
    steps TEXT DEFAULT '',
    material TEXT DEFAULT '',
    description TEXT DEFAULT '',
    features JSONB DEFAULT '[]'::jsonb,
    image TEXT DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    custom_specs JSONB DEFAULT '[]'::jsonb,
    is_top_pick BOOLEAN DEFAULT FALSE,
    rating NUMERIC DEFAULT 5.0,
    badge TEXT DEFAULT '',
    color_theme TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    quantity TEXT DEFAULT '100 Units',
    notes TEXT DEFAULT '',
    product_name TEXT DEFAULT '',
    product_id TEXT DEFAULT '',
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.catalogue_pages (
    id TEXT PRIMARY KEY,
    page_number INTEGER NOT NULL,
    title TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    image TEXT DEFAULT '',
    category_tag TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on store_settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on quotes" ON public.quotes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on catalogue_pages" ON public.catalogue_pages FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on catalogue_pages" ON public.catalogue_pages FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.catalogue_pages;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.store_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.quotes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.catalogue_pages TO anon, authenticated, service_role;`;

                      navigator.clipboard.writeText(sql);
                      setCopiedSql(true);
                      showToast('📋 SQL Script copied to clipboard!');
                      setTimeout(() => setCopiedSql(false), 3000);
                    }}
                    className="bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy Full SQL Schema'}</span>
                  </button>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto leading-relaxed select-all">
                  <pre className="whitespace-pre-wrap">{`-- Run in: https://supabase.com/dashboard/project/ywgosjrealgcbanelfei/sql/new
CREATE TABLE IF NOT EXISTS public.store_settings (...);
CREATE TABLE IF NOT EXISTS public.categories (...);
CREATE TABLE IF NOT EXISTS public.products (...);
CREATE TABLE IF NOT EXISTS public.quotes (...);
CREATE TABLE IF NOT EXISTS public.catalogue_pages (...);
-- Includes RLS Policies & Supabase Realtime`}</pre>
                </div>
              </div>
            </div>
          )}
      </main>

      {/* Add / Edit Product Modal Overlay */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-5 border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">
                {editingProduct ? 'Edit Product Specs & Image' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Product Name</label>
                <input
                  type="text"
                  required
                  value={prodForm.name || ''}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="e.g. Falcon Heavy Duty Modular Switch 16A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <select
                    value={prodForm.category || 'summer'}
                    onChange={(e) => {
                      const catVal = e.target.value;
                      const catObj = categories.find((c) => c.id === catVal);
                      setProdForm({
                        ...prodForm,
                        category: catVal,
                        categoryName: catObj ? catObj.title : 'Switches',
                        subCategory: catObj?.subCategories?.[0] || '',
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Sub-Category</label>
                  {(() => {
                    const currentCatObj = categories.find((c) => c.id === (prodForm.category || 'summer'));
                    const availableSubs = currentCatObj?.subCategories || [];
                    return (
                      <select
                        value={prodForm.subCategory || ''}
                        onChange={(e) => setProdForm({ ...prodForm, subCategory: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="">-- Select Sub-Category --</option>
                        {availableSubs.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Box / Pack Price</label>
                  <input
                    type="text"
                    value={prodForm.price || ''}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    placeholder="e.g. ₹220 / Box"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">1 Pc Price (Per Piece Rate)</label>
                  <input
                    type="text"
                    value={prodForm.perPiecePrice || ''}
                    onChange={(e) => setProdForm({ ...prodForm, perPiecePrice: e.target.value })}
                    placeholder="e.g. 25"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Amperes / Rating</label>
                  <input
                    type="text"
                    value={prodForm.amps || ''}
                    onChange={(e) => setProdForm({ ...prodForm, amps: e.target.value })}
                    placeholder="e.g. 16 Amp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-300">Badge Tag</label>
                  <input
                    type="text"
                    value={prodForm.badge || ''}
                    onChange={(e) => setProdForm({ ...prodForm, badge: e.target.value })}
                    placeholder="e.g. Best Seller / Heavy Duty"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Product Images Upload & Multiple Image Gallery */}
              <div className="space-y-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-300 block">Product Images Gallery</span>
                    <span className="text-[10px] text-slate-400">First image will be the primary cover photo</span>
                  </div>
                  <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingMap['Product Image'] ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingMap['Product Image'] === true}
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (url) => {
                            const isPreset = (img: string) => !img.startsWith('data:') && !img.startsWith('http');
                            // If current gallery only has preset, replace it with real uploaded photo
                            const currentImages = (prodForm.images || (prodForm.image ? [prodForm.image] : [])).filter(
                              (img) => !isPreset(img)
                            );
                            const newImages = [...currentImages, url];
                            setProdForm({
                              ...prodForm,
                              image: newImages[0],
                              images: newImages,
                            });
                          },
                          'Product Image',
                          'Product Image',
                          {
                            aspectRatio: 1,
                            title: 'Crop & Center Product Photo',
                            recommendedSizeText: '800 × 800 px (Square 1:1 ratio)',
                          }
                        )
                      }
                    />
                  </label>
                </div>

                {/* Size Recommendation Info Badge */}
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-[10px] text-slate-300">
                  <span className="text-slate-400">
                    <strong className="text-white">Best Fit Size:</strong> 800 × 800 px (Square 1:1)
                  </span>
                  <span className="text-emerald-400 font-bold">Auto-scales to fill card cleanly</span>
                </div>

                {/* Add Image by URL Link */}
                <div className="space-y-1 pt-1 border-t border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold block">Or Add Image via Link / URL:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productImgUrlInput}
                      onChange={(e) => setProductImgUrlInput(e.target.value)}
                      placeholder="Paste image link e.g. https://.../product.jpg"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = productImgUrlInput.trim();
                        if (trimmed) {
                          const isPreset = (img: string) => !img.startsWith('data:') && !img.startsWith('http');
                          const currentImages = (prodForm.images || (prodForm.image ? [prodForm.image] : [])).filter(
                            (img) => !isPreset(img)
                          );
                          const newImages = [...currentImages, trimmed];
                          setProdForm({
                            ...prodForm,
                            image: newImages[0],
                            images: newImages,
                          });
                          setProductImgUrlInput('');
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#E0183D]" />
                      <span>Add Link</span>
                    </button>
                  </div>
                </div>

                {/* Preset Selector fallback */}
                <div className="pt-1">
                  <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                    Or select standard icon visual preset:
                  </label>
                  <select
                    value={prodForm.image || 'fan-regulator-5step'}
                    onChange={(e) => {
                      const selectedPreset = e.target.value;
                      setProdForm({
                        ...prodForm,
                        image: selectedPreset,
                        images: [selectedPreset],
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                  >
                    <option value="fan-regulator-5step">Preset: 5-Step Fan Regulator</option>
                    <option value="rotary-switch-16a">Preset: Heavy Duty Rotary Switch</option>
                    <option value="modular-switch-6a">Preset: Rocker / Modular Switch</option>
                    <option value="socket-6a-shutter">Preset: Safety Shutter Socket</option>
                    <option value="mcb-breaker">Preset: MCB / DP Breaker</option>
                    {prodForm.image &&
                      (prodForm.image.startsWith('data:') || prodForm.image.startsWith('http')) && (
                        <option value={prodForm.image}>Custom Photo</option>
                      )}
                  </select>
                </div>

                {/* Thumbnail Gallery List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-400 font-bold block">
                    Current Product Photos ({((prodForm.images && prodForm.images.length > 0) ? prodForm.images : [prodForm.image || 'fan-regulator-5step']).length}):
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {(prodForm.images && prodForm.images.length > 0
                      ? prodForm.images
                      : [prodForm.image || 'fan-regulator-5step']
                    ).map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        className={`relative group w-20 h-20 bg-slate-900 rounded-xl border p-1 flex flex-col items-center justify-center shrink-0 ${
                          imgIdx === 0 ? 'border-red-500 ring-1 ring-red-500/50' : 'border-slate-800'
                        }`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center">
                          <ProductVisual type={imgUrl} size="sm" />
                        </div>

                        {/* Action Bar (Set Primary & Crop) */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-slate-950/90 rounded-b-[10px] px-1 py-0.5 border-t border-slate-800">
                          {imgIdx === 0 ? (
                            <span className="text-[8px] text-red-400 font-extrabold px-1">
                              Primary
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const currentImages = prodForm.images || (prodForm.image ? [prodForm.image] : []);
                                const selectedImg = currentImages[imgIdx];
                                const remaining = currentImages.filter((_, i) => i !== imgIdx);
                                const reordered = [selectedImg, ...remaining];
                                setProdForm({
                                  ...prodForm,
                                  image: reordered[0],
                                  images: reordered,
                                });
                                showToast('Set as primary cover photo!');
                              }}
                              className="text-[8px] text-slate-300 hover:text-white font-bold hover:underline"
                            >
                              Make Main
                            </button>
                          )}

                          {imgUrl && (imgUrl.startsWith('data:') || imgUrl.startsWith('http') || imgUrl.includes('/')) && (
                            <button
                              type="button"
                              onClick={() =>
                                openCropper({
                                  imageSrc: imgUrl,
                                  title: `Crop Photo #${imgIdx + 1}`,
                                  targetLabel: `Product Photo #${imgIdx + 1}`,
                                  aspectRatio: 1,
                                  recommendedSizeText: '800 × 800 px (Square 1:1 ratio)',
                                  onCropComplete: (croppedUrl) => {
                                    closeCropper();
                                    const currentImages = prodForm.images || (prodForm.image ? [prodForm.image] : []);
                                    const updated = [...currentImages];
                                    updated[imgIdx] = croppedUrl;
                                    setProdForm({
                                      ...prodForm,
                                      image: updated[0],
                                      images: updated,
                                    });
                                    showToast('Product image cropped!');
                                  },
                                })
                              }
                              className="text-amber-400 hover:text-white p-0.5"
                              title="Crop & Center Photo"
                            >
                              <Crop className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const currentImages = prodForm.images || (prodForm.image ? [prodForm.image] : []);
                            const filtered = currentImages.filter((_, i) => i !== imgIdx);
                            const nextMain = filtered[0] || 'fan-regulator-5step';
                            setProdForm({
                              ...prodForm,
                              image: nextMain,
                              images: filtered.length > 0 ? filtered : [nextMain],
                            });
                          }}
                          className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow transition z-10"
                          title="Delete image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Specs / Custom Presets */}
              <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 block">Custom Specifications / Options</span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentSpecs = prodForm.customSpecs || [];
                      setProdForm({
                        ...prodForm,
                        customSpecs: [...currentSpecs, { label: '', value: '' }],
                      });
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border border-slate-700"
                  >
                    <Plus className="w-3 h-3 text-[#E0183D]" />
                    <span>Add Custom Spec</span>
                  </button>
                </div>

                {prodForm.customSpecs && prodForm.customSpecs.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {prodForm.customSpecs.map((spec, specIdx) => (
                      <div key={specIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Spec Name (e.g. Warranty)"
                          value={spec.label}
                          onChange={(e) => {
                            const updatedSpecs = [...(prodForm.customSpecs || [])];
                            updatedSpecs[specIdx].label = e.target.value;
                            setProdForm({ ...prodForm, customSpecs: updatedSpecs });
                          }}
                          className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 5 Years)"
                          value={spec.value}
                          onChange={(e) => {
                            const updatedSpecs = [...(prodForm.customSpecs || [])];
                            updatedSpecs[specIdx].value = e.target.value;
                            setProdForm({ ...prodForm, customSpecs: updatedSpecs });
                          }}
                          className="w-1/2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedSpecs = (prodForm.customSpecs || []).filter((_, i) => i !== specIdx);
                            setProdForm({ ...prodForm, customSpecs: updatedSpecs });
                          }}
                          className="text-slate-400 hover:text-red-400 p-1 hover:bg-slate-900 rounded"
                          title="Remove Spec"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic">
                    No custom presets added yet. Click &quot;Add Custom Spec&quot; to define custom product details.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={prodForm.description || ''}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E0183D] text-white font-bold hover:bg-[#c01233] shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-3">
          <div className="bg-slate-900 text-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-extrabold text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Category Title</label>
                <input
                  type="text"
                  required
                  value={catForm.title || ''}
                  onChange={(e) => setCatForm({ ...catForm, title: e.target.value })}
                  placeholder="e.g. Industrial Heavy Duty Switches"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Subtitle</label>
                  <input
                    type="text"
                    value={catForm.subtitle || ''}
                    onChange={(e) => setCatForm({ ...catForm, subtitle: e.target.value })}
                    placeholder="e.g. Heavy Duty Appliance Controls"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Badge Tag</label>
                  <input
                    type="text"
                    value={catForm.badge || ''}
                    onChange={(e) => setCatForm({ ...catForm, badge: e.target.value })}
                    placeholder="e.g. HOT / NEW"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Icon Type</label>
                <select
                  value={catForm.icon || 'Flame'}
                  onChange={(e) => setCatForm({ ...catForm, icon: e.target.value, iconName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Flame">Flame (Summer / Heavy Power)</option>
                  <option value="Fan">Fan (Speed Regulator)</option>
                  <option value="Sliders">Sliders (Multi-level Switch)</option>
                  <option value="Zap">Zap (Electric / Power)</option>
                  <option value="Shield">Shield (Safety Socket)</option>
                  <option value="Sparkles">Sparkles (Modular Range)</option>
                  <option value="Star">Star (Premium Flagship)</option>
                  <option value="Factory">Factory (Commercial / Heavy)</option>
                </select>
              </div>

              {/* Custom Category Image Upload & Link Option */}
              <div className="space-y-2.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Custom Category Card Image / Banner</span>
                    <span className="text-[10px] text-slate-400">Auto-fits into category carousel card</span>
                  </div>
                  <label className="cursor-pointer bg-[#E0183D] hover:bg-[#c01233] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow active:scale-98">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingMap['Category Image'] ? 'Uploading...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingMap['Category Image'] === true}
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (url) => {
                            setCatForm((prev) => ({
                              ...prev,
                              imageUrl: url,
                              image: url,
                            }));
                          },
                          'Category Image',
                          'Category Image',
                          {
                            aspectRatio: 3 / 2,
                            title: 'Crop Category Card Image',
                            recommendedSizeText: '600 × 400 px (3:2 Aspect Ratio)',
                          }
                        )
                      }
                    />
                  </label>
                </div>

                {/* Category Card Auto-Fit vs Cover Selector */}
                <div className="space-y-1 pt-2 border-t border-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-300 font-bold">Image Fitting Behavior:</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCatForm((prev) => ({ ...prev, imageFit: 'contain' }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                          (catForm.imageFit || 'contain') === 'contain'
                            ? 'bg-[#E0183D] text-white border-[#E0183D]'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Auto-Fit (Contain)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCatForm((prev) => ({ ...prev, imageFit: 'cover' }))}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition border ${
                          catForm.imageFit === 'cover'
                            ? 'bg-[#E0183D] text-white border-[#E0183D]'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        Crop Fill (Cover)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Dedicated Inside-Category Banner Icon / Logo */}
                <div className="space-y-1.5 pt-2 border-t border-slate-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-200 font-bold block">
                        Separate Inside-Banner Icon (Optional)
                      </span>
                      <span className="text-[9px] text-slate-400">
                        Leave blank to auto-use the category card image above
                      </span>
                    </div>
                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-slate-700">
                      <Upload className="w-3 h-3" />
                      <span>Upload Banner Icon</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            e,
                            (url) => setCatForm((prev) => ({ ...prev, bannerImageUrl: url })),
                            'Banner Icon'
                          )
                        }
                      />
                    </label>
                  </div>
                  {catForm.bannerImageUrl && (
                    <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-[10px]">
                      <span className="text-emerald-400 font-bold truncate max-w-[200px]">Custom Banner Icon Attached</span>
                      <button
                        type="button"
                        onClick={() => setCatForm((prev) => ({ ...prev, bannerImageUrl: '' }))}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Paste Category Image Link */}
                <div className="space-y-1 pt-1 border-t border-slate-900">
                  <span className="text-[10px] text-slate-400 font-semibold block">Or Paste Category Image URL / Link:</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={categoryImgUrlInput}
                      onChange={(e) => setCategoryImgUrlInput(e.target.value)}
                      placeholder="Paste image link e.g. https://.../category.jpg"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-[#E0183D]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = categoryImgUrlInput.trim();
                        if (trimmed) {
                          setCatForm((prev) => ({
                            ...prev,
                            imageUrl: trimmed,
                            image: trimmed,
                          }));
                          setCategoryImgUrlInput('');
                          showToast('Category Image link applied!');
                        }
                      }}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#E0183D]" />
                      <span>Apply Link</span>
                    </button>
                  </div>
                </div>

                {(catForm.imageUrl || (catForm.image && (catForm.image.startsWith('data:') || catForm.image.startsWith('http') || catForm.image.includes('/')))) && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 block">Auto-Fit Category Card Preview:</span>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3">
                      <div className="w-20 h-16 bg-white rounded-lg border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow">
                        <ProductVisual type={catForm.imageUrl || catForm.image || ''} size="category" />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-white font-bold text-xs block">{catForm.title || 'Category'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openCropper({
                                imageSrc: catForm.imageUrl || catForm.image || '',
                                title: 'Crop Category Photo',
                                targetLabel: 'Category Photo',
                                aspectRatio: 3 / 2,
                                recommendedSizeText: '600 × 400 px (3:2 Ratio)',
                                onCropComplete: (croppedUrl) => {
                                  closeCropper();
                                  setCatForm((prev) => ({
                                    ...prev,
                                    imageUrl: croppedUrl,
                                    image: croppedUrl,
                                  }));
                                  showToast('Category image cropped!');
                                },
                              })
                            }
                            className="text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md"
                          >
                            <Crop className="w-3 h-3" />
                            <span>Crop / Center</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setCatForm((prev) => ({
                                ...prev,
                                imageUrl: '',
                                image: 'fan-regulator-5step',
                              }))
                            }
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sub-Categories Manager */}
              <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="font-bold text-slate-300 block">Sub-Categories Management</span>
                <p className="text-[10px] text-slate-400">
                  Add sub-categories (e.g. Rotary Switches, Fan Piano Switches) to organize products inside this category:
                </p>

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newSubCatText}
                    onChange={(e) => setNewSubCatText(e.target.value)}
                    placeholder="e.g. Rotary Switches"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newSubCatText.trim()) return;
                      const currentSubs = catForm.subCategories || [];
                      if (!currentSubs.includes(newSubCatText.trim())) {
                        setCatForm({
                          ...catForm,
                          subCategories: [...currentSubs, newSubCatText.trim()],
                        });
                      }
                      setNewSubCatText('');
                    }}
                    className="bg-[#E0183D] hover:bg-[#c01233] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                {catForm.subCategories && catForm.subCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {catForm.subCategories.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="bg-slate-900 text-slate-200 border border-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (catForm.subCategories || []).filter((_, i) => i !== sIdx);
                            setCatForm({ ...catForm, subCategories: updated });
                          }}
                          className="text-slate-400 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500 italic pt-1">
                    No sub-categories added yet. Type a title above and click Add.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={catForm.description || ''}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Brief description of products in this category..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#E0183D] text-white font-bold hover:bg-[#c01233] shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Interactive Image Cropper Dialog */}
      <ImageCropperModal
        isOpen={cropperConfig.isOpen}
        imageSrc={cropperConfig.imageSrc}
        title={cropperConfig.title}
        targetLabel={cropperConfig.targetLabel}
        aspectRatio={cropperConfig.aspectRatio}
        recommendedSizeText={cropperConfig.recommendedSizeText}
        onCropComplete={cropperConfig.onCropComplete}
        onCancel={closeCropper}
      />
    </div>
  );
};
