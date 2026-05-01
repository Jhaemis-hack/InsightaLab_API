import { ExternalServiceError } from "./custom_errors";

export async function genderizeServcie(response: any) {
  const rawData = response;

  let count = rawData?.count;
  let name = rawData?.name;
  let gender = rawData?.gender;
  let prob = rawData?.probability;

  if (!gender || count == 0) {
    throw ExternalServiceError("Genderize returned an invalid response");
  }

  const data = {
    name: name,
    gender: gender,
    genderProbability: prob,
    sampleSize: count,
  };

  return data;
}
