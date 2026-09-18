import React, { useState } from 'react';
import { useFalconStore } from '../context/StoreContext';
import { Product, Category } from '../types';
import { compressImageFile } from '../utils/imageCompressor';
import { ImageCropperModal } from './ImageCropperModal';
import { AdminHeader } from './admin/AdminHeader';
import { AdminTabsNav, AdminTabType } from './admin/AdminTabsNav';
import { LogosBrandingTab } from './admin/tabs/LogosBrandingTab';
import { CompanyContactTab } from './admin/tabs/CompanyContactTab';
import { ProductsTab } from './admin/tabs/ProductsTab';
import { CategoriesTab } from './admin/tabs/CategoriesTab';
import { CatalogueTab } from './admin/tabs/CatalogueTab';
import { WhyUsTab } from './admin/tabs/WhyUsTab';
import { SecurityTab } from './admin/tabs/SecurityTab';
import { DatabaseTab } from './admin/tabs/DatabaseTab';
import { ProductEditModal } from './admin/modals/ProductEditModal';
import { CategoryEditModal } from './admin/modals/CategoryEditModal';

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
    isFirebaseConnected,
    catalogueSettings,
    updateCatalogueSettings,
    updateCataloguePages,
    updateSingleCataloguePage,
    syncAllDataToSupabase,
  } = useFalconStore();

  const [activeTab, setActiveTab] = useState<AdminTabType>('CATALOGUE');
  const [successToast, setSuccessToast] = useState('');
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Interactive Image Cropper Modal State
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
    title: 'Crop Image',
    targetLabel: 'Image',
    aspectRatio: 1,
    recommendedSizeText: '800 × 800 px (Square 1:1 ratio)',
    onCropComplete: () => {},
  });

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const openCropper = (config: {
    imageSrc: string;
    title: string;
    targetLabel: string;
    aspectRatio: number | null;
    recommendedSizeText: string;
    onCropComplete: (dataUrl: string) => void | Promise<void>;
  }) => {
    setCropperConfig({
      isOpen: true,
      ...config,
    });
  };

  const closeCropper = () => {
    setCropperConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // High-performance image file handler with 25MB check & WebP compression
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void | Promise<void>,
    label: string = 'Image',
    slotKey: string = 'general',
    cropOptions?: {
      aspectRatio?: number | null;
      recommendedSizeText?: string;
      title?: string;
    }
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      alert(`${label} is too large (${sizeMb} MB). Please select an image under 25 MB.`);
      e.target.value = '';
      return;
    }

    setUploadingMap((prev) => ({ ...prev, [slotKey]: true }));
    try {
      const isLogo = label.toLowerCase().includes('logo');
      const isBanner = label.toLowerCase().includes('banner');
      const isCatalogue = label.toLowerCase().includes('catalogue');

      const dataUrl = await compressImageFile(file, {
        maxWidth: isCatalogue ? 2400 : isBanner ? 2000 : isLogo ? 1200 : 1800,
        maxHeight: isCatalogue ? 3200 : isBanner ? 1000 : isLogo ? 1200 : 1800,
        quality: 0.95,
      });

      if (dataUrl) {
        if (cropOptions) {
          openCropper({
            imageSrc: dataUrl,
            title: cropOptions.title || `Crop ${label}`,
            targetLabel: label,
            aspectRatio: cropOptions.aspectRatio !== undefined ? cropOptions.aspectRatio : 1,
            recommendedSizeText:
              cropOptions.recommendedSizeText || 'Recommended: 800 × 800 px (Square 1:1)',
            onCropComplete: async (croppedUrl) => {
              closeCropper();
              await onSuccess(croppedUrl);
              showToast(`${label} cropped and saved to Database!`);
            },
          });
        } else {
          await onSuccess(dataUrl);
          showToast(`${label} uploaded and saved to Database!`);
        }
      }
    } catch (err: any) {
      console.error(`Upload error for ${label}:`, err);
      alert(`Failed to process ${label}: ` + (err?.message || err));
    } finally {
      setUploadingMap((prev) => {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      });
      e.target.value = '';
    }
  };

  // Category helpers
  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const [movedItem] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, movedItem);

    reorderCategories(newCategories);
    showToast(`Reordered: "${movedItem.title}" moved ${direction}!`);
  };

  // Product helpers
  const handleToggleTopPick = async (product: Product) => {
    const newVal = !product.isTopPick;
    try {
      await updateProduct(product.id, { ...product, isTopPick: newVal });
      showToast(newVal ? `⭐ "${product.name}" added to Top Picks!` : `Removed from Top Picks.`);
    } catch (err: any) {
      alert('Failed to update product: ' + (err?.message || err));
    }
  };

  // Cloud Sync All
  const handleSyncAllToCloud = async () => {
    setSyncInProgress(true);
    try {
      await syncAllDataToSupabase();
      showToast('☁️ All catalog data, images & settings synchronized to Supabase Cloud!');
    } catch (err: any) {
      alert('Sync failed: ' + (err?.message || err));
    } finally {
      setSyncInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col w-full selection:bg-[#E0183D] selection:text-white pb-20">
      {/* Top Header Bar */}
      <AdminHeader
        isFirebaseConnected={isFirebaseConnected}
        onClose={onClose}
        onLogout={logoutAdmin}
      />

      {/* Responsive Horizontal Tabs Bar */}
      <AdminTabsNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        catalogueCount={(catalogueSettings.pages || []).length}
        productsCount={products.length}
        categoriesCount={categories.length}
        dbDiagnosticTested={true}
        dbTablesExist={isFirebaseConnected}
      />

      {/* Toast Notification Banner */}
      {successToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-emerald-600 text-white font-black text-xs sm:text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <span>✓</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 space-y-6">
        {activeTab === 'CATALOGUE' && (
          <CatalogueTab
            catalogueSettings={catalogueSettings}
            uploadingMap={uploadingMap}
            onUpdateCatalogueSettings={updateCatalogueSettings}
            onUpdateCataloguePages={updateCataloguePages}
            onUpdateSingleCataloguePage={updateSingleCataloguePage}
            onFileUpload={handleFileUpload}
            onOpenCropper={openCropper}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'LOGOS' && (
          <LogosBrandingTab
            companyDetails={companyDetails}
            heroContent={heroContent}
            logoImageUrl={logoImageUrl}
            uploadingMap={uploadingMap}
            onUpdateCompanyDetails={updateCompanyDetails}
            onUpdateHeroContent={updateHeroContent}
            onUpdateLogoImage={updateLogoImage}
            onFileUpload={handleFileUpload}
            onOpenCropper={openCropper}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'COMPANY' && (
          <CompanyContactTab
            companyDetails={companyDetails}
            uploadingMap={uploadingMap}
            onUpdateCompanyDetails={updateCompanyDetails}
            onFileUpload={handleFileUpload}
            onOpenCropper={openCropper}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'PRODUCTS' && (
          <ProductsTab
            products={products}
            categories={categories}
            onOpenAddProduct={() => {
              setEditingProduct(null);
              setIsProductModalOpen(true);
            }}
            onOpenEditProduct={(prod) => {
              setEditingProduct(prod);
              setIsProductModalOpen(true);
            }}
            onDeleteProduct={deleteProduct}
            onToggleTopPick={handleToggleTopPick}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'CATEGORIES' && (
          <CategoriesTab
            categories={categories}
            onOpenAddCategory={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            onOpenEditCategory={(cat) => {
              setEditingCategory(cat);
              setIsCategoryModalOpen(true);
            }}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
            onMoveCategory={handleMoveCategory}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'WHY_US' && (
          <WhyUsTab
            whyUsFeatures={whyChooseUs}
            onUpdateWhyUsFeatures={updateWhyChooseUs}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'SECURITY' && (
          <SecurityTab
            adminEmail={adminCredentials.email}
            onUpdateAdminAuth={async (email, pwd) => {
              await updateAdminCredentials(email, pwd);
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'DATABASE' && (
          <DatabaseTab
            isFirebaseConnected={isFirebaseConnected}
            syncInProgress={syncInProgress}
            onSyncAllToCloud={handleSyncAllToCloud}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          uploadingMap={uploadingMap}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={async (prodData) => {
            if (editingProduct?.id) {
              await updateProduct(editingProduct.id, prodData as Product);
            } else {
              await addProduct(prodData as Omit<Product, 'id'>);
            }
          }}
          onFileUpload={handleFileUpload}
          onOpenCropper={openCropper}
          onShowToast={showToast}
        />
      )}

      {/* Category Add / Edit Modal */}
      {isCategoryModalOpen && (
        <CategoryEditModal
          category={editingCategory}
          uploadingMap={uploadingMap}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSave={async (catData) => {
            if (editingCategory?.id) {
              await updateCategory(editingCategory.id, catData as Category);
            } else {
              await addCategory(catData as Omit<Category, 'id'>);
            }
          }}
          onFileUpload={handleFileUpload}
          onShowToast={showToast}
        />
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperConfig.isOpen}
        imageSrc={cropperConfig.imageSrc}
        title={cropperConfig.title}
        targetLabel={cropperConfig.targetLabel}
        aspectRatio={cropperConfig.aspectRatio}
        recommendedSizeText={cropperConfig.recommendedSizeText}
        onCancel={closeCropper}
        onCropComplete={cropperConfig.onCropComplete}
      />
    </div>
  );
};
