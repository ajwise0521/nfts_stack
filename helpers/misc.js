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
exports.getWalletsNfts = exports.postSaleToDiscord = exports.produceSqsMessage = void 0;
var aws_sdk_1 = require("aws-sdk");
var axios_1 = require("axios");
var solanaWeb3 = require("@solana/web3.js");
var solNfts = require("@nfteyez/sol-rayz");
var produceSqsMessage = function (body, attributes, sqsUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var sqs, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                sqs = new aws_sdk_1.SQS({
                    region: 'us-east-1'
                });
                return [4 /*yield*/, sqs.sendMessage({
                        MessageBody: body,
                        QueueUrl: sqsUrl,
                        MessageGroupId: 'CarhaulAdapterFailures',
                        MessageAttributes: mapMessageAttributes(attributes)
                    }).promise()];
            case 1:
                response = _a.sent();
                console.log("sqs response: " + JSON.stringify(response));
                return [2 /*return*/];
        }
    });
}); };
exports.produceSqsMessage = produceSqsMessage;
var mapMessageAttributes = function (messageAttributes) {
    var attributesMap = {};
    messageAttributes.forEach(function (attribute) {
        attributesMap[attribute.name] = {
            DataType: "String",
            StringValue: attribute.stringValue
        };
    });
    return attributesMap;
};
var postSaleToDiscord = function (title, price, date, signature, imageURL, collectionConfig) { return __awaiter(void 0, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1["default"].post(collectionConfig.webhookUrl, {
                        "username": "" + collectionConfig.user,
                        "avatar_url": "" + collectionConfig.userAvatar,
                        "embeds": [
                            {
                                "author": {
                                    "name": "" + collectionConfig.authorName,
                                    "url": "" + collectionConfig.authorUrl,
                                    "icon_url": "" + collectionConfig.authorIconUrl
                                },
                                "title": "" + collectionConfig.title,
                                "description": "" + collectionConfig.description,
                                "color": 15258703,
                                "fields": [
                                    {
                                        "name": "Price",
                                        "value": price + " SOL",
                                        "inline": true
                                    },
                                    {
                                        "name": "Date",
                                        "value": date + " CST",
                                        "inline": true
                                    },
                                    {
                                        "name": "Explorer",
                                        "value": "http://explorer.solana.com/tx/" + signature
                                    }
                                ],
                                "image": {
                                    "url": "" + imageURL
                                },
                                "footer": {
                                    "text": "Woah! So cool! :smirk:",
                                    "icon_url": "https://i.imgur.com/fKL31aD.jpg"
                                }
                            }
                        ]
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                console.log('error posting to discord: ');
                return [2 /*return*/];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.postSaleToDiscord = postSaleToDiscord;
var getWalletsNfts = function (wallet) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, walletNfts, groupedMap;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                connection = solNfts.createConnectionConfig(solanaWeb3.clusterApiUrl("mainnet-beta"));
                return [4 /*yield*/, solNfts.getParsedNftAccountsByOwner({
                        publicAddress: wallet,
                        connection: connection
                    })];
            case 1:
                walletNfts = _a.sent();
                groupedMap = walletNfts.reduce(function (entryMap, e) { return entryMap.set(e.updateAuthority, __spreadArray(__spreadArray([], entryMap.get(e.updateAuthority) || [], true), [{ mint: e.mint, name: e.data.name, rank: null }], false)); }, new Map());
                return [2 /*return*/, {
                        totalCount: walletNfts.length,
                        collectionCount: groupedMap.keys.length,
                        nfts: groupedMap
                    }];
        }
    });
}); };
exports.getWalletsNfts = getWalletsNfts;
