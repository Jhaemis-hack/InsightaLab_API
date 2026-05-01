import { ExternalServiceError } from "./custom_errors";
import iso from "iso-3166-1";

export async function nationalizeServcie(response: any) {
  const rawData = response;

  let countries: any[] = rawData?.country;
  let country_id = "";
  let highest_prob = 0;

  if (countries?.length == 0) {
    throw ExternalServiceError("Nationalize returned an invalid response");
  }

  countries.forEach(c => {
    let id = c?.country_id;
    let prob = c?.probability;

    if (highest_prob < prob) {
      highest_prob = prob;
      country_id = id;
    }
  });

  const data = {
    countryId: country_id,
    countryName: iso.whereAlpha2(country_id)?.country,
    countryProbability: highest_prob,
  };

  return data;
}
