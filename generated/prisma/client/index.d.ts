
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model School
 * 
 */
export type School = $Result.DefaultSelection<Prisma.$SchoolPayload>
/**
 * Model AdmissionFormConfig
 * 
 */
export type AdmissionFormConfig = $Result.DefaultSelection<Prisma.$AdmissionFormConfigPayload>
/**
 * Model AdmissionApplication
 * 
 */
export type AdmissionApplication = $Result.DefaultSelection<Prisma.$AdmissionApplicationPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ApplicationStatus: {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus]

}

export type ApplicationStatus = $Enums.ApplicationStatus

export const ApplicationStatus: typeof $Enums.ApplicationStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Schools
 * const schools = await prisma.school.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Schools
   * const schools = await prisma.school.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.school`: Exposes CRUD operations for the **School** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Schools
    * const schools = await prisma.school.findMany()
    * ```
    */
  get school(): Prisma.SchoolDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.admissionFormConfig`: Exposes CRUD operations for the **AdmissionFormConfig** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdmissionFormConfigs
    * const admissionFormConfigs = await prisma.admissionFormConfig.findMany()
    * ```
    */
  get admissionFormConfig(): Prisma.AdmissionFormConfigDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.admissionApplication`: Exposes CRUD operations for the **AdmissionApplication** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AdmissionApplications
    * const admissionApplications = await prisma.admissionApplication.findMany()
    * ```
    */
  get admissionApplication(): Prisma.AdmissionApplicationDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.1
   * Query Engine version: 55ae170b1ced7fc6ed07a15f110549408c501bb3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    School: 'School',
    AdmissionFormConfig: 'AdmissionFormConfig',
    AdmissionApplication: 'AdmissionApplication'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "school" | "admissionFormConfig" | "admissionApplication"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      School: {
        payload: Prisma.$SchoolPayload<ExtArgs>
        fields: Prisma.SchoolFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SchoolFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SchoolFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          findFirst: {
            args: Prisma.SchoolFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SchoolFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          findMany: {
            args: Prisma.SchoolFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>[]
          }
          create: {
            args: Prisma.SchoolCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          createMany: {
            args: Prisma.SchoolCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SchoolCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>[]
          }
          delete: {
            args: Prisma.SchoolDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          update: {
            args: Prisma.SchoolUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          deleteMany: {
            args: Prisma.SchoolDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SchoolUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SchoolUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>[]
          }
          upsert: {
            args: Prisma.SchoolUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          aggregate: {
            args: Prisma.SchoolAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSchool>
          }
          groupBy: {
            args: Prisma.SchoolGroupByArgs<ExtArgs>
            result: $Utils.Optional<SchoolGroupByOutputType>[]
          }
          count: {
            args: Prisma.SchoolCountArgs<ExtArgs>
            result: $Utils.Optional<SchoolCountAggregateOutputType> | number
          }
        }
      }
      AdmissionFormConfig: {
        payload: Prisma.$AdmissionFormConfigPayload<ExtArgs>
        fields: Prisma.AdmissionFormConfigFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdmissionFormConfigFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdmissionFormConfigFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>
          }
          findFirst: {
            args: Prisma.AdmissionFormConfigFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdmissionFormConfigFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>
          }
          findMany: {
            args: Prisma.AdmissionFormConfigFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>[]
          }
          create: {
            args: Prisma.AdmissionFormConfigCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>
          }
          createMany: {
            args: Prisma.AdmissionFormConfigCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdmissionFormConfigCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>[]
          }
          delete: {
            args: Prisma.AdmissionFormConfigDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>
          }
          update: {
            args: Prisma.AdmissionFormConfigUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>
          }
          deleteMany: {
            args: Prisma.AdmissionFormConfigDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdmissionFormConfigUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdmissionFormConfigUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>[]
          }
          upsert: {
            args: Prisma.AdmissionFormConfigUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionFormConfigPayload>
          }
          aggregate: {
            args: Prisma.AdmissionFormConfigAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdmissionFormConfig>
          }
          groupBy: {
            args: Prisma.AdmissionFormConfigGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdmissionFormConfigGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdmissionFormConfigCountArgs<ExtArgs>
            result: $Utils.Optional<AdmissionFormConfigCountAggregateOutputType> | number
          }
        }
      }
      AdmissionApplication: {
        payload: Prisma.$AdmissionApplicationPayload<ExtArgs>
        fields: Prisma.AdmissionApplicationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdmissionApplicationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdmissionApplicationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>
          }
          findFirst: {
            args: Prisma.AdmissionApplicationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdmissionApplicationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>
          }
          findMany: {
            args: Prisma.AdmissionApplicationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>[]
          }
          create: {
            args: Prisma.AdmissionApplicationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>
          }
          createMany: {
            args: Prisma.AdmissionApplicationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdmissionApplicationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>[]
          }
          delete: {
            args: Prisma.AdmissionApplicationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>
          }
          update: {
            args: Prisma.AdmissionApplicationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>
          }
          deleteMany: {
            args: Prisma.AdmissionApplicationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdmissionApplicationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AdmissionApplicationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>[]
          }
          upsert: {
            args: Prisma.AdmissionApplicationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdmissionApplicationPayload>
          }
          aggregate: {
            args: Prisma.AdmissionApplicationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdmissionApplication>
          }
          groupBy: {
            args: Prisma.AdmissionApplicationGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdmissionApplicationGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdmissionApplicationCountArgs<ExtArgs>
            result: $Utils.Optional<AdmissionApplicationCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    school?: SchoolOmit
    admissionFormConfig?: AdmissionFormConfigOmit
    admissionApplication?: AdmissionApplicationOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SchoolCountOutputType
   */

  export type SchoolCountOutputType = {
    applications: number
  }

  export type SchoolCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    applications?: boolean | SchoolCountOutputTypeCountApplicationsArgs
  }

  // Custom InputTypes
  /**
   * SchoolCountOutputType without action
   */
  export type SchoolCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SchoolCountOutputType
     */
    select?: SchoolCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SchoolCountOutputType without action
   */
  export type SchoolCountOutputTypeCountApplicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdmissionApplicationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model School
   */

  export type AggregateSchool = {
    _count: SchoolCountAggregateOutputType | null
    _min: SchoolMinAggregateOutputType | null
    _max: SchoolMaxAggregateOutputType | null
  }

  export type SchoolMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    subdomain: string | null
    customDomain: string | null
    logo: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SchoolMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    subdomain: string | null
    customDomain: string | null
    logo: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SchoolCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    subdomain: number
    customDomain: number
    logo: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SchoolMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    subdomain?: true
    customDomain?: true
    logo?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SchoolMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    subdomain?: true
    customDomain?: true
    logo?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SchoolCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    subdomain?: true
    customDomain?: true
    logo?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SchoolAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which School to aggregate.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Schools
    **/
    _count?: true | SchoolCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SchoolMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SchoolMaxAggregateInputType
  }

  export type GetSchoolAggregateType<T extends SchoolAggregateArgs> = {
        [P in keyof T & keyof AggregateSchool]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSchool[P]>
      : GetScalarType<T[P], AggregateSchool[P]>
  }




  export type SchoolGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SchoolWhereInput
    orderBy?: SchoolOrderByWithAggregationInput | SchoolOrderByWithAggregationInput[]
    by: SchoolScalarFieldEnum[] | SchoolScalarFieldEnum
    having?: SchoolScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SchoolCountAggregateInputType | true
    _min?: SchoolMinAggregateInputType
    _max?: SchoolMaxAggregateInputType
  }

  export type SchoolGroupByOutputType = {
    id: string
    name: string
    slug: string
    subdomain: string | null
    customDomain: string | null
    logo: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: SchoolCountAggregateOutputType | null
    _min: SchoolMinAggregateOutputType | null
    _max: SchoolMaxAggregateOutputType | null
  }

  type GetSchoolGroupByPayload<T extends SchoolGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SchoolGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SchoolGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SchoolGroupByOutputType[P]>
            : GetScalarType<T[P], SchoolGroupByOutputType[P]>
        }
      >
    >


  export type SchoolSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    subdomain?: boolean
    customDomain?: boolean
    logo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    admissionConfig?: boolean | School$admissionConfigArgs<ExtArgs>
    applications?: boolean | School$applicationsArgs<ExtArgs>
    _count?: boolean | SchoolCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["school"]>

  export type SchoolSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    subdomain?: boolean
    customDomain?: boolean
    logo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["school"]>

  export type SchoolSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    subdomain?: boolean
    customDomain?: boolean
    logo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["school"]>

  export type SchoolSelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    subdomain?: boolean
    customDomain?: boolean
    logo?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SchoolOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "slug" | "subdomain" | "customDomain" | "logo" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["school"]>
  export type SchoolInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    admissionConfig?: boolean | School$admissionConfigArgs<ExtArgs>
    applications?: boolean | School$applicationsArgs<ExtArgs>
    _count?: boolean | SchoolCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SchoolIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type SchoolIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SchoolPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "School"
    objects: {
      admissionConfig: Prisma.$AdmissionFormConfigPayload<ExtArgs> | null
      applications: Prisma.$AdmissionApplicationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      subdomain: string | null
      customDomain: string | null
      logo: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["school"]>
    composites: {}
  }

  type SchoolGetPayload<S extends boolean | null | undefined | SchoolDefaultArgs> = $Result.GetResult<Prisma.$SchoolPayload, S>

  type SchoolCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SchoolFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SchoolCountAggregateInputType | true
    }

  export interface SchoolDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['School'], meta: { name: 'School' } }
    /**
     * Find zero or one School that matches the filter.
     * @param {SchoolFindUniqueArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SchoolFindUniqueArgs>(args: SelectSubset<T, SchoolFindUniqueArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one School that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SchoolFindUniqueOrThrowArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SchoolFindUniqueOrThrowArgs>(args: SelectSubset<T, SchoolFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first School that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolFindFirstArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SchoolFindFirstArgs>(args?: SelectSubset<T, SchoolFindFirstArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first School that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolFindFirstOrThrowArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SchoolFindFirstOrThrowArgs>(args?: SelectSubset<T, SchoolFindFirstOrThrowArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Schools that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Schools
     * const schools = await prisma.school.findMany()
     * 
     * // Get first 10 Schools
     * const schools = await prisma.school.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const schoolWithIdOnly = await prisma.school.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SchoolFindManyArgs>(args?: SelectSubset<T, SchoolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a School.
     * @param {SchoolCreateArgs} args - Arguments to create a School.
     * @example
     * // Create one School
     * const School = await prisma.school.create({
     *   data: {
     *     // ... data to create a School
     *   }
     * })
     * 
     */
    create<T extends SchoolCreateArgs>(args: SelectSubset<T, SchoolCreateArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Schools.
     * @param {SchoolCreateManyArgs} args - Arguments to create many Schools.
     * @example
     * // Create many Schools
     * const school = await prisma.school.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SchoolCreateManyArgs>(args?: SelectSubset<T, SchoolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Schools and returns the data saved in the database.
     * @param {SchoolCreateManyAndReturnArgs} args - Arguments to create many Schools.
     * @example
     * // Create many Schools
     * const school = await prisma.school.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Schools and only return the `id`
     * const schoolWithIdOnly = await prisma.school.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SchoolCreateManyAndReturnArgs>(args?: SelectSubset<T, SchoolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a School.
     * @param {SchoolDeleteArgs} args - Arguments to delete one School.
     * @example
     * // Delete one School
     * const School = await prisma.school.delete({
     *   where: {
     *     // ... filter to delete one School
     *   }
     * })
     * 
     */
    delete<T extends SchoolDeleteArgs>(args: SelectSubset<T, SchoolDeleteArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one School.
     * @param {SchoolUpdateArgs} args - Arguments to update one School.
     * @example
     * // Update one School
     * const school = await prisma.school.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SchoolUpdateArgs>(args: SelectSubset<T, SchoolUpdateArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Schools.
     * @param {SchoolDeleteManyArgs} args - Arguments to filter Schools to delete.
     * @example
     * // Delete a few Schools
     * const { count } = await prisma.school.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SchoolDeleteManyArgs>(args?: SelectSubset<T, SchoolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Schools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Schools
     * const school = await prisma.school.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SchoolUpdateManyArgs>(args: SelectSubset<T, SchoolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Schools and returns the data updated in the database.
     * @param {SchoolUpdateManyAndReturnArgs} args - Arguments to update many Schools.
     * @example
     * // Update many Schools
     * const school = await prisma.school.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Schools and only return the `id`
     * const schoolWithIdOnly = await prisma.school.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SchoolUpdateManyAndReturnArgs>(args: SelectSubset<T, SchoolUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one School.
     * @param {SchoolUpsertArgs} args - Arguments to update or create a School.
     * @example
     * // Update or create a School
     * const school = await prisma.school.upsert({
     *   create: {
     *     // ... data to create a School
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the School we want to update
     *   }
     * })
     */
    upsert<T extends SchoolUpsertArgs>(args: SelectSubset<T, SchoolUpsertArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Schools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolCountArgs} args - Arguments to filter Schools to count.
     * @example
     * // Count the number of Schools
     * const count = await prisma.school.count({
     *   where: {
     *     // ... the filter for the Schools we want to count
     *   }
     * })
    **/
    count<T extends SchoolCountArgs>(
      args?: Subset<T, SchoolCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SchoolCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a School.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SchoolAggregateArgs>(args: Subset<T, SchoolAggregateArgs>): Prisma.PrismaPromise<GetSchoolAggregateType<T>>

    /**
     * Group by School.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SchoolGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SchoolGroupByArgs['orderBy'] }
        : { orderBy?: SchoolGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SchoolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSchoolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the School model
   */
  readonly fields: SchoolFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for School.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SchoolClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    admissionConfig<T extends School$admissionConfigArgs<ExtArgs> = {}>(args?: Subset<T, School$admissionConfigArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    applications<T extends School$applicationsArgs<ExtArgs> = {}>(args?: Subset<T, School$applicationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the School model
   */
  interface SchoolFieldRefs {
    readonly id: FieldRef<"School", 'String'>
    readonly name: FieldRef<"School", 'String'>
    readonly slug: FieldRef<"School", 'String'>
    readonly subdomain: FieldRef<"School", 'String'>
    readonly customDomain: FieldRef<"School", 'String'>
    readonly logo: FieldRef<"School", 'String'>
    readonly isActive: FieldRef<"School", 'Boolean'>
    readonly createdAt: FieldRef<"School", 'DateTime'>
    readonly updatedAt: FieldRef<"School", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * School findUnique
   */
  export type SchoolFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School findUniqueOrThrow
   */
  export type SchoolFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School findFirst
   */
  export type SchoolFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schools.
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schools.
     */
    distinct?: SchoolScalarFieldEnum | SchoolScalarFieldEnum[]
  }

  /**
   * School findFirstOrThrow
   */
  export type SchoolFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schools.
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schools.
     */
    distinct?: SchoolScalarFieldEnum | SchoolScalarFieldEnum[]
  }

  /**
   * School findMany
   */
  export type SchoolFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * Filter, which Schools to fetch.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Schools.
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    distinct?: SchoolScalarFieldEnum | SchoolScalarFieldEnum[]
  }

  /**
   * School create
   */
  export type SchoolCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * The data needed to create a School.
     */
    data: XOR<SchoolCreateInput, SchoolUncheckedCreateInput>
  }

  /**
   * School createMany
   */
  export type SchoolCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Schools.
     */
    data: SchoolCreateManyInput | SchoolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * School createManyAndReturn
   */
  export type SchoolCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * The data used to create many Schools.
     */
    data: SchoolCreateManyInput | SchoolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * School update
   */
  export type SchoolUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * The data needed to update a School.
     */
    data: XOR<SchoolUpdateInput, SchoolUncheckedUpdateInput>
    /**
     * Choose, which School to update.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School updateMany
   */
  export type SchoolUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Schools.
     */
    data: XOR<SchoolUpdateManyMutationInput, SchoolUncheckedUpdateManyInput>
    /**
     * Filter which Schools to update
     */
    where?: SchoolWhereInput
    /**
     * Limit how many Schools to update.
     */
    limit?: number
  }

  /**
   * School updateManyAndReturn
   */
  export type SchoolUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * The data used to update Schools.
     */
    data: XOR<SchoolUpdateManyMutationInput, SchoolUncheckedUpdateManyInput>
    /**
     * Filter which Schools to update
     */
    where?: SchoolWhereInput
    /**
     * Limit how many Schools to update.
     */
    limit?: number
  }

  /**
   * School upsert
   */
  export type SchoolUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * The filter to search for the School to update in case it exists.
     */
    where: SchoolWhereUniqueInput
    /**
     * In case the School found by the `where` argument doesn't exist, create a new School with this data.
     */
    create: XOR<SchoolCreateInput, SchoolUncheckedCreateInput>
    /**
     * In case the School was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SchoolUpdateInput, SchoolUncheckedUpdateInput>
  }

  /**
   * School delete
   */
  export type SchoolDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
    /**
     * Filter which School to delete.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School deleteMany
   */
  export type SchoolDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Schools to delete
     */
    where?: SchoolWhereInput
    /**
     * Limit how many Schools to delete.
     */
    limit?: number
  }

  /**
   * School.admissionConfig
   */
  export type School$admissionConfigArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    where?: AdmissionFormConfigWhereInput
  }

  /**
   * School.applications
   */
  export type School$applicationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    where?: AdmissionApplicationWhereInput
    orderBy?: AdmissionApplicationOrderByWithRelationInput | AdmissionApplicationOrderByWithRelationInput[]
    cursor?: AdmissionApplicationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AdmissionApplicationScalarFieldEnum | AdmissionApplicationScalarFieldEnum[]
  }

  /**
   * School without action
   */
  export type SchoolDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Omit specific fields from the School
     */
    omit?: SchoolOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SchoolInclude<ExtArgs> | null
  }


  /**
   * Model AdmissionFormConfig
   */

  export type AggregateAdmissionFormConfig = {
    _count: AdmissionFormConfigCountAggregateOutputType | null
    _min: AdmissionFormConfigMinAggregateOutputType | null
    _max: AdmissionFormConfigMaxAggregateOutputType | null
  }

  export type AdmissionFormConfigMinAggregateOutputType = {
    id: string | null
    schoolId: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdmissionFormConfigMaxAggregateOutputType = {
    id: string | null
    schoolId: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdmissionFormConfigCountAggregateOutputType = {
    id: number
    schoolId: number
    fields: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AdmissionFormConfigMinAggregateInputType = {
    id?: true
    schoolId?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdmissionFormConfigMaxAggregateInputType = {
    id?: true
    schoolId?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdmissionFormConfigCountAggregateInputType = {
    id?: true
    schoolId?: true
    fields?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AdmissionFormConfigAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdmissionFormConfig to aggregate.
     */
    where?: AdmissionFormConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionFormConfigs to fetch.
     */
    orderBy?: AdmissionFormConfigOrderByWithRelationInput | AdmissionFormConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdmissionFormConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionFormConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionFormConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdmissionFormConfigs
    **/
    _count?: true | AdmissionFormConfigCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdmissionFormConfigMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdmissionFormConfigMaxAggregateInputType
  }

  export type GetAdmissionFormConfigAggregateType<T extends AdmissionFormConfigAggregateArgs> = {
        [P in keyof T & keyof AggregateAdmissionFormConfig]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdmissionFormConfig[P]>
      : GetScalarType<T[P], AggregateAdmissionFormConfig[P]>
  }




  export type AdmissionFormConfigGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdmissionFormConfigWhereInput
    orderBy?: AdmissionFormConfigOrderByWithAggregationInput | AdmissionFormConfigOrderByWithAggregationInput[]
    by: AdmissionFormConfigScalarFieldEnum[] | AdmissionFormConfigScalarFieldEnum
    having?: AdmissionFormConfigScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdmissionFormConfigCountAggregateInputType | true
    _min?: AdmissionFormConfigMinAggregateInputType
    _max?: AdmissionFormConfigMaxAggregateInputType
  }

  export type AdmissionFormConfigGroupByOutputType = {
    id: string
    schoolId: string
    fields: JsonValue
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: AdmissionFormConfigCountAggregateOutputType | null
    _min: AdmissionFormConfigMinAggregateOutputType | null
    _max: AdmissionFormConfigMaxAggregateOutputType | null
  }

  type GetAdmissionFormConfigGroupByPayload<T extends AdmissionFormConfigGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdmissionFormConfigGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdmissionFormConfigGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdmissionFormConfigGroupByOutputType[P]>
            : GetScalarType<T[P], AdmissionFormConfigGroupByOutputType[P]>
        }
      >
    >


  export type AdmissionFormConfigSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    schoolId?: boolean
    fields?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["admissionFormConfig"]>

  export type AdmissionFormConfigSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    schoolId?: boolean
    fields?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["admissionFormConfig"]>

  export type AdmissionFormConfigSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    schoolId?: boolean
    fields?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["admissionFormConfig"]>

  export type AdmissionFormConfigSelectScalar = {
    id?: boolean
    schoolId?: boolean
    fields?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AdmissionFormConfigOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "schoolId" | "fields" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["admissionFormConfig"]>
  export type AdmissionFormConfigInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }
  export type AdmissionFormConfigIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }
  export type AdmissionFormConfigIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }

  export type $AdmissionFormConfigPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdmissionFormConfig"
    objects: {
      school: Prisma.$SchoolPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      schoolId: string
      fields: Prisma.JsonValue
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["admissionFormConfig"]>
    composites: {}
  }

  type AdmissionFormConfigGetPayload<S extends boolean | null | undefined | AdmissionFormConfigDefaultArgs> = $Result.GetResult<Prisma.$AdmissionFormConfigPayload, S>

  type AdmissionFormConfigCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdmissionFormConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdmissionFormConfigCountAggregateInputType | true
    }

  export interface AdmissionFormConfigDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdmissionFormConfig'], meta: { name: 'AdmissionFormConfig' } }
    /**
     * Find zero or one AdmissionFormConfig that matches the filter.
     * @param {AdmissionFormConfigFindUniqueArgs} args - Arguments to find a AdmissionFormConfig
     * @example
     * // Get one AdmissionFormConfig
     * const admissionFormConfig = await prisma.admissionFormConfig.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdmissionFormConfigFindUniqueArgs>(args: SelectSubset<T, AdmissionFormConfigFindUniqueArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdmissionFormConfig that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdmissionFormConfigFindUniqueOrThrowArgs} args - Arguments to find a AdmissionFormConfig
     * @example
     * // Get one AdmissionFormConfig
     * const admissionFormConfig = await prisma.admissionFormConfig.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdmissionFormConfigFindUniqueOrThrowArgs>(args: SelectSubset<T, AdmissionFormConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdmissionFormConfig that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionFormConfigFindFirstArgs} args - Arguments to find a AdmissionFormConfig
     * @example
     * // Get one AdmissionFormConfig
     * const admissionFormConfig = await prisma.admissionFormConfig.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdmissionFormConfigFindFirstArgs>(args?: SelectSubset<T, AdmissionFormConfigFindFirstArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdmissionFormConfig that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionFormConfigFindFirstOrThrowArgs} args - Arguments to find a AdmissionFormConfig
     * @example
     * // Get one AdmissionFormConfig
     * const admissionFormConfig = await prisma.admissionFormConfig.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdmissionFormConfigFindFirstOrThrowArgs>(args?: SelectSubset<T, AdmissionFormConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdmissionFormConfigs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionFormConfigFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdmissionFormConfigs
     * const admissionFormConfigs = await prisma.admissionFormConfig.findMany()
     * 
     * // Get first 10 AdmissionFormConfigs
     * const admissionFormConfigs = await prisma.admissionFormConfig.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const admissionFormConfigWithIdOnly = await prisma.admissionFormConfig.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdmissionFormConfigFindManyArgs>(args?: SelectSubset<T, AdmissionFormConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdmissionFormConfig.
     * @param {AdmissionFormConfigCreateArgs} args - Arguments to create a AdmissionFormConfig.
     * @example
     * // Create one AdmissionFormConfig
     * const AdmissionFormConfig = await prisma.admissionFormConfig.create({
     *   data: {
     *     // ... data to create a AdmissionFormConfig
     *   }
     * })
     * 
     */
    create<T extends AdmissionFormConfigCreateArgs>(args: SelectSubset<T, AdmissionFormConfigCreateArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdmissionFormConfigs.
     * @param {AdmissionFormConfigCreateManyArgs} args - Arguments to create many AdmissionFormConfigs.
     * @example
     * // Create many AdmissionFormConfigs
     * const admissionFormConfig = await prisma.admissionFormConfig.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdmissionFormConfigCreateManyArgs>(args?: SelectSubset<T, AdmissionFormConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AdmissionFormConfigs and returns the data saved in the database.
     * @param {AdmissionFormConfigCreateManyAndReturnArgs} args - Arguments to create many AdmissionFormConfigs.
     * @example
     * // Create many AdmissionFormConfigs
     * const admissionFormConfig = await prisma.admissionFormConfig.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AdmissionFormConfigs and only return the `id`
     * const admissionFormConfigWithIdOnly = await prisma.admissionFormConfig.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdmissionFormConfigCreateManyAndReturnArgs>(args?: SelectSubset<T, AdmissionFormConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AdmissionFormConfig.
     * @param {AdmissionFormConfigDeleteArgs} args - Arguments to delete one AdmissionFormConfig.
     * @example
     * // Delete one AdmissionFormConfig
     * const AdmissionFormConfig = await prisma.admissionFormConfig.delete({
     *   where: {
     *     // ... filter to delete one AdmissionFormConfig
     *   }
     * })
     * 
     */
    delete<T extends AdmissionFormConfigDeleteArgs>(args: SelectSubset<T, AdmissionFormConfigDeleteArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdmissionFormConfig.
     * @param {AdmissionFormConfigUpdateArgs} args - Arguments to update one AdmissionFormConfig.
     * @example
     * // Update one AdmissionFormConfig
     * const admissionFormConfig = await prisma.admissionFormConfig.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdmissionFormConfigUpdateArgs>(args: SelectSubset<T, AdmissionFormConfigUpdateArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdmissionFormConfigs.
     * @param {AdmissionFormConfigDeleteManyArgs} args - Arguments to filter AdmissionFormConfigs to delete.
     * @example
     * // Delete a few AdmissionFormConfigs
     * const { count } = await prisma.admissionFormConfig.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdmissionFormConfigDeleteManyArgs>(args?: SelectSubset<T, AdmissionFormConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdmissionFormConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionFormConfigUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdmissionFormConfigs
     * const admissionFormConfig = await prisma.admissionFormConfig.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdmissionFormConfigUpdateManyArgs>(args: SelectSubset<T, AdmissionFormConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdmissionFormConfigs and returns the data updated in the database.
     * @param {AdmissionFormConfigUpdateManyAndReturnArgs} args - Arguments to update many AdmissionFormConfigs.
     * @example
     * // Update many AdmissionFormConfigs
     * const admissionFormConfig = await prisma.admissionFormConfig.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AdmissionFormConfigs and only return the `id`
     * const admissionFormConfigWithIdOnly = await prisma.admissionFormConfig.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdmissionFormConfigUpdateManyAndReturnArgs>(args: SelectSubset<T, AdmissionFormConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AdmissionFormConfig.
     * @param {AdmissionFormConfigUpsertArgs} args - Arguments to update or create a AdmissionFormConfig.
     * @example
     * // Update or create a AdmissionFormConfig
     * const admissionFormConfig = await prisma.admissionFormConfig.upsert({
     *   create: {
     *     // ... data to create a AdmissionFormConfig
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdmissionFormConfig we want to update
     *   }
     * })
     */
    upsert<T extends AdmissionFormConfigUpsertArgs>(args: SelectSubset<T, AdmissionFormConfigUpsertArgs<ExtArgs>>): Prisma__AdmissionFormConfigClient<$Result.GetResult<Prisma.$AdmissionFormConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdmissionFormConfigs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionFormConfigCountArgs} args - Arguments to filter AdmissionFormConfigs to count.
     * @example
     * // Count the number of AdmissionFormConfigs
     * const count = await prisma.admissionFormConfig.count({
     *   where: {
     *     // ... the filter for the AdmissionFormConfigs we want to count
     *   }
     * })
    **/
    count<T extends AdmissionFormConfigCountArgs>(
      args?: Subset<T, AdmissionFormConfigCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdmissionFormConfigCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdmissionFormConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionFormConfigAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdmissionFormConfigAggregateArgs>(args: Subset<T, AdmissionFormConfigAggregateArgs>): Prisma.PrismaPromise<GetAdmissionFormConfigAggregateType<T>>

    /**
     * Group by AdmissionFormConfig.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionFormConfigGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdmissionFormConfigGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdmissionFormConfigGroupByArgs['orderBy'] }
        : { orderBy?: AdmissionFormConfigGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdmissionFormConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdmissionFormConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdmissionFormConfig model
   */
  readonly fields: AdmissionFormConfigFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdmissionFormConfig.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdmissionFormConfigClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    school<T extends SchoolDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SchoolDefaultArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AdmissionFormConfig model
   */
  interface AdmissionFormConfigFieldRefs {
    readonly id: FieldRef<"AdmissionFormConfig", 'String'>
    readonly schoolId: FieldRef<"AdmissionFormConfig", 'String'>
    readonly fields: FieldRef<"AdmissionFormConfig", 'Json'>
    readonly isActive: FieldRef<"AdmissionFormConfig", 'Boolean'>
    readonly createdAt: FieldRef<"AdmissionFormConfig", 'DateTime'>
    readonly updatedAt: FieldRef<"AdmissionFormConfig", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AdmissionFormConfig findUnique
   */
  export type AdmissionFormConfigFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionFormConfig to fetch.
     */
    where: AdmissionFormConfigWhereUniqueInput
  }

  /**
   * AdmissionFormConfig findUniqueOrThrow
   */
  export type AdmissionFormConfigFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionFormConfig to fetch.
     */
    where: AdmissionFormConfigWhereUniqueInput
  }

  /**
   * AdmissionFormConfig findFirst
   */
  export type AdmissionFormConfigFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionFormConfig to fetch.
     */
    where?: AdmissionFormConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionFormConfigs to fetch.
     */
    orderBy?: AdmissionFormConfigOrderByWithRelationInput | AdmissionFormConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdmissionFormConfigs.
     */
    cursor?: AdmissionFormConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionFormConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionFormConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdmissionFormConfigs.
     */
    distinct?: AdmissionFormConfigScalarFieldEnum | AdmissionFormConfigScalarFieldEnum[]
  }

  /**
   * AdmissionFormConfig findFirstOrThrow
   */
  export type AdmissionFormConfigFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionFormConfig to fetch.
     */
    where?: AdmissionFormConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionFormConfigs to fetch.
     */
    orderBy?: AdmissionFormConfigOrderByWithRelationInput | AdmissionFormConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdmissionFormConfigs.
     */
    cursor?: AdmissionFormConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionFormConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionFormConfigs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdmissionFormConfigs.
     */
    distinct?: AdmissionFormConfigScalarFieldEnum | AdmissionFormConfigScalarFieldEnum[]
  }

  /**
   * AdmissionFormConfig findMany
   */
  export type AdmissionFormConfigFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionFormConfigs to fetch.
     */
    where?: AdmissionFormConfigWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionFormConfigs to fetch.
     */
    orderBy?: AdmissionFormConfigOrderByWithRelationInput | AdmissionFormConfigOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdmissionFormConfigs.
     */
    cursor?: AdmissionFormConfigWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionFormConfigs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionFormConfigs.
     */
    skip?: number
    distinct?: AdmissionFormConfigScalarFieldEnum | AdmissionFormConfigScalarFieldEnum[]
  }

  /**
   * AdmissionFormConfig create
   */
  export type AdmissionFormConfigCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * The data needed to create a AdmissionFormConfig.
     */
    data: XOR<AdmissionFormConfigCreateInput, AdmissionFormConfigUncheckedCreateInput>
  }

  /**
   * AdmissionFormConfig createMany
   */
  export type AdmissionFormConfigCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdmissionFormConfigs.
     */
    data: AdmissionFormConfigCreateManyInput | AdmissionFormConfigCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdmissionFormConfig createManyAndReturn
   */
  export type AdmissionFormConfigCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * The data used to create many AdmissionFormConfigs.
     */
    data: AdmissionFormConfigCreateManyInput | AdmissionFormConfigCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AdmissionFormConfig update
   */
  export type AdmissionFormConfigUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * The data needed to update a AdmissionFormConfig.
     */
    data: XOR<AdmissionFormConfigUpdateInput, AdmissionFormConfigUncheckedUpdateInput>
    /**
     * Choose, which AdmissionFormConfig to update.
     */
    where: AdmissionFormConfigWhereUniqueInput
  }

  /**
   * AdmissionFormConfig updateMany
   */
  export type AdmissionFormConfigUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdmissionFormConfigs.
     */
    data: XOR<AdmissionFormConfigUpdateManyMutationInput, AdmissionFormConfigUncheckedUpdateManyInput>
    /**
     * Filter which AdmissionFormConfigs to update
     */
    where?: AdmissionFormConfigWhereInput
    /**
     * Limit how many AdmissionFormConfigs to update.
     */
    limit?: number
  }

  /**
   * AdmissionFormConfig updateManyAndReturn
   */
  export type AdmissionFormConfigUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * The data used to update AdmissionFormConfigs.
     */
    data: XOR<AdmissionFormConfigUpdateManyMutationInput, AdmissionFormConfigUncheckedUpdateManyInput>
    /**
     * Filter which AdmissionFormConfigs to update
     */
    where?: AdmissionFormConfigWhereInput
    /**
     * Limit how many AdmissionFormConfigs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AdmissionFormConfig upsert
   */
  export type AdmissionFormConfigUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * The filter to search for the AdmissionFormConfig to update in case it exists.
     */
    where: AdmissionFormConfigWhereUniqueInput
    /**
     * In case the AdmissionFormConfig found by the `where` argument doesn't exist, create a new AdmissionFormConfig with this data.
     */
    create: XOR<AdmissionFormConfigCreateInput, AdmissionFormConfigUncheckedCreateInput>
    /**
     * In case the AdmissionFormConfig was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdmissionFormConfigUpdateInput, AdmissionFormConfigUncheckedUpdateInput>
  }

  /**
   * AdmissionFormConfig delete
   */
  export type AdmissionFormConfigDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
    /**
     * Filter which AdmissionFormConfig to delete.
     */
    where: AdmissionFormConfigWhereUniqueInput
  }

  /**
   * AdmissionFormConfig deleteMany
   */
  export type AdmissionFormConfigDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdmissionFormConfigs to delete
     */
    where?: AdmissionFormConfigWhereInput
    /**
     * Limit how many AdmissionFormConfigs to delete.
     */
    limit?: number
  }

  /**
   * AdmissionFormConfig without action
   */
  export type AdmissionFormConfigDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionFormConfig
     */
    select?: AdmissionFormConfigSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionFormConfig
     */
    omit?: AdmissionFormConfigOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionFormConfigInclude<ExtArgs> | null
  }


  /**
   * Model AdmissionApplication
   */

  export type AggregateAdmissionApplication = {
    _count: AdmissionApplicationCountAggregateOutputType | null
    _min: AdmissionApplicationMinAggregateOutputType | null
    _max: AdmissionApplicationMaxAggregateOutputType | null
  }

  export type AdmissionApplicationMinAggregateOutputType = {
    id: string | null
    schoolId: string | null
    applicantName: string | null
    applicantEmail: string | null
    status: $Enums.ApplicationStatus | null
    studentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdmissionApplicationMaxAggregateOutputType = {
    id: string | null
    schoolId: string | null
    applicantName: string | null
    applicantEmail: string | null
    status: $Enums.ApplicationStatus | null
    studentId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AdmissionApplicationCountAggregateOutputType = {
    id: number
    schoolId: number
    applicantName: number
    applicantEmail: number
    submissionData: number
    status: number
    studentId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AdmissionApplicationMinAggregateInputType = {
    id?: true
    schoolId?: true
    applicantName?: true
    applicantEmail?: true
    status?: true
    studentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdmissionApplicationMaxAggregateInputType = {
    id?: true
    schoolId?: true
    applicantName?: true
    applicantEmail?: true
    status?: true
    studentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AdmissionApplicationCountAggregateInputType = {
    id?: true
    schoolId?: true
    applicantName?: true
    applicantEmail?: true
    submissionData?: true
    status?: true
    studentId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AdmissionApplicationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdmissionApplication to aggregate.
     */
    where?: AdmissionApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionApplications to fetch.
     */
    orderBy?: AdmissionApplicationOrderByWithRelationInput | AdmissionApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdmissionApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AdmissionApplications
    **/
    _count?: true | AdmissionApplicationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdmissionApplicationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdmissionApplicationMaxAggregateInputType
  }

  export type GetAdmissionApplicationAggregateType<T extends AdmissionApplicationAggregateArgs> = {
        [P in keyof T & keyof AggregateAdmissionApplication]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdmissionApplication[P]>
      : GetScalarType<T[P], AggregateAdmissionApplication[P]>
  }




  export type AdmissionApplicationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdmissionApplicationWhereInput
    orderBy?: AdmissionApplicationOrderByWithAggregationInput | AdmissionApplicationOrderByWithAggregationInput[]
    by: AdmissionApplicationScalarFieldEnum[] | AdmissionApplicationScalarFieldEnum
    having?: AdmissionApplicationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdmissionApplicationCountAggregateInputType | true
    _min?: AdmissionApplicationMinAggregateInputType
    _max?: AdmissionApplicationMaxAggregateInputType
  }

  export type AdmissionApplicationGroupByOutputType = {
    id: string
    schoolId: string
    applicantName: string
    applicantEmail: string
    submissionData: JsonValue
    status: $Enums.ApplicationStatus
    studentId: string | null
    createdAt: Date
    updatedAt: Date
    _count: AdmissionApplicationCountAggregateOutputType | null
    _min: AdmissionApplicationMinAggregateOutputType | null
    _max: AdmissionApplicationMaxAggregateOutputType | null
  }

  type GetAdmissionApplicationGroupByPayload<T extends AdmissionApplicationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdmissionApplicationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdmissionApplicationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdmissionApplicationGroupByOutputType[P]>
            : GetScalarType<T[P], AdmissionApplicationGroupByOutputType[P]>
        }
      >
    >


  export type AdmissionApplicationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    schoolId?: boolean
    applicantName?: boolean
    applicantEmail?: boolean
    submissionData?: boolean
    status?: boolean
    studentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["admissionApplication"]>

  export type AdmissionApplicationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    schoolId?: boolean
    applicantName?: boolean
    applicantEmail?: boolean
    submissionData?: boolean
    status?: boolean
    studentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["admissionApplication"]>

  export type AdmissionApplicationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    schoolId?: boolean
    applicantName?: boolean
    applicantEmail?: boolean
    submissionData?: boolean
    status?: boolean
    studentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["admissionApplication"]>

  export type AdmissionApplicationSelectScalar = {
    id?: boolean
    schoolId?: boolean
    applicantName?: boolean
    applicantEmail?: boolean
    submissionData?: boolean
    status?: boolean
    studentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AdmissionApplicationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "schoolId" | "applicantName" | "applicantEmail" | "submissionData" | "status" | "studentId" | "createdAt" | "updatedAt", ExtArgs["result"]["admissionApplication"]>
  export type AdmissionApplicationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }
  export type AdmissionApplicationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }
  export type AdmissionApplicationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    school?: boolean | SchoolDefaultArgs<ExtArgs>
  }

  export type $AdmissionApplicationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AdmissionApplication"
    objects: {
      school: Prisma.$SchoolPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      schoolId: string
      applicantName: string
      applicantEmail: string
      submissionData: Prisma.JsonValue
      status: $Enums.ApplicationStatus
      studentId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["admissionApplication"]>
    composites: {}
  }

  type AdmissionApplicationGetPayload<S extends boolean | null | undefined | AdmissionApplicationDefaultArgs> = $Result.GetResult<Prisma.$AdmissionApplicationPayload, S>

  type AdmissionApplicationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AdmissionApplicationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AdmissionApplicationCountAggregateInputType | true
    }

  export interface AdmissionApplicationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AdmissionApplication'], meta: { name: 'AdmissionApplication' } }
    /**
     * Find zero or one AdmissionApplication that matches the filter.
     * @param {AdmissionApplicationFindUniqueArgs} args - Arguments to find a AdmissionApplication
     * @example
     * // Get one AdmissionApplication
     * const admissionApplication = await prisma.admissionApplication.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdmissionApplicationFindUniqueArgs>(args: SelectSubset<T, AdmissionApplicationFindUniqueArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one AdmissionApplication that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AdmissionApplicationFindUniqueOrThrowArgs} args - Arguments to find a AdmissionApplication
     * @example
     * // Get one AdmissionApplication
     * const admissionApplication = await prisma.admissionApplication.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdmissionApplicationFindUniqueOrThrowArgs>(args: SelectSubset<T, AdmissionApplicationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdmissionApplication that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionApplicationFindFirstArgs} args - Arguments to find a AdmissionApplication
     * @example
     * // Get one AdmissionApplication
     * const admissionApplication = await prisma.admissionApplication.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdmissionApplicationFindFirstArgs>(args?: SelectSubset<T, AdmissionApplicationFindFirstArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first AdmissionApplication that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionApplicationFindFirstOrThrowArgs} args - Arguments to find a AdmissionApplication
     * @example
     * // Get one AdmissionApplication
     * const admissionApplication = await prisma.admissionApplication.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdmissionApplicationFindFirstOrThrowArgs>(args?: SelectSubset<T, AdmissionApplicationFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more AdmissionApplications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionApplicationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AdmissionApplications
     * const admissionApplications = await prisma.admissionApplication.findMany()
     * 
     * // Get first 10 AdmissionApplications
     * const admissionApplications = await prisma.admissionApplication.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const admissionApplicationWithIdOnly = await prisma.admissionApplication.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdmissionApplicationFindManyArgs>(args?: SelectSubset<T, AdmissionApplicationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a AdmissionApplication.
     * @param {AdmissionApplicationCreateArgs} args - Arguments to create a AdmissionApplication.
     * @example
     * // Create one AdmissionApplication
     * const AdmissionApplication = await prisma.admissionApplication.create({
     *   data: {
     *     // ... data to create a AdmissionApplication
     *   }
     * })
     * 
     */
    create<T extends AdmissionApplicationCreateArgs>(args: SelectSubset<T, AdmissionApplicationCreateArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many AdmissionApplications.
     * @param {AdmissionApplicationCreateManyArgs} args - Arguments to create many AdmissionApplications.
     * @example
     * // Create many AdmissionApplications
     * const admissionApplication = await prisma.admissionApplication.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdmissionApplicationCreateManyArgs>(args?: SelectSubset<T, AdmissionApplicationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AdmissionApplications and returns the data saved in the database.
     * @param {AdmissionApplicationCreateManyAndReturnArgs} args - Arguments to create many AdmissionApplications.
     * @example
     * // Create many AdmissionApplications
     * const admissionApplication = await prisma.admissionApplication.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AdmissionApplications and only return the `id`
     * const admissionApplicationWithIdOnly = await prisma.admissionApplication.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdmissionApplicationCreateManyAndReturnArgs>(args?: SelectSubset<T, AdmissionApplicationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a AdmissionApplication.
     * @param {AdmissionApplicationDeleteArgs} args - Arguments to delete one AdmissionApplication.
     * @example
     * // Delete one AdmissionApplication
     * const AdmissionApplication = await prisma.admissionApplication.delete({
     *   where: {
     *     // ... filter to delete one AdmissionApplication
     *   }
     * })
     * 
     */
    delete<T extends AdmissionApplicationDeleteArgs>(args: SelectSubset<T, AdmissionApplicationDeleteArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one AdmissionApplication.
     * @param {AdmissionApplicationUpdateArgs} args - Arguments to update one AdmissionApplication.
     * @example
     * // Update one AdmissionApplication
     * const admissionApplication = await prisma.admissionApplication.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdmissionApplicationUpdateArgs>(args: SelectSubset<T, AdmissionApplicationUpdateArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more AdmissionApplications.
     * @param {AdmissionApplicationDeleteManyArgs} args - Arguments to filter AdmissionApplications to delete.
     * @example
     * // Delete a few AdmissionApplications
     * const { count } = await prisma.admissionApplication.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdmissionApplicationDeleteManyArgs>(args?: SelectSubset<T, AdmissionApplicationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdmissionApplications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionApplicationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AdmissionApplications
     * const admissionApplication = await prisma.admissionApplication.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdmissionApplicationUpdateManyArgs>(args: SelectSubset<T, AdmissionApplicationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AdmissionApplications and returns the data updated in the database.
     * @param {AdmissionApplicationUpdateManyAndReturnArgs} args - Arguments to update many AdmissionApplications.
     * @example
     * // Update many AdmissionApplications
     * const admissionApplication = await prisma.admissionApplication.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more AdmissionApplications and only return the `id`
     * const admissionApplicationWithIdOnly = await prisma.admissionApplication.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AdmissionApplicationUpdateManyAndReturnArgs>(args: SelectSubset<T, AdmissionApplicationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one AdmissionApplication.
     * @param {AdmissionApplicationUpsertArgs} args - Arguments to update or create a AdmissionApplication.
     * @example
     * // Update or create a AdmissionApplication
     * const admissionApplication = await prisma.admissionApplication.upsert({
     *   create: {
     *     // ... data to create a AdmissionApplication
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AdmissionApplication we want to update
     *   }
     * })
     */
    upsert<T extends AdmissionApplicationUpsertArgs>(args: SelectSubset<T, AdmissionApplicationUpsertArgs<ExtArgs>>): Prisma__AdmissionApplicationClient<$Result.GetResult<Prisma.$AdmissionApplicationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of AdmissionApplications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionApplicationCountArgs} args - Arguments to filter AdmissionApplications to count.
     * @example
     * // Count the number of AdmissionApplications
     * const count = await prisma.admissionApplication.count({
     *   where: {
     *     // ... the filter for the AdmissionApplications we want to count
     *   }
     * })
    **/
    count<T extends AdmissionApplicationCountArgs>(
      args?: Subset<T, AdmissionApplicationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdmissionApplicationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AdmissionApplication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionApplicationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdmissionApplicationAggregateArgs>(args: Subset<T, AdmissionApplicationAggregateArgs>): Prisma.PrismaPromise<GetAdmissionApplicationAggregateType<T>>

    /**
     * Group by AdmissionApplication.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdmissionApplicationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdmissionApplicationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdmissionApplicationGroupByArgs['orderBy'] }
        : { orderBy?: AdmissionApplicationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdmissionApplicationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdmissionApplicationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AdmissionApplication model
   */
  readonly fields: AdmissionApplicationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AdmissionApplication.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdmissionApplicationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    school<T extends SchoolDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SchoolDefaultArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AdmissionApplication model
   */
  interface AdmissionApplicationFieldRefs {
    readonly id: FieldRef<"AdmissionApplication", 'String'>
    readonly schoolId: FieldRef<"AdmissionApplication", 'String'>
    readonly applicantName: FieldRef<"AdmissionApplication", 'String'>
    readonly applicantEmail: FieldRef<"AdmissionApplication", 'String'>
    readonly submissionData: FieldRef<"AdmissionApplication", 'Json'>
    readonly status: FieldRef<"AdmissionApplication", 'ApplicationStatus'>
    readonly studentId: FieldRef<"AdmissionApplication", 'String'>
    readonly createdAt: FieldRef<"AdmissionApplication", 'DateTime'>
    readonly updatedAt: FieldRef<"AdmissionApplication", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AdmissionApplication findUnique
   */
  export type AdmissionApplicationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionApplication to fetch.
     */
    where: AdmissionApplicationWhereUniqueInput
  }

  /**
   * AdmissionApplication findUniqueOrThrow
   */
  export type AdmissionApplicationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionApplication to fetch.
     */
    where: AdmissionApplicationWhereUniqueInput
  }

  /**
   * AdmissionApplication findFirst
   */
  export type AdmissionApplicationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionApplication to fetch.
     */
    where?: AdmissionApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionApplications to fetch.
     */
    orderBy?: AdmissionApplicationOrderByWithRelationInput | AdmissionApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdmissionApplications.
     */
    cursor?: AdmissionApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdmissionApplications.
     */
    distinct?: AdmissionApplicationScalarFieldEnum | AdmissionApplicationScalarFieldEnum[]
  }

  /**
   * AdmissionApplication findFirstOrThrow
   */
  export type AdmissionApplicationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionApplication to fetch.
     */
    where?: AdmissionApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionApplications to fetch.
     */
    orderBy?: AdmissionApplicationOrderByWithRelationInput | AdmissionApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AdmissionApplications.
     */
    cursor?: AdmissionApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionApplications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AdmissionApplications.
     */
    distinct?: AdmissionApplicationScalarFieldEnum | AdmissionApplicationScalarFieldEnum[]
  }

  /**
   * AdmissionApplication findMany
   */
  export type AdmissionApplicationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * Filter, which AdmissionApplications to fetch.
     */
    where?: AdmissionApplicationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AdmissionApplications to fetch.
     */
    orderBy?: AdmissionApplicationOrderByWithRelationInput | AdmissionApplicationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AdmissionApplications.
     */
    cursor?: AdmissionApplicationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AdmissionApplications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AdmissionApplications.
     */
    skip?: number
    distinct?: AdmissionApplicationScalarFieldEnum | AdmissionApplicationScalarFieldEnum[]
  }

  /**
   * AdmissionApplication create
   */
  export type AdmissionApplicationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * The data needed to create a AdmissionApplication.
     */
    data: XOR<AdmissionApplicationCreateInput, AdmissionApplicationUncheckedCreateInput>
  }

  /**
   * AdmissionApplication createMany
   */
  export type AdmissionApplicationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AdmissionApplications.
     */
    data: AdmissionApplicationCreateManyInput | AdmissionApplicationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AdmissionApplication createManyAndReturn
   */
  export type AdmissionApplicationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * The data used to create many AdmissionApplications.
     */
    data: AdmissionApplicationCreateManyInput | AdmissionApplicationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AdmissionApplication update
   */
  export type AdmissionApplicationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * The data needed to update a AdmissionApplication.
     */
    data: XOR<AdmissionApplicationUpdateInput, AdmissionApplicationUncheckedUpdateInput>
    /**
     * Choose, which AdmissionApplication to update.
     */
    where: AdmissionApplicationWhereUniqueInput
  }

  /**
   * AdmissionApplication updateMany
   */
  export type AdmissionApplicationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AdmissionApplications.
     */
    data: XOR<AdmissionApplicationUpdateManyMutationInput, AdmissionApplicationUncheckedUpdateManyInput>
    /**
     * Filter which AdmissionApplications to update
     */
    where?: AdmissionApplicationWhereInput
    /**
     * Limit how many AdmissionApplications to update.
     */
    limit?: number
  }

  /**
   * AdmissionApplication updateManyAndReturn
   */
  export type AdmissionApplicationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * The data used to update AdmissionApplications.
     */
    data: XOR<AdmissionApplicationUpdateManyMutationInput, AdmissionApplicationUncheckedUpdateManyInput>
    /**
     * Filter which AdmissionApplications to update
     */
    where?: AdmissionApplicationWhereInput
    /**
     * Limit how many AdmissionApplications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * AdmissionApplication upsert
   */
  export type AdmissionApplicationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * The filter to search for the AdmissionApplication to update in case it exists.
     */
    where: AdmissionApplicationWhereUniqueInput
    /**
     * In case the AdmissionApplication found by the `where` argument doesn't exist, create a new AdmissionApplication with this data.
     */
    create: XOR<AdmissionApplicationCreateInput, AdmissionApplicationUncheckedCreateInput>
    /**
     * In case the AdmissionApplication was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdmissionApplicationUpdateInput, AdmissionApplicationUncheckedUpdateInput>
  }

  /**
   * AdmissionApplication delete
   */
  export type AdmissionApplicationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
    /**
     * Filter which AdmissionApplication to delete.
     */
    where: AdmissionApplicationWhereUniqueInput
  }

  /**
   * AdmissionApplication deleteMany
   */
  export type AdmissionApplicationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AdmissionApplications to delete
     */
    where?: AdmissionApplicationWhereInput
    /**
     * Limit how many AdmissionApplications to delete.
     */
    limit?: number
  }

  /**
   * AdmissionApplication without action
   */
  export type AdmissionApplicationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AdmissionApplication
     */
    select?: AdmissionApplicationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the AdmissionApplication
     */
    omit?: AdmissionApplicationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AdmissionApplicationInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SchoolScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    subdomain: 'subdomain',
    customDomain: 'customDomain',
    logo: 'logo',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SchoolScalarFieldEnum = (typeof SchoolScalarFieldEnum)[keyof typeof SchoolScalarFieldEnum]


  export const AdmissionFormConfigScalarFieldEnum: {
    id: 'id',
    schoolId: 'schoolId',
    fields: 'fields',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AdmissionFormConfigScalarFieldEnum = (typeof AdmissionFormConfigScalarFieldEnum)[keyof typeof AdmissionFormConfigScalarFieldEnum]


  export const AdmissionApplicationScalarFieldEnum: {
    id: 'id',
    schoolId: 'schoolId',
    applicantName: 'applicantName',
    applicantEmail: 'applicantEmail',
    submissionData: 'submissionData',
    status: 'status',
    studentId: 'studentId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AdmissionApplicationScalarFieldEnum = (typeof AdmissionApplicationScalarFieldEnum)[keyof typeof AdmissionApplicationScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'ApplicationStatus'
   */
  export type EnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus'>
    


  /**
   * Reference to a field of type 'ApplicationStatus[]'
   */
  export type ListEnumApplicationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ApplicationStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type SchoolWhereInput = {
    AND?: SchoolWhereInput | SchoolWhereInput[]
    OR?: SchoolWhereInput[]
    NOT?: SchoolWhereInput | SchoolWhereInput[]
    id?: StringFilter<"School"> | string
    name?: StringFilter<"School"> | string
    slug?: StringFilter<"School"> | string
    subdomain?: StringNullableFilter<"School"> | string | null
    customDomain?: StringNullableFilter<"School"> | string | null
    logo?: StringNullableFilter<"School"> | string | null
    isActive?: BoolFilter<"School"> | boolean
    createdAt?: DateTimeFilter<"School"> | Date | string
    updatedAt?: DateTimeFilter<"School"> | Date | string
    admissionConfig?: XOR<AdmissionFormConfigNullableScalarRelationFilter, AdmissionFormConfigWhereInput> | null
    applications?: AdmissionApplicationListRelationFilter
  }

  export type SchoolOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    subdomain?: SortOrderInput | SortOrder
    customDomain?: SortOrderInput | SortOrder
    logo?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    admissionConfig?: AdmissionFormConfigOrderByWithRelationInput
    applications?: AdmissionApplicationOrderByRelationAggregateInput
  }

  export type SchoolWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    subdomain?: string
    customDomain?: string
    AND?: SchoolWhereInput | SchoolWhereInput[]
    OR?: SchoolWhereInput[]
    NOT?: SchoolWhereInput | SchoolWhereInput[]
    name?: StringFilter<"School"> | string
    logo?: StringNullableFilter<"School"> | string | null
    isActive?: BoolFilter<"School"> | boolean
    createdAt?: DateTimeFilter<"School"> | Date | string
    updatedAt?: DateTimeFilter<"School"> | Date | string
    admissionConfig?: XOR<AdmissionFormConfigNullableScalarRelationFilter, AdmissionFormConfigWhereInput> | null
    applications?: AdmissionApplicationListRelationFilter
  }, "id" | "slug" | "subdomain" | "customDomain">

  export type SchoolOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    subdomain?: SortOrderInput | SortOrder
    customDomain?: SortOrderInput | SortOrder
    logo?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SchoolCountOrderByAggregateInput
    _max?: SchoolMaxOrderByAggregateInput
    _min?: SchoolMinOrderByAggregateInput
  }

  export type SchoolScalarWhereWithAggregatesInput = {
    AND?: SchoolScalarWhereWithAggregatesInput | SchoolScalarWhereWithAggregatesInput[]
    OR?: SchoolScalarWhereWithAggregatesInput[]
    NOT?: SchoolScalarWhereWithAggregatesInput | SchoolScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"School"> | string
    name?: StringWithAggregatesFilter<"School"> | string
    slug?: StringWithAggregatesFilter<"School"> | string
    subdomain?: StringNullableWithAggregatesFilter<"School"> | string | null
    customDomain?: StringNullableWithAggregatesFilter<"School"> | string | null
    logo?: StringNullableWithAggregatesFilter<"School"> | string | null
    isActive?: BoolWithAggregatesFilter<"School"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"School"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"School"> | Date | string
  }

  export type AdmissionFormConfigWhereInput = {
    AND?: AdmissionFormConfigWhereInput | AdmissionFormConfigWhereInput[]
    OR?: AdmissionFormConfigWhereInput[]
    NOT?: AdmissionFormConfigWhereInput | AdmissionFormConfigWhereInput[]
    id?: StringFilter<"AdmissionFormConfig"> | string
    schoolId?: StringFilter<"AdmissionFormConfig"> | string
    fields?: JsonFilter<"AdmissionFormConfig">
    isActive?: BoolFilter<"AdmissionFormConfig"> | boolean
    createdAt?: DateTimeFilter<"AdmissionFormConfig"> | Date | string
    updatedAt?: DateTimeFilter<"AdmissionFormConfig"> | Date | string
    school?: XOR<SchoolScalarRelationFilter, SchoolWhereInput>
  }

  export type AdmissionFormConfigOrderByWithRelationInput = {
    id?: SortOrder
    schoolId?: SortOrder
    fields?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    school?: SchoolOrderByWithRelationInput
  }

  export type AdmissionFormConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    schoolId?: string
    AND?: AdmissionFormConfigWhereInput | AdmissionFormConfigWhereInput[]
    OR?: AdmissionFormConfigWhereInput[]
    NOT?: AdmissionFormConfigWhereInput | AdmissionFormConfigWhereInput[]
    fields?: JsonFilter<"AdmissionFormConfig">
    isActive?: BoolFilter<"AdmissionFormConfig"> | boolean
    createdAt?: DateTimeFilter<"AdmissionFormConfig"> | Date | string
    updatedAt?: DateTimeFilter<"AdmissionFormConfig"> | Date | string
    school?: XOR<SchoolScalarRelationFilter, SchoolWhereInput>
  }, "id" | "schoolId">

  export type AdmissionFormConfigOrderByWithAggregationInput = {
    id?: SortOrder
    schoolId?: SortOrder
    fields?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AdmissionFormConfigCountOrderByAggregateInput
    _max?: AdmissionFormConfigMaxOrderByAggregateInput
    _min?: AdmissionFormConfigMinOrderByAggregateInput
  }

  export type AdmissionFormConfigScalarWhereWithAggregatesInput = {
    AND?: AdmissionFormConfigScalarWhereWithAggregatesInput | AdmissionFormConfigScalarWhereWithAggregatesInput[]
    OR?: AdmissionFormConfigScalarWhereWithAggregatesInput[]
    NOT?: AdmissionFormConfigScalarWhereWithAggregatesInput | AdmissionFormConfigScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AdmissionFormConfig"> | string
    schoolId?: StringWithAggregatesFilter<"AdmissionFormConfig"> | string
    fields?: JsonWithAggregatesFilter<"AdmissionFormConfig">
    isActive?: BoolWithAggregatesFilter<"AdmissionFormConfig"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"AdmissionFormConfig"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AdmissionFormConfig"> | Date | string
  }

  export type AdmissionApplicationWhereInput = {
    AND?: AdmissionApplicationWhereInput | AdmissionApplicationWhereInput[]
    OR?: AdmissionApplicationWhereInput[]
    NOT?: AdmissionApplicationWhereInput | AdmissionApplicationWhereInput[]
    id?: StringFilter<"AdmissionApplication"> | string
    schoolId?: StringFilter<"AdmissionApplication"> | string
    applicantName?: StringFilter<"AdmissionApplication"> | string
    applicantEmail?: StringFilter<"AdmissionApplication"> | string
    submissionData?: JsonFilter<"AdmissionApplication">
    status?: EnumApplicationStatusFilter<"AdmissionApplication"> | $Enums.ApplicationStatus
    studentId?: StringNullableFilter<"AdmissionApplication"> | string | null
    createdAt?: DateTimeFilter<"AdmissionApplication"> | Date | string
    updatedAt?: DateTimeFilter<"AdmissionApplication"> | Date | string
    school?: XOR<SchoolScalarRelationFilter, SchoolWhereInput>
  }

  export type AdmissionApplicationOrderByWithRelationInput = {
    id?: SortOrder
    schoolId?: SortOrder
    applicantName?: SortOrder
    applicantEmail?: SortOrder
    submissionData?: SortOrder
    status?: SortOrder
    studentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    school?: SchoolOrderByWithRelationInput
  }

  export type AdmissionApplicationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    studentId?: string
    AND?: AdmissionApplicationWhereInput | AdmissionApplicationWhereInput[]
    OR?: AdmissionApplicationWhereInput[]
    NOT?: AdmissionApplicationWhereInput | AdmissionApplicationWhereInput[]
    schoolId?: StringFilter<"AdmissionApplication"> | string
    applicantName?: StringFilter<"AdmissionApplication"> | string
    applicantEmail?: StringFilter<"AdmissionApplication"> | string
    submissionData?: JsonFilter<"AdmissionApplication">
    status?: EnumApplicationStatusFilter<"AdmissionApplication"> | $Enums.ApplicationStatus
    createdAt?: DateTimeFilter<"AdmissionApplication"> | Date | string
    updatedAt?: DateTimeFilter<"AdmissionApplication"> | Date | string
    school?: XOR<SchoolScalarRelationFilter, SchoolWhereInput>
  }, "id" | "studentId">

  export type AdmissionApplicationOrderByWithAggregationInput = {
    id?: SortOrder
    schoolId?: SortOrder
    applicantName?: SortOrder
    applicantEmail?: SortOrder
    submissionData?: SortOrder
    status?: SortOrder
    studentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AdmissionApplicationCountOrderByAggregateInput
    _max?: AdmissionApplicationMaxOrderByAggregateInput
    _min?: AdmissionApplicationMinOrderByAggregateInput
  }

  export type AdmissionApplicationScalarWhereWithAggregatesInput = {
    AND?: AdmissionApplicationScalarWhereWithAggregatesInput | AdmissionApplicationScalarWhereWithAggregatesInput[]
    OR?: AdmissionApplicationScalarWhereWithAggregatesInput[]
    NOT?: AdmissionApplicationScalarWhereWithAggregatesInput | AdmissionApplicationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AdmissionApplication"> | string
    schoolId?: StringWithAggregatesFilter<"AdmissionApplication"> | string
    applicantName?: StringWithAggregatesFilter<"AdmissionApplication"> | string
    applicantEmail?: StringWithAggregatesFilter<"AdmissionApplication"> | string
    submissionData?: JsonWithAggregatesFilter<"AdmissionApplication">
    status?: EnumApplicationStatusWithAggregatesFilter<"AdmissionApplication"> | $Enums.ApplicationStatus
    studentId?: StringNullableWithAggregatesFilter<"AdmissionApplication"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AdmissionApplication"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"AdmissionApplication"> | Date | string
  }

  export type SchoolCreateInput = {
    id?: string
    name: string
    slug: string
    subdomain?: string | null
    customDomain?: string | null
    logo?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    admissionConfig?: AdmissionFormConfigCreateNestedOneWithoutSchoolInput
    applications?: AdmissionApplicationCreateNestedManyWithoutSchoolInput
  }

  export type SchoolUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    subdomain?: string | null
    customDomain?: string | null
    logo?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    admissionConfig?: AdmissionFormConfigUncheckedCreateNestedOneWithoutSchoolInput
    applications?: AdmissionApplicationUncheckedCreateNestedManyWithoutSchoolInput
  }

  export type SchoolUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionConfig?: AdmissionFormConfigUpdateOneWithoutSchoolNestedInput
    applications?: AdmissionApplicationUpdateManyWithoutSchoolNestedInput
  }

  export type SchoolUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionConfig?: AdmissionFormConfigUncheckedUpdateOneWithoutSchoolNestedInput
    applications?: AdmissionApplicationUncheckedUpdateManyWithoutSchoolNestedInput
  }

  export type SchoolCreateManyInput = {
    id?: string
    name: string
    slug: string
    subdomain?: string | null
    customDomain?: string | null
    logo?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SchoolUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SchoolUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionFormConfigCreateInput = {
    id?: string
    fields: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    school: SchoolCreateNestedOneWithoutAdmissionConfigInput
  }

  export type AdmissionFormConfigUncheckedCreateInput = {
    id?: string
    schoolId: string
    fields: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionFormConfigUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    school?: SchoolUpdateOneRequiredWithoutAdmissionConfigNestedInput
  }

  export type AdmissionFormConfigUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    schoolId?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionFormConfigCreateManyInput = {
    id?: string
    schoolId: string
    fields: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionFormConfigUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionFormConfigUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    schoolId?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionApplicationCreateInput = {
    id?: string
    applicantName: string
    applicantEmail: string
    submissionData: JsonNullValueInput | InputJsonValue
    status?: $Enums.ApplicationStatus
    studentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    school: SchoolCreateNestedOneWithoutApplicationsInput
  }

  export type AdmissionApplicationUncheckedCreateInput = {
    id?: string
    schoolId: string
    applicantName: string
    applicantEmail: string
    submissionData: JsonNullValueInput | InputJsonValue
    status?: $Enums.ApplicationStatus
    studentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionApplicationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    applicantName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    submissionData?: JsonNullValueInput | InputJsonValue
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    school?: SchoolUpdateOneRequiredWithoutApplicationsNestedInput
  }

  export type AdmissionApplicationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    schoolId?: StringFieldUpdateOperationsInput | string
    applicantName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    submissionData?: JsonNullValueInput | InputJsonValue
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionApplicationCreateManyInput = {
    id?: string
    schoolId: string
    applicantName: string
    applicantEmail: string
    submissionData: JsonNullValueInput | InputJsonValue
    status?: $Enums.ApplicationStatus
    studentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionApplicationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    applicantName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    submissionData?: JsonNullValueInput | InputJsonValue
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionApplicationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    schoolId?: StringFieldUpdateOperationsInput | string
    applicantName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    submissionData?: JsonNullValueInput | InputJsonValue
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AdmissionFormConfigNullableScalarRelationFilter = {
    is?: AdmissionFormConfigWhereInput | null
    isNot?: AdmissionFormConfigWhereInput | null
  }

  export type AdmissionApplicationListRelationFilter = {
    every?: AdmissionApplicationWhereInput
    some?: AdmissionApplicationWhereInput
    none?: AdmissionApplicationWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AdmissionApplicationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SchoolCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    subdomain?: SortOrder
    customDomain?: SortOrder
    logo?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SchoolMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    subdomain?: SortOrder
    customDomain?: SortOrder
    logo?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SchoolMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    subdomain?: SortOrder
    customDomain?: SortOrder
    logo?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type SchoolScalarRelationFilter = {
    is?: SchoolWhereInput
    isNot?: SchoolWhereInput
  }

  export type AdmissionFormConfigCountOrderByAggregateInput = {
    id?: SortOrder
    schoolId?: SortOrder
    fields?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdmissionFormConfigMaxOrderByAggregateInput = {
    id?: SortOrder
    schoolId?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdmissionFormConfigMinOrderByAggregateInput = {
    id?: SortOrder
    schoolId?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
  }

  export type AdmissionApplicationCountOrderByAggregateInput = {
    id?: SortOrder
    schoolId?: SortOrder
    applicantName?: SortOrder
    applicantEmail?: SortOrder
    submissionData?: SortOrder
    status?: SortOrder
    studentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdmissionApplicationMaxOrderByAggregateInput = {
    id?: SortOrder
    schoolId?: SortOrder
    applicantName?: SortOrder
    applicantEmail?: SortOrder
    status?: SortOrder
    studentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AdmissionApplicationMinOrderByAggregateInput = {
    id?: SortOrder
    schoolId?: SortOrder
    applicantName?: SortOrder
    applicantEmail?: SortOrder
    status?: SortOrder
    studentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type EnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
  }

  export type AdmissionFormConfigCreateNestedOneWithoutSchoolInput = {
    create?: XOR<AdmissionFormConfigCreateWithoutSchoolInput, AdmissionFormConfigUncheckedCreateWithoutSchoolInput>
    connectOrCreate?: AdmissionFormConfigCreateOrConnectWithoutSchoolInput
    connect?: AdmissionFormConfigWhereUniqueInput
  }

  export type AdmissionApplicationCreateNestedManyWithoutSchoolInput = {
    create?: XOR<AdmissionApplicationCreateWithoutSchoolInput, AdmissionApplicationUncheckedCreateWithoutSchoolInput> | AdmissionApplicationCreateWithoutSchoolInput[] | AdmissionApplicationUncheckedCreateWithoutSchoolInput[]
    connectOrCreate?: AdmissionApplicationCreateOrConnectWithoutSchoolInput | AdmissionApplicationCreateOrConnectWithoutSchoolInput[]
    createMany?: AdmissionApplicationCreateManySchoolInputEnvelope
    connect?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
  }

  export type AdmissionFormConfigUncheckedCreateNestedOneWithoutSchoolInput = {
    create?: XOR<AdmissionFormConfigCreateWithoutSchoolInput, AdmissionFormConfigUncheckedCreateWithoutSchoolInput>
    connectOrCreate?: AdmissionFormConfigCreateOrConnectWithoutSchoolInput
    connect?: AdmissionFormConfigWhereUniqueInput
  }

  export type AdmissionApplicationUncheckedCreateNestedManyWithoutSchoolInput = {
    create?: XOR<AdmissionApplicationCreateWithoutSchoolInput, AdmissionApplicationUncheckedCreateWithoutSchoolInput> | AdmissionApplicationCreateWithoutSchoolInput[] | AdmissionApplicationUncheckedCreateWithoutSchoolInput[]
    connectOrCreate?: AdmissionApplicationCreateOrConnectWithoutSchoolInput | AdmissionApplicationCreateOrConnectWithoutSchoolInput[]
    createMany?: AdmissionApplicationCreateManySchoolInputEnvelope
    connect?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AdmissionFormConfigUpdateOneWithoutSchoolNestedInput = {
    create?: XOR<AdmissionFormConfigCreateWithoutSchoolInput, AdmissionFormConfigUncheckedCreateWithoutSchoolInput>
    connectOrCreate?: AdmissionFormConfigCreateOrConnectWithoutSchoolInput
    upsert?: AdmissionFormConfigUpsertWithoutSchoolInput
    disconnect?: AdmissionFormConfigWhereInput | boolean
    delete?: AdmissionFormConfigWhereInput | boolean
    connect?: AdmissionFormConfigWhereUniqueInput
    update?: XOR<XOR<AdmissionFormConfigUpdateToOneWithWhereWithoutSchoolInput, AdmissionFormConfigUpdateWithoutSchoolInput>, AdmissionFormConfigUncheckedUpdateWithoutSchoolInput>
  }

  export type AdmissionApplicationUpdateManyWithoutSchoolNestedInput = {
    create?: XOR<AdmissionApplicationCreateWithoutSchoolInput, AdmissionApplicationUncheckedCreateWithoutSchoolInput> | AdmissionApplicationCreateWithoutSchoolInput[] | AdmissionApplicationUncheckedCreateWithoutSchoolInput[]
    connectOrCreate?: AdmissionApplicationCreateOrConnectWithoutSchoolInput | AdmissionApplicationCreateOrConnectWithoutSchoolInput[]
    upsert?: AdmissionApplicationUpsertWithWhereUniqueWithoutSchoolInput | AdmissionApplicationUpsertWithWhereUniqueWithoutSchoolInput[]
    createMany?: AdmissionApplicationCreateManySchoolInputEnvelope
    set?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    disconnect?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    delete?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    connect?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    update?: AdmissionApplicationUpdateWithWhereUniqueWithoutSchoolInput | AdmissionApplicationUpdateWithWhereUniqueWithoutSchoolInput[]
    updateMany?: AdmissionApplicationUpdateManyWithWhereWithoutSchoolInput | AdmissionApplicationUpdateManyWithWhereWithoutSchoolInput[]
    deleteMany?: AdmissionApplicationScalarWhereInput | AdmissionApplicationScalarWhereInput[]
  }

  export type AdmissionFormConfigUncheckedUpdateOneWithoutSchoolNestedInput = {
    create?: XOR<AdmissionFormConfigCreateWithoutSchoolInput, AdmissionFormConfigUncheckedCreateWithoutSchoolInput>
    connectOrCreate?: AdmissionFormConfigCreateOrConnectWithoutSchoolInput
    upsert?: AdmissionFormConfigUpsertWithoutSchoolInput
    disconnect?: AdmissionFormConfigWhereInput | boolean
    delete?: AdmissionFormConfigWhereInput | boolean
    connect?: AdmissionFormConfigWhereUniqueInput
    update?: XOR<XOR<AdmissionFormConfigUpdateToOneWithWhereWithoutSchoolInput, AdmissionFormConfigUpdateWithoutSchoolInput>, AdmissionFormConfigUncheckedUpdateWithoutSchoolInput>
  }

  export type AdmissionApplicationUncheckedUpdateManyWithoutSchoolNestedInput = {
    create?: XOR<AdmissionApplicationCreateWithoutSchoolInput, AdmissionApplicationUncheckedCreateWithoutSchoolInput> | AdmissionApplicationCreateWithoutSchoolInput[] | AdmissionApplicationUncheckedCreateWithoutSchoolInput[]
    connectOrCreate?: AdmissionApplicationCreateOrConnectWithoutSchoolInput | AdmissionApplicationCreateOrConnectWithoutSchoolInput[]
    upsert?: AdmissionApplicationUpsertWithWhereUniqueWithoutSchoolInput | AdmissionApplicationUpsertWithWhereUniqueWithoutSchoolInput[]
    createMany?: AdmissionApplicationCreateManySchoolInputEnvelope
    set?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    disconnect?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    delete?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    connect?: AdmissionApplicationWhereUniqueInput | AdmissionApplicationWhereUniqueInput[]
    update?: AdmissionApplicationUpdateWithWhereUniqueWithoutSchoolInput | AdmissionApplicationUpdateWithWhereUniqueWithoutSchoolInput[]
    updateMany?: AdmissionApplicationUpdateManyWithWhereWithoutSchoolInput | AdmissionApplicationUpdateManyWithWhereWithoutSchoolInput[]
    deleteMany?: AdmissionApplicationScalarWhereInput | AdmissionApplicationScalarWhereInput[]
  }

  export type SchoolCreateNestedOneWithoutAdmissionConfigInput = {
    create?: XOR<SchoolCreateWithoutAdmissionConfigInput, SchoolUncheckedCreateWithoutAdmissionConfigInput>
    connectOrCreate?: SchoolCreateOrConnectWithoutAdmissionConfigInput
    connect?: SchoolWhereUniqueInput
  }

  export type SchoolUpdateOneRequiredWithoutAdmissionConfigNestedInput = {
    create?: XOR<SchoolCreateWithoutAdmissionConfigInput, SchoolUncheckedCreateWithoutAdmissionConfigInput>
    connectOrCreate?: SchoolCreateOrConnectWithoutAdmissionConfigInput
    upsert?: SchoolUpsertWithoutAdmissionConfigInput
    connect?: SchoolWhereUniqueInput
    update?: XOR<XOR<SchoolUpdateToOneWithWhereWithoutAdmissionConfigInput, SchoolUpdateWithoutAdmissionConfigInput>, SchoolUncheckedUpdateWithoutAdmissionConfigInput>
  }

  export type SchoolCreateNestedOneWithoutApplicationsInput = {
    create?: XOR<SchoolCreateWithoutApplicationsInput, SchoolUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: SchoolCreateOrConnectWithoutApplicationsInput
    connect?: SchoolWhereUniqueInput
  }

  export type EnumApplicationStatusFieldUpdateOperationsInput = {
    set?: $Enums.ApplicationStatus
  }

  export type SchoolUpdateOneRequiredWithoutApplicationsNestedInput = {
    create?: XOR<SchoolCreateWithoutApplicationsInput, SchoolUncheckedCreateWithoutApplicationsInput>
    connectOrCreate?: SchoolCreateOrConnectWithoutApplicationsInput
    upsert?: SchoolUpsertWithoutApplicationsInput
    connect?: SchoolWhereUniqueInput
    update?: XOR<XOR<SchoolUpdateToOneWithWhereWithoutApplicationsInput, SchoolUpdateWithoutApplicationsInput>, SchoolUncheckedUpdateWithoutApplicationsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumApplicationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusFilter<$PrismaModel> | $Enums.ApplicationStatus
  }

  export type NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ApplicationStatus | EnumApplicationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ApplicationStatus[] | ListEnumApplicationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumApplicationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ApplicationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumApplicationStatusFilter<$PrismaModel>
    _max?: NestedEnumApplicationStatusFilter<$PrismaModel>
  }

  export type AdmissionFormConfigCreateWithoutSchoolInput = {
    id?: string
    fields: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionFormConfigUncheckedCreateWithoutSchoolInput = {
    id?: string
    fields: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionFormConfigCreateOrConnectWithoutSchoolInput = {
    where: AdmissionFormConfigWhereUniqueInput
    create: XOR<AdmissionFormConfigCreateWithoutSchoolInput, AdmissionFormConfigUncheckedCreateWithoutSchoolInput>
  }

  export type AdmissionApplicationCreateWithoutSchoolInput = {
    id?: string
    applicantName: string
    applicantEmail: string
    submissionData: JsonNullValueInput | InputJsonValue
    status?: $Enums.ApplicationStatus
    studentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionApplicationUncheckedCreateWithoutSchoolInput = {
    id?: string
    applicantName: string
    applicantEmail: string
    submissionData: JsonNullValueInput | InputJsonValue
    status?: $Enums.ApplicationStatus
    studentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionApplicationCreateOrConnectWithoutSchoolInput = {
    where: AdmissionApplicationWhereUniqueInput
    create: XOR<AdmissionApplicationCreateWithoutSchoolInput, AdmissionApplicationUncheckedCreateWithoutSchoolInput>
  }

  export type AdmissionApplicationCreateManySchoolInputEnvelope = {
    data: AdmissionApplicationCreateManySchoolInput | AdmissionApplicationCreateManySchoolInput[]
    skipDuplicates?: boolean
  }

  export type AdmissionFormConfigUpsertWithoutSchoolInput = {
    update: XOR<AdmissionFormConfigUpdateWithoutSchoolInput, AdmissionFormConfigUncheckedUpdateWithoutSchoolInput>
    create: XOR<AdmissionFormConfigCreateWithoutSchoolInput, AdmissionFormConfigUncheckedCreateWithoutSchoolInput>
    where?: AdmissionFormConfigWhereInput
  }

  export type AdmissionFormConfigUpdateToOneWithWhereWithoutSchoolInput = {
    where?: AdmissionFormConfigWhereInput
    data: XOR<AdmissionFormConfigUpdateWithoutSchoolInput, AdmissionFormConfigUncheckedUpdateWithoutSchoolInput>
  }

  export type AdmissionFormConfigUpdateWithoutSchoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionFormConfigUncheckedUpdateWithoutSchoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    fields?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionApplicationUpsertWithWhereUniqueWithoutSchoolInput = {
    where: AdmissionApplicationWhereUniqueInput
    update: XOR<AdmissionApplicationUpdateWithoutSchoolInput, AdmissionApplicationUncheckedUpdateWithoutSchoolInput>
    create: XOR<AdmissionApplicationCreateWithoutSchoolInput, AdmissionApplicationUncheckedCreateWithoutSchoolInput>
  }

  export type AdmissionApplicationUpdateWithWhereUniqueWithoutSchoolInput = {
    where: AdmissionApplicationWhereUniqueInput
    data: XOR<AdmissionApplicationUpdateWithoutSchoolInput, AdmissionApplicationUncheckedUpdateWithoutSchoolInput>
  }

  export type AdmissionApplicationUpdateManyWithWhereWithoutSchoolInput = {
    where: AdmissionApplicationScalarWhereInput
    data: XOR<AdmissionApplicationUpdateManyMutationInput, AdmissionApplicationUncheckedUpdateManyWithoutSchoolInput>
  }

  export type AdmissionApplicationScalarWhereInput = {
    AND?: AdmissionApplicationScalarWhereInput | AdmissionApplicationScalarWhereInput[]
    OR?: AdmissionApplicationScalarWhereInput[]
    NOT?: AdmissionApplicationScalarWhereInput | AdmissionApplicationScalarWhereInput[]
    id?: StringFilter<"AdmissionApplication"> | string
    schoolId?: StringFilter<"AdmissionApplication"> | string
    applicantName?: StringFilter<"AdmissionApplication"> | string
    applicantEmail?: StringFilter<"AdmissionApplication"> | string
    submissionData?: JsonFilter<"AdmissionApplication">
    status?: EnumApplicationStatusFilter<"AdmissionApplication"> | $Enums.ApplicationStatus
    studentId?: StringNullableFilter<"AdmissionApplication"> | string | null
    createdAt?: DateTimeFilter<"AdmissionApplication"> | Date | string
    updatedAt?: DateTimeFilter<"AdmissionApplication"> | Date | string
  }

  export type SchoolCreateWithoutAdmissionConfigInput = {
    id?: string
    name: string
    slug: string
    subdomain?: string | null
    customDomain?: string | null
    logo?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: AdmissionApplicationCreateNestedManyWithoutSchoolInput
  }

  export type SchoolUncheckedCreateWithoutAdmissionConfigInput = {
    id?: string
    name: string
    slug: string
    subdomain?: string | null
    customDomain?: string | null
    logo?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    applications?: AdmissionApplicationUncheckedCreateNestedManyWithoutSchoolInput
  }

  export type SchoolCreateOrConnectWithoutAdmissionConfigInput = {
    where: SchoolWhereUniqueInput
    create: XOR<SchoolCreateWithoutAdmissionConfigInput, SchoolUncheckedCreateWithoutAdmissionConfigInput>
  }

  export type SchoolUpsertWithoutAdmissionConfigInput = {
    update: XOR<SchoolUpdateWithoutAdmissionConfigInput, SchoolUncheckedUpdateWithoutAdmissionConfigInput>
    create: XOR<SchoolCreateWithoutAdmissionConfigInput, SchoolUncheckedCreateWithoutAdmissionConfigInput>
    where?: SchoolWhereInput
  }

  export type SchoolUpdateToOneWithWhereWithoutAdmissionConfigInput = {
    where?: SchoolWhereInput
    data: XOR<SchoolUpdateWithoutAdmissionConfigInput, SchoolUncheckedUpdateWithoutAdmissionConfigInput>
  }

  export type SchoolUpdateWithoutAdmissionConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: AdmissionApplicationUpdateManyWithoutSchoolNestedInput
  }

  export type SchoolUncheckedUpdateWithoutAdmissionConfigInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    applications?: AdmissionApplicationUncheckedUpdateManyWithoutSchoolNestedInput
  }

  export type SchoolCreateWithoutApplicationsInput = {
    id?: string
    name: string
    slug: string
    subdomain?: string | null
    customDomain?: string | null
    logo?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    admissionConfig?: AdmissionFormConfigCreateNestedOneWithoutSchoolInput
  }

  export type SchoolUncheckedCreateWithoutApplicationsInput = {
    id?: string
    name: string
    slug: string
    subdomain?: string | null
    customDomain?: string | null
    logo?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    admissionConfig?: AdmissionFormConfigUncheckedCreateNestedOneWithoutSchoolInput
  }

  export type SchoolCreateOrConnectWithoutApplicationsInput = {
    where: SchoolWhereUniqueInput
    create: XOR<SchoolCreateWithoutApplicationsInput, SchoolUncheckedCreateWithoutApplicationsInput>
  }

  export type SchoolUpsertWithoutApplicationsInput = {
    update: XOR<SchoolUpdateWithoutApplicationsInput, SchoolUncheckedUpdateWithoutApplicationsInput>
    create: XOR<SchoolCreateWithoutApplicationsInput, SchoolUncheckedCreateWithoutApplicationsInput>
    where?: SchoolWhereInput
  }

  export type SchoolUpdateToOneWithWhereWithoutApplicationsInput = {
    where?: SchoolWhereInput
    data: XOR<SchoolUpdateWithoutApplicationsInput, SchoolUncheckedUpdateWithoutApplicationsInput>
  }

  export type SchoolUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionConfig?: AdmissionFormConfigUpdateOneWithoutSchoolNestedInput
  }

  export type SchoolUncheckedUpdateWithoutApplicationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    subdomain?: NullableStringFieldUpdateOperationsInput | string | null
    customDomain?: NullableStringFieldUpdateOperationsInput | string | null
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    admissionConfig?: AdmissionFormConfigUncheckedUpdateOneWithoutSchoolNestedInput
  }

  export type AdmissionApplicationCreateManySchoolInput = {
    id?: string
    applicantName: string
    applicantEmail: string
    submissionData: JsonNullValueInput | InputJsonValue
    status?: $Enums.ApplicationStatus
    studentId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AdmissionApplicationUpdateWithoutSchoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    applicantName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    submissionData?: JsonNullValueInput | InputJsonValue
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionApplicationUncheckedUpdateWithoutSchoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    applicantName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    submissionData?: JsonNullValueInput | InputJsonValue
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdmissionApplicationUncheckedUpdateManyWithoutSchoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    applicantName?: StringFieldUpdateOperationsInput | string
    applicantEmail?: StringFieldUpdateOperationsInput | string
    submissionData?: JsonNullValueInput | InputJsonValue
    status?: EnumApplicationStatusFieldUpdateOperationsInput | $Enums.ApplicationStatus
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}