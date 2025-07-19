import React, { useState } from 'react';
import { usePrinter } from '../../hooks/usePrinter';

const PrinterSelectionModal = ({ isOpen, onClose }) => {
  const { printers, selectedPrinter, selectPrinter } = usePrinter();
  const [currentSelection, setCurrentSelection] = useState(selectedPrinter);

  const handleSave = () => {
    selectPrinter(currentSelection);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6">Select Printer</h2>
        <div className="space-y-4">
          {printers.map(printer => (
            <div key={printer.id} className="flex items-center">
              <input
                type="radio"
                id={`printer-${printer.id}`}
                name="printer"
                value={printer.id}
                checked={currentSelection?.id === printer.id}
                onChange={() => setCurrentSelection(printer)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={`printer-${printer.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                {printer.name}
              </label>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">Cancel</button>
          <button type="button" onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Select</button>
        </div>
      </div>
    </div>
  );
};

export default PrinterSelectionModal;