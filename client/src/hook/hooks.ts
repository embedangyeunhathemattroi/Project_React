import {  useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../stores/store";

// Typed hook cho dispatch
export const useAppDispatch: () => AppDispatch = useDispatch;

// Typed hook cho selector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
