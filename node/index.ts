import { ClientsConfig, LRUCache, Service, ServiceContext } from '@vtex/api'

import { Clients } from './clients'
import { updateLiveUsers } from './event/liveUsersUpdate'
import { productList } from './resolvers/products'

const TIMEOUT_MS = 5000

const TREE_SECONDS_MS = 3 * 1000
const CONCURRENCY = 10

const memoryCache = new LRUCache<string, any>({max: 5000})
metrics.trackCache('status', memoryCache)

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    events: {
      exponentialTimeoutCoefficient: 2,
      exponentialBackoffCoefficient: 2,
      initialBackoffDelay: 50,
      retries: 1,
      timeout: TREE_SECONDS_MS,
      concurrency: CONCURRENCY
    },
    status: {
      memoryCache,
    },    
  },  
}

declare global {
  type Context = ServiceContext<Clients>
}

// Export a service that defines route handlers and client options.
export default new Service<Clients, {}>({
  clients,
  graphql: {
    resolvers: {
      Query: {
        productList
      },
    },
  },
  events: {
    liveUsersUpdate: updateLiveUsers
  }
})
