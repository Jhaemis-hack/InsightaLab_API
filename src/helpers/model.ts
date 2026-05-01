export function extractProfile(data: any) {
  return {
    id: data?.id,
    name: data?.name,
    gender: data?.gender,
    gender_probability: data?.gender_probility,
    age: data?.age,
    age_group: data?.age_group,
    country_id: data?.country_id,
    country_name: data?.country_name,
    country_probability: data?.country_probability,
    created_at: data?.created_at,
  };
}

export function extractProfileListItem(data: any) {
  return {
    id: data?.id,
    name: data?.name,
    gender: data?.gender,
    gender_probability: data?.gender_probability,
    age: data?.age,
    age_group: data?.age_group,
    country_id: data?.country_id,
    country_name: data?.country_name,
    country_probability: data?.country_probability,
    created_at: data?.created_at,
  };
}

export function createProfile(
  genderize: any,
  agify: any,
  nationalize: any,
  profileId: string,
  createdAt: string,
) {
  return {
    id: profileId,
    created_at: createdAt,
    name: genderize?.name,
    gender: genderize?.gender,
    gender_probability: genderize?.genderProbability,
    sample_size: genderize?.sampleSize,
    age: agify?.age,
    age_group: agify?.ageGroup,
    country_id: nationalize?.countryId,
    country_name: nationalize?.countryName,
    country_probability: nationalize?.countryProbability,
  };
}

export function createStaff(data: any) {
  return {
    id: data?.id,
    github_id: data?.githubId,
    username: data?.userName,
    email: data?.email,
    avatar_url: data?.avatarUrl,
    role: data?.role,
    is_active: data?.isActive,
    last_login_at: data?.lastLoginAt,
    created_at: data?.createdAt,
  };
}

export function extractStaff(data: any) {
  return {
    id: data?.id,
    github_id: data?.github_id,
    username: data?.username,
    email: data?.email,
    avatar_url: data?.avatar_url,
    role: data?.role,
    is_active: data?.is_active,
    last_login_at: data?.last_login_at,
    created_at: data?.created_at,
  };
}
