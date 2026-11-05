import type { ProviderId } from "@/lib/types";

export type ProviderInfo = {
  id: ProviderId;
  name: string;
  blurb: string;
  fills: string[];
  env: string[];
  scopes: string[];
  consoleUrl: string;
  docsUrl: string;
  setup: string[];
  approval: string;
};

export const PROVIDERS: ProviderInfo[] = [
  {
    id: "square",
    name: "Square",
    blurb: "Sales by store and by menu item, for the KPIs tab and the menu re-engineering.",
    fills: ["Daily net sales and orders per store", "Item sales by month (menu engineering matrix)", "Re-engineering step 1 fills itself"],
    env: ["SQUARE_APP_ID", "SQUARE_APP_SECRET"],
    scopes: ["MERCHANT_PROFILE_READ", "ORDERS_READ", "ITEMS_READ", "PAYMENTS_READ"],
    consoleUrl: "https://developer.squareup.com/apps",
    docsUrl: "https://developer.squareup.com/docs/oauth-api/overview",
    setup: [
      "Sign in to the Square Developer dashboard with the account that owns the stores (or have María do it) and create an application called The Cheese Course HQ.",
      "Open OAuth, switch to Production, and paste the redirect URL shown below.",
      "Copy the Application ID and Application secret into SQUARE_APP_ID and SQUARE_APP_SECRET in Vercel, then redeploy.",
      "Come back here and press Connect. Square asks the account owner to approve read-only access.",
    ],
    approval: "No app review needed: you are connecting your own business. Read-only scopes.",
  },
  {
    id: "meta",
    name: "Instagram and Facebook (Meta)",
    blurb: "Followers, every Reel's views, likes, comments, saves and shares, filled into the video log.",
    fills: ["Instagram followers and posts (daily)", "Facebook page followers (daily)", "Video log: views, likes, comments, saves, shares per Reel", "Instagram reach, profile views and link clicks"],
    env: ["META_APP_ID", "META_APP_SECRET"],
    scopes: ["instagram_basic", "instagram_manage_insights", "pages_show_list", "pages_read_engagement", "business_management"],
    consoleUrl: "https://developers.facebook.com/apps",
    docsUrl: "https://developers.facebook.com/docs/instagram-platform/instagram-graph-api",
    setup: [
      "You need admin on the Facebook page and the Instagram must be a Business account linked to that page (part of the access you are getting from María).",
      "In Meta for Developers, create a Business app, add the product Facebook Login for Business, and add the redirect URL shown below as a Valid OAuth Redirect URI.",
      "Copy the App ID and App secret into META_APP_ID and META_APP_SECRET, then redeploy.",
      "While the app is in Development mode it works for people with a role on the app: add yourself as an app admin and press Connect.",
    ],
    approval:
      "For your own accounts, Development mode is enough. Meta only asks for App Review and business verification if people outside the app's roles will connect. The login lasts about 60 days; this page warns you before it runs out.",
  },
  {
    id: "google",
    name: "Google Business Profile",
    blurb: "Calls, direction requests, website clicks and reviews for Weston and Pinecrest.",
    fills: ["Calls, directions and website clicks per store (daily)", "Average rating and total reviews", "New reviews per day"],
    env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    scopes: ["https://www.googleapis.com/auth/business.manage"],
    consoleUrl: "https://console.cloud.google.com/apis/credentials",
    docsUrl: "https://developers.google.com/my-business/content/prereqs",
    setup: [
      "Claim both store profiles first (task on the Tasks tab).",
      "In Google Cloud, create a project and request Business Profile API access with the form in the docs link (Google approves this by hand, usually within a few days).",
      "Once approved, enable My Business Account Management, My Business Business Information and Business Profile Performance APIs.",
      "Create an OAuth client (Web application), add the redirect URL shown below, and copy the client ID and secret into GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
    ],
    approval: "Google has to approve API access for the project before any data comes through. Apply early.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    blurb: "Followers and each video's views, likes, comments and shares, for when TikTok opens in month 2.",
    fills: ["Followers, likes and video count (daily)", "Video log: views, likes, comments, shares per TikTok"],
    env: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
    scopes: ["user.info.basic", "user.info.stats", "video.list"],
    consoleUrl: "https://developers.tiktok.com/apps",
    docsUrl: "https://developers.tiktok.com/doc/login-kit-web",
    setup: [
      "Get access to the Weston TikTok or open @thecheesecourse first (task on the Tasks tab).",
      "In TikTok for Developers, create an app, add Login Kit, and add the redirect URL shown below.",
      "Request the scopes user.info.basic, user.info.stats and video.list.",
      "Copy the client key and secret into TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.",
    ],
    approval: "TikTok reviews the app before it can be used with accounts outside the sandbox. Submit it for review when TikTok is about to open.",
  },
];

export const providerInfo = (id: ProviderId) => PROVIDERS.find((p) => p.id === id)!;

export const isProviderId = (v: string): v is ProviderId => PROVIDERS.some((p) => p.id === v);

export const missingEnv = (id: ProviderId) => providerInfo(id).env.filter((k) => !process.env[k]);

export const appUrl = () => (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const redirectUri = (id: ProviderId) => `${appUrl()}/api/integrations/${id}/callback`;
