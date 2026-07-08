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

export const parseLocationValue = (value: string): LocationOption | null => {
  const [city, state] = value.split(" - ");
  if (!city || !state) return null;
  return { city, state };
};

export const sortLocations = (locations: LocationOption[]) =>
  [...locations].sort((a, b) => {
    const stateComparison = a.state.localeCompare(b.state, "pt-BR");
    if (stateComparison !== 0) return stateComparison;
    return a.city.localeCompare(b.city, "pt-BR");
  });

/**
 * Deriva as combinações distintas de cidade/estado a partir de uma lista de
 * profissionais já carregada no cliente. Usado por telas que ainda buscam o
 * array completo (ex.: novo agendamento do gestor). A busca de médicos do
 * paciente usa `professionalsService.listLocations()` (server-side) em vez
 * desta função.
 */
export const getAvailableLocations = (
  professionals: ProfessionalWithLocation[],
) => {
  const locationsByKey = new Map<string, LocationOption>();

  professionals
    .filter(
      (professional) =>
        professional.status !== "PENDING" && professional.status !== "BLOCKED",
    )
    .forEach((professional) => {
      const city = professional.address?.city?.trim();
      const state = professional.address?.state?.trim();

      if (!city || !state) return;

      const key = `${city.toLocaleLowerCase("pt-BR")}-${state.toLocaleLowerCase("pt-BR")}`;
      locationsByKey.set(key, { city, state });
    });

  return sortLocations(Array.from(locationsByKey.values()));
};
