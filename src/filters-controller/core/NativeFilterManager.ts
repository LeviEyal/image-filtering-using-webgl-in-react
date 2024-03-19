// type Filter = [string, ...number[]];

// export class NativeFilterManager {
//     private _filterChain: Filter[];

//     constructor() {
//         this._filterChain = [];
//     }

//     addFilter(filter: Filter) {
//         this._filterChain.push(filter);
//     }
    
//     reset() {
//         this._filterChain = [];
//     }

//     apply(image: ImageData) {
//         let filteredImage = image;
//         for (const filter of this._filterChain) {
//             filteredImage = this._applyFilter(filter, filteredImage);
//         }
//         return filteredImage;
//     }

//     private _applyFilter(filter: Filter, image: ImageData) {
//         switch (filter.name) {
//             case 'sharpen':
//                 return this._sharpen(image, filter.args as number);
//             case 'highPenetrationFilter':
//                 return this._highPenetrationFilter(image, filter.args as number);
//             case 'negative':
//                 return this._negative(image);
//             case 'blackWhite':
//                 return this._blackWhite(image);
//             case 'contrast':
//                 return this._contrast(image, filter.args as number);
//             case 'osFilter':
//                 return this._osFilter(image, filter.args as number[]);
//             case 'o2Filter':
//                 return this._o2Filter(image, filter.args as number[]);
//             case 'senFilter':
//                 return this._senFilter(image);
//             default:
//                 return image;
//         }
//     }

//     private _sharpen(image: ImageData, factor: number) {
//         return image;
//     }

//     private _highPenetrationFilter(image: ImageData, factor: number) {
//         return image;
//     }
// }