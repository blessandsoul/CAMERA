// Node.js script to scrape all 128 product pages from netis.ge
// Run with: node scrape_products.js

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CATALOG_URL = 'https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/?items_per_page=128';

const PRODUCT_URLS = [
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/5mp-fixed-ir-fisheye-camera-tiandy-tc-c35vn/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ic-03247/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/wi-fi-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/tenda-rh9-wca-ip-camera-with-2-lens-3mp-fixed-4mm-3mp-pt-6mm/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-16x-lighthunter-network-ptz-dome-camera-5-80mm-uniview-ipc6412lr-x16-vg/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/wi-fi-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/3mp-indoor-pan-and-tilt-wi-fi-camera-4mm-uniview-uho-s2e-m3/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-ir-network-indoor-mini-ptz-dome-camera-2-7-13-5mm-uniview-ipc6412lr-x5upw-vg/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ic-01365/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-hd-ir-fixed-mini-bullet-network-camera-4-0-uniview-ipc2122lb-sf40k-a/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4mp-4mm-mini-fixed-bullet-network-camera-sd-card-mic-uniview-ipc2124lb-adf40km-h/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4k-mini-fixed-bullet-network-camera-4mm-uniview-ipc2128le-adf40km-g/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4mp-hd-mini-ir-fixed-bullet-network-camera-4mm-uniview-ipc2124le-adf40km-g/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-super-starlight-fixed-bullet-network-camera-4-0mm-uniview-ipc2222er5-dupf40-c/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4mp-hd-intelligent-80m-ir-fixed-bullet-network-camera-4mm-uniview-ipc2314sb-adf40km-i0/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/5mp-hd-mini-ir-fixed-bullet-network-camera-2-8mm-uniview-ipc2125le-adf40km-g/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4mp-hd-intelligent-light-and-audible-warning-fixed-bullet-network-camera-2-8mm-uniview-ipc2124sb-adf40kmc-i0/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-hd-wdr-fixed-ir-bullet-network-camera-4mm-uniview-ipc2122lb-adf40km-g/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-mini-fixed-bullet-network-camera-4mm-uniview-ipc2122lb-sf40-a/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4mp-hd-intelligent-lighthunter-ir-fixed-mini-dome-camera-2-8mm-uniview-ipc314sb-adf28k-i0/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-minifixed-bullet-network-camera-4mm-uniview-ipc2122sr3-pf40-c/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/wi-fi-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/tenda-cp3-pro-3mp-home-smart-wi-fi-camera-with-360-rotation-built-in-microphone-and-speaker/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/wi-fi-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/2mp-hd-wifi-bullet-network-camera-2-8mm-uniview-uho-b1r-m2f4/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4mp-sd-card-mini-fixed-bullet-network-camera-2-8mm-uniview-ipc2124sr3-adpf40m-f/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4g-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/%E1%83%A1%E1%83%90%E1%83%9B%E1%83%94%E1%83%97%E1%83%95%E1%83%90%E1%83%9A%E1%83%A7%E1%83%A3%E1%83%A0%E1%83%94%E1%83%9D-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90-4g-4mm-ezviz-cs-eb8-sp-r100/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/5mp-hd-ir-vf-bullet-network-camera-2-8-12mm-uniview-ipc2325lb-adzk-h/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/%E1%83%A1%E1%83%90%E1%83%9B%E1%83%94%E1%83%97%E1%83%95%E1%83%90%E1%83%9A%E1%83%A7%E1%83%A3%E1%83%A0%E1%83%94%E1%83%9D-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90-2-8mm-2mp-ip-hikvision-ds-2cd2121g0-is/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-16974/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-16871/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-11779/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/%E1%83%90%E1%83%9C%E1%83%90%E1%83%9A%E1%83%9D%E1%83%92%E1%83%A3%E1%83%A0%E1%83%98-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/hiwatch-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90-ds-t200-b-2-8mm-hdtvi-2mp-bullet-fix-ir20m/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/4g-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ic-03182/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ptz-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ic-03527/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-15581/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-16509/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-15582/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/%E1%83%A1%E1%83%90%E1%83%9B%E1%83%94%E1%83%97%E1%83%95%E1%83%90%E1%83%9A%E1%83%A7%E1%83%A3%E1%83%A0%E1%83%94%E1%83%9D-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90-4mm-4mp-ip-hikvision-ds-2cd2047g2-lu-c/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-16973/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ic-03327/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ic-03538/",
"https://netis.ge/%E1%83%95%E1%83%98%E1%83%93%E1%83%94%E1%83%9D-%E1%83%A3%E1%83%A1%E1%83%90%E1%83%A4%E1%83%A0%E1%83%97%E1%83%AE%E1%83%9D%E1%83%94%E1%83%91%E1%83%90/%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/ip-%E1%83%99%E1%83%90%E1%83%9B%E1%83%94%E1%83%A0%E1%83%90/n-13783/"
];

// Map of img filename → product URL (from catalog scrape we already have thumb→full mapping)
const IMG_MAP = {
"1_qtkl-r3.png": PRODUCT_URLS[0],
"1_i5p8-gw.png": PRODUCT_URLS[1],
};

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ka,ru;q=0.9,en;q=0.8',
      }
    };
    const req = mod.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function parseProduct(html, url) {
  // Extract product name
  const nameMatch = html.match(/<h1[^>]*class="[^"]*ty-product-block-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
    || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const name = nameMatch ? nameMatch[1].replace(/<[^>]+>/g, '').trim() : '';

  // Extract price
  const priceMatch = html.match(/class="ty-price-num[^"]*"[^>]*>([\d\s,\.]+)</i)
    || html.match(/"price"\s*:\s*"?([\d\.]+)"?/i);
  let price = 0;
  if (priceMatch) {
    price = parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.')) || 0;
  }

  // Extract main image
  const imgMatch = html.match(/id="det_img_[^"]*"\s+src="([^"]+)"/i)
    || html.match(/class="[^"]*ty-pict[^"]*"[^>]*src="([^"]+)"/i)
    || html.match(/"image"\s*:\s*"([^"]+\.(?:jpg|png|webp))"/i);
  const mainImg = imgMatch ? imgMatch[1] : '';

  // Extract all product images
  const imgUrls = [];
  const imgRegex = /href="(https:\/\/netis\.ge\/images\/detailed\/[^"]+\.(?:jpg|png|webp|jpeg))"/gi;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    if (!imgUrls.includes(m[1])) imgUrls.push(m[1]);
  }
  // Also try src of large images
  const srcRegex = /src="(https:\/\/netis\.ge\/images\/(?:detailed|thumbnails)[^"]+\.(?:jpg|png|webp|jpeg))"/gi;
  while ((m = srcRegex.exec(html)) !== null) {
    const full = m[1].replace(/\/thumbnails\/\d+\/\d+\/detailed\//, '/detailed/');
    if (!imgUrls.includes(full) && full.includes('/detailed/')) imgUrls.push(full);
  }

  // Extract specs table - Georgian labels
  const specs = [];
  const specRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/tr>/gi;
  while ((m = specRegex.exec(html)) !== null) {
    const key = m[1].replace(/<[^>]+>/g, '').trim();
    const val = m[2].replace(/<[^>]+>/g, '').trim();
    if (key && val && key.length < 100 && val.length < 200) {
      specs.push({ key, value: val });
    }
  }

  // Also try definition list format
  const dlRegex = /<dt[^>]*>([\s\S]*?)<\/dt>[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/gi;
  while ((m = dlRegex.exec(html)) !== null) {
    const key = m[1].replace(/<[^>]+>/g, '').trim();
    const val = m[2].replace(/<[^>]+>/g, '').trim();
    if (key && val && key.length < 100 && val.length < 200) {
      specs.push({ key, value: val });
    }
  }

  // Try Cs-cart feature table format
  const featRegex = /class="[^"]*ty-features-list[^"]*"[\s\S]*?<\/[^>]+>/gi;
  const featMatch = html.match(/class="[^"]*ty-features-list[\s\S]*?(?=<div class="[^"]*ty-product-block)/i);
  if (featMatch) {
    const featHtml = featMatch[0];
    const rowRegex = /<li[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>[\s\S]*?<\/li>/gi;
    while ((m = rowRegex.exec(featHtml)) !== null) {
      const k = m[1].replace(/<[^>]+>/g, '').trim();
      const v = m[2].replace(/<[^>]+>/g, '').trim();
      if (k && v) specs.push({ key: k, value: v });
    }
  }

  // Brand detection from name
  let brand = '';
  const brands = ['Hikvision', 'Hiwatch', 'Hilook', 'Dahua', 'Uniview', 'Ezviz', 'Tenda', 'Tiandy', 'AJAX', 'CPPLUS', 'Raysharp', 'Uniarch'];
  for (const b of brands) {
    if (name.toLowerCase().includes(b.toLowerCase())) { brand = b; break; }
  }

  // Resolution from name
  let resolution = '';
  const resMatch = name.match(/(\d+)\s*[Мм][Пп]|\b(\d+)mp\b|\b(\d+MP)\b/i);
  if (resMatch) resolution = (resMatch[1] || resMatch[2] || resMatch[3]) + 'МП';

  // Lens from name
  let lens = '';
  const lensMatch = name.match(/(\d+(?:[.,]\d+)?)\s*(?:мм|mm)/i);
  if (lensMatch) lens = lensMatch[0];

  return { name, price, mainImg, imgUrls: imgUrls.slice(0, 5), specs, brand, resolution, lens, url };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const results = [];
  console.log(`Scraping ${PRODUCT_URLS.length} products...`);

  for (let i = 0; i < PRODUCT_URLS.length; i++) {
    const url = PRODUCT_URLS[i];
    try {
      console.log(`[${i+1}/${PRODUCT_URLS.length}] ${url.split('/').slice(-2, -1)[0]}`);
      const html = await fetchPage(url);
      const data = parseProduct(html, url);
      results.push(data);
      await sleep(200); // polite delay
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      results.push({ url, error: e.message, name: '', price: 0, specs: [], imgUrls: [] });
    }
  }

  fs.writeFileSync(
    path.join(__dirname, 'scraped_products.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log(`\nDone! Saved ${results.length} products to scraped_products.json`);
}

main().catch(console.error);
