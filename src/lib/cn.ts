import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne des classes Tailwind/NativeWind en résolvant les conflits (dernier gagnant). */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
