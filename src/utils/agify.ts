import { ExternalServiceError } from "./custom_errors";

export async function agifyServcie(response: any) {
  const rawData = response;

  let age: number = rawData?.age;
  let age_group = "";

  if (!age || age < 0) {
    throw ExternalServiceError("Agify returned an invalid response");
  }

  let AGE_GROUP_CHILD: number = 12;
  let AGE_GROUP_TEENAGE: number = 19;
  let AGE_GROUP_ADULT: number = 59;

  if (age <= AGE_GROUP_CHILD) {
    age_group = "child";
  } else if (AGE_GROUP_CHILD < age && age <= AGE_GROUP_TEENAGE) {
    age_group = "teenager";
  } else if (AGE_GROUP_TEENAGE < age && age <= AGE_GROUP_ADULT) {
    age_group = "adult";
  } else {
    age_group = "senior";
  }

  const data = {
    age: age,
    ageGroup: age_group,
  };

  return data;
}
