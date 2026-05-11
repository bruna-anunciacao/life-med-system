import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressService, AddressDto } from "../services/address-service";

export function useSearchCepQuery(cep: string) {
  return useQuery({
    queryKey: ["cep", cep],
    queryFn: () => addressService.searchByCep(cep),
    enabled: cep.length === 8,
    staleTime: Infinity,
    retry: 1,
  });
}

export function useUserAddressQuery(userId: string) {
  return useQuery({
    queryKey: ["address", userId],
    queryFn: async () => {
      try {
        return await addressService.getUserAddress(userId);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveAddressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data, hasAddress }: { 
      userId: string; 
      data: AddressDto;
      hasAddress: boolean;
    }) =>
      hasAddress
        ? addressService.updateAddress(userId, data)
        : addressService.createAddress(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["address", userId] });
    },
  });
}