// A custom hook makes it much cleaner to access the auth context
// in any component, avoiding repetitive useContext(AuthContext) calls.

import { useContext } from 'react';
import AuthContext from '../auth/AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};