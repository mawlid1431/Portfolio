/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admins from "../admins.js";
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as authMutations from "../authMutations.js";
import type * as cv from "../cv.js";
import type * as cvData from "../cvData.js";
import type * as dashboard from "../dashboard.js";
import type * as e2e from "../e2e.js";
import type * as educations from "../educations.js";
import type * as experiences from "../experiences.js";
import type * as faqs from "../faqs.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_seedData from "../lib/seedData.js";
import type * as lib_session from "../lib/session.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as seedCv from "../seedCv.js";
import type * as siteImages from "../siteImages.js";
import type * as skills from "../skills.js";
import type * as socialLinks from "../socialLinks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  auth: typeof auth;
  authActions: typeof authActions;
  authMutations: typeof authMutations;
  cv: typeof cv;
  cvData: typeof cvData;
  dashboard: typeof dashboard;
  e2e: typeof e2e;
  educations: typeof educations;
  experiences: typeof experiences;
  faqs: typeof faqs;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/seedData": typeof lib_seedData;
  "lib/session": typeof lib_session;
  messages: typeof messages;
  projects: typeof projects;
  seedCv: typeof seedCv;
  siteImages: typeof siteImages;
  skills: typeof skills;
  socialLinks: typeof socialLinks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
