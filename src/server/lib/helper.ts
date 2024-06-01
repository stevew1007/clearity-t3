
// export default function buildFullPath(baseURL: string, requestedURL: string) {
//     let requested = new URL(requestedURL);
//     if (baseURL && !isAbsoluteURL(requestedURL)) {
//       return combineURLs(baseURL, requestedURL);
//     }
//     return requestedURL;
//   }

//   function combineURLs(baseURL, relativeURL) {
//     return relativeURL
//       ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
//       : baseURL;
//   }