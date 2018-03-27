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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const typeorm_providers_1 = require("./typeorm.providers");
const typeorm_core_module_1 = require("./typeorm-core.module");
let TypeOrmModule = (TypeOrmModule_1 = class TypeOrmModule {
  static forRoot(options) {
    const providers = typeorm_providers_1.createTypeOrmProviders();
    return {
      module: TypeOrmModule_1,
      imports: [typeorm_core_module_1.TypeOrmCoreModule.forRoot(options)]
    };
  }
  static forFeature(entities = [], connection = "default") {
    const providers = typeorm_providers_1.createTypeOrmProviders(
      entities,
      connection
    );
    return {
      module: TypeOrmModule_1,
      providers: providers,
      exports: providers
    };
  }
});
TypeOrmModule = TypeOrmModule_1 = __decorate(
  [common_1.Module({})],
  TypeOrmModule
);
exports.TypeOrmModule = TypeOrmModule;
var TypeOrmModule_1;
