import React, { createContext, useState, useEffect } from 'react';
import { getPrinters } from '../api';

const PrinterContext = createContext(null);

export const PrinterProvider = ({ children }) => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the list of available printers when the app loads.
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const printerList = await getPrinters();
        setPrinters(printerList);
        // Set the first printer as the default selection.
        if (printerList.length > 0) {
          setSelectedPrinter(printerList[0]);
        }
      } catch (error) {
        console.error("Failed to fetch printers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrinters();
  }, []);

  const selectPrinter = (printer) => {
    setSelectedPrinter(printer);
  };

  const value = { printers, selectedPrinter, selectPrinter, loading };

  return (
    <PrinterContext.Provider value={value}>
      {children}
    </PrinterContext.Provider>
  );
};

export default PrinterContext;