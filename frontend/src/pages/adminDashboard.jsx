import { useState, useEffect } from "react";

import uploadIcon from "../assets/icons/upload.svg";
import scanIcon from "../assets/icons/scan.svg";
import usersIcon from "../assets/icons/users.svg";
import activityIcon from "../assets/icons/activity.svg";
import homeIcon from "../assets/icons/home.svg";
import {
  fetchActivityHistory,
  updateAsset,
} from "../services/api";
import companyLogo from "../assets/logo.jpg";

import UploadForm from "../components/UploadForm";
import ScannedAssetDetails from "../components/ScannedAssetDetails";
import UserManagement from "../components/UserManagement";
import AssetTable from "../components/AssetTable";
import QRScanner from "../components/QRScanner";
import ActivityHistory from "../components/ActivityHistory";
import EditAssetModal from "../components/EditAssetModal";
import MobileBottomNav from "../components/MobileBottomNav";
import Sidebar from "../components/sidebar";

export default function AdminDashboard({
  assets,
  headers,
  scannedAssets,
  isLoading,
  onUploadSuccess,
  onUploadError,
  onScanSuccess,
  onScanError,
  onDownload,
  isDownloading,
  onClearAssets,
  isClearing,
  onRefreshAssets,
}) {
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedAsset, setSelectedAsset] =
  useState(null);

  const [showEditModal, setShowEditModal] =
  useState(false);
  const [recentScansCount, setRecentScansCount] =
  useState(0);
  const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
};
const navigationItems = [

  {
    key: "dashboard",
    label: "Home",
    icon: homeIcon,
  },

  {
    key: "upload",
    label: "Upload",
    icon: uploadIcon,
  },

  {
    key: "scan",
    label: "Scan",
    icon: scanIcon,
  },

  {
    key: "activityHistory",
    label: "Activity",
    icon: activityIcon,
  },

  {
    key: "users",
    label: "Users",
    icon: usersIcon,
  },

];

useEffect(() => {

  async function loadRecentScans() {

    try {

      const history =
        await fetchActivityHistory();

      setRecentScansCount(
        history.length
      );

    } catch (error) {

      console.error(
        "Failed to load recent scans",
        error
      );

    }

  }

  loadRecentScans();

  const interval = setInterval(
    loadRecentScans,
    3000
  );

  return () =>
    clearInterval(interval);

}, []);
const handleEditAsset = async (
  updates
) => {

  try {

    await updateAsset(
      selectedAsset.asset,
      updates
    );

    setShowEditModal(false);

    setSelectedAsset(null);

    await onRefreshAssets(true);

  } catch (error) {

    console.error(
      "Failed to update asset",
      error
    );

    alert(
      error.message ||
      "Failed to update asset"
    );

  }

};
  return (

  <div className="dashboard-scroll flex flex-row gap-4 w-full min-w-0">
    <Sidebar
  activePage={activePage}
  setActivePage={setActivePage}
  navigationItems={navigationItems}
  />

    {/* DESKTOP SIDEBAR */}
    {/*<aside className="hidden lg:flex fixed top-4 h-[calc(100vh-48px)] w-[220px] flex-col shrink-0 rounded-[36px] border border-white/50 bg-[#FCFBF7]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.06)] p-5 pt-8">

      

      <div className="flex flex-col gap-2">

        {navigationItems.map(item => {

          const isActive =
            activePage === item.key;

          return (

            <button
              key={item.key}
              onClick={() =>
                setActivePage(item.key)
              }
              className={`group flex items-center gap-4 rounded-2xl px-4 py-4 transition-all duration-300 text-left ${
                isActive
                  ? 'parchment-button'
                  : 'hover:bg-white/70 text-slate-600'
              }`}
            >

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                  isActive
                    ? 'bg-black/10 border-black/10'
                    : 'bg-white/50 border-white/60'
                }`}
              >

                <img
                  src={item.icon}
                  alt={item.label}
                  className={`w-5 h-5 object-contain ${
                    isActive
                      ? 'opacity-100'
                      : 'opacity-70'
                  }`}
                />

              </div>

              <div>

                <p className="font-semibold text-sm">
                  {item.label}
                </p>

              </div>

            </button>

          );

        })}

      </div>

      

    </aside>*/}

    {/* MAIN CONTENT */}
    <div className="flex-1 min-w-0 pb-36 lg:pb-28 lg:ml-[250px] lg:pt-5">

<div className="hidden lg:block sticky top-4 z-30 mb-6">

  <div className="flex items-start justify-between gap-4 rounded-[30px] bg-[#F7F5EF]/85 backdrop-blur-xl border border-white/60 px-6 py-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

    <div>

      <p className="text-sm font-medium text-slate-500">
        {getGreeting()}, Administrator
      </p>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
        Operations Dashboard
      </h1>

      

    </div>

  </div>

</div>

{/* MOBILE INTRO */}
<div className="lg:hidden mb-4">

  <p className="text-sm font-medium text-slate-500">
    {getGreeting()}, Administrator
  </p>

  <h1 className="text-[22px] sm:text-[28px] leading-tight font-extrabold tracking-[-0.02em] text-slate-900 mt-1">
    Operations Dashboard
  </h1>

  

</div>

{/* MOBILE HERO */}
<div className="lg:hidden mb-6">

  <div className="relative overflow-hidden rounded-[28px] bg-[#FCFBF7] border border-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.05)] p-4">

    <div className="absolute top-0 right-0 w-40 h-40 bg-[#FAEFD9]/40 rounded-full blur-3xl" />
    <img
  src={companyLogo}
  alt="Golden Eagles"
  className="
    absolute
    right-[-35px]
    top-[-5px]
    w-40
    opacity-[0.10]
    rotate-[-12deg]
    pointer-events-none
    select-none
  "
/>

    <div className="relative z-10">

      <div className="flex items-start">

        <div>

          

          <h1
  className="
    mt-2
    text-[24px] sm:text-[32px]
    leading-[0.95]
    tracking-[-0.04em]
    font-black
    text-slate-900
  "
>
  Administrator
</h1>

          <p className="mt-1 text-[13px] text-slate-400 font-medium tracking-wide">
  Golden Eagles Distribution Center
</p>

        </div>

        

      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">

        <div className="rounded-3xl bg-white/80 p-4 border border-white/70">

          <p className="text-xs text-slate-500">
            Total Assets
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {assets.length}
          </h2>

        </div>

        <div className="rounded-3xl bg-white/80 p-4 border border-white/70">

          <p className="text-xs text-slate-500">
            Recent Scans
          </p>

          <h2 className="mt-1 text-3xl font-bold text-slate-900">
            {recentScansCount}
          </h2>

        </div>

      </div>

    </div>

  </div>

</div>

      {/* DASHBOARD MENU */}
      {activePage === "dashboard" && (

  <>

    
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">

  <div className="bg-[#FCFBF7] backdrop-blur-2xl rounded-[28px] border border-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">

    <p className="text-sm text-slate-500">
      Total Assets
    </p>

    <h2 className="text-2xl font-bold text-slate-800 mt-1">
      {assets.length}
    </h2>

  </div>

  <div className="bg-[#FCFBF7] backdrop-blur-2xl rounded-[28px] border border-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">

    <p className="text-sm text-slate-500">
      Recent Scans
    </p>

    <h2 className="text-2xl font-bold text-slate-800 mt-1">
      {recentScansCount}
    </h2>

  </div>

  <div className="bg-[#FCFBF7] backdrop-blur-2xl rounded-[28px] border border-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">

    <p className="text-sm text-slate-500">
      System Status
    </p>

    <h2 className="text-lg font-semibold text-green-600 mt-1">
      Online
    </h2>

  </div>

  <div className="bg-[#FCFBF7] backdrop-blur-2xl rounded-[28px] border border-white/60 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">

    <p className="text-sm text-slate-500">
      Inventory Mode
    </p>

    <h2 className="text-lg font-semibold text-slate-800 mt-1">
      Active
    </h2>

  </div>

</div>

<div className="mt-8 mb-4">

  <h2 className="text-lg md:text-2xl font-bold text-slate-800">
    Quick Actions
  </h2>

</div>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5 mt-6 md:mt-10">
      

          {/* Upload */}
<button
  onClick={() => setActivePage("upload")}
  className="group relative overflow-hidden rounded-3xl bg-[#FCFBF7] backdrop-blur-2xl border border-white/50 p-5 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:scale-[1.02] hover:gold-soft-glow active:scale-[0.98] min-h-[120px] md:min-h-[170px]"
>

  <div className="flex flex-col items-start h-full">

    <div className="w-12 h-12 rounded-3xl bg-[#FAF8F3] border border-white/60 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">

      <img
        src={uploadIcon}
        alt="Upload"
        className="w-7 h-7 object-contain opacity-70"
      />

    </div>

    <div className="mt-auto pt-6 w-full text-left">

  <h2 className="text-slate-800 text-lg md:text-2xl font-bold leading-tight text-left">
    Upload
  </h2>

  <p className="hidden md:block min-h-[40px] text-left text-slate-500 text-sm mt-1">
    Upload inventory files
  </p>

  <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/70 border border-white/70 backdrop-blur-xl flex items-center justify-center shadow-[0_6px_18px_rgba(15,23,42,0.06)]">

    <span className="text-[#b89b5e] text-lg">
      →
    </span>

  </div>

</div>

  </div>

</button>

          {/* Scan */}
<button
  onClick={() => setActivePage("scan")}
  className="group relative overflow-hidden rounded-3xl bg-[#FCFBF7] backdrop-blur-2xl border border-white/50 p-5 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] min-h-[120px] md:min-h-[170px]"
>

  <div className="flex flex-col items-start h-full">

    <div className="w-12 h-12 rounded-3xl bg-[#FAF8F3] border border-white/60 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <img
        src={scanIcon}
        alt="Scan"
        className="w-7 h-7 object-contain opacity-70"
      />

    </div>

    <div className="mt-auto pt-6 w-full text-left">

  <h2 className="text-slate-800 text-lg md:text-2xl font-bold leading-tight text-left">
    Scan
  </h2>

  <p className="hidden md:block min-h-[40px] text-slate-500 text-sm mt-1">
    Scan and manage assets
  </p>

  <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/70 border border-white/70 backdrop-blur-xl flex items-center justify-center shadow-[0_6px_18px_rgba(15,23,42,0.06)]">

    <span className="text-[#b89b5e] text-lg">
      →
    </span>

  </div>

</div>

  </div>

</button>

          {/* User Management */}
<button
  onClick={() => setActivePage("users")}
  className="group relative overflow-hidden rounded-3xl bg-[#FCFBF7] backdrop-blur-2xl border border-white/50 p-5 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:scale-[1.02] hover:gold-soft-glow active:scale-[0.98] min-h-[120px] md:min-h-[170px]"
>

  <div className="flex flex-col items-start h-full">

    <div className="w-12 h-12 rounded-3xl bg-[#FAF8F3] border border-white/60 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">

      <img
        src={usersIcon}
        alt="Users"
        className="w-6 h-6 object-contain opacity-70"
      />

    </div>

    <div className="mt-auto pt-6 w-full text-left">

  <h2 className="text-slate-800 text-lg md:text-2xl font-bold leading-tight text-left">
    Users
  </h2>

  <p className="hidden md:block min-h-[40px] text-slate-500 text-sm mt-1">
    Manage system users
  </p>

  <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/70 border border-white/70 backdrop-blur-xl flex items-center justify-center shadow-[0_6px_18px_rgba(15,23,42,0.06)]">

    <span className="text-[#b89b5e] text-lg">
      →
    </span>

  </div>

</div>

  </div>

</button>

          {/* Activity History */}
<button
  onClick={() =>
    setActivePage("activityHistory")
  }
  className="group relative overflow-hidden rounded-3xl bg-[#FCFBF7] backdrop-blur-2xl border border-white/50 p-5 md:p-8 shadow-[0_10px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:scale-[1.02] hover:gold-soft-glow active:scale-[0.98] min-h-[120px] md:min-h-[170px]"
>

  <div className="flex flex-col items-start h-full">

    <div className="w-12 h-12 rounded-3xl bg-[#FAF8F3] border border-white/60 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">

      <img
        src={activityIcon}
        alt="Activity"
        className="w-7 h-7 object-contain opacity-70"
      />

    </div>

    <div className="mt-auto pt-6 w-full text-left">

  <h2 className="text-slate-800 text-lg md:text-2xl font-bold leading-tight text-left">
    Activity
  </h2>

  <p className="hidden md:block min-h-[40px] text-slate-500 text-sm mt-1">
    View activity logs
  </p>

  <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/70 border border-white/70 backdrop-blur-xl flex items-center justify-center shadow-[0_6px_18px_rgba(15,23,42,0.06)]">

    <span className="text-[#b89b5e] text-lg">
      →
    </span>

  </div>

</div>

  </div>

</button>

                </div>

  </>

      )}

      {/* UPLOAD PAGE */}
      {activePage === "upload" && (
        <div>

          

          <UploadForm
            onUploadSuccess={onUploadSuccess}
            onUploadError={onUploadError}
          />

        </div>
      )}

      {/* SCAN PAGE */}
      {activePage === "scan" && (
        <div>

        

          {/* CUSTOM LAYOUT */}
<div className="flex flex-col xl:flex-row gap-4 items-start">

  {/* LEFT SIDEBAR */}
  <div className="w-full xl:w-[340px] 2xl:w-[380px] flex-shrink-0 flex flex-col gap-4">

    <div className="order-2 xl:order-1">
  <ScannedAssetDetails
    scannedAssets={scannedAssets}
  />
</div>

<div className="order-1 xl:order-2">
  <QRScanner
    onScanSuccess={onScanSuccess}
    onScanError={onScanError}
  />
</div>

  </div>

  {/* RIGHT CONTENT */}
  <div className="flex-1 min-w-0 w-full">

              {isLoading ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center h-full flex flex-col justify-center">

                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>

                  <p className="text-gray-600 mt-4">
                    Loading assets...
                  </p>

                </div>
              ) : (
                <AssetTable
  assets={assets}
  headers={headers}
  onDownload={onDownload}
  isDownloading={isDownloading}
  onClearAssets={onClearAssets}
  isClearing={isClearing}
  onEditAsset={(asset) => {
    setSelectedAsset(asset);
    setShowEditModal(true);
  }}
/>
              )}

            </div>

          </div>

        </div>
      )}

      {/* USER MANAGEMENT PAGE */}
      {activePage === "users" && (
        <div>

          

          <UserManagement />

        </div>
      )}

      {/* ACTIVITY HISTORY PAGE */}
{activePage === "activityHistory" && (
  <div>

    

    <ActivityHistory
  scannedAssets={scannedAssets}
  currentUser={JSON.parse(
    localStorage.getItem('currentUser')
  )}
/>

  </div>
)}

<div className="lg:hidden">

  <MobileBottomNav
    activePage={activePage}
    setActivePage={setActivePage}
  />

</div>

        </div>
<EditAssetModal
  isOpen={showEditModal}
  asset={selectedAsset}
  onClose={() => {
    setShowEditModal(false);
    setSelectedAsset(null);
  }}
  onSave={handleEditAsset}
/>
  </div>

);
}