'use client';
import { FareStage } from "@/services/firebase";
import { SelectedRoute } from "./PaymentFlow";
import { Dispatch, SetStateAction } from "react";
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/solid'; // Using heroicons for better UI

interface RouteSelectionProps {
  fareStages: FareStage[];
  selectedRoutes: SelectedRoute[];
  onSetSelectedRoutes: Dispatch<SetStateAction<SelectedRoute[]>>;
  onProceed: () => void;
  plate: string; // Pass down the license plate for the header
}

export const RouteSelection = ({ fareStages, selectedRoutes, onSetSelectedRoutes, onProceed, plate }: RouteSelectionProps) => {
  const handleAdd = (stage: FareStage) => {
    onSetSelectedRoutes(prev => {
      const existing = prev.find(r => r.id === stage.id);
      if (existing) {
        return prev.map(r => r.id === stage.id ? { ...r, quantity: r.quantity + 1 } : r);
      }
      return [...prev, { ...stage, quantity: 1 }];
    });
  };

  const handleRemove = (stageId: string) => {
    onSetSelectedRoutes(prev => {
      const existing = prev.find(r => r.id === stageId);
      if (existing && existing.quantity > 1) {
        return prev.map(r => r.id === stageId ? { ...r, quantity: r.quantity - 1 } : r);
      }
      // If quantity is 1, filter it out completely
      return prev.filter(r => r.id !== stageId);
    });
  };

  const total = selectedRoutes.reduce((sum, route) => sum + route.fare * route.quantity, 0);

  return (
    // Use flex-grow to ensure the footer sticks to the bottom correctly
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="p-4 text-center border-b border-border">
        <h1 className="text-xl font-bold text-text-primary">Pay Fare</h1>
        <p className="text-text-secondary">Vehicle: {plate}</p>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow p-4 space-y-3">
        {fareStages.map(stage => {
          const selected = selectedRoutes.find(r => r.id === stage.id);
          return (
            <div key={stage.id} className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
              <div>
                <p className="font-semibold text-text-primary">{stage.description}</p>
                <p className="text-sm text-text-secondary">KSH {stage.fare.toFixed(2)}</p>
              </div>
              
              {/* Show quantity controls if item is selected, otherwise show ADD button */}
              {selected ? (
                <div className="flex items-center gap-3 bg-background p-1 rounded-lg">
                  <button onClick={() => handleRemove(stage.id)} className="p-1.5 text-text-primary">
                    {selected.quantity === 1 ? <TrashIcon className="h-5 w-5 text-danger" /> : <MinusIcon className="h-5 w-5" />}
                  </button>
                  <span className="font-bold text-lg w-5 text-center">{selected.quantity}</span>
                  <button onClick={() => handleAdd(stage)} className="p-1.5 text-text-primary">
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => handleAdd(stage)} className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-md transition-colors">
                  ADD
                </button>
              )}
            </div>
          )
        })}
      </main>

      {/* Footer */}
      {selectedRoutes.length > 0 && (
        <footer className="bg-card p-4 border-t-2 border-border sticky bottom-0">
          <div className="flex justify-between items-center text-xl font-bold mb-4">
            <span className="text-text-secondary">Total:</span>
            <span className="text-text-primary">KSH {total.toFixed(2)}</span>
          </div>
          <button onClick={onProceed} className="w-full bg-success hover:bg-success-hover text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors">
            PROCEED TO PAY
          </button>
        </footer>
      )}
    </div>
  );
};
