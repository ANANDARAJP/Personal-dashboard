import { QueryKey } from 'react-query/types/core/types';
import { QueryFilters } from 'react-query/types/core/utils';
export declare function useIsFetching(filters?: QueryFilters): number;
export declare function useIsFetching(queryKey?: QueryKey, filters?: QueryFilters): number;
