import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
// this typed useselector, take a call-back and return the state
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
