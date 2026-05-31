import { useState, useEffect } from "react";

export default function EditAssetModal({
  isOpen,
  asset,
  onClose,
  onSave,
}) {

  const [assetDescription, setAssetDescription] =
    useState("");

  const [remarks, setRemarks] =
    useState("WORKING");

    const [correctRoom, setCorrectRoom] =
  useState("");

  useEffect(() => {

    if (asset) {

      setAssetDescription(
        asset.assetDescription ||
        asset["Asset Description"] ||
        ""
      );

      const currentRemarks =
        asset.remarks ||
        "";

      setRemarks(
        currentRemarks === "NOT_WORKING"
          ? "NOT_WORKING"
          : "WORKING"
      );
      setCorrectRoom(
  asset["CORRECT ROOM"] ||
  asset.correctRoom ||
  ""
);

    }

  }, [asset]);

  if (!isOpen || !asset) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">

      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

        <h2 className="text-2xl font-bold text-slate-800">
          Edit Asset
        </h2>

        <p className="text-slate-500 mt-1">
          Asset #: {asset.asset}
        </p>

        <div className="mt-6">

          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Asset Description
          </label>

          <input
            type="text"
            value={assetDescription}
            onChange={(e) =>
              setAssetDescription(e.target.value)
            }
            className="w-full border rounded-xl px-4 py-3"
          />

        </div>

<div className="mt-5">

  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Current Room
  </label>

  <input
    type="text"
    value={
      asset.room ||
      asset.Room ||
      ""
    }
    disabled
    className="w-full border rounded-xl px-4 py-3 bg-slate-100 text-slate-500"
  />

</div>

<div className="mt-5">

  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Correct Room
  </label>

  <input
    type="text"
    value={correctRoom}
    onChange={(e) =>
      setCorrectRoom(e.target.value)
    }
    className="w-full border rounded-xl px-4 py-3"
  />

</div>

        <label className="block text-sm font-semibold text-slate-700 mb-3"></label>

        <div className="mt-5">

          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Remarks
          </label>

          <div className="flex gap-3">

            <button
              onClick={() =>
                setRemarks("WORKING")
              }
              className={`flex-1 py-3 rounded-xl border ${
                remarks === "WORKING"
                  ? "bg-green-600 text-white"
                  : "bg-white"
              }`}
            >
              Working
            </button>

            <button
              onClick={() =>
                setRemarks("NOT_WORKING")
              }
              className={`flex-1 py-3 rounded-xl border ${
                remarks === "NOT_WORKING"
                  ? "bg-red-600 text-white"
                  : "bg-white"
              }`}
            >
              Not Working
            </button>

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-5 py-3 border rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSave({

  assetDescription,
  correctRoom,
  remarks,

  previousValues: {

    correctRoom:
  asset["CORRECT ROOM"] ||
  asset.correctRoom ||
  "",

    assetDescription:
      asset.assetDescription ||
      asset["Asset Description"] ||
      "",

    remarks:
      asset.remarks || "",

  },

})
            }
            className="px-5 py-3 bg-blue-600 text-white rounded-xl"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}