import { createContext } from "react";
import type { StatsContextValue } from "../../types/Stats";

const StatsContext = createContext<StatsContextValue | null>(null);

export default StatsContext;
