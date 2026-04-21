import { MutationKey } from 'react-query/types/core/types';
import { MutationFilters } from 'react-query/types/core/utils';
export declare function useIsMutating(filters?: MutationFilters): number;
export declare function useIsMutating(mutationKey?: MutationKey, filters?: Omit<MutationFilters, 'mutationKey'>): number;
