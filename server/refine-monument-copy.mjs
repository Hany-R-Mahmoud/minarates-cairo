import { config } from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

config({ path: [".env.local", ".env"] });

const copy = {
  "aqsunqur-blue-mosque": [
    "The blue tiles visitors notice most belong largely to a later Ottoman phase, layered onto the earlier Mamluk foundation.",
    "تنتمي البلاطات الزرقاء التي يلاحظها الزائر غالباً في معظمها إلى مرحلة عثمانية لاحقة، وقد أضيفت إلى المنشأة المملوكية الأقدم.",
  ],
  "bayt-al-razzaz": [
    "Bayt al-Razzaz grew over time, so no single patron or date explains the whole complex.",
    "نشأ بيت الرزاز وتطور على مراحل، لذلك لا يفسر راعٍ واحد أو تاريخ واحد المجمع كله.",
  ],
  "citadel-of-cairo": [
    "The Citadel is best understood as a fortified complex whose mosques, palaces, and museums belong to different periods.",
    "من الأفضل فهم القلعة بوصفها مجمعاً محصناً؛ فمساجدها وقصورها ومتاحفها تنتمي إلى فترات مختلفة.",
  ],
  "complex-barquq-muizz": [
    "Look closely at the domes: their geometric patterns are carved directly into the stone rather than painted or applied as plaster.",
    "تأمل القباب عن قرب؛ فالأنماط الهندسية محفورة مباشرة في الحجر وليست مرسومة أو مضافة بطبقة من الجص.",
  ],
  "complex-qalawun": [
    "Historical accounts describe the maristan as a charitable hospital that cared for patients from different communities without charge.",
    "تصف المصادر التاريخية المارستان بأنه مستشفى خيري اعتنى بمرضى من جماعات مختلفة دون مقابل.",
  ],
  "complex-sultan-hasan": [
    "Although the complex bears Sultan Hasan’s name, the tombs inside belong to two of his sons; the sultan himself was not buried here.",
    "مع أن المجمع يحمل اسم السلطان حسن، فإن القبور داخله تعود إلى اثنين من أبنائه؛ أما السلطان نفسه فلم يُدفن هنا.",
  ],
  "gayer-anderson-museum": [
    "The houses predate Gayer-Anderson. His later residence and collection added a twentieth-century layer to the historic interiors.",
    "يسبق البيتان إقامة جاير أندرسون فيهما؛ فقد أضاف سكنه ومجموعته لاحقاً طبقة من تاريخ القرن العشرين إلى الفراغات التاريخية.",
  ],
  "mausoleum-imam-al-shafii": [
    "The early tomb tradition and the standing mausoleum belong to different moments, so they are best read as connected but distinct layers.",
    "ينتمي تقليد القبر المبكر والضريح القائم إلى مرحلتين مختلفتين، ومن الأفضل قراءتهما كطبقتين متصلتين لكن متميزتين.",
  ],
  "mausoleum-shajarat-al-durr": [
    "The clearest reading begins with the documented political and architectural history, while popular stories remain part of the site’s wider memory.",
    "تبدأ القراءة الأوضح بالتاريخ السياسي والمعماري الموثق، بينما تظل الروايات الشعبية جزءاً من الذاكرة الأوسع للموقع.",
  ],
  "mosque-al-aqmar": [
    "The façade follows the street line rather than facing Mecca; inside, the prayer space turns toward the qibla.",
    "تتبع الواجهة خط الشارع بدلاً من التوجه إلى مكة؛ أما قاعة الصلاة في الداخل فتتجه نحو القبلة.",
  ],
  "mosque-al-azhar": [
    "Al-Azhar’s institutional history changed over time: it was founded under Fatimid Ismaili rule and became a Sunni center after 1171 CE.",
    "تغير التاريخ المؤسسي للأزهر مع الزمن؛ فقد تأسس في ظل الحكم الفاطمي الإسماعيلي، ثم أصبح مركزاً سنياً بعد عام 1171م.",
  ],
  "mosque-al-ghuri": [
    "The mausoleum was prepared for al-Ghuri, but he died in battle before reaching Cairo, so the tomb inside remains empty.",
    "أُعد الضريح للغوري، لكنه مات في معركة قبل أن يعود إلى القاهرة، ولذلك ظل القبر داخله فارغاً.",
  ],
  "mosque-al-hussein": [
    "Access to the interior follows the mosque’s religious rules; the surrounding square and Khan al-Khalili are public spaces open to everyone.",
    "يخضع الدخول إلى داخل المسجد لقواعده الدينية؛ أما الساحة المحيطة وخان الخليلي فهما فضاءان عامان مفتوحان للجميع.",
  ],
  "mosque-al-muayyad": [
    "The mosque stands on the site where al-Mu’ayyad was imprisoned, and tradition links its foundation to a personal vow.",
    "يقوم المسجد في الموقع الذي سُجن فيه المؤيد، ويربط التقليد تأسيسه بنذر شخصي.",
  ],
  "mosque-al-nasir-muhammad-citadel": [
    "The Gothic-looking motifs on the minarets are commonly associated with spolia from Crusader Acre rather than newly carved Mamluk decoration.",
    "ترتبط الزخارف ذات المظهر القوطي على المآذن عادةً بعناصر معاد استخدامها من عكا الصليبية، لا بزخرفة مملوكية منحوتة حديثاً.",
  ],
  "mosque-al-rifai": [
    "Despite its Mamluk appearance, al-Rifa’i Mosque is a modern building completed in 1912 and designed to echo an earlier architectural language.",
    "رغم مظهره المملوكي، فإن مسجد الرفاعي مبنى حديث اكتمل عام 1912م وصُمم ليستحضر لغة معمارية أقدم.",
  ],
  "mosque-al-salih-ayyub": [
    "The madrasa and mausoleum are two connected buildings, linked by an alley rather than forming one structure.",
    "المدرسة والضريح مبنيان متصلان يربطهما زقاق، وليسا مبنى واحداً.",
  ],
  "mosque-al-salih-talai": [
    "The mosque now sits below street level, offering a visible reminder of how Cairo’s streets have risen and changed over the centuries.",
    "يقع المسجد اليوم أسفل مستوى الشارع، وهو ما يذكّر بارتفاع شوارع القاهرة وتغيرها عبر القرون.",
  ],
  "mosque-amr-ibn-al-as": [
    "The present mosque reflects many rebuilding campaigns and should not be read as an untouched seventh-century structure.",
    "يعكس المسجد الحالي حملات إعادة بناء عديدة، ولا ينبغي قراءته بوصفه مبنى من القرن السابع ظل بلا تغيير.",
  ],
  "mosque-muhammad-ali-citadel": [
    "Muhammad Ali was of Albanian origin and founded the dynasty that ruled Egypt until 1952; the mosque belongs to that later chapter of Cairo’s history.",
    "كان محمد علي من أصل ألباني، وأسّس الأسرة التي حكمت مصر حتى عام 1952م؛ وينتمي المسجد إلى هذا الفصل اللاحق من تاريخ القاهرة.",
  ],
  "mosque-sabil-sulayman-agha-al-silahdar": [
    "The building dates from the nineteenth century, even though its combined functions recall older Cairo traditions.",
    "يرجع المبنى إلى القرن التاسع عشر، رغم أن وظائفه المجمعة تستحضر تقاليد أقدم في القاهرة.",
  ],
  "museum-of-islamic-art": [
    "The museum stands in Bab al-Khalq, beside the area commonly known as Islamic Cairo.",
    "يقع المتحف في باب الخلق، بجوار المنطقة المعروفة عادةً باسم القاهرة الإسلامية.",
  ],
  "sabil-kuttab-abd-al-rahman-katkhuda": [
    "The sabil offered free drinking water, while the kuttab above provided Quranic education; both functions formed part of a charitable waqf.",
    "قدم السبيل مياه الشرب مجاناً، بينما وفر الكتاب في الأعلى التعليم القرآني؛ وكانت الوظيفتان جزءاً من وقف خيري.",
  ],
  "sabil-kuttab-nafisa-al-bayda": [
    "Its primary identity is a public charitable foundation rather than a private house.",
    "هويته الأساسية منشأة خيرية عامة، لا بيتاً خاصاً.",
  ],
  "sinan-pasha-mosque-bulaq": [
    "The streets around the mosque have changed substantially, so they should not be treated as an unchanged sixteenth-century port landscape.",
    "تغيرت الشوارع المحيطة بالمسجد كثيراً، لذلك لا ينبغي التعامل معها بوصفها مشهداً مينائياً من القرن السادس عشر ظل كما هو.",
  ],
  "sulayman-pasha-al-khadim-mosque": [
    "This is an earlier Ottoman monument, distinct from the nineteenth-century Mosque of Muhammad Ali.",
    "هذا معلم عثماني أقدم، ويختلف عن مسجد محمد علي الذي يرجع إلى القرن التاسع عشر.",
  ],
  "sultan-qaytbay-funerary-complex": [
    "The surrounding cemetery remains a lived and sensitive cultural landscape, not simply a backdrop to the monument.",
    "تظل الجبانة المحيطة مشهداً ثقافياً مأهولاً وحساساً، وليست مجرد خلفية للمعلم.",
  ],
  "wakala-al-ghuri": [
    "A wakala was a commercial inn for merchants and goods, so this building belongs to Cairo’s trading history rather than its mosque architecture.",
    "كانت الوكالة خاناً تجارياً للتجار والبضائع، ولذلك ينتمي المبنى إلى تاريخ التجارة في القاهرة لا إلى عمارة المساجد.",
  ],
};

const packageDir = path.resolve("minarets_of_cairo_content_package_v4");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });
try {
  await sql.begin(async tx => {
    for (const [slug, [en, ar]] of Object.entries(copy)) {
      await tx`UPDATE places SET "clarificationEn" = ${en}, "clarificationAr" = ${ar}, "updatedAt" = now() WHERE slug = ${slug}`;
    }
  });

  for (const slug of Object.keys(copy)) {
    const file = path.join(packageDir, "published-places", `${slug}.json`);
    try {
      const place = JSON.parse(await fs.readFile(file, "utf8"));
      place.clarificationNoteEn = copy[slug][0];
      place.clarificationNoteAr = copy[slug][1];
      await fs.writeFile(file, `${JSON.stringify(place, null, 2)}\n`);
    } catch {
      // The database remains the authoritative runtime update if a legacy package file is absent.
    }
  }

  const claimsPath = path.join(packageDir, "claims.json");
  const claims = JSON.parse(await fs.readFile(claimsPath, "utf8"));
  for (const claim of claims.claims ?? []) {
    if (claim.claimType !== "clarification" || !copy[claim.placeSlug]) continue;
    claim.claimTextEn = copy[claim.placeSlug][0];
    claim.claimTextAr = copy[claim.placeSlug][1];
  }
  await fs.writeFile(claimsPath, `${JSON.stringify(claims, null, 2)}\n`);
  console.log(JSON.stringify({ updated: Object.keys(copy).length }, null, 2));
} finally {
  await sql.end();
}
