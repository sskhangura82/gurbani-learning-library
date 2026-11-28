// Frozen against the combined reviewed-input baseline; edits require explicit review.
import {READER_SCRIPT_POLICY} from '../refresh-reader-sri.mjs';

export const BASELINE_COMMIT='44401e35690322fb3dbc29c443bff86d73279fcb';
export const TOOL_VERSIONS=Object.freeze({esbuild:'0.28.2',acorn:'8.19.0'});
export const GRAPH_MANIFEST='tools/script-integrity/app-graphs.json';
// One explicitly user-loaded provider SDK in the new companion only. These
// provider bytes are external; they are not claimed to be pinned by our SRI.
export const YOUTUBE_SCRIPT_CAPABILITY=Object.freeze({
  source:'collections/source-reader/read-along-player.mjs',
  output:'collections/source-reader/read-along.bundle.mjs',
  variable:'youtubeAPIScript',url:'https://www.youtube.com/iframe_api'
});
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
      "library/app.mjs": "268ecf18678b38b423f4caf69d4979d06f19aa354bb4f43e86fa39743dd32abe",
      "library/catalog.mjs": "7218f9222fb072b50b79741862f0c184afce0a23cbad3b161157a42191ed5900",
      "library/core.mjs": "99399db465730ed4b3e22bd0028c5fae830b739a8fab60749cf0e61762491c40",
      "library/passage-ui.mjs": "7accf3d87d049e469701d13db06697ca4b8b953eb4300a1f3935b48477938900",
      "library/passages.mjs": "58973fe1097e764b75cf9dff0315ef6a1b3455e2633bc585d1ba1a468cd01a7d",
      "library/passage-contracts.mjs": "b056fd03b669540fea1b31e24633a6eda8d8645152946da4c9373b04d66e76cd",
      "library/search.mjs": "2e8538c8fbe2a417cb6b414ff7cbe5aa9f11cb8743c97780f3ae67da5f26ef0c",
      "library/kinds.mjs": "42bea1237464d25f99e7ad53dc00a1721b2cb391eed9e0f21baff6363ee55297"
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
        ],
        [
          "import-statement",
          "library/passage-ui.mjs"
        ]
      ],
      "library/catalog.mjs": [],
      "library/core.mjs": [
        [
          "import-statement",
          "library/catalog.mjs"
        ]
      ],
      "library/passage-ui.mjs": [
        [
          "import-statement",
          "library/passages.mjs"
        ]
      ],
      "library/passages.mjs": [
        [
          "import-statement",
          "library/passage-contracts.mjs"
        ],
        [
          "import-statement",
          "library/search.mjs"
        ]
      ],
      "library/passage-contracts.mjs": [],
      "library/search.mjs": [
        [
          "import-statement",
          "library/kinds.mjs"
        ]
      ],
      "library/kinds.mjs": []
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
      "knowledge/app.mjs": "f96665029c95b391869d2c21f13cf22e8286573d09aa35c2e527e247627dba1c",
      "knowledge/core.mjs": "a9133a7e438314406076605e374d58cd0f60d8c310abd3799644a67553812c07",
      "knowledge/kinds.mjs": "42bea1237464d25f99e7ad53dc00a1721b2cb391eed9e0f21baff6363ee55297",
      "knowledge/registry.mjs": "1a3920965d00fbe3a7911a6fd2d688a96e41c2007985ac08f3e4abe747dd7170",
      "knowledge/search.mjs": "2e8538c8fbe2a417cb6b414ff7cbe5aa9f11cb8743c97780f3ae67da5f26ef0c",
      "knowledge/source-lock.mjs": "d3e6ae095aaef13ad9d018a68b6b492fc00f37e86efc96a1b918406e5ea288d6",
      "knowledge/journey.mjs": "3cde739f749904e593ce41e4992e0f96054fc6ccbe6099c1906e06778fe42532",
      "knowledge/learning.mjs": "376b8a2ca3de67934dd14e8bf18a2689ce191c0249905e0e276c24a6d24f6268",
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
  },
  "source-reader": {
    "entry": "collections/source-reader/reader.mjs",
    "output": "collections/source-reader/reader.bundle.mjs",
    "inputs": {
      "collections/source-reader/reader.mjs": "6343d0c25b6eea278cd26f1ad4daf3d229dac422fd46972d160e77b1c9434709",
      "collections/source-reader/core.mjs": "80475823a93c5b397edbf284f60be13db0f9f50d164a8ea8a4d82cdac9cd253e",
      "collections/source-reader/source-lock.mjs": "5313e5b2103e5cc9ec12fbada297b2544447482a829b030757e4db5853a7f807",
      "collections/source-reader/learning.mjs": "e82b55afd51cfda6d28dac6d89e140cb5d891c801d1a34ad7247e1e55752e269",
      "collections/source-reader/lesson-core.mjs": "29ee291e31155e6f1a695c712f93c67452ce5c6cf5877ed6c0caf93717455ef7",
      "collections/source-reader/lesson-data.mjs": "593c9dc6b6a1d799b7155befdaa8888041567109132e726515b75e0a95e5002d"
    },
    "imports": {
      "collections/source-reader/reader.mjs": [
        [
          "import-statement",
          "collections/source-reader/source-lock.mjs"
        ],
        [
          "import-statement",
          "collections/source-reader/learning.mjs"
        ],
        [
          "import-statement",
          "collections/source-reader/core.mjs"
        ]
      ],
      "collections/source-reader/core.mjs": [],
      "collections/source-reader/source-lock.mjs": [],
      "collections/source-reader/learning.mjs": [
        [
          "import-statement",
          "collections/source-reader/lesson-core.mjs"
        ]
      ],
      "collections/source-reader/lesson-core.mjs": [
        [
          "import-statement",
          "collections/source-reader/core.mjs"
        ],
        [
          "import-statement",
          "collections/source-reader/lesson-data.mjs"
        ]
      ],
      "collections/source-reader/lesson-data.mjs": []
    }
  }
};
// New companion; prior application graphs retain their exact inputs.
graphs['read-along']={
  "entry": "collections/source-reader/read-along.mjs",
  "output": "collections/source-reader/read-along.bundle.mjs",
  "inputs": {
    "collections/source-reader/read-along.mjs": "8d618896031f6e6ad5948ae9472f6e67a0fc76fffb7385854cd3b1ab65bf4e8a",
    "collections/source-reader/read-along-core.mjs": "056b2c0b38c6b6d79515ffd5485f934436e5e80e0382a7112a79cf649edae5c0",
    "collections/source-reader/read-along-source.mjs": "cd0060d031c79219dec4e9ae07813d8eef36a23795f551c17992f42d41bb89ef",
    "collections/source-reader/read-along-player.mjs": "ddc878748aa3aa2288251512affe7a244497da6ff3c1c39aa5f4a613b64721a1",
    "collections/source-reader/read-along-config.mjs": "cbc2be9b686cd3cbb858f34b6245ad325e6743867f155be8928f1ecc83b7c27e",
    "collections/source-reader/core.mjs": "80475823a93c5b397edbf284f60be13db0f9f50d164a8ea8a4d82cdac9cd253e",
    "collections/source-reader/source-lock.mjs": "5313e5b2103e5cc9ec12fbada297b2544447482a829b030757e4db5853a7f807"
  },
  "imports": {
    "collections/source-reader/read-along.mjs": [
      [
        "import-statement",
        "collections/source-reader/read-along-source.mjs"
      ],
      [
        "import-statement",
        "collections/source-reader/read-along-core.mjs"
      ],
      [
        "import-statement",
        "collections/source-reader/read-along-player.mjs"
      ]
    ],
    "collections/source-reader/read-along-core.mjs": [],
    "collections/source-reader/read-along-source.mjs": [
      [
        "import-statement",
        "collections/source-reader/source-lock.mjs"
      ],
      [
        "import-statement",
        "collections/source-reader/core.mjs"
      ]
    ],
    "collections/source-reader/read-along-player.mjs": [
      [
        "import-statement",
        "collections/source-reader/read-along-config.mjs"
      ]
    ],
    "collections/source-reader/read-along-config.mjs": [],
    "collections/source-reader/core.mjs": [],
    "collections/source-reader/source-lock.mjs": []
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
  {page:'collections/dasam/index.html',scripts:[]},
  {page:'collections/dasam/read.html',scripts:[module('../source-reader/reader.bundle.mjs','source-reader')]},
  {page:'collections/sggs/index.html',scripts:[module('../source-reader/reader.bundle.mjs','source-reader')]},
  {page:'psychology/index.html',scripts:[]},
  {page:'psychology/intellectual-humility.html',scripts:[]},
  {page:'psychology/attention.html',scripts:[]},
  {page:'psychology/emotion-regulation.html',scripts:[]},
  {page:'listen/index.html',scripts:[module('../collections/source-reader/read-along.bundle.mjs','read-along')]},
  {page:'private-library/index.html',scripts:[module('./app.mjs','private-library')]},
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
