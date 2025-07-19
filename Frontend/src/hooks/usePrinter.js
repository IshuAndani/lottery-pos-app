import { useContext } from 'react';
import PrinterContext from '../contexts/PrinterContext';

export const usePrinter = () => {
  return useContext(PrinterContext);
};