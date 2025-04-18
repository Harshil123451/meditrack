"use client";

import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";

export default function AddMedicine() {
  const [medicine, setMedicine] = useState({
    name: "",
    barcode: "",
    expiry_date: "",
  });
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let controls = null;

    const startScanner = async () => {
      if (showScanner && videoRef.current) {
        try {
          const codeReader = new BrowserQRCodeReader();
          controls = await codeReader.decodeFromVideoDevice(
            undefined,
            videoRef.current,
            (result, error) => {
              if (result) {
                setMedicine((prev) => ({
                  ...prev,
                  barcode: result.getText(),
                }));
                setShowScanner(false);
              }
              if (error) {
                console.error(error);
                toast.error("Error scanning barcode");
              }
            }
          );
          controlsRef.current = controls;
        } catch (error) {
          console.error(error);
          toast.error("Failed to start camera");
        }
      }
    };

    startScanner();

    return () => {
      if (controls) {
        controls.stop();
      }
    };
  }, [showScanner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("medicines")
        .insert([
          {
            user_id: user.id,
            name: medicine.name,
            barcode: medicine.barcode,
            expiry_date: medicine.expiry_date,
          },
        ]);

      if (error) throw error;

      toast.success("Medicine added successfully!");
      setMedicine({ name: "", barcode: "", expiry_date: "" });
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast.error("Failed to add medicine");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Medicine</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barcode
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={medicine.barcode}
              onChange={(e) =>
                setMedicine((prev) => ({ ...prev, barcode: e.target.value }))
              }
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Scan or enter barcode"
            />
            <button
              type="button"
              onClick={() => setShowScanner(!showScanner)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {showScanner ? "Close Scanner" : "Scan"}
            </button>
          </div>
        </div>

        {showScanner && (
          <div className="w-full aspect-video bg-gray-100 rounded-md overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medicine Name
          </label>
          <input
            type="text"
            value={medicine.name}
            onChange={(e) =>
              setMedicine((prev) => ({ ...prev, name: e.target.value }))
            }
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter medicine name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            value={medicine.expiry_date}
            onChange={(e) =>
              setMedicine((prev) => ({ ...prev, expiry_date: e.target.value }))
            }
            required
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Adding..." : "Add Medicine"}
        </button>
      </form>
    </div>
  );
} 