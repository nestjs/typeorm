"use strict";
var __decorate =
  (this && this.__decorate) ||
  function(decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_utils_1 = require("./typeorm.utils");
const fromPromise_1 = require("rxjs/observable/fromPromise");
let TypeOrmCoreModule = (TypeOrmCoreModule_1 = class TypeOrmCoreModule {
  static forRoot(options) {
    const connectionProvider = {
      provide: typeorm_utils_1.getConnectionToken(options),
      useFactory: () =>
        __awaiter(this, void 0, void 0, function*() {
          return yield fromPromise_1
            .fromPromise(typeorm_1.createConnection(options))
            .pipe(typeorm_utils_1.handleRetry)
            .toPromise();
        })
    };
    const entityManagerProvider = {
      provide: typeorm_utils_1.getEntityManagerToken(options),
      useFactory: connection => connection.manager,
      inject: [typeorm_utils_1.getConnectionToken(options)]
    };
    return {
      module: TypeOrmCoreModule_1,
      providers: [entityManagerProvider, connectionProvider],
      exports: [entityManagerProvider, connectionProvider]
    };
  }
});
TypeOrmCoreModule = TypeOrmCoreModule_1 = __decorate(
  [common_1.Global(), common_1.Module({})],
  TypeOrmCoreModule
);
exports.TypeOrmCoreModule = TypeOrmCoreModule;
var TypeOrmCoreModule_1;
