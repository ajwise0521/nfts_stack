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
exports.__esModule = true;
var lodash_1 = require("lodash");
var howRare_1 = require("../lambda/controllers/howRare");
var dotenv_1 = require("dotenv");
var fs = require("fs");
var misc_1 = require("./misc");
(0, dotenv_1.config)();
var ajsWallets = ['HcbnbYctUWHFndNQGpNGnicDpDn2fSt3AscfrM3j7JT8', '3fcREq7WrSXYpqm2siXhPUR8iWsTovnkdm18DwqXVYnt', '9tZgnXncsbCahHn8nbxe952Jayn5apMkQtyvyVYi3RWR'];
var ttUA = ['TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb', '6NA69K8LrN283crJyWkjYMujs9bgQ2BP2pneGp3D3m1e'];
var writeToFile = function (data) {
    fs.writeFile("test.json", JSON.stringify(data, null, 2), function (err) {
        if (err) {
            console.log(err);
        }
    });
};
var getHowRareCollection = function (collectionName) { return __awaiter(void 0, void 0, void 0, function () {
    var howRare, data, collectionData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                howRare = new howRare_1.HowRare();
                return [4 /*yield*/, howRare.getCollectionRank(collectionName)
                    // console.log(`tigers: ${JSON.stringify(data.result.data.items[0])}`)
                ];
            case 1:
                data = _a.sent();
                collectionData = data.result.data.items.reduce(function (entryMap, e) { return entryMap.set(e.id, __spreadArray(__spreadArray([], entryMap.get(e.id) || [], true), [e], false)); }, new Map());
                return [2 /*return*/, collectionData];
        }
    });
}); };
var handle = function (collectionName, collectionAddresses) { return __awaiter(void 0, void 0, void 0, function () {
    var collectionData, nfts1, nfts2, nfts3, groupedMap, updateAuth1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getHowRareCollection(collectionName)];
            case 1:
                collectionData = _a.sent();
                console.log(JSON.stringify(collectionData.get('3954')[0].rank));
                return [4 /*yield*/, (0, misc_1.getWalletsNfts)(ajsWallets[0])];
            case 2:
                nfts1 = _a.sent();
                return [4 /*yield*/, (0, misc_1.getWalletsNfts)(ajsWallets[1])];
            case 3:
                nfts2 = _a.sent();
                return [4 /*yield*/, (0, misc_1.getWalletsNfts)(ajsWallets[2])];
            case 4:
                nfts3 = _a.sent();
                nfts1 = nfts1.concat(nfts2);
                nfts1 = nfts1.concat(nfts3);
                groupedMap = nfts1.reduce(function (entryMap, e) { return entryMap.set(e.updateAuthority, __spreadArray(__spreadArray([], entryMap.get(e.updateAuthority) || [], true), [{ wallet: e.wallet, mint: e.mint, name: e.data.name, id: Number(e.data.name.split('#').pop()), rank: null }], false)); }, new Map());
                groupedMap.forEach(function (value, key, map) {
                    console.log(key + ": " + JSON.stringify(value.length));
                    console.log(value[0]);
                });
                updateAuth1 = groupedMap.get('TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb');
                updateAuth1 = updateAuth1.concat(groupedMap.get('6NA69K8LrN283crJyWkjYMujs9bgQ2BP2pneGp3D3m1e'));
                updateAuth1.forEach(function (nft) {
                    nft.rank = collectionData.get("" + nft.id)[0].rank;
                });
                console.log("please: " + updateAuth1.length);
                updateAuth1.sort(function (a, b) {
                    if ((0, lodash_1.isNil)(a.rank) || (0, lodash_1.isNil)(b.rank)) {
                        return 1;
                    }
                    return a.rank > b.rank ? -1 : 1;
                });
                writeToFile(updateAuth1);
                return [2 /*return*/];
        }
    });
}); };
var handler = function () { return __awaiter(void 0, void 0, void 0, function () {
    var nfts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, misc_1.getWalletsNfts)('9tZgnXncsbCahHn8nbxe952Jayn5apMkQtyvyVYi3RWR')];
            case 1:
                nfts = _a.sent();
                console.log(nfts);
                return [2 /*return*/];
        }
    });
}); };
handler();
