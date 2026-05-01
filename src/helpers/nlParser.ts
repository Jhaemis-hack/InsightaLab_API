const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  nigeria: "NG",
  nigerian: "NG",
  nigerians: "NG",
  ghana: "GH",
  ghanaian: "GH",
  ghanaians: "GH",
  kenya: "KE",
  kenyan: "KE",
  kenyans: "KE",
  "south africa": "ZA",
  "south african": "ZA",
  "south africans": "ZA",
  angola: "AO",
  angolan: "AO",
  angolans: "AO",
  benin: "BJ",
  beninese: "BJ",
  ethiopia: "ET",
  ethiopian: "ET",
  ethiopians: "ET",
  tanzania: "TZ",
  tanzanian: "TZ",
  tanzanians: "TZ",
  uganda: "UG",
  ugandan: "UG",
  ugandans: "UG",
  cameroon: "CM",
  cameroonian: "CM",
  cameroonians: "CM",
  senegal: "SN",
  senegalese: "SN",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  "cote divoire": "CI",
  mozambique: "MZ",
  mozambican: "MZ",
  zambia: "ZM",
  zambian: "ZM",
  zimbabwe: "ZW",
  zimbabwean: "ZW",
  mali: "ML",
  malian: "ML",
  niger: "NE",
  nigerien: "NE",
  guinea: "GN",
  guinean: "GN",
  rwanda: "RW",
  rwandan: "RW",
  somalia: "SO",
  somali: "SO",
  malawi: "MW",
  malawian: "MW",
  "burkina faso": "BF",
  burkinabe: "BF",
  togo: "TG",
  togolese: "TG",
  "sierra leone": "SL",
  liberia: "LR",
  liberian: "LR",
  botswana: "BW",
  namibia: "NA",
  namibian: "NA",
  mauritius: "MU",
  mauritania: "MR",
  mauritanian: "MR",
  gabon: "GA",
  gabonese: "GA",
  congo: "CG",
  congolese: "CG",
  "dr congo": "CD",
  "democratic republic of congo": "CD",
  chad: "TD",
  chadian: "TD",
  sudan: "SD",
  sudanese: "SD",
  egypt: "EG",
  egyptian: "EG",
  morocco: "MA",
  moroccan: "MA",
  tunisia: "TN",
  tunisian: "TN",
  algeria: "DZ",
  algerian: "DZ",
  libya: "LY",
  libyan: "LY",
  madagascar: "MG",
  malagasy: "MG",
  lesotho: "LS",
  eswatini: "SZ",
  swaziland: "SZ",
  eritrea: "ER",
  eritrean: "ER",
  djibouti: "DJ",
  "south sudan": "SS",
  "central african republic": "CF",
  "cape verde": "CV",
  "equatorial guinea": "GQ",
  seychelles: "SC",
  comoros: "KM",
  "united states": "US",
  usa: "US",
  america: "US",
  american: "US",
  "united kingdom": "GB",
  uk: "GB",
  britain: "GB",
  british: "GB",
  france: "FR",
  french: "FR",
  germany: "DE",
  german: "DE",
  spain: "ES",
  spanish: "ES",
  italy: "IT",
  italian: "IT",
  portugal: "PT",
  portuguese: "PT",
  brazil: "BR",
  brazilian: "BR",
  india: "IN",
  indian: "IN",
  china: "CN",
  chinese: "CN",
  japan: "JP",
  japanese: "JP",
  canada: "CA",
  canadian: "CA",
  australia: "AU",
  australian: "AU",
  netherlands: "NL",
  dutch: "NL",
  sweden: "SE",
  swedish: "SE",
  norway: "NO",
  norwegian: "NO",
  denmark: "DK",
  danish: "DK",
  finland: "FI",
  finnish: "FI",
  poland: "PL",
  polish: "PL",
  russia: "RU",
  russian: "RU",
  turkey: "TR",
  turkish: "TR",
  mexico: "MX",
  mexican: "MX",
  argentina: "AR",
  argentinian: "AR",
  colombia: "CO",
  colombian: "CO",
  chile: "CL",
  chilean: "CL",
  peru: "PE",
  peruvian: "PE",
  venezuela: "VE",
  venezuelan: "VE",
  indonesia: "ID",
  indonesian: "ID",
  philippines: "PH",
  filipino: "PH",
  vietnam: "VN",
  vietnamese: "VN",
  thailand: "TH",
  thai: "TH",
  malaysia: "MY",
  malaysian: "MY",
  pakistan: "PK",
  pakistani: "PK",
  bangladesh: "BD",
  bangladeshi: "BD",
  "south korea": "KR",
  korean: "KR",
  iran: "IR",
  iranian: "IR",
  iraq: "IQ",
  iraqi: "IQ",
  "saudi arabia": "SA",
  saudi: "SA",
  "new zealand": "NZ",
};

const AGE_STOPPERS = `above|below|over|under|at\\s+least|more\\s+than|less\\s+than|age[d]?|who|with`;

function extractCountry(qLower: string): string | null {
  const pattern = new RegExp(`\\b(?:from|in)\\s+(.+?)(?=\\s+(?:${AGE_STOPPERS})|\\s*$)`, "i");
  const m = qLower.match(pattern);
  if (!m) return null;
  return m[1].trim();
}

export function parseNlQuery(q: string): Record<string, any> | null {
  const qLower = q.toLowerCase().trim();
  const query: Record<string, any> = {};
  let recognized = false;

  // Gender
  const hasMale = /\b(males?|men|man|boys?)\b/.test(qLower);
  const hasFemale = /\b(females?|women|woman|girls?)\b/.test(qLower);
  if (hasMale && !hasFemale) {
    query.gender = "male";
    recognized = true;
  } else if (hasFemale && !hasMale) {
    query.gender = "female";
    recognized = true;
  } else if (hasMale && hasFemale) {
    recognized = true;
  }

  // Age group
  if (/\b(children|child|kids?)\b/.test(qLower)) {
    query.age_group = "child";
    recognized = true;
  } else if (/\b(teenagers?|teens?|adolescents?)\b/.test(qLower)) {
    query.age_group = "teenager";
    recognized = true;
  } else if (/\b(adults?)\b/.test(qLower)) {
    query.age_group = "adult";
    recognized = true;
  } else if (/\b(seniors?|elderly)\b/.test(qLower)) {
    query.age_group = "senior";
    recognized = true;
  }

  // Young/youth shorthand
  if (/\b(young|youth)\b/.test(qLower) && !query.age_group) {
    query.age = { $gte: 16, $lte: 24 };
    recognized = true;
  }

  // Age comparisons
  const above = qLower.match(/\b(?:above|over|older than|at least|more than)\s+(\d+)/);
  if (above) {
    query.age = { ...query.age, $gte: parseInt(above[1]) };
    recognized = true;
  }

  const below = qLower.match(/\b(?:below|under|younger than|at most|less than)\s+(\d+)/);
  if (below) {
    query.age = { ...query.age, $lte: parseInt(below[1]) };
    recognized = true;
  }

  const between = qLower.match(/\bbetween\s+(\d+)\s+and\s+(\d+)/);
  if (between) {
    query.age = { $gte: parseInt(between[1]), $lte: parseInt(between[2]) };
    recognized = true;
  }

  // Country
  const countryText = extractCountry(qLower);
  if (countryText) {
    // Sort keys longest-first so "south africa" matches before "africa"
    const sortedKeys = Object.keys(COUNTRY_NAME_TO_ISO).sort((a, b) => b.length - a.length);
    let iso: string | null = null;
    for (const name of sortedKeys) {
      if (countryText === name || countryText.startsWith(name)) {
        iso = COUNTRY_NAME_TO_ISO[name];
        break;
      }
    }
    if (iso) {
      query.country_id = iso;
    } else {
      query.country_name = { $regex: countryText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    }
    recognized = true;
  }

  return recognized ? query : null;
}
