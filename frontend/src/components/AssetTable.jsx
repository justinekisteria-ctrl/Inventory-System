// frontend/src/components/AssetTable.jsx
// Component to display assets in a table with sorting and filtering

import {
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import StatusBadge from './StatusBadge';
import { QRCodeCanvas } from 'qrcode.react';
import searchIcon from '../assets/icons/search-icon.png';
import downloadIcon from '../assets/icons/download-icon.png';
import clearIcon from '../assets/icons/clear-icon.png';
import emptyIcon from '../assets/icons/empty-icon.png';
import qrIcon from '../assets/icons/qr-icon.png';

export default function AssetTable({
  assets,
  headers = [],
  onDownload,
  isDownloading,
  isLoading,
  onClearAssets,
  isClearing,
  onEditAsset,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('asset');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedQRAsset, setSelectedQRAsset] =
  useState(null);

const qrRef = useRef(null);

const [currentPage, setCurrentPage] =
  useState(1);

const assetsPerPage = 10;

const searchPlaceholders = [
  'Search Asset #: 10001234',
  'Search Serial #: DELL-9282',
  'Search Description: Monitor',
  'Search Cost Center',
  'Search Room',
];
const [placeholderIndex, setPlaceholderIndex] =
  useState(0);

  useEffect(() => {

  if (searchTerm) return;

  const interval = setInterval(() => {

    setPlaceholderIndex(prev =>
      (prev + 1) %
      searchPlaceholders.length
    );

  }, 3500);

  return () => clearInterval(interval);

}, [searchTerm]);

  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const currentMonth = monthNames[new Date().getMonth()];
  const currentYear = new Date().getFullYear();
  const currentRemarksLabel = `${currentMonth} ${currentYear} REMARKS`;

  const defaultColumns = [
    { key: 'asset', label: 'Asset #' },
    { key: 'assetDescription', label: 'Description' },
    { key: 'serialNumber', label: 'Serial #' },
    { key: 'costCenter', label: 'Cost Center' },
    { key: 'correctRoom', label: 'Room' },
    { key: 'status', label: 'Status' },
    { key: `${currentMonth} STATUS`, label: `${currentMonth} STATUS` },
    { key: 'remarks', label: currentRemarksLabel },
  ];

  const normalizeLabel = (label) =>
    String(label || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .trim();

  const isInternalField = (label) =>
    normalizeLabel(label).replace(/\s+/g, '') === 'scanningmonth';

  const isMonthlyRemarksHeader = (label) => {
    const normalized = normalizeLabel(label);
    return /^(january|february|march|april|may|june|july|august|september|october|november|december)\s*\d{4}\s*remarks$/.test(normalized);
  };

  const isRemarksHeader = (label) => {
    const normalized = normalizeLabel(label);
    return normalized === 'remarks' || (normalized.endsWith(' remarks') && !isMonthlyRemarksHeader(label));
  };

  const getAssetValue = (asset, header) => {
    if (isMonthlyRemarksHeader(header)) {
      if (asset[header] !== undefined) {
        return asset[header];
      }
      const normalizedHeader = normalizeLabel(header);
      const matchingKey = Object.keys(asset).find(key => normalizeLabel(key) === normalizedHeader);
      return matchingKey ? asset[matchingKey] : '';
    }

    if (isRemarksHeader(header)) {
      return asset.remarks || asset.REMARKS || asset.Remarks || asset.remark || asset.notes || asset.note || asset.comments || asset.comment || '';
    }

    if (asset[header] !== undefined) {
      return asset[header];
    }

    const normalizedHeader = normalizeLabel(header);
    const matchingKey = Object.keys(asset).find(key => {
      const normalizedKey = normalizeLabel(key);
      return normalizedKey === normalizedHeader;
    });

    return matchingKey ? asset[matchingKey] : '';
  };
const tableColumns = headers && headers.length > 0
  ? (() => {
      let processedHeaders = [...headers].filter(
        header => !isInternalField(header)
      );

      const monthRegex =
        /^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/i;

      // AUTO ADD missing STATUS/REMARKS pair
      processedHeaders.forEach(header => {
        const normalized = normalizeLabel(header);

        const match = normalized.match(monthRegex);

        if (match) {
          const monthYear = match[0];

          const statusHeader =
            `${monthYear.toUpperCase()} STATUS`;

          const remarksHeader =
            `${monthYear.toUpperCase()} REMARKS`;

          const hasStatus = processedHeaders.some(
            h => normalizeLabel(h) === normalizeLabel(statusHeader)
          );

          const hasRemarks = processedHeaders.some(
            h => normalizeLabel(h) === normalizeLabel(remarksHeader)
          );

          if (!hasStatus) {
            processedHeaders.push(statusHeader);
          }

          if (!hasRemarks) {
            processedHeaders.push(remarksHeader);
          }
        }
      });

      // REMOVE DUPLICATES
      processedHeaders = [...new Set(processedHeaders)];

      // SORT MONTH COLUMNS
      processedHeaders.sort((a, b) => {
        const aNorm = normalizeLabel(a);
        const bNorm = normalizeLabel(b);

        const aMatch = aNorm.match(monthRegex);
        const bMatch = bNorm.match(monthRegex);

        if (aMatch && bMatch) {
          const monthOrder = [
            'january', 'february', 'march', 'april',
            'may', 'june', 'july', 'august',
            'september', 'october', 'november', 'december'
          ];

          const [aMonth, aYear] = aMatch[0].split(' ');
          const [bMonth, bYear] = bMatch[0].split(' ');

          if (aYear !== bYear) {
            return parseInt(aYear) - parseInt(bYear);
          }

          const monthCompare =
            monthOrder.indexOf(aMonth) -
            monthOrder.indexOf(bMonth);

          if (monthCompare !== 0) {
            return monthCompare;
          }

          const aIsStatus = aNorm.endsWith(' status');
          const aIsRemarks = aNorm.endsWith(' remarks');

          const bIsStatus = bNorm.endsWith(' status');
          const bIsRemarks = bNorm.endsWith(' remarks');

          if (aIsStatus && bIsRemarks) return -1;
          if (aIsRemarks && bIsStatus) return 1;
        }

        return 0;
      });

            return processedHeaders.map(header => ({
        key: header,
        label: header,
      }));
    })()
  : defaultColumns;
  

  const normalizeHeader = (header) =>
    String(header || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, '')
      .replace(/[^a-z0-9]+/g, '');

  const getRemarksRank = (value) => {
    const normalized = String(value || '').toLowerCase().trim();
    if (normalized === 'found') return 0;
    if (normalized === 'not found' || normalized === 'notfound') return 1;
    if (normalized === '') return 3;
    return 2;
  };

  

  /**
   * Filter and sort assets based on search, status filter, and sort options
   */
  const filteredAssets = useMemo(() => {
    let filtered = [...assets];

    if (searchTerm) {
      const searchValue = searchTerm.toLowerCase();
      filtered = filtered.filter(asset =>
        Object.entries(asset).some(([key, value]) =>
          !isInternalField(key) &&
          String(value || '').toLowerCase().includes(searchValue)
        )
      );
    }

    if (filterStatus !== 'ALL') {
      if (filterStatus === 'FOUND' || filterStatus === 'NOT_FOUND') {
  filtered = filtered.filter(asset => {

    // check ALL monthly STATUS columns
    const monthlyStatuses = Object.keys(asset)
      .filter(key => {
  const normalized = normalizeLabel(key);

  return (
    normalized.endsWith(' status') &&
    normalized !== 'status' &&
    normalized !== 'status accounted unaccounted reconciling'
  );
})
      .map(key =>
        String(asset[key] || '')
          .toLowerCase()
          .trim()
      );

    const hasFound = monthlyStatuses.some(
      value => value === 'found'
    );

    const hasNotFound = monthlyStatuses.some(
      value =>
        value === 'not found' ||
        value === 'notfound'
    );

    return filterStatus === 'FOUND'
      ? hasFound
      : hasNotFound;
  });
} else {
        filtered = filtered.filter(asset => String(asset.status || '').toUpperCase() === filterStatus);
      }
    }

    filtered.sort((a, b) => {
      let aValue = getAssetValue(a, sortBy);
      let bValue = getAssetValue(b, sortBy);
      const isRemarksColumn = isRemarksHeader(sortBy);

      if (isRemarksColumn) {
        const aRank = getRemarksRank(aValue);
        const bRank = getRemarksRank(bValue);
        if (aRank !== bRank) {
          return sortOrder === 'asc' ? aRank - bRank : bRank - aRank;
        }
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (!isNaN(aValue) && !isNaN(bValue) && aValue !== '' && bValue !== '') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assets, searchTerm, filterStatus, sortBy, sortOrder]);
  useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, filterStatus]);

  /**
   * Handle column header click to change sort
   */
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort column
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Count statistics
  const accountedCount = assets.filter(
    a => a.status === 'ACCOUNTED'
  ).length;
  const unaccountedCount = assets.filter(
    a => a.status === 'UNACCOUNTED'
  ).length;

const highlightText = (text) => {

  if (!searchTerm) {
    return String(text || '');
  }

  const value = String(text || '');

  const regex = new RegExp(
    `(${searchTerm})`,
    'gi'
  );

  const parts = value.split(regex);

  return parts.map((part, index) => (

    regex.test(part) ? (
      <mark
        key={index}
        className="bg-yellow-200 text-gray-900 px-0.5 rounded"
      >
        {part}
      </mark>
    ) : (
      part
    )

  ));
};

  const handleDownloadQR = () => {

  if (!selectedQRAsset) return;

  const canvas =
    qrRef.current?.querySelector('canvas');

  if (!canvas) return;

  const url = canvas.toDataURL('image/png');

  const link =
    document.createElement('a');

  link.href = url;

  link.download =
  `${
    selectedQRAsset.serialNumber ||
    selectedQRAsset.asset
  }.png`;

  link.click();
};
const totalPages = Math.ceil(
  filteredAssets.length / assetsPerPage
);

const paginatedAssets =
  filteredAssets.slice(
    (currentPage - 1) * assetsPerPage,
    currentPage * assetsPerPage
  );
  const reconcilingCount = assets.filter(
    a => a.status === 'RECONCILING'
  ).length;

  return (
    <div className="bg-[#FCFBF7] backdrop-blur-2xl rounded-[32px] overflow-hidden border border-white/50 shadow-[0_10px_40px_rgba(15,23,42,0.05)] p-4 sm:p-6 h-full">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-white/85 to-[#fff8dc]/55 border border-white/60 backdrop-blur-xl rounded-[28px] p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
          <div className="text-2xl md:text-3xl font-bold text-[#D4A017]">{assets.length}</div>
          <div className="text-sm text-gray-600">Total Assets</div>
        </div>

        <div className="bg-gradient-to-br from-white/85 to-emerald-50/60 border border-white/60 backdrop-blur-xl rounded-[28px] p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
          <div className="text-2xl md:text-3xl font-bold text-green-600">
            {accountedCount}
          </div>
          <div className="text-sm text-gray-600">Accounted</div>
        </div>

        <div className="bg-gradient-to-br from-white/85 to-amber-50/60 border border-white/60 backdrop-blur-xl rounded-[28px] p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
          <div className="text-2xl md:text-3xl font-bold text-yellow-600">
            {reconcilingCount}
          </div>
          <div className="text-sm text-gray-600">Reconciling</div>
        </div>

        <div className="bg-gradient-to-br from-white/85 to-rose-50/60 border border-white/60 backdrop-blur-xl rounded-[28px] p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
          <div className="text-2xl md:text-3xl font-bold text-red-600">
            {unaccountedCount}
          </div>
          <div className="text-sm text-gray-600">Unaccounted</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="sticky top-[72px] z-30 bg-white flex flex-col md:flex-row gap-4 mb-6 pb-4">
        {/* Search Input */}
<div className="relative flex-1">

  <img
    src={searchIcon}
    alt="Search"
    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60"
  />

  <input
    type="text"
    placeholder={
      searchPlaceholders[
        placeholderIndex
      ]
    }
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    className="w-full pl-12 pr-4 h-14 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white/60 backdrop-blur-xl transition-all duration-300 shadow-[0_4px_12px_rgba(15,23,42,0.04)]"
  />

</div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 h-14 border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white/60 backdrop-blur-xl shadow-[0_4px_12px_rgba(15,23,42,0.04)]"
        >
          <option value="ALL">All Status / Remarks</option>
          <option value="ACCOUNTED">Accounted</option>
<option value="UNACCOUNTED">Unaccounted</option>
<option value="RECONCILING">Reconciling</option>
<option value="FOUND">Found</option>
<option value="NOT_FOUND">Not Found</option>
        </select>

        {/* Download Button */}
        <button
          onClick={onDownload}
          disabled={isDownloading || assets.length === 0}
          className="px-6 py-3 parchment-button text-slate-800 rounded-2xl hover:scale-[1.01] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_10px_28px_rgba(212,160,23,0.22)]"
        >
          <div className="flex items-center justify-center gap-2">

  <img
    src={downloadIcon}
    alt="Download"
    className="w-5 h-5"
  />

  <span>
    {isDownloading
      ? 'Downloading...'
      : 'Download Excel'}
  </span>

</div>
        </button>

        {/* Clear List Button */}
        {onClearAssets && (
          <button
            onClick={onClearAssets}
            disabled={isClearing || assets.length === 0}
            className="px-6 py-3 bg-gradient-to-br from-rose-400 to-red-500 text-white rounded-2xl hover:scale-[1.01] disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_8px_24px_rgba(239,68,68,0.18)]"
          >
            <div className="flex items-center justify-center gap-2">

  <img
    src={clearIcon}
    alt="Clear"
    className="w-5 h-5"
  />

  <span>
    {isClearing
      ? 'Clearing...'
      : 'Clear List'}
  </span>

</div>
          </button>
        )}
      </div>

      {/* Assets Table */}
{isLoading ? (

  <div className="overflow-auto w-full max-h-[58vh] xl:max-h-[65vh] rounded-lg border border-gray-200 animate-pulse">

    <table className="min-w-[1000px] w-full text-sm">

      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>

          {[...Array(8)].map((_, index) => (
            <th
              key={index}
              className="px-4 py-4"
            >
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </th>
          ))}

        </tr>
      </thead>

      <tbody>

        {[...Array(8)].map((_, rowIndex) => (
          <tr
            key={rowIndex}
            className="border-b border-gray-200"
          >

            {[...Array(8)].map((_, colIndex) => (
              <td
                key={colIndex}
                className="px-4 py-4"
              >
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </td>
            ))}

          </tr>
        ))}

      </tbody>

    </table>

  </div>

) : filteredAssets.length > 0 ? (
        <div className="overflow-auto w-full max-h-[70vh] rounded-3xl border border-gray-200 asset-table-scroll">
          <table className="min-w-[1600px] w-full text-sm">
            <thead className="sticky top-0 z-40 bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12 bg-gray-100 sticky top-0 z-40">
                  
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 bg-gray-100 sticky top-0 z-40">
  QR
</th>
                {tableColumns.map((col) => {

  const normalizedKey =
    normalizeHeader(col.key);

  const isCurrentMonthStatus =
    normalizedKey ===
    normalizeHeader(
      `${currentMonth} ${currentYear} STATUS`
    );

  const isCurrentMonthRemarks =
    normalizedKey ===
    normalizeHeader(
      `${currentMonth} ${currentYear} REMARKS`
    );

  return (
    <th
      key={col.key}
      onClick={() => handleSort(col.key)}
      className={`px-4 py-3 text-left font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 bg-gray-100 sticky top-0 z-40
        ${
          isCurrentMonthRemarks
  ? 'md:sticky md:right-0 z-30 w-[140px] min-w-[140px] max-w-[140px] shadow-[-2px_0_5px_rgba(0,0,0,0.1)]'
            : ''
        }
        ${
          isCurrentMonthStatus
  ? 'sticky right-0 md:right-[140px] bg-gray-100 z-30 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]'
            : ''
        }
      `}
    >
      {col.label}

      {sortBy === col.key && (
        <span className="ml-2">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </th>
  );
})}
              </tr>
            </thead>

            <tbody>
              {paginatedAssets.map((asset, index) => {
                const statusValue = asset.status || asset['STATUS'] || asset['Status'] || '';
                return (
                  <tr
                    key={asset.id || asset.asset}
                    className={`border-b border-gray-200 hover:bg-gray-50 ${
                      String(statusValue).toUpperCase() === 'ACCOUNTED'
                        ? 'bg-green-50'
                        : String(statusValue).toUpperCase() === 'RECONCILING'
                        ? 'bg-yellow-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-600 font-semibold w-12">
                      {(currentPage - 1) * assetsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3 text-center">

  <div className="flex flex-col gap-2 items-center">

    <button
      onClick={() =>
        setSelectedQRAsset(asset)
      }
      className="min-w-[110px] px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold flex items-center justify-center"
    >
      <div className="flex items-center justify-center gap-2 whitespace-nowrap">

        <img
          src={qrIcon}
          alt="QR"
          className="w-4 h-4 flex-shrink-0"
        />

        <span>Generate QR</span>

      </div>

    </button>

    <button
      onClick={() =>
        onEditAsset?.(asset)
      }
      className="min-w-[110px] px-3 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition text-sm font-semibold"
    >
      Edit
    </button>

  </div>

</td>
                    {tableColumns.map(column => {

  const normalizedKey =
    normalizeHeader(column.key);

  const isCurrentMonthStatus =
    normalizedKey ===
    normalizeHeader(
      `${currentMonth} ${currentYear} STATUS`
    );

  const isCurrentMonthRemarks =
    normalizedKey ===
    normalizeHeader(
      `${currentMonth} ${currentYear} REMARKS`
    );

  const cellValue =
    getAssetValue(asset, column.key);

  const isStatusColumn =
    normalizeHeader(column.key) === 'status';

  return (
    <td
      key={`${asset.id || asset.asset}-${column.key}`}
      className={`px-4 py-3 text-gray-600
        ${
          isCurrentMonthRemarks
  ? 'md:sticky md:right-0 bg-inherit z-20 backdrop-blur-0 w-[140px] min-w-[140px] max-w-[140px] shadow-[-2px_0_5px_rgba(0,0,0,0.05)]'
            : ''
        }
        ${
          isCurrentMonthStatus
  ? 'sticky right-0 md:right-[140px] bg-inherit z-20 backdrop-blur-0 shadow-[-2px_0_5px_rgba(0,0,0,0.05)]'
            : ''
        }
      `}
    >
      {isStatusColumn ? (
        <StatusBadge status={cellValue} />
      ) : (
        highlightText(cellValue)
      )}
    </td>
  );
})}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Showing results info */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">

  <div className="text-sm text-slate-500">
    Showing
    {' '}
    <span className="font-semibold text-slate-700">
      {(currentPage - 1) * assetsPerPage + 1}
    </span>
    {' '}-{' '}
    <span className="font-semibold text-slate-700">
      {Math.min(
        currentPage * assetsPerPage,
        filteredAssets.length
      )}
    </span>
    {' '}of{' '}
    <span className="font-semibold text-slate-700">
      {filteredAssets.length}
    </span>
    {' '}assets
  </div>

  <div className="flex items-center gap-2">

    <button
      onClick={() =>
        setCurrentPage(prev =>
          Math.max(prev - 1, 1)
        )
      }
      disabled={currentPage === 1}
      className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      Previous
    </button>

    {[...Array(totalPages)].map((_, index) => (
      <button
        key={index}
        onClick={() =>
          setCurrentPage(index + 1)
        }
        className={`w-10 h-10 rounded-xl transition font-semibold ${
          currentPage === index + 1
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white border border-slate-200 hover:bg-slate-100'
        }`}
      >
        {index + 1}
      </button>
    ))}

    <button
      onClick={() =>
        setCurrentPage(prev =>
          Math.min(prev + 1, totalPages)
        )
      }
      disabled={currentPage === totalPages}
      className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      Next
    </button>

  </div>

</div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-[32px] border border-white/50 bg-gradient-to-br from-white/80 to-[#fff8dc]/35 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

  <img
    src={emptyIcon}
    alt="Empty"
    className="w-16 h-16 opacity-70 mb-5"
  />

  <h3 className="text-xl font-bold text-slate-700">
    No matching assets found
  </h3>

  <p className="text-slate-500 mt-2 max-w-sm">
    {searchTerm
      ? `No assets matched "${searchTerm}"`
      : 'Upload an inventory file to begin tracking assets in real-time.'}
  </p>

</div>
      )}
    {selectedQRAsset && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn">

      <button
        onClick={() =>
          setSelectedQRAsset(null)
        }
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
      >
        ×
      </button>

      <div className="text-center">

        <h2 className="text-2xl font-bold text-gray-800">
          Asset QR Code
        </h2>

        <p className="text-gray-500 mt-2">
          Generate and download QR label
        </p>

      </div>

      <div
        ref={qrRef}
        className="mt-8 flex justify-center"
      >
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">

          <QRCodeCanvas
  value={String(
    selectedQRAsset.serialNumber ||
    selectedQRAsset.asset
  )}
  size={220}
  level="H"
  includeMargin
/>

        </div>
      </div>

      <div className="mt-6 text-center">

        <h3 className="text-lg font-bold text-gray-800">
  {selectedQRAsset.serialNumber ||
    selectedQRAsset.asset}
</h3>

        <p className="text-sm text-gray-500 mt-1">
          {selectedQRAsset.assetDescription ||
            'No description'}
        </p>

        <p className="text-xs text-gray-400 mt-2">
  Asset #: {
    selectedQRAsset.asset || 'N/A'
  }
</p>

      </div>

      <div className="mt-8 flex gap-3">

        <button
          onClick={handleDownloadQR}
          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
        >
          <div className="flex items-center justify-center gap-2">

  <img
    src={downloadIcon}
    alt="Download"
    className="w-5 h-5"
  />

  <span>Download PNG</span>

</div>
        </button>

        <button
          onClick={() =>
            window.print()
          }
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-semibold"
        >
          <span>Print QR</span>
        </button>

      </div>

    </div>

  </div>
)}

</div>
  );
}
