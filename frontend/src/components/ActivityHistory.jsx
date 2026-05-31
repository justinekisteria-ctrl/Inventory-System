import {
  useState,
  useEffect,
} from 'react';

import {
  fetchActivityHistory,
getLastUpdated,
downloadActivityReport,
} from '../services/api';

import { createPortal } from 'react-dom';

export default function ActivityHistory({
  scannedAssets,
  currentUser,
}) {
  const [history, setHistory] =
  useState([]);

const [isLoading, setIsLoading] =
  useState(true);

const [lastKnownUpdate, setLastKnownUpdate] =
  useState(null);

  const [search, setSearch] =
  useState('');

  const [currentPage, setCurrentPage] =
  useState(1);

  const [selectedActivity, setSelectedActivity] =
  useState(null);

const itemsPerPage = 25;

const getActivityLabel = (
  scanMethod
) => {

  switch (scanMethod) {

    case 'EDIT':
      return 'Asset Updated';

    case 'MANUAL':
      return 'Manual Scan';

    case 'QR':
      return 'QR Scan';

    default:
      return scanMethod || 'QR Scan';

  }

};

  useEffect(() => {
  loadHistory();

  async function checkUpdates(){
    try {
      const latestUpdate = await getLastUpdated();

      if (latestUpdate && latestUpdate !== lastKnownUpdate) {
        setLastKnownUpdate(latestUpdate);
        await loadHistory();
      }
    } catch (error) {
      console.error("Failed to check for updates", error);
    }
  }

  const interval = setInterval(
    checkUpdates,
    2000
  );

  return () => clearInterval(interval);
}, [lastKnownUpdate]);

async function loadHistory() {
  setIsLoading(true);
  try {
    const data =
      await fetchActivityHistory();
    setHistory(data);
  } catch (error) {
    console.error("Failed to load history",error);
    setHistory([]);
  } finally {
    setIsLoading(false);
  }
}

  const filteredHistory =
    history.filter(item => {
      const searchValue =
        search.toLowerCase();

      return (
        (item.employeeId || '')
  .toLowerCase()
  .includes(searchValue) ||

(item.userName || '')
  .toLowerCase()
  .includes(searchValue) ||

        (
  item.asset ||
  item.Asset ||
  ''
)
  .toLowerCase()
  .includes(searchValue)
      );
    });

    const totalPages = Math.ceil(
  filteredHistory.length /
  itemsPerPage
);

const paginatedHistory =
  filteredHistory.slice(
    (currentPage - 1) *
      itemsPerPage,

    currentPage *
      itemsPerPage
  );

  return (
    <div className="bg-gradient-to-br from-white/80 via-white/65 to-slate-100/40 backdrop-blur-2xl rounded-[32px] border border-white/50 shadow-[0_10px_40px_rgba(15,23,42,0.05)] p-4">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
  Activity History
</h2>

          <p className="text-sm text-slate-400 mt-0.5">
            User scan records
          </p>
        </div>

<button
  onClick={
    downloadActivityReport
  }
  className="h-14 px-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-semibold shadow-[0_8px_24px_rgba(99,102,241,0.18)] hover:scale-[1.01] transition-all duration-300"
>
  Download Report
</button>

        <input
          type="text"
          placeholder="Search user or asset..."
          value={search}
          onChange={e =>
            setSearch(e.target.value)
          }
          className="w-full md:w-80 h-14 border border-white/60 rounded-2xl px-5 bg-white/60 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-slate-300 shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition-all duration-300"
        />

      </div>

      {isLoading ? (
        <div className="text-center py-10">
          Loading activity history...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-16 text-slate-400 rounded-[28px] border border-white/50 bg-white/45 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          No activity history yet.
        </div>
      ) : (

<>
<div className="md:hidden space-y-4">

  {paginatedHistory.map(item => {

    const scanDate =
      new Date(item.scannedAt);

    return (

      <div
        key={`${item.Asset || item.asset}-${item.scannedAt}`}
        className="relative overflow-hidden border border-white/50 rounded-[28px] p-5 bg-gradient-to-br from-white/80 via-white/65 to-slate-100/40 backdrop-blur-2xl shadow-[0_8px_30px_rgba(15,23,42,0.05)]"
      >

        <div className="flex items-start justify-between mb-3">

          <div>

            <h3 className="font-bold text-slate-800 text-xl tracking-tight">
              {item.userName || '-'}
            </h3>

            <p className="text-sm text-slate-400 mt-1">
              {item.employeeId || '-'}
            </p>

          </div>

          <span
            className={
  item.scanMethod === 'EDIT'
    ? 'bg-blue-50/80 text-blue-700 border border-white/60 backdrop-blur-xl px-3 py-1 rounded-full text-xs font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.04)]'
    : item.scanMethod === 'MANUAL'
    ? 'bg-amber-50/80 text-amber-700 border border-white/60 backdrop-blur-xl px-3 py-1 rounded-full text-xs font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.04)]'
    : 'bg-emerald-50/80 text-emerald-700 border border-white/60 backdrop-blur-xl px-3 py-1 rounded-full text-xs font-semibold shadow-[0_4px_12px_rgba(15,23,42,0.04)]'
}
          >
            {getActivityLabel(
  item.scanMethod
)}
          </span>

        </div>

        <div className="space-y-2 text-sm">

          <div className="text-slate-500">
  {item.department || '-'} Department
</div>

          <div className="pt-2">
  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
    Asset Number
  </p>

  <p className="font-semibold text-slate-700">
    {item.asset || item.Asset || '-'}
  </p>
</div>

          <div>
            <span className="font-semibold text-gray-700">
              Serial:
            </span>{' '}
            {
              item.serialNumber ||
              item['Serial number'] ||
              '-'
            }
          </div>

          <div className="pt-1">
  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
    Asset Description
  </p>

  <p className="text-slate-700 leading-relaxed">
    {
      item.assetDescription ||
      item['Asset Description'] ||
      '-'
    }
  </p>
</div>

{item.changes?.length > 0 && (

  <div className="mt-4 pt-4 border-t border-white/50">

    <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">
  Audit Changes
</p>

    <div className="space-y-3">

      {item.changes.map(
  (change, index) => (

    <div
      key={index}
      className="rounded-2xl bg-slate-50 border border-slate-200 p-4"
    >

      <h4 className="font-semibold text-slate-800 mb-3">
        {change.field}
      </h4>

      <div className="space-y-3">

        <div>

          <span className="inline-flex px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            Before
          </span>

          <p className="mt-2 text-sm text-slate-700 break-words">
            {change.oldValue || 'Empty'}
          </p>

        </div>

        <div>

          <span className="inline-flex px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            After
          </span>

          <p className="mt-2 text-sm text-slate-700 break-words">
            {change.newValue || 'Empty'}
          </p>

        </div>

      </div>

    </div>

  )
)}

    </div>

  </div>

)}

          <div className="pt-4 mt-4 border-t border-white/50 text-xs text-slate-400">

            {scanDate.toLocaleDateString()}
            {' • '}
            {scanDate.toLocaleTimeString()}

          </div>

        </div>

      </div>

    );

  })}

</div>
        <div className="hidden md:block rounded-[28px] border border-white/50 bg-white/50 backdrop-blur-2xl shadow-[0_8px_30px_rgba(15,23,42,0.05)]">

          <div className="overflow-x-auto">
  <table className="min-w-full border border-gray-200">

            <thead className="bg-white/80 backdrop-blur-xl">

              <tr>

                <th className="border px-4 py-4 text-left bg-gray-100">
                  Employee ID
                </th>

                <th className="border px-4 py-4 text-left bg-gray-100">
                  User Name
                </th>

                <th className="border px-4 py-4 text-left bg-gray-100">
  Department
</th>

                <th className="border px-4 py-4 text-left bg-gray-100">
                  Asset
                </th>

                <th className="border px-4 py-4 text-left bg-gray-100">
                  Asset Description
                </th>

<th className="border px-3 py-4 text-center bg-gray-100 w-[110px]">
  Changes
</th>

                <th className="border px-4 py-4 text-left bg-gray-100">
                  Serial Number
                </th>

                <th className="border px-4 py-4 text-left bg-gray-100">
                  Date
                </th>

                <th className="border px-4 py-4 text-left bg-gray-100">
                  Time
                </th>

                <th className="border px-3 py-4 text-center bg-gray-100 w-[130px]">
  Activity Type
</th>

              </tr>

            </thead>

            <tbody>

              {paginatedHistory.map(item => {
                const scanDate =
                  new Date(item.scannedAt);

                return (
                  <tr
                    key={`${item.Asset || item.asset}-${item.scannedAt}`}
                    className="hover:bg-gray-50"
                  >

                    <td className="border px-4 py-2">
                      {item.employeeId || '-'}
                    </td>

                    <td className="border px-4 py-2">
                      {item.userName || '-'}
                    </td>

                    <td className="border px-4 py-2">
  {item.department || '-'}
</td>

                    <td className="border px-4 py-2">
  {item.asset || item.Asset || '-'}
</td>

<td
  className="border px-4 py-2 max-w-[250px]"
  title={
    item.assetDescription ||
    item['Asset Description'] ||
    '-'
  }
>
  <div className="truncate">
    {
      item.assetDescription ||
      item['Asset Description'] ||
      '-'
    }
  </div>
</td>

<td className="border px-2 py-2 text-center">

  {item.changes?.length ? (

    <button
      onClick={() =>
        setSelectedActivity(item)
      }
      className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition whitespace-nowrap"
    >
      View Changes
    </button>

  ) : (

    <span className="text-slate-400">
      —
    </span>

  )}

</td>

                    <td
  className="border px-4 py-2 max-w-[180px]"
  title={
    item.serialNumber ||
    item['Serial number'] ||
    '-'
  }
>
  <div className="truncate">
    {
      item.serialNumber ||
      item['Serial number'] ||
      '-'
    }
  </div>
</td>

                    <td className="border px-4 py-2">
                      {scanDate.toLocaleDateString()}
                    </td>

                    <td className="border px-4 py-2">
                      {scanDate.toLocaleTimeString()}
                    </td>

                    <td className="border px-3 py-2 text-center whitespace-nowrap min-w-[140px]">
  <span
  className={
    item.scanMethod === 'EDIT'
      ? 'text-blue-600 font-medium'
      : item.scanMethod === 'MANUAL'
      ? 'text-amber-600 font-medium'
      : 'text-green-600 font-medium'
  }
>
  {getActivityLabel(item.scanMethod)}
</span>
</td>

                  </tr>
                );
              })}

            </tbody>

          </table>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-white">

  <p className="text-sm text-gray-500">
    Showing page {currentPage} of {totalPages || 1}
  </p>

  <div className="flex gap-2">

    <button
      onClick={() =>
        setCurrentPage(prev =>
          Math.max(prev - 1, 1)
        )
      }
      disabled={currentPage === 1}
      className="px-4 py-2 border rounded-lg disabled:opacity-50"
    >
      Previous
    </button>

    <button
      onClick={() =>
        setCurrentPage(prev =>
          Math.min(
            prev + 1,
            totalPages
          )
        )
      }
      disabled={
        currentPage === totalPages
      }
      className="px-4 py-2 border rounded-lg disabled:opacity-50"
    >
      Next
    </button>

  </div>

</div>

                </div>

      </>

      )}

{selectedActivity &&
  createPortal(

    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60">

    <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl p-6 relative top-12">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold text-slate-800">
            Asset Changes
          </h2>

          <p className="text-slate-500">
            Asset #{selectedActivity.asset}
          </p>

        </div>

        <button
          onClick={() =>
            setSelectedActivity(null)
          }
          className="text-slate-500 hover:text-slate-800"
        >
          ✕
        </button>

      </div>

      <div className="space-y-4">

        {selectedActivity.changes?.map(
          (change, index) => (

            <div
              key={index}
              className="border rounded-2xl p-4 bg-slate-50"
            >

              <div className="font-semibold text-slate-700 mb-3">
                {change.field}
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">

                <div className="flex-1 bg-red-50 text-red-700 rounded-lg px-3 py-2 break-words">
                  {change.oldValue || 'Empty'}
                </div>

                <div className="text-slate-400 text-xl">
                  →
                </div>

                <div className="flex-1 bg-green-50 text-green-700 rounded-lg px-3 py-2 break-words">
                  {change.newValue || 'Empty'}
                </div>

              </div>

            </div>

          )
        )}

      </div>

        </div>

  </div>,

  document.body

)}


    </div>
  );
}