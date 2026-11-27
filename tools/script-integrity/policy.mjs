// Frozen against the combined reviewed-input baseline; edits require explicit review.
import {READER_SCRIPT_POLICY} from '../refresh-reader-sri.mjs';

export const BASELINE_COMMIT='44401e35690322fb3dbc29c443bff86d73279fcb';
export const TOOL_VERSIONS=Object.freeze({esbuild:'0.28.2',acorn:'8.19.0'});
export const GRAPH_MANIFEST='tools/script-integrity/app-graphs.json';
export const BUILD_OPTIONS=Object.freeze({
  bundle:true,format:'esm',platform:'browser',target:'es2022',
  splitting:false,minify:false,treeShaking:false,sourcemap:false,
  charset:'utf8',legalComments:'inline',keepNames:false
});
const graphs={
  "library": {
    "entry": "library/app.mjs",
    "output": "library/app.bundle.mjs",
    "inputs": {
      "library/app.mjs": "2c73e9578263bc1bdeb8161249c53673d6f4b4ba12a50b60767e4b34fd9d9e00",
      "library/catalog.mjs": "98ff94e3d5102f960cd00300159bd749ff99175f3d060111c4943199c01ef497",
      "library/core.mjs": "99399db465730ed4b3e22bd0028c5fae830b739a8fab60749cf0e61762491c40"
    },
    "imports": {
      "library/app.mjs": [
        [
          "import-statement",
          "library/catalog.mjs"
        ],
        [
          "import-statement",
          "library/core.mjs"
        ]
      ],
      "library/catalog.mjs": [],
      "library/core.mjs": [
        [
          "import-statement",
          "library/catalog.mjs"
        ]
      ]
    }
  },
  "articles": {
    "entry": "articles/app.mjs",
    "output": "articles/app.bundle.mjs",
    "inputs": {
      "articles/app.mjs": "f0b3b240c70ed23388d24d83d06c1f770ced7856a4bab689357e06a4932174b8",
      "articles/core.mjs": "c27144526ac32550fc4e9a03da181d7413db4c54929d04d72772c52bef351124",
      "articles/source-contracts.mjs": "abb640e5e3e10f123c50b5fdbe16d3a42fbf2fdfe29e9090ad4f1016523d04d0"
    },
    "imports": {
      "articles/app.mjs": [
        [
          "dynamic-import",
          "articles/core.mjs"
        ],
        [
          "dynamic-import",
          "articles/source-contracts.mjs"
        ]
      ],
      "articles/core.mjs": [
        [
          "import-statement",
          "articles/source-contracts.mjs"
        ]
      ],
      "articles/source-contracts.mjs": []
    }
  },
  "knowledge": {
    "entry": "knowledge/app.mjs",
    "output": "knowledge/app.bundle.mjs",
    "inputs": {
      "knowledge/app.mjs": "4646ce7b02a411cade85832a0be31400cf52b1e908a64931c750dc7acd3ca128",
      "knowledge/core.mjs": "a9133a7e438314406076605e374d58cd0f60d8c310abd3799644a67553812c07",
      "knowledge/kinds.mjs": "42bea1237464d25f99e7ad53dc00a1721b2cb391eed9e0f21baff6363ee55297",
      "knowledge/registry.mjs": "316c7c0777a0438936679e5f07d71dd3639bbb61580f418a9a1546caff6986cd",
      "knowledge/search.mjs": "2e8538c8fbe2a417cb6b414ff7cbe5aa9f11cb8743c97780f3ae67da5f26ef0c",
      "knowledge/source-lock.mjs": "d3e6ae095aaef13ad9d018a68b6b492fc00f37e86efc96a1b918406e5ea288d6",
      "knowledge/journey.mjs": "461fed61bd5b78fa3511906285c3af7c7303ef3ab7c1a73670306d5f879e7bb2",
      "knowledge/learning.mjs": "39c43e3233621a6d907e93bb9e3fb4135b4c7477375db8809aed64923702c0f6",
      "knowledge/json.mjs": "123efc807da6442e7d800863648ad4e196748f355bf1a00fc48a7b453174d5d5"
    },
    "imports": {
      "knowledge/app.mjs": [
        [
          "import-statement",
          "knowledge/registry.mjs"
        ],
        [
          "import-statement",
          "knowledge/journey.mjs"
        ],
        [
          "import-statement",
          "knowledge/core.mjs"
        ]
      ],
      "knowledge/core.mjs": [
        [
          "import-statement",
          "knowledge/kinds.mjs"
        ],
        [
          "import-statement",
          "knowledge/search.mjs"
        ]
      ],
      "knowledge/kinds.mjs": [],
      "knowledge/registry.mjs": [
        [
          "import-statement",
          "knowledge/source-lock.mjs"
        ]
      ],
      "knowledge/search.mjs": [
        [
          "import-statement",
          "knowledge/kinds.mjs"
        ]
      ],
      "knowledge/source-lock.mjs": [],
      "knowledge/journey.mjs": [
        [
          "import-statement",
          "knowledge/learning.mjs"
        ]
      ],
      "knowledge/learning.mjs": [
        [
          "import-statement",
          "knowledge/json.mjs"
        ]
      ],
      "knowledge/json.mjs": []
    }
  },
  "hukamnama": {
    "entry": "hukamnama/reader.mjs",
    "output": "hukamnama/reader.bundle.mjs",
    "inputs": {
      "hukamnama/reader.mjs": "d73a43a1f73626561d547c9b361dc4549b82c4d8f23c254fa3482900162a3b17",
      "hukamnama/core.mjs": "b93d06e8d3347e39dba5524b04c36c629a762f001e571822f662d0f3cd7bab6d",
      "hukamnama/delivery.mjs": "c6edc3356a656a668f05f8efc9519f7a5798749f3e6c14d8bea66e76d25c509e",
      "hukamnama/learning.mjs": "b27aa14332dcb07f589faecf4616a31f90414afcdd628ab6d66399328d203d54",
      "hukamnama/publication-key.mjs": "e4c830924caa89fb6d64a0b2770b47340e1be0b8e10536e2684398adce2481c3",
      "hukamnama/json.mjs": "123efc807da6442e7d800863648ad4e196748f355bf1a00fc48a7b453174d5d5"
    },
    "imports": {
      "hukamnama/reader.mjs": [
        [
          "import-statement",
          "hukamnama/core.mjs"
        ],
        [
          "import-statement",
          "hukamnama/delivery.mjs"
        ],
        [
          "import-statement",
          "hukamnama/learning.mjs"
        ]
      ],
      "hukamnama/core.mjs": [],
      "hukamnama/delivery.mjs": [
        [
          "import-statement",
          "hukamnama/core.mjs"
        ],
        [
          "import-statement",
          "hukamnama/publication-key.mjs"
        ],
        [
          "import-statement",
          "hukamnama/json.mjs"
        ]
      ],
      "hukamnama/learning.mjs": [
        [
          "import-statement",
          "hukamnama/core.mjs"
        ]
      ],
      "hukamnama/publication-key.mjs": [],
      "hukamnama/json.mjs": []
    }
  }
};
function freeze(value){if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;}
export const APP_GRAPHS=freeze(graphs);
const classic=(src,defer=false)=>({src,type:'classic',defer});
const module=(src,appId)=>({src,type:'module',defer:false,appId,sourceSrc:src.replace(/\.bundle\.mjs$/,'.mjs')});
const nonreaders=[
  {page:'index.html',scripts:[classic('js/home.js'),classic('js/pwa.js'),module('library/app.bundle.mjs','library')]},
  {page:'articles/index.html',scripts:[module('app.bundle.mjs','articles')]},
  {page:'articles/article.html',scripts:[module('app.bundle.mjs','articles')]},
  {page:'knowledge/index.html',scripts:[module('app.bundle.mjs','knowledge')]},
  {page:'hukamnama/index.html',scripts:[module('./reader.bundle.mjs','hukamnama')]},
  {page:'breathing.html',scripts:[classic('js/breathing-core.js',true),classic('js/breathing.js',true)]},
  {page:'simran.html',scripts:[classic('js/simran.js')]},
  {page:'gurdwara.html',scripts:[classic('js/arrivals.js')]},
  {page:'gurdwaras.html',scripts:[]},
  {page:'pauri-2-lesson.html',scripts:['js/content.js','js/core.js','js/gurdwaras.js','js/places.js','js/app.js'].map(src=>classic(src))}
];
export const APP_SCRIPT_POLICY=freeze([
  ...nonreaders.map(p=>({...p,algorithm:'sha384',reader:false})),
  ...READER_SCRIPT_POLICY.map(p=>({...p,reader:true,scripts:p.scripts.map(src=>classic(src))}))
].sort((a,b)=>a.page.localeCompare(b.page,'en')));
export const EXCLUDED_HTML_ROOTS=freeze([
  {path:'tests/',reason:'Synthetic browser fixtures; not application entry pages.'},
  {path:'reviews/',reason:'Independent review artifacts; not application entry pages.'},
  {path:'evidence/',reason:'Generated test evidence; not application entry pages.'},
  {path:'docs/',reason:'Design and build documentation; not application entry pages.'}
]);
