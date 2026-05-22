import { AddressData } from "./addressMaps";

type ProfessionalWithLocation = {
  status: string;
  address?: AddressData | null;
};

export type LocationOption = {
  city: string;
  state: string;
};

export const getLocationValue = (location: LocationOption) =>
  `${location.city} - ${location.state}`;

export const getAvailableLocations = (
  professionals: ProfessionalWithLocation[],
) => {
  const locationsByKey = new Map<string, LocationOption>();

  professionals
    .filter((professional) => (
      professional.status !== "PENDING" && professional.status !== "BLOCKED"
    ))
    .forEach((professional) => {
      const city = professional.address?.city?.trim();
      const state = professional.address?.state?.trim();

      if (!city || !state) return;

      const key = `${city.toLocaleLowerCase("pt-BR")}-${state.toLocaleLowerCase("pt-BR")}`;
      locationsByKey.set(key, { city, state });
    });

  return Array.from(locationsByKey.values()).sort((a, b) => {
    const stateComparison = a.state.localeCompare(b.state, "pt-BR");

    if (stateComparison !== 0) return stateComparison;

    return a.city.localeCompare(b.city, "pt-BR");
  });
};
