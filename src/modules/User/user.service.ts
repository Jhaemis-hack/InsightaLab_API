import { StatusCodes } from "http-status-codes";
import user from "./models/userProfile";
import { createProfile, extractProfile, extractProfileListItem } from "../../helpers/model";
import dotenv from "dotenv";
import { customNotFoundError } from "../../utils/custom_errors";
import { genderizeServcie } from "../../utils/genderize";
import RequestService from "../../utils/request";
import { agifyServcie } from "../../utils/agify";
import { nationalizeServcie } from "../../utils/nationalize";
import { v7 as uuid7 } from "uuid";
import { parseNlQuery } from "../../helpers/nlParser";
import { Parser } from "json2csv";


dotenv.config();

export class UserService {
  genderizeUrl: string;
  agifyUrl: string;
  nationalizeUrl: string;
  request;

  constructor() {
    this.genderizeUrl = process.env.GENDERIZE_API!;
    this.agifyUrl = process.env.AGIFY_API!;
    this.nationalizeUrl = process.env.NATIONALIZE_API!;
    this.request = new RequestService();
  }

  async createProfile(userName: string) {
    const name = userName.toLowerCase();

    const profileExist = await user.findOne({ name });

    if (profileExist) {
      return {
        status_code: StatusCodes.OK,
        status: "success",
        message: "Profile already exists",
        data: extractProfile(profileExist),
      };
    }

    const [genderize, agify, nationalize] = await Promise.all([
      genderizeServcie(await this.request.sendRequest(this.genderizeUrl, name)),
      agifyServcie(await this.request.sendRequest(this.agifyUrl, name)),
      nationalizeServcie(await this.request.sendRequest(this.nationalizeUrl, name)),
    ]);

    let profileId = uuid7();
    let createdAt = new Date().toISOString();

    const newUser = await user.create(createProfile(genderize, agify, nationalize, profileId, createdAt));

    return {
      status_code: StatusCodes.CREATED,
      status: "success",
      data: extractProfile(newUser),
    };
  }

  async getProfiles(query: any) {
    const profiles = await user.find(query);

    if (profiles.length < 1) {
      return {
        status_code: StatusCodes.NOT_FOUND,
        status: "success",
        count: 0,
        data: [],
      };
    }

    return {
      status_code: StatusCodes.OK,
      status: "success",
      count: profiles.length,
      data: profiles.map(p => extractProfileListItem(p)),
    };
  }

  async getProfile(profileId: string) {
    const profile = await user.findOne({ id: profileId });

    if (!profile) {
      throw customNotFoundError("Profile not found");
    }

    return {
      status_code: StatusCodes.OK,
      status: "success",
      data: extractProfile(profile),
    };
  }

  async deleteProfile(profileId: string) {
    const profileDeleted = await user.deleteOne({ id: profileId });

    if (!profileDeleted) {
      throw customNotFoundError("Profile not found");
    }

    return {
      status_code: StatusCodes.NO_CONTENT,
    };
  }

  async getAllProfiles(params: {
    gender?: string;
    age_group?: string;
    country_id?: string;
    min_age?: number;
    max_age?: number;
    min_gender_probability?: number;
    min_country_probability?: number;
    sort_by?: string;
    order?: string;
    page: number;
    limit: number;
  }) {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by,
      order,
      page,
      limit,
    } = params;

    // Build filter
    const query: Record<string, any> = {};
    if (gender) query.gender = gender.toLowerCase();
    if (age_group) query.age_group = age_group.toLowerCase();
    if (country_id) query.country_id = country_id.toUpperCase();

    const ageFilter: Record<string, number> = {};
    if (min_age !== undefined) ageFilter.$gte = min_age;
    if (max_age !== undefined) ageFilter.$lte = max_age;
    if (Object.keys(ageFilter).length) query.age = ageFilter;

    if (min_gender_probability !== undefined) query.gender_probability = { $gte: min_gender_probability };
    if (min_country_probability !== undefined) query.country_probability = { $gte: min_country_probability };

    // Build sort
    const sortField = (sort_by ?? "created_at").toLowerCase();
    const sortDir = (order ?? "").toLowerCase() === "desc" ? -1 : 1;
    const sortSpec: Record<string, 1 | -1> = { [sortField]: sortDir };
    if (sortField !== "created_at") sortSpec.created_at = -1; // secondary sort

    // Paginate
    const skip = (page - 1) * limit;
    const total = await user.countDocuments(query);
    const total_pages = Math.ceil(total / limit);

    const profiles = await user.find(query).sort(sortSpec).skip(skip).limit(limit);

    return {
      status_code: StatusCodes.OK,
      status: "success",
      page,
      limit,
      total,
      total_pages,
      links: {
        self: `/api/profiles?page=${page}&limit=${limit}`,
        next: page < total_pages ? `/api/profiles?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `/api/profiles?page=${page - 1}&limit=${limit}` : null,
      },
      data: profiles.map(p => extractProfileListItem(p)),
    };
  }

  async searchProfiles(params: { q: string; page: number; limit: number }) {
    const { q, page, limit } = params;

    const parsed = parseNlQuery(q.trim());

    if (parsed === null) {
      return {
        status_code: StatusCodes.BAD_REQUEST,
        status: "error",
        message: "Unable to interpret query",
      };
    }

    const skip = (page - 1) * limit;
    const total = await user.countDocuments(parsed);
    const total_pages = Math.ceil(total / limit);

    const profiles = await user.find(parsed).sort({ created_at: -1 }).skip(skip).limit(limit);

    return {
      status_code: StatusCodes.OK,
      status: "success",
      page,
      limit,
      total,
      total_pages,
      links: {
        self: `/api/profiles/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
        next:
          page < total_pages ? `/api/profiles/search?q=${encodeURIComponent(q)}&page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `/api/profiles/search?q=${encodeURIComponent(q)}&page=${page - 1}&limit=${limit}` : null,
      },
      data: profiles.map(p => extractProfileListItem(p)),
    };
  }

  
async exportProfiles(params: {
  gender?: string;
  age_group?: string;
  country_id?: string;
  min_age?: number;
  max_age?: number;
  min_gender_probability?: number;
  min_country_probability?: number;
}) {
  const {
    gender, age_group, country_id,
    min_age, max_age,
    min_gender_probability,
    min_country_probability,
  } = params;

  // Build the same filter logic as getAllProfiles
  const query: Record<string, any> = {};
  if (gender)     query.gender     = gender.toLowerCase();
  if (age_group)  query.age_group  = age_group.toLowerCase();
  if (country_id) query.country_id = country_id.toUpperCase();

  const ageFilter: Record<string, number> = {};
  if (min_age !== undefined) ageFilter.$gte = min_age;
  if (max_age !== undefined) ageFilter.$lte = max_age;
  if (Object.keys(ageFilter).length) query.age = ageFilter;

  if (min_gender_probability !== undefined)
    query.gender_probability = { $gte: min_gender_probability };
  if (min_country_probability !== undefined)
    query.country_probability = { $gte: min_country_probability };

  // Fetch ALL matching profiles (no pagination — it's a full export)
  const profiles = await user.find(query).sort({ created_at: -1 });

  if (profiles.length === 0) {
    return {
      status_code: StatusCodes.NOT_FOUND,
      status: "error",
      message: "No profiles found matching the given filters",
    };
  }

  // Shape rows for CSV
  const rows = profiles.map((p) => ({
    id:                  p.id,
    name:                p.name,
    gender:              p.gender,
    gender_probability:  p.gender_probability,
    age:                 p.age,
    age_group:           p.age_group,
    country_id:          p.country_id,
    country_probability: p.country_probability,
    created_at:          p.created_at,
  }));

  const fields = [
    { label: "ID",                  value: "id" },
    { label: "Name",                value: "name" },
    { label: "Gender",              value: "gender" },
    { label: "Gender Probability",  value: "gender_probability" },
    { label: "Age",                 value: "age" },
    { label: "Age Group",           value: "age_group" },
    { label: "Country",             value: "country_id" },
    { label: "Country Probability", value: "country_probability" },
    { label: "Created At",          value: "created_at" },
  ];

  const parser = new Parser({ fields });
  const csv    = parser.parse(rows);

  return {
    status_code: StatusCodes.OK,
    csv,
    filename: `insighta_profiles_${new Date().toISOString().split("T")[0]}.csv`,
  };
}

}
