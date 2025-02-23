// TODO: убрать ts-ignore-ы
import { Injectable } from '@nestjs/common';
// import { ITXClientDenyList } from '@vault-prisma/client/runtime/library';

// import { PrismaClient as MatchmakingPrismaClient } from '@matchmaking-prisma/client';

const PRISMA_BUNDLES = {
  // matchmaking: MatchmakingPrismaClient,
};

type PrismaBundleName = keyof typeof PRISMA_BUNDLES;

type PrismaBundle<BundleName extends PrismaBundleName = PrismaBundleName> =
  (typeof PRISMA_BUNDLES)[BundleName]['prototype'];

// @ts-ignore
export type PrismaContext<BundleName extends PrismaBundleName = PrismaBundleName> = Omit<
  PrismaBundle<BundleName>
  // ITXClientDenyList
>;

@Injectable()
export class PrismaRepository<BundleName extends PrismaBundleName> {
  $transaction: PrismaBundle<BundleName>['$transaction'];
  context: (typeof PRISMA_BUNDLES)[BundleName]['prototype'];

  constructor(bundleName: BundleName) {
    // @ts-ignore
    const baseContext = new PRISMA_BUNDLES[bundleName]();

    this.$transaction = baseContext.$transaction.bind(baseContext);
    this.context = baseContext;
  }

  static injectContext<TargetType extends PrismaRepository<PrismaBundleName>>(
    target: TargetType,
    context: PrismaContext
  ): TargetType {
    if (!context) return target;

    const repository = Object.create(target);
    repository.context = context;
    return repository;
  }
}
