if(!self.define){let e,s={};const c=(c,n)=>(c=new URL(c+".js",n).href,s[c]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=s,document.head.appendChild(e)}else e=c,importScripts(c),s()})).then((()=>{let e=s[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(n,a)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let t={};const r=e=>c(e,i),o={module:{uri:i},exports:t,require:r};s[i]=Promise.all(n.map((e=>o[e]||r(e)))).then((e=>(a(...e),t)))}}define(["./workbox-6a1bf588"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/KgQSgc63U1uzrTO2WFkUD/_buildManifest.js",revision:"8cd1f128e07e5d3623e803b08f2ad13e"},{url:"/_next/static/KgQSgc63U1uzrTO2WFkUD/_ssgManifest.js",revision:"5352cb582146311d1540f6075d1f265e"},{url:"/_next/static/chunks/0f24dcc5-bb73453142a5c31e.js",revision:"bb73453142a5c31e"},{url:"/_next/static/chunks/186068ac-2ac0c72ecc0790f9.js",revision:"2ac0c72ecc0790f9"},{url:"/_next/static/chunks/212-9346c4196f1ec015.js",revision:"9346c4196f1ec015"},{url:"/_next/static/chunks/280-bb061d3556482c92.js",revision:"bb061d3556482c92"},{url:"/_next/static/chunks/396-d9ec074ef085cfee.js",revision:"d9ec074ef085cfee"},{url:"/_next/static/chunks/3f2376d1-077a809b7a5f9c67.js",revision:"077a809b7a5f9c67"},{url:"/_next/static/chunks/451-b2a0840c51eee58c.js",revision:"b2a0840c51eee58c"},{url:"/_next/static/chunks/550-27f0506a85ec78e7.js",revision:"27f0506a85ec78e7"},{url:"/_next/static/chunks/675-70343703159d5baf.js",revision:"70343703159d5baf"},{url:"/_next/static/chunks/7112840a-769a9a155cb5766c.js",revision:"769a9a155cb5766c"},{url:"/_next/static/chunks/75fc9c18-4275c2966b1879ef.js",revision:"4275c2966b1879ef"},{url:"/_next/static/chunks/829-13d48bdcc29f4d16.js",revision:"13d48bdcc29f4d16"},{url:"/_next/static/chunks/8eb7616c-d495bfa641a4ac5b.js",revision:"d495bfa641a4ac5b"},{url:"/_next/static/chunks/framework-9b5d6ec4444c80fa.js",revision:"9b5d6ec4444c80fa"},{url:"/_next/static/chunks/main-a2196cfdfba7b46d.js",revision:"a2196cfdfba7b46d"},{url:"/_next/static/chunks/pages/Chats-e24e6db3cd28d093.js",revision:"e24e6db3cd28d093"},{url:"/_next/static/chunks/pages/_app-f2712a840976ad96.js",revision:"f2712a840976ad96"},{url:"/_next/static/chunks/pages/_error-7397496ca01950b1.js",revision:"7397496ca01950b1"},{url:"/_next/static/chunks/pages/auth/signin-3c2829c40064e096.js",revision:"3c2829c40064e096"},{url:"/_next/static/chunks/pages/chat/%5Bid%5D-0a22c017e77fe8c6.js",revision:"0a22c017e77fe8c6"},{url:"/_next/static/chunks/pages/comment/%5Bpostid%5D-a9cb9f74a8a886de.js",revision:"a9cb9f74a8a886de"},{url:"/_next/static/chunks/pages/index-3610b9340cc17168.js",revision:"3610b9340cc17168"},{url:"/_next/static/chunks/pages/like/%5Bpostid%5D-e5da999c39856419.js",revision:"e5da999c39856419"},{url:"/_next/static/chunks/pages/login-9f3ac8021ccff7dd.js",revision:"9f3ac8021ccff7dd"},{url:"/_next/static/chunks/pages/profile/%5Bprofile%5D-b55a3a96f96f58ea.js",revision:"b55a3a96f96f58ea"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-246c5233b889db27.js",revision:"246c5233b889db27"},{url:"/_next/static/css/0afb1727238b2205.css",revision:"0afb1727238b2205"},{url:"/_next/static/css/360f79b2b5ecaffd.css",revision:"360f79b2b5ecaffd"},{url:"/_next/static/media/userimg.1262d2ad.jpg",revision:"3812e3d2d41a521470bf1cc7e24e78ad"},{url:"/favicon.ico",revision:"327b5a98289c7f6f95688b2ce5487a45"},{url:"/icon-192x192.png",revision:"ed2677be233c1866ff8f9bcec1355f08"},{url:"/icon-256x256.png",revision:"35ab7bd79a92997fb34384eabdb33394"},{url:"/icon-384x384.png",revision:"6b04a2eba5c0f117427c148358498bb3"},{url:"/icon-512x512.png",revision:"327b5a98289c7f6f95688b2ce5487a45"},{url:"/manifest.json",revision:"6da66118ed0c05751fe0078c7fcb6778"},{url:"/userimg.jpg",revision:"3812e3d2d41a521470bf1cc7e24e78ad"},{url:"/vercel.svg",revision:"26bf2d0adaf1028a4d4c6ee77005e819"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:c,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
