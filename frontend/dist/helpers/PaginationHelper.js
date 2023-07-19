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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllPages = void 0;
function fetchAllPages(initialSkip, take, fetchPage) {
    return __awaiter(this, void 0, void 0, function* () {
        let skip = initialSkip;
        let allData = [];
        while (true) {
            const response = yield fetchPage(take, skip);
            const { records } = response.data;
            if (response.data._pagination.count <= skip) {
                // Reached the last page, exit the loop
                break;
            }
            allData = allData.concat(records);
            skip += take;
        }
        return allData;
    });
}
exports.fetchAllPages = fetchAllPages;
//# sourceMappingURL=PaginationHelper.js.map