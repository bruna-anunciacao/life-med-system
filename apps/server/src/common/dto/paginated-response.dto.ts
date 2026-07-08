import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadados de paginação incluídos em toda resposta paginada.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Envelope padrão de resposta paginada da API.
 *
 * Contrato unificado usado por TODOS os endpoints paginados:
 *   { data: T[], meta: { page, limit, total, totalPages } }
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Classe de metadados para documentação Swagger.
 */
export class PaginationMetaDto implements PaginationMeta {
  @ApiProperty({ example: 1, description: 'Página atual' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Registros por página' })
  limit!: number;

  @ApiProperty({ example: 42, description: 'Total de registros' })
  total!: number;

  @ApiProperty({ example: 5, description: 'Total de páginas' })
  totalPages!: number;
}

/**
 * Monta os metadados de paginação a partir do total e dos parâmetros da query.
 * `totalPages` é no mínimo 1 mesmo quando não há registros, para simplificar a UI.
 */
export function buildMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Delegate mínimo de um model Prisma: expõe `findMany` e `count`.
 * Genérico sobre o próprio delegate para preservar a inferência de tipos do
 * Prisma (args e retorno de `findMany`).
 */
interface PrismaModelDelegate {
  findMany(args: unknown): Promise<unknown>;
  count(args: unknown): Promise<number>;
}

type FindManyArgs<D extends PrismaModelDelegate> = Parameters<D['findMany']>[0];
type FindManyRow<D extends PrismaModelDelegate> =
  Awaited<ReturnType<D['findMany']>> extends (infer R)[] ? R : never;

/**
 * Executa `findMany` + `count` em paralelo aplicando skip/take e retorna o
 * envelope paginado padrão. Elimina a duplicação de `Promise.all([findMany, count])`
 * espalhada pelos repositories.
 *
 * @example
 *   return paginate(this.prisma.user, { where, include, orderBy }, page, limit);
 */
export async function paginate<D extends PrismaModelDelegate>(
  delegate: D,
  args: FindManyArgs<D>,
  page: number,
  limit: number,
): Promise<PaginatedResult<FindManyRow<D>>> {
  const findArgs = args as { where?: unknown };

  const [data, total] = await Promise.all([
    delegate.findMany({
      ...findArgs,
      skip: (page - 1) * limit,
      take: limit,
    }) as Promise<FindManyRow<D>[]>,
    delegate.count({ where: findArgs.where }),
  ]);

  return { data, meta: buildMeta(total, page, limit) };
}
