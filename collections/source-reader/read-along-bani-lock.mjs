// Existing original-text Bani files, pinned without changing their bytes.
// A digest identifies this digital edition; it does not establish independent
// printed collation, authorship, or approval of teaching/editorial material.
const freeze = value => {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};

export const BANI_COLLECTION_ID = 'daily-bani';
export const BANI_EDITION_ID = 'glp-daily-bani-pinned-originals-20261127-v1';
export const BANI_ORDER_VERSION = 'stored-source-display-order-v1';

// sha256 covers the entire raw file, including its inert assignment wrapper.
export const BANI_SOURCES = freeze({
  "japji": {
    "id": "japji",
    "title": "Japji Sahib",
    "titlePunjabi": "ਜਪੁਜੀ ਸਾਹਿਬ",
    "sourceEdition": "0.7-japji-read-candidate",
    "format": "japji",
    "path": "../../js/japji-full-data.js",
    "bytes": 83714,
    "sha256": "7f5f78ac33da1a944e14c3d2b901926686df7e520e6fe681f6a28802d85e9808",
    "lineCount": 385,
    "unitCount": 42,
    "readerPath": "../../full-japji.html"
  },
  "jaap": {
    "id": "jaap",
    "title": "Jaap Sahib",
    "titlePunjabi": "ਜਾਪੁ ਸਾਹਿਬ",
    "sourceEdition": "jaap-banidb-direct-20261125",
    "format": "nitnem",
    "path": "../../nitnem/data/jaap.json",
    "bytes": 538376,
    "sha256": "f00ab63bfe27ad36fac6b7b285c480f3265780f5eb02bb077cafcc29c9e7dcec",
    "lineCount": 808,
    "unitCount": 199,
    "readerPath": "../../nitnem/index.html"
  },
  "savaiye": {
    "id": "savaiye",
    "title": "Tav-Prasad Savaiye",
    "titlePunjabi": "ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ",
    "sourceEdition": "savaiye-discover-narrow-repairs-20261125",
    "format": "nitnem",
    "path": "../../nitnem/data/savaiye.json",
    "bytes": 27078,
    "sha256": "7d5e6fe9ac801b7649e4ef3547a25a79ee1f543f70c4f6bb52492d2d8f37cfaa",
    "lineCount": 43,
    "unitCount": 10,
    "readerPath": "../../nitnem/index.html"
  },
  "chaupai": {
    "id": "chaupai",
    "title": "Benti Chaupai Sahib",
    "titlePunjabi": "ਬੇਨਤੀ ਚੌਪਈ ਸਾਹਿਬ",
    "sourceEdition": "chaupai-expanded29-narrow-repairs-20261125",
    "format": "nitnem",
    "path": "../../nitnem/data/chaupai.json",
    "bytes": 70494,
    "sha256": "289bbd6d725a7921bf1e160620b14ac927fe5e5874c219849168ee70b9389046",
    "lineCount": 121,
    "unitCount": 29,
    "readerPath": "../../nitnem/index.html"
  },
  "anand": {
    "id": "anand",
    "title": "Anand Sahib",
    "titlePunjabi": "ਅਨੰਦੁ ਸਾਹਿਬ",
    "sourceEdition": "anand-opengranth-pinned-20261125",
    "format": "nitnem",
    "path": "../../nitnem/data/anand.json",
    "bytes": 127242,
    "sha256": "124245dfbfa260efd618f513683cbd5dd273e5f7aefdf86bee28db4ee778471a",
    "lineCount": 210,
    "unitCount": 40,
    "readerPath": "../../nitnem/index.html"
  },
  "rehras": {
    "id": "rehras",
    "title": "Sodar Rehras Sahib",
    "titlePunjabi": "ਸੋ ਦਰੁ ਰਹਿਰਾਸ ਸਾਹਿਬ",
    "sourceEdition": "rehras-sgpc-selection-narrow-repairs-20261125",
    "format": "nitnem",
    "path": "../../nitnem/data/rehras.json",
    "bytes": 149365,
    "sha256": "81bff60d8c942a7eafc30a0b7f3ba994816c6e86a0c8d8daeb7c1ca2f2cebc3b",
    "lineCount": 159,
    "unitCount": 44,
    "readerPath": "../../nitnem/index.html"
  },
  "sohila": {
    "id": "sohila",
    "title": "Kirtan Sohila",
    "titlePunjabi": "ਸੋਹਿਲਾ",
    "sourceEdition": "sohila-srigranth-digitally-collated-20261125",
    "format": "nitnem",
    "path": "../../nitnem/data/sohila.json",
    "bytes": 26637,
    "sha256": "7fe21aec71a889c452d639141994087ee2a1390d800c78b59bf604c4496df673",
    "lineCount": 56,
    "unitCount": 5,
    "readerPath": "../../nitnem/index.html"
  },
  "sukhmani": {
    "id": "sukhmani",
    "title": "Sukhmani Sahib",
    "titlePunjabi": "ਸੁਖਮਨੀ ਸਾਹਿਬ",
    "sourceEdition": "GLP-SUKHMANI-SOURCE-1",
    "format": "sukhmani",
    "path": "../../js/sukhmani-data.js",
    "bytes": 1241749,
    "sha256": "0cdd704749265c09ead442ec5fd6c84569b1da34dd40ec021585dacd4a1c65f6",
    "lineCount": 2027,
    "unitCount": 24,
    "readerPath": "../../sukhmani.html"
  }
});

// Selection receipts use the exact canonical key order in selectionIdentity().
export const BANI_SELECTIONS = freeze({
  "japji": {
    "title": "Japji Sahib",
    "titlePunjabi": "ਜਪੁਜੀ ਸਾਹਿਬ",
    "parts": [
      "japji"
    ],
    "lineCount": 385,
    "manifestSha256": "0cb9ffa9b4e787a287cfb08326f1663fb718d16bdb406eb4cd2d13bc4a27c6e5"
  },
  "jaap": {
    "title": "Jaap Sahib",
    "titlePunjabi": "ਜਾਪੁ ਸਾਹਿਬ",
    "parts": [
      "jaap"
    ],
    "lineCount": 808,
    "manifestSha256": "12c5742dc062f1859914caccd97f90c151352424e6cf5d18cf26e145732ae671"
  },
  "savaiye": {
    "title": "Tav-Prasad Savaiye",
    "titlePunjabi": "ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ",
    "parts": [
      "savaiye"
    ],
    "lineCount": 43,
    "manifestSha256": "414cdbe09c4c691f8d0a5279c5a3a7aa489d843b634c92c7a246fc6d2c8f0b9f"
  },
  "chaupai": {
    "title": "Benti Chaupai Sahib",
    "titlePunjabi": "ਬੇਨਤੀ ਚੌਪਈ ਸਾਹਿਬ",
    "parts": [
      "chaupai"
    ],
    "lineCount": 121,
    "manifestSha256": "03f25df63e1e67a89346c21f8119736dff03479ef9a65a749fc0183e2388d81f"
  },
  "anand": {
    "title": "Anand Sahib",
    "titlePunjabi": "ਅਨੰਦੁ ਸਾਹਿਬ",
    "parts": [
      "anand"
    ],
    "lineCount": 210,
    "manifestSha256": "a951c8f897f2b86a71a70f4844899878499032da2cd65187b87e49a77e89f287"
  },
  "rehras": {
    "title": "Sodar Rehras Sahib",
    "titlePunjabi": "ਸੋ ਦਰੁ ਰਹਿਰਾਸ ਸਾਹਿਬ",
    "parts": [
      "rehras"
    ],
    "lineCount": 159,
    "manifestSha256": "c3ac38e711ff9115af16a8d1ea53524ee17136602ce397d229c8de144a3f0254"
  },
  "sohila": {
    "title": "Kirtan Sohila",
    "titlePunjabi": "ਸੋਹਿਲਾ",
    "parts": [
      "sohila"
    ],
    "lineCount": 56,
    "manifestSha256": "9a3ba57baaa353fa3408ba3e68b4f031261a90e748354bc69b024dfa14ebd204"
  },
  "sukhmani": {
    "title": "Sukhmani Sahib",
    "titlePunjabi": "ਸੁਖਮਨੀ ਸਾਹਿਬ",
    "parts": [
      "sukhmani"
    ],
    "lineCount": 2027,
    "manifestSha256": "d4dc1072c401e20783adab6f703bfb6d2d58cb04a90164da9eaf2efa26071529"
  },
  "morning": {
    "title": "Morning Bani selection",
    "titlePunjabi": "ਸਵੇਰ ਦੀਆਂ ਬਾਣੀਆਂ",
    "parts": [
      "japji",
      "jaap",
      "savaiye",
      "chaupai",
      "anand"
    ],
    "lineCount": 1567,
    "manifestSha256": "71109f361d9039db365987d5af016376a7ad2a33f7e69e540520ada3c477ede3"
  }
});
