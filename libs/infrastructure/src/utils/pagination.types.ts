export interface CreateMetaDataPaginationParams {
  page?: number;
  perPage?: number;
  total: number;
}

export interface MetaDataPagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface CreateMetaDataPaginationResponse {
  meta: MetaDataPagination;
  params: {
    skip: number | undefined;
    take: number | undefined;
  };
}

export interface PaginatedData<DataType = any> {
  meta: MetaDataPagination;
  data: DataType;
}
