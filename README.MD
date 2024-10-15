# Hexagonal architecture

## Introduction
This is an educational example of a hexagonal architecture implementation using my own understanding. It uses a custom dependency injection at its core, inspired from Angular.

## Local development
### Prerequisites
- Node.js v18.19.x, could work on older or newer versions
- Yarn package manager v1.x

### Set up
Install the dependencies
```
yarn
```

Run the HTTP server
```
yarn serve
```

Run the test suite
```
yarn test
```

For more, refer to the scripts defined in `package.json`.


## Architecture overview

### Core framework
The fundemantal concepts in this dependency injection framework are `Context`, `Tag` and `Provider`.

`Provider` is a wrapper around an injectable dependency.

`Context` can be interpreted as collection of injectable dependencies.

`Tag` serves as an identifier of a dependency. It binds an injectable dependency's interface to a runtime object, which can then be specified as placeholder to be resolved later by a `Context`.

An example illustrating all concepts
```TS
// infra/database.ts
export interface IDatabase { ... }
export const DATABASE = new Tag<IDatabase>('infra/database')

export class PgDatabase implements IDatabase { ... }

// services/business.ts
export interface IBusinessService { ... }
export const BIZ_SRV = new Tag<IBusinessService>('business/service')

export class BusinessService implements IBusinessService { 
    private db: IDatabase = Context.get(DATABASE)
}

// app/config.ts
export interface IConfig { host: string }
export const APP_CONFIG = new Tag<IConfig>('app/config')

// app/index.ts
export class App { 
    private config: IBusinessService = Context.get(APP_CONFIG)
    private business: IBusinessService = Context.get(BIZ_SRV)

    run() { ... }
}

// main.ts
const context = Context.create(
    provide(APP_CONFIG, new ValueProvider({ host: 'localhost' })), 
    provide(BIZ_SRV, BusinessService)
)

const app = Context.provide(App, context)
app.run()
```


### Entities
The lowest layer in the hexagonal architecture, it defines the business domain.

Here, it's simply two entities: `Project` and `Todo`. There is a one-to-many relationship between projects and todos. Each can project can have multiple todos.

### Services (or use cases)
A layer to implement business cases using the business domain entities.

### Repositories
Data source connectors, using supported drivers.

Currently, only a mock database driver is implemented.

Possible extensions: any SQL database, any NoSQL database, etc.

### Adapters
Server interface adapters for any clients.

Currently, only an express adapter is implemented.

Possible extensions: more adapters for popular server frameworks (fastify), a socket-io adapter, a CLI adapter...