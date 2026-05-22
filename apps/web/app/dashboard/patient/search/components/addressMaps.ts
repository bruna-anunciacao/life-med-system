export type AddressData = {
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
};

const joinAddressParts = (parts: Array<string | null | undefined>) =>
  parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

export const formatAddress = (address?: AddressData | null) => {
  if (!address) return null;

  const streetLine = joinAddressParts([
    address.street,
    address.number,
    address.complement,
  ]).join(", ");

  const cityLine = joinAddressParts([
    address.district,
    address.city,
    address.state,
    address.zipCode,
  ]).join(", ");

  const formattedAddress = joinAddressParts([streetLine, cityLine]).join(" - ");

  return formattedAddress || null;
};

export const getGoogleMapsUrl = (address?: AddressData | null) => {
  const formattedAddress = formatAddress(address);

  if (!formattedAddress) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    formattedAddress,
  )}`;
};
