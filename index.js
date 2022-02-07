"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseFindByReference = void 0;
function MongooseFindByReference(schema) {
    if (schema.constructor.name !== 'Schema')
        throw new Error('参数 "schema" 的类型得是 "Schema"。\n param "schema" type must be "Schema".');
    schema.pre(['find', 'findOne'], function (next) {
        return __awaiter(this, void 0, void 0, function () {
            function getRefModel(obj) {
                var _a, _b;
                return (((obj === null || obj === void 0 ? void 0 : obj.instance) === 'ObjectID' &&
                    ((_b = (_a = obj.options) === null || _a === void 0 ? void 0 : _a.ref) === null || _b === void 0 ? void 0 : _b.length) &&
                    Object.keys(models).includes(obj.options.ref) &&
                    models[obj.options.ref]) ||
                    ((obj === null || obj === void 0 ? void 0 : obj.$embeddedSchemaType) && getRefModel(obj.$embeddedSchemaType)) ||
                    undefined);
            }
            var models, schema, loopUpdateCoditions, _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        models = this.model.db.models;
                        if (!models || Object.keys(models).length === 0)
                            throw new Error('访问到的 Model 数量为 0 或者不存在。\n The number of models accessed is 0 or does not exist.');
                        schema = this.model.schema;
                        loopUpdateCoditions = function (prevPaths, conditions, cSchema) {
                            if (cSchema === void 0) { cSchema = schema; }
                            return __awaiter(_this, void 0, void 0, function () {
                                var result, prevPathsValue, _loop_1, _i, _a, _b, paths, value, state_1;
                                var _this = this;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (typeof conditions !== 'object' ||
                                                conditions === null ||
                                                Object.keys(conditions).length === 0)
                                                return [2 /*return*/, conditions];
                                            result = {};
                                            prevPathsValue = cSchema.path(prevPaths.join('.'));
                                            _loop_1 = function (paths, value) {
                                                var currentPathsArray, currentPathsString, currentPathsValue, currentModel, subCoditions, ids, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                                                var _p, _q, _r, _s;
                                                return __generator(this, function (_t) {
                                                    switch (_t.label) {
                                                        case 0:
                                                            if (paths.includes('.'))
                                                                _p = Object.entries(__spreadArray(__spreadArray([], paths.split('.'), true), [value], false).reduceRight(function (previousValue, currentValue) {
                                                                    var _a;
                                                                    return currentValue === '$'
                                                                        ? previousValue
                                                                        : (_a = {}, _a[currentValue] = previousValue, _a);
                                                                }))[0], paths = _p[0], value = _p[1];
                                                            currentPathsArray = paths.startsWith('$')
                                                                ? paths === '$'
                                                                    ? prevPaths
                                                                    : []
                                                                : __spreadArray(__spreadArray([], prevPaths, true), [paths], false);
                                                            currentPathsString = currentPathsArray.join('.');
                                                            currentPathsValue = cSchema.path(currentPathsString);
                                                            if (!!paths.startsWith('$')) return [3 /*break*/, 3];
                                                            if (!(currentPathsValue === undefined)) return [3 /*break*/, 3];
                                                            currentModel = getRefModel(prevPathsValue);
                                                            if (!currentModel) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, loopUpdateCoditions([], value, currentModel.schema)];
                                                        case 1:
                                                            subCoditions = _t.sent();
                                                            if (!subCoditions) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, currentModel.find((_q = {}, _q[paths] = subCoditions, _q), '_id')];
                                                        case 2:
                                                            ids = (_t.sent()).map(function (v) { return v._id; });
                                                            return [2 /*return*/, { value: { $in: ids } }];
                                                        case 3:
                                                            if (!Array.isArray(value)) return [3 /*break*/, 5];
                                                            _e = (_d = Object).assign;
                                                            _f = [result];
                                                            _r = {};
                                                            _g = paths;
                                                            return [4 /*yield*/, Promise.all(value.map(function (v) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                                                    switch (_a.label) {
                                                                        case 0: return [4 /*yield*/, loopUpdateCoditions(currentPathsArray, v, cSchema)];
                                                                        case 1: return [2 /*return*/, _a.sent()];
                                                                    }
                                                                }); }); }))];
                                                        case 4:
                                                            _e.apply(_d, _f.concat([(_r[_g] = _t.sent(),
                                                                    _r)]));
                                                            return [3 /*break*/, 8];
                                                        case 5:
                                                            if (!(typeof value === 'object' &&
                                                                value !== null &&
                                                                Object.keys(value).length > 0)) return [3 /*break*/, 7];
                                                            _j = (_h = Object).assign;
                                                            _k = [result];
                                                            _s = {};
                                                            _l = paths;
                                                            _o = (_m = Object).fromEntries;
                                                            return [4 /*yield*/, Promise.all(Object.entries(value).map(function (_a) {
                                                                    var k = _a[0], v = _a[1];
                                                                    return __awaiter(_this, void 0, void 0, function () {
                                                                        var _b, _c;
                                                                        var _d;
                                                                        return __generator(this, function (_e) {
                                                                            switch (_e.label) {
                                                                                case 0:
                                                                                    _c = (_b = Object).entries;
                                                                                    return [4 /*yield*/, loopUpdateCoditions(currentPathsArray, (_d = {},
                                                                                            _d[k] = v,
                                                                                            _d), cSchema)];
                                                                                case 1: return [2 /*return*/, _c.apply(_b, [_e.sent()])[0]];
                                                                            }
                                                                        });
                                                                    });
                                                                }))];
                                                        case 6:
                                                            _j.apply(_h, _k.concat([(_s[_l] = _o.apply(_m, [_t.sent()]),
                                                                    _s)]));
                                                            return [3 /*break*/, 8];
                                                        case 7:
                                                            result[paths] = value;
                                                            _t.label = 8;
                                                        case 8: return [2 /*return*/];
                                                    }
                                                });
                                            };
                                            _i = 0, _a = Object.entries(conditions);
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                                            _b = _a[_i], paths = _b[0], value = _b[1];
                                            return [5 /*yield**/, _loop_1(paths, value)];
                                        case 2:
                                            state_1 = _c.sent();
                                            if (typeof state_1 === "object")
                                                return [2 /*return*/, state_1.value];
                                            _c.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4: return [2 /*return*/, result];
                                    }
                                });
                            });
                        };
                        _a = this;
                        return [4 /*yield*/, loopUpdateCoditions([], this._conditions)];
                    case 1:
                        _a._conditions = _b.sent();
                        next();
                        return [2 /*return*/];
                }
            });
        });
    });
}
exports.MongooseFindByReference = MongooseFindByReference;
