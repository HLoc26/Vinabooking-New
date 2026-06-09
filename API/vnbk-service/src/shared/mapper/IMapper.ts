/**
 * Base contract for entity mappers: translate a persistence entity into a domain
 * model. Concrete mappers add their own `toCreateInput` / `toUpdateInput` methods
 * for the persistence direction (Prisma create/update inputs differ in shape).
 */
export interface IMapper<TDomain, TEntity> {
	toDomain(entity: TEntity): TDomain;
}
