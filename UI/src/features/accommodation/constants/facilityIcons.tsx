import {
  Wifi,
  Pool,
  FitnessCenter,
  Restaurant,
  LocalParking,
  AcUnit,
  Bathtub,
} from "@mui/icons-material";
import type { FacilityIconMap } from "../types/accommodation.types";

export const facilityIcons: FacilityIconMap = {
  GENERAL: <Wifi sx={{ fontSize: 20 }} />,
  PUBLIC_FACILITIES: <Pool sx={{ fontSize: 20 }} />,
  BATHROOM: <Bathtub sx={{ fontSize: 20 }} />,
  WELLNESS: <FitnessCenter sx={{ fontSize: 20 }} />,
  TRANSPORTATION: <LocalParking sx={{ fontSize: 20 }} />,
  FOOD_AND_DRINK: <Restaurant sx={{ fontSize: 20 }} />,
  SERVICES: <AcUnit sx={{ fontSize: 20 }} />,
  DEFAULT: <AcUnit sx={{ fontSize: 20 }} />,
};