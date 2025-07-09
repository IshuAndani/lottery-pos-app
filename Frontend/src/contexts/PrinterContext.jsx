import React, { createContext, useState, useEffect, useContext } from 'react';
import { getPrinters } from '../api';
import AuthContext from '../auth/AuthContext';

const PrinterContext = createContext(null);

export const PrinterProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the list of available printers only when the user is authenticated.
  useEffect(() => {
    const fetchPrinters = async () => {
      if (isAuthenticated) {
        setLoading(true);
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
      } else {
        // If user is not authenticated (e.g., logged out), clear the printer data.
        setPrinters([]);
        setSelectedPrinter(null);
        setLoading(false);
      }
    };
    fetchPrinters();
  }, [isAuthenticated]); // Re-run this effect whenever the authentication status changes.

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