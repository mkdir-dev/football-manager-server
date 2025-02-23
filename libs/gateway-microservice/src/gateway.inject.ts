import { Inject } from '@nestjs/common';

import { GatewayMicroserviceName } from './gateway.constants';

export const InjectGatewayService = Inject.bind(this, GatewayMicroserviceName);
