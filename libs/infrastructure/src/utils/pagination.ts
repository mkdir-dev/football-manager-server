import {
  CreateMetaDataPaginationParams,
  CreateMetaDataPaginationResponse,
} from './pagination.types';

export const createMetaDataPagination = ({
  page,
  perPage,
  total,
}: CreateMetaDataPaginationParams): CreateMetaDataPaginationResponse => {
  // если perPage не передан, то устанавливаем значение по умолчанию
  const valuePerPage = perPage ?? 100;
  // вычисляем общее количество страниц
  const totalPages = Math.ceil(total / valuePerPage);
  // если текущая страница больше общего количества страниц, то устанавливаем текущую страницу на 1
  const currentPage = !page || page > totalPages ? 1 : page;
  // вычисляем количество пропускаемых элементов
  const skip = currentPage ? (currentPage - 1) * valuePerPage : page;
  // вычисляем количество элементов на страницу
  const take = perPage ? valuePerPage : perPage;

  return {
    // возвращаем мета данные для пагинации
    meta: {
      page: currentPage,
      perPage: valuePerPage,
      total,
      totalPages,
    },
    // возвращаем параметры для запроса
    params: { skip, take },
  };
};
