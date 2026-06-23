/**
 * Seed filming locations from Wikidata.
 * Run: npm run seed
 *
 * What it does:
 *   1. Creates a "scenescout" bot user to own the seeded locations
 *   2. Queries Wikidata for real US places used as film/TV filming locations
 *   3. Infers hashtags from place type keywords
 *   4. Attaches Wikimedia Commons photos where available
 *   5. Inserts everything via the service-role key (bypasses RLS)
 */

import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Supabase client (service-role — bypasses RLS)
// ---------------------------------------------------------------------------
const { NEXT_PUBLIC_SUPABASE_URL: URL, SUPABASE_SERVICE_ROLE_KEY: KEY } =
  process.env;

if (!URL || !KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment."
  );
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const BOT_USERNAME = "scenescout";
const BOT_EMAIL = "bot@scenescout.internal";

// ---------------------------------------------------------------------------
// Wikidata SPARQL query
// Fetches real places used as filming locations, with coordinates + optional
// image and place type. Scoped to the USA (wd:Q30).
// ---------------------------------------------------------------------------
const SPARQL = `
SELECT DISTINCT ?place ?placeLabel ?coord ?image ?typeLabel WHERE {
  ?work wdt:P915 ?place .
  ?place wdt:P625 ?coord .
  ?place wdt:P17  wd:Q30 .
  OPTIONAL { ?place wdt:P31 ?type . FILTER (!isBlank(?type)) }
  OPTIONAL { ?place wdt:P18 ?image . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY ?placeLabel
LIMIT 200
`.trim();

type WikiRow = {
  place: { value: string };
  placeLabel: { value: string };
  coord: { value: string };
  image?: { value: string };
  typeLabel?: { value: string };
};

async function queryWikidata(): Promise<WikiRow[]> {
  const endpoint = `https://query.wikidata.org/sparql?query=${encodeURIComponent(SPARQL)}`;
  console.log("Querying Wikidata SPARQL endpoint…");
  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "SceneScout/1.0 (scenescout.app; filmmaking community app)",
    },
  });
  if (!res.ok) {
    throw new Error(`Wikidata returned ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.results.bindings as WikiRow[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse "Point(lng lat)" → { lat, lng } */
function parsePoint(v: string): { lat: number; lng: number } | null {
  const m = v.match(/Point\(([-.0-9]+)\s+([-.0-9]+)\)/);
  if (!m) return null;
  return { lng: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

/** Wikidata wdt:P18 values are already FilePath URLs — just force https + resize. */
function commonsUrl(uri: string): string {
  return uri.replace(/^http:/, "https:") + "?width=800";
}

/** Map label + type keywords → hashtag names */
function inferHashtags(label: string, type = ""): string[] {
  const t = `${label} ${type}`.toLowerCase();
  const tags: string[] = [];

  if (/beach|boardwalk|coast|pier|ocean|shore|bay|cove/.test(t)) tags.push("beach");
  if (/park|canyon|creek|river|lake|trail|nature|wilderness|wetland|marsh|preserve/.test(t)) tags.push("nature");
  if (/mountain|canyon|ridge|peak|hill|cliff|summit|rocks?|boulder|butte/.test(t)) tags.push("mountains");
  if (/desert|dune|arid|mojave|badlands|dry lake/.test(t)) tags.push("desert");
  if (/warehouse|factory|industrial|port|dock|shipyard|rail|yard|mill|refinery|plant/.test(t)) tags.push("industrial");
  if (/street|alley|district|downtown|city|urban|plaza|square|avenue|bridge|boulevard/.test(t)) tags.push("urban");
  if (/museum|library|theater|theatre|hall|hotel|store|church|studio|arena|stadium|mansion|estate/.test(t)) tags.push("indoors");
  if (/forest|wood|grove|jungle|redwood|sequoia/.test(t)) tags.push("forest");

  if (tags.length === 0) tags.push("urban");

  // Sprinkle mood/condition tags probabilistically
  const r = Math.random();
  if (r > 0.45) tags.push("goldenHour");
  if (r > 0.60) tags.push("hiddenGem");
  if (r > 0.72) tags.push("nightShoot");
  if (/state park|national park|public beach|public park/.test(t)) tags.push("permitFree");
  if (r > 0.78) tags.push("studentFriendly");

  return [...new Set(tags)];
}

// Filmmaker-voiced description templates keyed by primary hashtag
const DESCRIPTIONS: Record<string, string[]> = {
  nature: [
    "Stunning natural terrain with cinematic light transitions across the day. Minimal noise pollution keeps dialogue recordings clean. The landscape shifts dramatically between morning mist and hard afternoon contrast.",
    "Unspoiled outdoor location with strong visual character. Wide vistas for establishing shots and intimate pockets for close-ups — this place has range.",
    "Wild, textured environment where the light does most of the heavy lifting. Works across genres from drama to sci-fi without heavy set dressing.",
    "Natural location with the kind of raw beauty that reads instantly on screen. Has served countless productions as a flexible, low-cost backdrop.",
  ],
  beach: [
    "Expansive coastline with ever-changing light and natural audio ambiance. The horizon line is effortlessly cinematic at golden hour.",
    "Dramatic shoreline that shifts mood completely from dawn to dusk. Works for romance, action, and everything in between.",
    "Open coastal location with strong visual range — vast ocean vistas to tight sandy textures. The Pacific light at this spot is genuinely special.",
    "Classic shoreline location with that authentic coastal atmosphere that no studio stage can replicate. Bring a polarizer.",
  ],
  mountains: [
    "High-elevation terrain with dramatic skies and sweeping vistas. Has doubled for dozens of screen locations — incredibly versatile rock.",
    "Rocky, rugged setting that shifts character completely with weather. The natural grandeur makes subjects feel small in the best possible way.",
    "Dramatic formations and canyon walls that create instant visual tension. Used in countless productions for good reason — it just photographs.",
    "Elevated terrain with the kind of geological scale that makes everything feel epic without any production effort.",
  ],
  desert: [
    "Vast arid landscape with extraordinary light at dawn and dusk. The spare environment isolates subjects powerfully — nothing competing for attention.",
    "Open desert terrain with a timeless, elemental quality. Works for intimate character scenes and sweeping epics with equal ease.",
    "Stark setting where the sky and ground split the frame cleanly. The silence here is something you have to experience.",
    "Desert expanse with the extreme light contrast that cinematographers dream about. High noon is brutal; magic hour is transcendent.",
  ],
  industrial: [
    "Raw industrial environment with strong structural geometry and weathered surfaces. The scale and texture create immediate visual tension.",
    "Working or abandoned industrial space with an authentic grit that set dressing can't replicate. Perfect for action, thriller, or dystopian work.",
    "Textured, mechanical environment where every surface adds depth. The dramatic shadows and hard lines make even simple shots feel composed.",
    "Heavy industrial aesthetic with real production history. The bones of this place are cinematic in themselves.",
  ],
  urban: [
    "Authentic urban location with layered visual energy. The architecture and street-level activity provide a rich, lived-in backdrop with no need for dressing.",
    "Gritty city environment with strong contrast between surfaces and scales. The density of detail makes every frame feel earned.",
    "Versatile urban backdrop that shifts character with time of day — quiet and atmospheric at dawn, buzzing with energy by midday.",
    "City location with the kind of textural authenticity that location scouts spend careers looking for. Practical light is excellent.",
  ],
  indoors: [
    "Distinctive interior with architectural character that establishes mood immediately. The existing design adds production value without budget.",
    "Unique interior space with strong visual identity and flexible light opportunities. Sets scenes instantly without over-explaining.",
    "Characterful indoor environment with layered spatial depth. The existing aesthetic dramatically reduces set dressing needs.",
    "Interior location with genuine production history and a visual identity that holds up in every shot.",
  ],
  forest: [
    "Dense woodland with natural canopy light and rich organic texture. The layered depth creates exceptional atmospheric opportunities.",
    "Atmospheric forest with filtered light and textural complexity. Works across thriller, fantasy, and drama with equal effectiveness.",
    "Old-growth setting with a sense of scale and stillness that's hard to manufacture. The natural sound environment is extraordinary.",
    "Deep forest location with the kind of visual density that rewards wide and tight framings equally.",
  ],
  default: [
    "Compelling location with strong visual character and flexible shooting conditions. Well-suited to both large productions and nimble indie shoots.",
    "Distinctive filming environment with natural cinematic quality. The light and scale make it immediately camera-ready.",
    "Versatile location that rewards both wide establishing shots and intimate close work. Worth a scout before your next production.",
    "Well-documented filming location with a proven track record on screen. Practical considerations are manageable for most crew sizes.",
  ],
};

function generateDescription(hashtags: string[]): string {
  const cat =
    hashtags.find((h) => Object.keys(DESCRIPTIONS).includes(h)) ?? "default";
  const pool = DESCRIPTIONS[cat];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------------------------------------------------------------------------
// Bot user
// ---------------------------------------------------------------------------
async function ensureBotUser(): Promise<string> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", BOT_USERNAME)
    .single();

  if (existing) {
    console.log(`Bot user already exists (${existing.id})`);
    return existing.id as string;
  }

  // auth.admin.createUser fires the on_auth_user_created trigger,
  // which auto-inserts the profile using user_metadata.username.
  const { data, error } = await supabase.auth.admin.createUser({
    email: BOT_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { username: BOT_USERNAME },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create bot user: ${error?.message}`);
  }

  console.log(`Created bot user (${data.user.id})`);
  return data.user.id;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const botUserId = await ensureBotUser();

  // Fetch hashtag id→name map from DB
  const { data: hashtagRows, error: hErr } = await supabase
    .from("hashtags")
    .select("id, name");
  if (hErr) throw new Error(hErr.message);
  const hashtagMap = new Map<string, number>(
    (hashtagRows ?? []).map((r) => [r.name as string, r.id as number])
  );

  // Fetch Wikidata
  const rows = await queryWikidata();

  // Deduplicate by place URI
  const seen = new Set<string>();
  const unique: WikiRow[] = [];
  for (const row of rows) {
    if (!seen.has(row.place.value)) {
      seen.add(row.place.value);
      unique.push(row);
    }
  }
  console.log(`${unique.length} unique places to process`);

  let inserted = 0;
  let skipped = 0;

  for (const row of unique) {
    const label = row.placeLabel.value;

    // Skip Q-code fallbacks (no English label resolved)
    if (/^Q\d+$/.test(label)) {
      skipped++;
      continue;
    }

    const coords = parsePoint(row.coord.value);
    if (!coords) { skipped++; continue; }

    const { lat, lng } = coords;
    // Keep only continental US + Alaska/Hawaii range
    if (lat < 18 || lat > 72 || lng < -180 || lng > -60) {
      skipped++;
      continue;
    }

    const typeLabel = row.typeLabel?.value ?? "";
    const hashtags = inferHashtags(label, typeLabel);
    const description = generateDescription(hashtags);

    // Insert location
    const { data: loc, error: locErr } = await supabase
      .from("locations")
      .insert({
        user_id: botUserId,
        name: label,
        description,
        lat,
        lng,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (locErr || !loc) {
      console.warn(`  ✗ ${label}: ${locErr?.message}`);
      skipped++;
      continue;
    }

    const locationId = loc.id as string;

    // Insert Wikimedia Commons photo if available
    if (row.image) {
      await supabase.from("location_photos").insert({
        location_id: locationId,
        storage_path: `wikidata/${locationId}.jpg`,
        url: commonsUrl(row.image.value),
        display_order: 0,
      });
    }

    // Insert hashtags
    const tagRows = hashtags
      .map((name) => hashtagMap.get(name))
      .filter((id): id is number => id !== undefined)
      .map((hashtag_id) => ({ location_id: locationId, hashtag_id }));

    if (tagRows.length > 0) {
      await supabase.from("location_hashtags").insert(tagRows);
    }

    console.log(`  ✓ ${label}  [${hashtags.join(", ")}]`);
    inserted++;
  }

  console.log(`\nDone — inserted ${inserted}, skipped ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
