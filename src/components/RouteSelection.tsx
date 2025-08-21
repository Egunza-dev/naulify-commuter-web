'use client';
import { FareStage } from "@/services/firebase";
import { SelectedRoute } from "./PaymentFlow";
import { Dispatch, SetStateAction } from "react";

interface RouteSelectionProps {
  fareStages: FareStage[];
  selectedRoutes: SelectedRoute[];
  onSetSelectedRoutes: Dispatch<SetStateAction<SelectedRoute[]>>;
  onProceed: () => void;
}

export const RouteSelection = ({ fareStages, selectedRoutes, onSetSelectedRoutes, onProceed }: RouteSelectionProps) => {
  const handleAdd = (stage: FareStage) => {
    onSetSelectedRoutes(prev => {
      const existing = prev.find(r => r.id === stage.id);
      if (existing) {
        return prev.map(r => r.id === stage.id ? { ...r, quantity: r.quantity + 1 } : r);
      }
      return [...prev, { ...stage, quantity: 1 }];
    });
  };

  const total = selectedRoutes.reduce((sum, route) => sum + route.fare * route.quantity, 0);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow p-4 space-y-3">
        {fareStages.map(stage => (
          <div key={stage.id} className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
            <div>
              <p className="font-semibold">{stage.description}</p>
              <p className="text-sm text-gray-400">KSH {stage.fare.toFixed(2)}</p>
            </div>
            <button onClick={() => handleAdd(stage)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition">
              ADD
            </button>
          </div>
        ))}
      </div>

      {selectedRoutes.length > 0 && (
        <div className="bg-gray-800 p-4 border-t-2 border-gray-700">
          <h3 className="text-lg font-bold mb-2">Your Selected Routes:</h3>
          {/* List selected routes, quantity controls, etc. here if needed */}
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span>Total:</span>
            <span>KSH {total.toFixed(2)}</span>
          </div>
          <button onClick={onProceed} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-green-700 transition">
            PROCEED TO PAY
          </button>
        </div>
      )}
    </div>
  );
};
