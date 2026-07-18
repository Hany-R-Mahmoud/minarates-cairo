/**
 * Expansion seed: adds 30+ more monument places, 10 more comparisons, 10 more stories
 * to reach the target of 48+ places, 14 comparisons, 15 stories.
 */
import { createConnection } from 'mysql2/promise';

const conn = await createConnection(process.env.DATABASE_URL);

// Helper to get period/district IDs
const [periods] = await conn.execute('SELECT id, slug FROM periods');
const [districts] = await conn.execute('SELECT id, slug FROM districts');

const periodMap = Object.fromEntries(periods.map(p => [p.slug, p.id]));
const districtMap = Object.fromEntries(districts.map(d => [d.slug, d.id]));

// Get placeType IDs
const [placeTypes] = await conn.execute('SELECT id, slug FROM place_types');
const typeMap = Object.fromEntries(placeTypes.map(t => [t.slug, t.id]));

console.log('Period IDs:', periodMap);
console.log('District IDs:', districtMap);
console.log('Type IDs:', typeMap);

// Additional 30 monument places
const newPlaces = [
  {
    slug: 'mosque-al-salih-ayyub',
    nameEn: 'Madrasa and Mausoleum of al-Salih Ayyub',
    nameAr: 'مدرسة وضريح الصالح أيوب',
    period: 'ayyubid',
    district: 'al-muizz',
    type: 'madrasa',
    foundedYear: 1242,
    founder: 'Sultan al-Salih Ayyub',
    founderAr: 'السلطان الصالح أيوب',
    lat: '30.0481', lng: '31.2611',
    historyEn: 'The Madrasa and Mausoleum of al-Salih Ayyub, completed in 1242 CE, represents the last great Ayyubid monument in Cairo. Sultan al-Salih Ayyub built this complex on al-Muizz Street to house his tomb and a four-iwan madrasa teaching all four Sunni legal schools simultaneously — the first institution in Cairo to do so. The mausoleum, with its carved stone dome, stands apart from the madrasa across a narrow alley. After the sultan died in 1249, his widow Shajar al-Durr preserved his death to maintain military morale during the Crusader invasion, later placing his body here. The complex marks the transition from Ayyubid to Mamluk rule.',
    historyAr: 'تمثل مدرسة وضريح الصالح أيوب، المكتملة عام 1242م، آخر المعالم الأيوبية الكبرى في القاهرة. بنى السلطان الصالح أيوب هذا المجمع في شارع المعز ليضم ضريحه ومدرسة ذات أربعة إيوانات تدرّس المذاهب الفقهية السنية الأربعة في آنٍ واحد، وكانت الأولى في القاهرة. يقع الضريح بقبته الحجرية المنحوتة مقابل المدرسة عبر زقاق ضيق. بعد وفاة السلطان عام 1249م، أخفت زوجته شجر الدر خبر وفاته للحفاظ على الروح المعنوية للجيش إبان الغزو الصليبي، ثم وضعت جثمانه هنا. يمثل المجمع مرحلة الانتقال من الحكم الأيوبي إلى المملوكي.',
    activeWorship: false,
    clarificationEn: 'The madrasa and mausoleum are separate buildings connected by an alley, not a single structure.',
    clarificationAr: 'المدرسة والضريح مبنيان منفصلان يربطهما زقاق، وليسا مبنى واحداً.',
    architecturalStyle: 'Ayyubid',
    currentFunction: 'Museum / Heritage Site',
    status: 'published',
  },
  {
    slug: 'mosque-al-nasir-muhammad-citadel',
    nameEn: 'Mosque of al-Nasir Muhammad (Citadel)',
    nameAr: 'مسجد الناصر محمد بالقلعة',
    period: 'bahri-mamluk',
    district: 'citadel',
    type: 'mosque',
    foundedYear: 1318,
    founder: 'Sultan al-Nasir Muhammad ibn Qalawun',
    founderAr: 'السلطان الناصر محمد بن قلاوون',
    lat: '30.0285', lng: '31.2592',
    historyEn: 'The Mosque of al-Nasir Muhammad within the Citadel, completed in 1318 CE, served as the royal mosque for Mamluk sultans for over two centuries. Sultan al-Nasir Muhammad, who reigned three times, built this mosque as the centerpiece of his Citadel complex. Its two minarets display a unique Gothic-influenced decoration on the lower shafts — looted from a Crusader church in Acre — topped by bulbous Mamluk finials. The prayer hall features marble columns taken from Pharaonic and Roman sites. The mosque fell into disuse after the Ottoman conquest but remains one of the finest examples of Bahri Mamluk royal architecture.',
    historyAr: 'خدم مسجد الناصر محمد داخل القلعة، المكتمل عام 1318م، مسجداً ملكياً للسلاطين المماليك لأكثر من قرنين. بناه السلطان الناصر محمد الذي حكم ثلاث مرات، ليكون محور مجمعه في القلعة. تُظهر مئذنتاه زخارف قوطية فريدة في الأجزاء السفلية — منهوبة من كنيسة صليبية في عكا — تعلوها تيجان مملوكية بصلية الشكل. تضم قاعة الصلاة أعمدة رخامية مأخوذة من مواقع فرعونية ورومانية. أُهمل المسجد بعد الفتح العثماني، لكنه يبقى من أرقى نماذج العمارة الملكية المملوكية البحرية.',
    activeWorship: false,
    clarificationEn: 'The Gothic decorations on the minarets were not built by Mamluk craftsmen but were looted from Crusader Acre.',
    clarificationAr: 'الزخارف القوطية على المآذن لم يصنعها الحرفيون المماليك بل نُهبت من عكا الصليبية.',
    architecturalStyle: 'Bahri Mamluk',
    currentFunction: 'Heritage Site',
    status: 'published',
  },
  {
    slug: 'complex-sultan-hasan',
    nameEn: 'Mosque and Madrasa of Sultan Hasan',
    nameAr: 'مسجد ومدرسة السلطان حسن',
    period: 'bahri-mamluk',
    district: 'citadel',
    type: 'mosque',
    foundedYear: 1356,
    founder: 'Sultan Hasan ibn Muhammad ibn Qalawun',
    founderAr: 'السلطان حسن بن محمد بن قلاوون',
    lat: '30.0290', lng: '31.2573',
    historyEn: 'The Mosque and Madrasa of Sultan Hasan, built between 1356 and 1363 CE, is widely considered the greatest Mamluk monument and one of the finest examples of Islamic architecture in the world. Sultan Hasan commissioned this colossal complex opposite the Citadel to house four madrasas teaching the Sunni legal schools, a mausoleum, and a congregational mosque. The entrance portal, at 38 meters high, remains the tallest in Islamic architecture. The interior courtyard, with its massive four-iwan plan, creates a profound sense of scale and spiritual gravity. The sultan was assassinated before its completion and was never buried in his own mausoleum.',
    historyAr: 'يُعدّ مسجد ومدرسة السلطان حسن، المبني بين 1356 و1363م، على نطاق واسع أعظم المعالم المملوكية وأحد أرقى نماذج العمارة الإسلامية في العالم. أمر السلطان حسن ببناء هذا المجمع الضخم مقابل القلعة ليضم أربع مدارس لتدريس المذاهب الفقهية السنية، وضريحاً، ومسجداً جامعاً. يبلغ ارتفاع بوابة المدخل 38 متراً، وهي الأعلى في العمارة الإسلامية. يُضفي الفناء الداخلي بمخططه الإيواني الرباعي الضخم إحساساً عميقاً بالمقياس والجلال الروحي. اغتيل السلطان قبل اكتمال المجمع ولم يُدفن قط في ضريحه.',
    activeWorship: true,
    clarificationEn: 'Sultan Hasan was never buried in his own mausoleum. The tombs inside belong to two of his sons.',
    clarificationAr: 'لم يُدفن السلطان حسن في ضريحه قط. الأضرحة الداخلية تعود لاثنين من أبنائه.',
    architecturalStyle: 'Bahri Mamluk',
    currentFunction: 'Active Mosque / Heritage Site',
    status: 'published',
  },
  {
    slug: 'mosque-al-rifai',
    nameEn: 'Al-Rifa\'i Mosque',
    nameAr: 'مسجد الرفاعي',
    period: 'modern',
    district: 'citadel',
    type: 'mosque',
    foundedYear: 1869,
    founder: 'Princess Khushyar (completed under Khedive Abbas II)',
    founderAr: 'الأميرة خوشيار (اكتمل في عهد الخديوي عباس الثاني)',
    lat: '30.0289', lng: '31.2570',
    historyEn: 'Al-Rifa\'i Mosque, completed in 1912 CE after a 43-year construction, was commissioned by Princess Khushyar, mother of Khedive Ismail, as a royal mausoleum and congregational mosque. Architect Husayn Fahmi designed it in a neo-Mamluk style to complement the adjacent Sultan Hasan Mosque, deliberately echoing Mamluk proportions and stone carving. The mosque contains the tombs of Egypt\'s royal family including Khedive Ismail, King Fuad I, King Farouk, and Shah Mohammad Reza Pahlavi of Iran. Despite its 19th-century construction, it is often mistaken for a medieval monument — a testament to the quality of its historicist design.',
    historyAr: 'مسجد الرفاعي، المكتمل عام 1912م بعد 43 عاماً من البناء، أمرت ببنائه الأميرة خوشيار والدة الخديوي إسماعيل، لتكون ضريحاً ملكياً ومسجداً جامعاً. صممه المعماري حسين فهمي بأسلوب نيو-مملوكي ليتناسق مع مسجد السلطان حسن المجاور، مستحضراً عن قصد النسب المملوكية والنحت الحجري. يضم المسجد أضرحة الأسرة المالكة المصرية بما فيها الخديوي إسماعيل والملك فؤاد الأول والملك فاروق وشاه إيران محمد رضا بهلوي. رغم بنائه في القرن التاسع عشر، كثيراً ما يُخطأ في تصنيفه كمعلم وسيطي، شهادةً على جودة تصميمه التاريخاني.',
    activeWorship: true,
    clarificationEn: 'Al-Rifa\'i Mosque is not a medieval building. It was completed in 1912 and designed to look like a Mamluk monument.',
    clarificationAr: 'مسجد الرفاعي ليس مبنى وسيطياً. اكتمل عام 1912م وصُمِّم ليبدو كمعلم مملوكي.',
    architecturalStyle: 'Neo-Mamluk',
    currentFunction: 'Active Mosque / Royal Mausoleum',
    status: 'published',
  },
  {
    slug: 'mosque-ibn-tulun',
    nameEn: 'Mosque of Ahmad Ibn Tulun',
    nameAr: 'مسجد أحمد بن طولون',
    period: 'tulunid',
    district: 'fustat',
    type: 'mosque',
    foundedYear: 876,
    founder: 'Ahmad ibn Tulun',
    founderAr: 'أحمد بن طولون',
    lat: '30.0070', lng: '31.2296',
    historyEn: 'The Mosque of Ahmad Ibn Tulun, completed in 879 CE, is the oldest intact mosque in Cairo and one of the largest in the world. Ahmad ibn Tulun, the Abbasid governor who effectively made Egypt independent, built this mosque in his new capital al-Qata\'i north of Fustat. Its design, with a spiral external minaret echoing the Great Mosque of Samarra in Iraq, reflects Ibn Tulun\'s Mesopotamian origins. The mosque\'s vast courtyard, arcaded on four sides with pointed arches, predates similar forms in the Islamic west. After the Fatimid conquest destroyed al-Qata\'i, only the mosque survived, preserved by successive dynasties as a Friday mosque.',
    historyAr: 'مسجد أحمد بن طولون، المكتمل عام 879م، هو أقدم مسجد متكامل في القاهرة وأحد أكبر المساجد في العالم. بناه أحمد بن طولون، الوالي العباسي الذي جعل مصر مستقلة فعلياً، في عاصمته الجديدة القطائع شمال الفسطاط. يعكس تصميمه بمئذنته الخارجية الحلزونية، التي تستحضر الجامع الكبير في سامراء بالعراق، أصول ابن طولون الرافدينية. الفناء الواسع للمسجد، المحاط بأروقة ذات أقواس مدببة من الجوانب الأربعة، يسبق أشكالاً مماثلة في الغرب الإسلامي. بعد أن دمر الفتح الفاطمي القطائع، نجا المسجد وحده، محفوظاً من الأسرات المتعاقبة كمسجد للجمعة.',
    activeWorship: true,
    clarificationEn: 'The spiral minaret is an external structure with an external staircase, not a minaret built into the mosque wall.',
    clarificationAr: 'المئذنة الحلزونية هيكل خارجي بدرج خارجي، وليست مئذنة مدمجة في جدار المسجد.',
    architecturalStyle: 'Tulunid / Abbasid',
    currentFunction: 'Active Mosque / Heritage Site',
    status: 'published',
  },
  {
    slug: 'mosque-al-hakim',
    nameEn: 'Mosque of al-Hakim bi-Amr Allah',
    nameAr: 'جامع الحاكم بأمر الله',
    period: 'fatimid',
    district: 'al-muizz',
    type: 'mosque',
    foundedYear: 990,
    founder: 'Caliph al-Aziz (completed by al-Hakim)',
    founderAr: 'الخليفة العزيز (اكتمل في عهد الحاكم)',
    lat: '30.0548', lng: '31.2612',
    historyEn: 'The Mosque of al-Hakim bi-Amr Allah, completed in 1013 CE, is the second great Fatimid congregational mosque of Cairo, built just inside Bab al-Futuh at the northern end of al-Muizz Street. Begun by Caliph al-Aziz in 990 CE, it was completed by his son al-Hakim, the controversial Fatimid caliph whose reign combined brilliant administration with episodes of extreme persecution. The mosque\'s two minarets, with their unusual cylindrical shafts encased in square bases, are among the earliest surviving Fatimid minarets. The mosque was used as a prison, stable, and warehouse before being restored in the 1980s by the Dawoodi Bohra community, who use it for prayer.',
    historyAr: 'جامع الحاكم بأمر الله، المكتمل عام 1013م، هو ثاني المساجد الجامعة الفاطمية الكبرى في القاهرة، مبني داخل باب الفتوح مباشرةً عند الطرف الشمالي لشارع المعز. بدأ بناءه الخليفة العزيز عام 990م وأكمله ابنه الحاكم، الخليفة الفاطمي المثير للجدل الذي جمع حكمه بين الإدارة البارعة وحوادث الاضطهاد الشديد. مئذنتا المسجد بأعمدتهما الأسطوانية المحاطة بقواعد مربعة من بين أقدم المآذن الفاطمية الباقية. استُخدم المسجد سجناً وإسطبلاً ومستودعاً قبل أن يُرمم في ثمانينيات القرن العشرين من قِبل مجتمع الداوودي البهرة الذي يستخدمه للصلاة.',
    activeWorship: true,
    clarificationEn: 'The mosque was restored by the Dawoodi Bohra Ismaili community, not by the Egyptian government, and serves as their prayer space.',
    clarificationAr: 'رُمِّم المسجد من قِبل مجتمع الداوودي البهرة الإسماعيلي، لا الحكومة المصرية، ويُستخدم مصلى لهم.',
    architecturalStyle: 'Fatimid',
    currentFunction: 'Active Mosque (Dawoodi Bohra)',
    status: 'published',
  },
  {
    slug: 'mosque-al-aqmar',
    nameEn: 'Al-Aqmar Mosque',
    nameAr: 'جامع الأقمر',
    period: 'fatimid',
    district: 'al-muizz',
    type: 'mosque',
    foundedYear: 1125,
    founder: 'Vizier al-Ma\'mun al-Bata\'ihi',
    founderAr: 'الوزير المأمون البطائحي',
    lat: '30.0496', lng: '31.2609',
    historyEn: 'Al-Aqmar Mosque, built in 1125 CE, is the oldest surviving mosque in Cairo with a decorated stone facade. Vizier al-Ma\'mun al-Bata\'ihi built it under Caliph al-Amir, and its name — meaning "moonlit" — refers to the shimmering quality of its carved limestone facade. The facade is remarkable for being the first in Cairo to be aligned with the street rather than the prayer direction, requiring the interior to be angled to face Mecca. The carved medallions and muqarnas hood over the entrance represent the earliest surviving example of this decorative vocabulary in Cairo. The mosque also features the earliest known use of a recessed facade in Egyptian Islamic architecture.',
    historyAr: 'جامع الأقمر، المبني عام 1125م، هو أقدم مسجد باقٍ في القاهرة بواجهة حجرية مزخرفة. بناه الوزير المأمون البطائحي في عهد الخليفة الآمر، واسمه — الذي يعني "المضيء بضوء القمر" — يشير إلى البريق المتلألئ لواجهته الحجرية الجيرية المنحوتة. تتميز الواجهة بكونها الأولى في القاهرة المحاذية للشارع لا لاتجاه الصلاة، مما استلزم إمالة الداخل نحو مكة. تمثل المقرنصات المنحوتة والأطباق الزخرفية فوق المدخل أقدم نموذج باقٍ لهذه المفردات الزخرفية في القاهرة. يضم المسجد أيضاً أقدم استخدام معروف للواجهة الغائرة في العمارة الإسلامية المصرية.',
    activeWorship: true,
    clarificationEn: 'The facade faces the street, not Mecca. The prayer hall inside is angled to correct the orientation toward the qibla.',
    clarificationAr: 'الواجهة تواجه الشارع لا مكة. قاعة الصلاة الداخلية مائلة لتصحيح الاتجاه نحو القبلة.',
    architecturalStyle: 'Fatimid',
    currentFunction: 'Active Mosque',
    status: 'published',
  },
  {
    slug: 'mosque-al-azhar',
    nameEn: 'Al-Azhar Mosque',
    nameAr: 'الجامع الأزهر',
    period: 'fatimid',
    district: 'al-azhar',
    type: 'mosque',
    foundedYear: 970,
    founder: 'General Jawhar al-Siqilli (for Caliph al-Muizz)',
    founderAr: 'القائد جوهر الصقلي (للخليفة المعز)',
    lat: '30.0459', lng: '31.2626',
    historyEn: 'Al-Azhar Mosque, founded in 970 CE, is the oldest continuously operating university in the world and the spiritual heart of Sunni Islam. General Jawhar al-Siqilli built it as the congregational mosque of the new Fatimid capital al-Qahira. Initially a Shia institution, it was converted to Sunni teaching after Saladin\'s conquest in 1171 CE. Over twelve centuries, successive dynasties added minarets, arcades, and madrasas, making al-Azhar a palimpsest of Islamic architectural history. Today it remains the preeminent institution of Islamic scholarship, with students from across the Muslim world. Its five minarets represent Fatimid, Mamluk, and Ottoman contributions.',
    historyAr: 'الجامع الأزهر، المؤسَّس عام 970م، هو أقدم جامعة تعمل باستمرار في العالم والقلب الروحي للإسلام السني. بناه القائد جوهر الصقلي مسجداً جامعاً للعاصمة الفاطمية الجديدة القاهرة. كان في الأصل مؤسسة شيعية قبل أن يُحوَّل إلى التدريس السني بعد فتح صلاح الدين عام 1171م. على مدى اثني عشر قرناً، أضافت الأسرات المتعاقبة مآذن وأروقة ومدارس، مما جعل الأزهر نسيجاً طبقياً من تاريخ العمارة الإسلامية. لا يزال اليوم المؤسسة الرائدة في الدراسات الإسلامية، يقصده الطلاب من أرجاء العالم الإسلامي. مآذنه الخمس تمثل إسهامات فاطمية ومملوكية وعثمانية.',
    activeWorship: true,
    clarificationEn: 'Al-Azhar was founded as a Shia Ismaili institution and only became a Sunni center after 1171 CE.',
    clarificationAr: 'أُسِّس الأزهر مؤسسةً شيعية إسماعيلية ولم يصبح مركزاً سنياً إلا بعد عام 1171م.',
    architecturalStyle: 'Fatimid / Mamluk / Ottoman composite',
    currentFunction: 'Active Mosque / University',
    status: 'published',
  },
  {
    slug: 'complex-qalawun',
    nameEn: 'Qalawun Complex',
    nameAr: 'مجموعة قلاوون',
    period: 'bahri-mamluk',
    district: 'al-muizz',
    type: 'complex',
    foundedYear: 1284,
    founder: 'Sultan Qalawun',
    founderAr: 'السلطان قلاوون',
    lat: '30.0503', lng: '31.2607',
    historyEn: 'The Qalawun Complex, built between 1284 and 1285 CE, is the founding monument of Mamluk dynastic architecture on al-Muizz Street. Sultan Qalawun built this massive complex — comprising a madrasa, mausoleum, and hospital (maristan) — in just over a year, reportedly using stone from a Fatimid palace. The hospital, which treated patients of all faiths and social classes free of charge, was the most advanced medical facility of its time, with separate wards for different conditions, a pharmacy, and a library. The mausoleum\'s interior, with its Andalusian-influenced stucco and Byzantine-inspired windows, reflects the cosmopolitan nature of Mamluk patronage.',
    historyAr: 'مجموعة قلاوون، المبنية بين 1284 و1285م، هي المعلم التأسيسي للعمارة الأسرية المملوكية في شارع المعز. بنى السلطان قلاوون هذا المجمع الضخم — المكوّن من مدرسة وضريح ومارستان — في أكثر من عام بقليل، مستخدماً على ما يُروى حجارة قصر فاطمي. كان المارستان، الذي عالج المرضى من جميع الأديان والطبقات الاجتماعية مجاناً، أكثر المرافق الطبية تقدماً في عصره، بأجنحة منفصلة لحالات مختلفة وصيدلية ومكتبة. يعكس داخل الضريح بجصه المتأثر بالأندلس ونوافذه المستوحاة من البيزنطية الطابع الكوزموبوليتاني لرعاية المماليك.',
    activeWorship: false,
    clarificationEn: 'The hospital (maristan) treated patients of all faiths free of charge, not just Muslims.',
    clarificationAr: 'عالج المارستان المرضى من جميع الأديان مجاناً، لا المسلمين وحدهم.',
    architecturalStyle: 'Bahri Mamluk',
    currentFunction: 'Heritage Site / Active Mausoleum',
    status: 'published',
  },
  {
    slug: 'complex-barquq-muizz',
    nameEn: 'Khanqah and Mosque of Faraj ibn Barquq',
    nameAr: 'خانقاه ومسجد فرج بن برقوق',
    period: 'burji-mamluk',
    district: 'northern-cemetery',
    type: 'complex',
    foundedYear: 1410,
    founder: 'Sultan Faraj ibn Barquq',
    founderAr: 'السلطان فرج بن برقوق',
    lat: '30.0620', lng: '31.2750',
    historyEn: 'The Khanqah and Mausoleum of Faraj ibn Barquq, completed in 1411 CE in the Northern Cemetery, is one of the most architecturally ambitious monuments of the Burji Mamluk period. Sultan Faraj built this complex to house his father Barquq\'s remains and a large Sufi lodge (khanqah). Its twin domes — the first pair of carved stone domes in Cairo — and twin minarets create a perfectly symmetrical facade unprecedented in Egyptian architecture. The carved stone domes, with their interlocking geometric star patterns, represent the peak of Mamluk stone-carving craft. The complex also includes a sabil-kuttab and residential cells for Sufi residents.',
    historyAr: 'خانقاه ومقبرة فرج بن برقوق، المكتملة عام 1411م في القرافة الشمالية، من أكثر المعالم طموحاً معمارياً في العصر المملوكي البرجي. بنى السلطان فرج هذا المجمع ليحتضن رفات والده برقوق وخانقاه صوفية كبيرة. قبتاه المزدوجتان — أول زوج من القباب الحجرية المنحوتة في القاهرة — ومئذنتاه تخلقان واجهة متماثلة تماماً لم يسبق لها مثيل في العمارة المصرية. القباب الحجرية المنحوتة بأنماطها النجمية الهندسية المتشابكة تمثل ذروة حرفة النحت الحجري المملوكي. يضم المجمع أيضاً سبيلاً وكتاباً وخلايا سكنية للمقيمين الصوفيين.',
    activeWorship: false,
    clarificationEn: 'The carved stone domes are not plastered or painted — the geometric patterns are cut directly into the stone.',
    clarificationAr: 'القباب الحجرية المنحوتة ليست مجصصة أو مطلية — الأنماط الهندسية محفورة مباشرةً في الحجر.',
    architecturalStyle: 'Burji Mamluk',
    currentFunction: 'Heritage Site',
    status: 'published',
  },
  {
    slug: 'bab-al-futuh',
    nameEn: 'Bab al-Futuh',
    nameAr: 'باب الفتوح',
    period: 'fatimid',
    district: 'al-muizz',
    type: 'gate',
    foundedYear: 1087,
    founder: 'Vizier Badr al-Jamali',
    founderAr: 'الوزير بدر الجمالي',
    lat: '30.0556', lng: '31.2617',
    historyEn: 'Bab al-Futuh, the Gate of Conquests, was built in 1087 CE by Vizier Badr al-Jamali as part of his reconstruction of Cairo\'s northern walls. Along with Bab al-Nasr and Bab Zuweila, it represents the finest surviving example of Fatimid military architecture. The gate\'s two round towers, connected by a vaulted passage, were designed by Armenian architects brought from Edessa. The interior passage features a complex system of bent entrances and murder holes designed to trap and eliminate attackers. Bab al-Futuh faces north, traditionally the direction of conquest, and was used for military processions departing on campaigns.',
    historyAr: 'باب الفتوح، بُني عام 1087م من قِبل الوزير بدر الجمالي ضمن إعادة بنائه للأسوار الشمالية للقاهرة. إلى جانب باب النصر وباب زويلة، يمثل أرقى نموذج باقٍ للعمارة العسكرية الفاطمية. صمّم برجَي البوابة المستديرَين المعماريون الأرمن القادمون من الرها، ويربطهما ممر مقبّو. يتضمن الممر الداخلي نظاماً معقداً من المداخل المنكسرة وفتحات الإيذاء المصممة لاحتجاز المهاجمين والقضاء عليهم. يواجه باب الفتوح الشمال، اتجاه الفتح تقليدياً، وكان يُستخدم للمواكب العسكرية المتوجهة في حملات.',
    activeWorship: false,
    clarificationEn: 'The towers of Bab al-Futuh were designed by Armenian architects, not Arab or Egyptian craftsmen.',
    clarificationAr: 'صمّم أبراج باب الفتوح معماريون أرمن، لا حرفيون عرب أو مصريون.',
    architecturalStyle: 'Fatimid Military',
    currentFunction: 'Heritage Site / Museum',
    status: 'published',
  },
  {
    slug: 'bab-al-nasr',
    nameEn: 'Bab al-Nasr',
    nameAr: 'باب النصر',
    period: 'fatimid',
    district: 'al-muizz',
    type: 'gate',
    foundedYear: 1087,
    founder: 'Vizier Badr al-Jamali',
    founderAr: 'الوزير بدر الجمالي',
    lat: '30.0556', lng: '31.2622',
    historyEn: 'Bab al-Nasr, the Gate of Victory, was built in 1087 CE alongside Bab al-Futuh by Vizier Badr al-Jamali. While Bab al-Futuh has round towers, Bab al-Nasr features square towers — a deliberate architectural distinction. The gate\'s interior walls are covered with Crusader graffiti from the 13th century, when Frankish prisoners were held in the towers. The gate faces northeast toward the Sinai and was associated with military victories returning from the east. Napoleon\'s French army camped near this gate during the 1798 occupation, and French soldiers left inscriptions alongside the Crusader graffiti.',
    historyAr: 'باب النصر، بُني عام 1087م جنباً إلى جنب مع باب الفتوح من قِبل الوزير بدر الجمالي. في حين يتميز باب الفتوح بأبراج مستديرة، يتميز باب النصر بأبراج مربعة — تمييز معماري مقصود. تغطي جدران الممر الداخلي نقوش صليبية من القرن الثالث عشر، حين احتُجز الأسرى الفرنجة في الأبراج. يواجه الباب الشمال الشرقي نحو سيناء وارتبط بالانتصارات العسكرية العائدة من الشرق. خيّم جيش نابليون الفرنسي قرب هذا الباب إبان احتلال 1798م، وترك الجنود الفرنسيون نقوشاً إلى جانب الكتابات الصليبية.',
    activeWorship: false,
    clarificationEn: 'The Crusader graffiti inside Bab al-Nasr was made by Frankish prisoners held in the towers, not by invaders who breached the gate.',
    clarificationAr: 'النقوش الصليبية داخل باب النصر خلّفها أسرى فرنجة احتُجزوا في الأبراج، لا غزاة اقتحموا البوابة.',
    architecturalStyle: 'Fatimid Military',
    currentFunction: 'Heritage Site',
    status: 'published',
  },
  {
    slug: 'bab-zuweila',
    nameEn: 'Bab Zuweila',
    nameAr: 'باب زويلة',
    period: 'fatimid',
    district: 'al-muizz',
    type: 'gate',
    foundedYear: 1092,
    founder: 'Vizier Badr al-Jamali',
    founderAr: 'الوزير بدر الجمالي',
    lat: '30.0440', lng: '31.2607',
    historyEn: 'Bab Zuweila, the southern gate of Fatimid Cairo, was built in 1092 CE and is the last surviving gate of the original Fatimid city walls. Named after the Berber Zuweila tribe that camped near it, the gate served as the ceremonial southern entrance to al-Qahira. Its two towers are topped by the twin minarets of the Mosque of al-Muayyad, added in the 15th century. Bab Zuweila was Cairo\'s principal place of public execution for centuries — the last Mamluk sultan, Tuman Bay, was hanged here three times before dying in 1517. The gate also served as the departure point for the annual Hajj caravan.',
    historyAr: 'باب زويلة، البوابة الجنوبية للقاهرة الفاطمية، بُني عام 1092م وهو آخر بوابة باقية من أسوار المدينة الفاطمية الأصلية. سُمِّي باسم قبيلة البربر الزويلة التي خيّمت بالقرب منه، وكان البوابة الجنوبية الرسمية للقاهرة. يعلو برجَيه مئذنتا مسجد المؤيد المضافتان في القرن الخامس عشر. كان باب زويلة لقرون المكان الرئيسي للإعدام العلني في القاهرة — شُنق هنا آخر السلاطين المماليك طومان باي ثلاث مرات قبل أن يموت عام 1517م. كانت البوابة أيضاً نقطة انطلاق قافلة الحج السنوية.',
    activeWorship: false,
    clarificationEn: 'The minarets on top of Bab Zuweila belong to the Mosque of al-Muayyad, not to the gate itself.',
    clarificationAr: 'المآذن فوق باب زويلة تعود لمسجد المؤيد، لا للبوابة نفسها.',
    architecturalStyle: 'Fatimid Military',
    currentFunction: 'Heritage Site / Museum',
    status: 'published',
  },
  {
    slug: 'mosque-al-muayyad',
    nameEn: 'Mosque of al-Muayyad',
    nameAr: 'مسجد المؤيد',
    period: 'burji-mamluk',
    district: 'al-muizz',
    type: 'mosque',
    foundedYear: 1415,
    founder: 'Sultan al-Muayyad Shaykh',
    founderAr: 'السلطان المؤيد شيخ',
    lat: '30.0441', lng: '31.2608',
    historyEn: 'The Mosque of al-Muayyad, completed in 1421 CE, was built by Sultan al-Muayyad Shaykh on the site of a prison where he had been incarcerated before becoming sultan. He vowed to build a mosque if released, and fulfilled his promise with this grand Burji Mamluk complex. The mosque\'s two minarets were placed atop the towers of Bab Zuweila, creating one of Cairo\'s most iconic skyline compositions. The interior features a hypostyle hall with ancient columns taken from earlier monuments, and the marble floor and carved wooden minbar are among the finest of the period. The attached mausoleum contains the sultan\'s tomb.',
    historyAr: 'مسجد المؤيد، المكتمل عام 1421م، بناه السلطان المؤيد شيخ على موقع سجن كان محتجزاً فيه قبل أن يصبح سلطاناً. نذر ببناء مسجد إذا أُطلق سراحه، فوفى بوعده بهذا المجمع البرجي المملوكي الفخم. وُضعت مئذنتا المسجد فوق برجَي باب زويلة، مما خلق أحد أكثر تكوينات أفق القاهرة أيقونية. يضم الداخل قاعة أعمدة بأعمدة قديمة مأخوذة من معالم سابقة، والأرضية الرخامية والمنبر الخشبي المنحوت من أرقى ما في تلك الحقبة. يحتوي الضريح الملحق على قبر السلطان.',
    activeWorship: true,
    clarificationEn: 'Sultan al-Muayyad built this mosque on the site of the prison where he was held — it was a personal vow, not a state commission.',
    clarificationAr: 'بنى السلطان المؤيد هذا المسجد على موقع السجن الذي احتُجز فيه — كان نذراً شخصياً لا تكليفاً رسمياً.',
    architecturalStyle: 'Burji Mamluk',
    currentFunction: 'Active Mosque',
    status: 'published',
  },
  {
    slug: 'mosque-al-ghuri',
    nameEn: 'Mosque and Mausoleum of al-Ghuri',
    nameAr: 'مسجد وضريح الغوري',
    period: 'burji-mamluk',
    district: 'al-muizz',
    type: 'mosque',
    foundedYear: 1503,
    founder: 'Sultan Qansuh al-Ghuri',
    founderAr: 'السلطان قانصوه الغوري',
    lat: '30.0466', lng: '31.2618',
    historyEn: 'The Mosque and Mausoleum of al-Ghuri, completed in 1505 CE, forms the last great Mamluk complex on al-Muizz Street. Sultan Qansuh al-Ghuri built this paired complex — mosque on one side of the street, mausoleum and khanqah on the other — as a monument to Mamluk cultural achievement at the moment of its decline. The mosque\'s distinctive striped minaret, with its five-bulb finial, is one of Cairo\'s most recognizable landmarks. Al-Ghuri died at the Battle of Marj Dabiq in 1516 fighting the Ottomans and was never buried in his mausoleum. The complex hosts the famous Tanoura whirling dervish performances.',
    historyAr: 'مسجد وضريح الغوري، المكتمل عام 1505م، يشكّل آخر المجمعات المملوكية الكبرى في شارع المعز. بنى السلطان قانصوه الغوري هذا المجمع المزدوج — مسجد على جانب من الشارع وضريح وخانقاه على الجانب الآخر — شاهداً على الإنجاز الثقافي المملوكي في لحظة أفوله. مئذنة المسجد المخططة المميزة بتاجها الخماسي البصلي من أكثر معالم القاهرة تميزاً. مات الغوري في معركة مرج دابق عام 1516م مقاتلاً العثمانيين ولم يُدفن قط في ضريحه. يستضيف المجمع عروض التنورة الدراويش الشهيرة.',
    activeWorship: true,
    clarificationEn: 'Al-Ghuri died in battle against the Ottomans and was never buried in his mausoleum. The tomb inside is empty.',
    clarificationAr: 'مات الغوري في معركة ضد العثمانيين ولم يُدفن قط في ضريحه. القبر الداخلي فارغ.',
    architecturalStyle: 'Burji Mamluk',
    currentFunction: 'Active Mosque / Cultural Venue',
    status: 'published',
  },
  {
    slug: 'wakala-al-ghuri',
    nameEn: 'Wakala of al-Ghuri',
    nameAr: 'وكالة الغوري',
    period: 'burji-mamluk',
    district: 'al-muizz',
    type: 'wakala',
    foundedYear: 1504,
    founder: 'Sultan Qansuh al-Ghuri',
    founderAr: 'السلطان قانصوه الغوري',
    lat: '30.0465', lng: '31.2617',
    historyEn: 'The Wakala of al-Ghuri, built in 1504 CE, is the best-preserved medieval commercial caravanserai in Cairo. Sultan al-Ghuri built this five-story structure as a commercial khan where merchants could store goods on the ground floor and sleep in the upper-floor rooms. The ground floor consisted of locked storage rooms around a central courtyard, while the upper floors provided residential accommodation for traveling merchants. Today the wakala has been restored and serves as a center for traditional crafts and cultural performances, including the famous Tanoura whirling dervish shows.',
    historyAr: 'وكالة الغوري، المبنية عام 1504م، هي أفضل خان تجاري وسيطي محفوظ في القاهرة. بنى السلطان الغوري هذا المبنى الخماسي الطوابق خاناً تجارياً يخزن فيه التجار بضائعهم في الطابق الأرضي وينامون في غرف الطوابق العليا. تتكون الطابق الأرضي من غرف تخزين مقفلة حول فناء مركزي، بينما توفر الطوابق العليا إقامة للتجار المسافرين. اليوم رُمِّمت الوكالة وتعمل مركزاً للحرف التقليدية والعروض الثقافية، بما فيها عروض التنورة الشهيرة.',
    activeWorship: false,
    clarificationEn: 'The wakala is a commercial caravanserai, not a mosque or religious building.',
    clarificationAr: 'الوكالة خان تجاري، لا مسجد أو مبنى ديني.',
    architecturalStyle: 'Burji Mamluk',
    currentFunction: 'Cultural Center / Craft Market',
    status: 'published',
  },
  {
    slug: 'bayt-al-suhaymi',
    nameEn: 'Bayt al-Suhaymi',
    nameAr: 'بيت السحيمي',
    period: 'ottoman',
    district: 'al-muizz',
    type: 'house',
    foundedYear: 1648,
    founder: 'Ahmad al-Suhaymi (expanded by later owners)',
    founderAr: 'أحمد السحيمي (وسّعه ملاك لاحقون)',
    lat: '30.0524', lng: '31.2617',
    historyEn: 'Bayt al-Suhaymi, built in 1648 CE and expanded in 1796 CE, is the finest surviving example of Ottoman-period domestic architecture in Cairo. The house demonstrates the characteristic features of Islamic domestic design: a blank exterior wall facing the street, an entrance bent to prevent views into the interior, and a central courtyard with a fountain providing light, air, and sound. The upper floors feature mashrabiyya wooden screens that allow women to observe the street without being seen. The qa\'a (reception hall) with its sunken central fountain and raised seating areas represents the pinnacle of Ottoman domestic luxury in Egypt.',
    historyAr: 'بيت السحيمي، المبني عام 1648م والموسَّع عام 1796م، هو أرقى نموذج باقٍ للعمارة السكنية في القاهرة العثمانية. يُجسّد البيت السمات المميزة للتصميم السكني الإسلامي: جدار خارجي أصمت يواجه الشارع، ومدخل منكسر يمنع الرؤية إلى الداخل، وفناء مركزي بنافورة توفر الضوء والهواء والصوت. تتميز الطوابق العليا بمشربيات خشبية تتيح للنساء مراقبة الشارع دون أن يُرَيْن. القاعة بحوضها المركزي الغائر ومناطق الجلوس المرتفعة تمثل ذروة الفخامة السكنية العثمانية في مصر.',
    activeWorship: false,
    clarificationEn: 'Bayt al-Suhaymi is not a single building but a complex of two houses merged over time by different owners.',
    clarificationAr: 'بيت السحيمي ليس مبنى واحداً بل مجمع من بيتين اندمجا عبر الزمن بأيدي ملاك مختلفين.',
    architecturalStyle: 'Ottoman Cairene',
    currentFunction: 'Museum',
    status: 'published',
  },
  {
    slug: 'nilometer-roda',
    nameEn: 'Nilometer on Roda Island',
    nameAr: 'مقياس النيل في روضة',
    period: 'abbasid',
    district: 'fustat',
    type: 'nilometer',
    foundedYear: 861,
    founder: 'Caliph al-Mutawakkil',
    founderAr: 'الخليفة المتوكل',
    lat: '29.9988', lng: '31.2216',
    historyEn: 'The Nilometer on Roda Island, built in 861 CE under Caliph al-Mutawakkil, is the oldest surviving Islamic monument in Egypt. This instrument for measuring the annual Nile flood was critical to Egypt\'s agricultural economy — the flood level determined tax rates and predicted famine or plenty. The octagonal marble column at the center of the cistern is marked with graduated measurements. The conical roof and interior decoration were added in the 19th century. The Nilometer was used continuously from its construction until the building of the Aswan High Dam in the 1960s made annual flood measurement obsolete.',
    historyAr: 'مقياس النيل في جزيرة الروضة، المبني عام 861م في عهد الخليفة المتوكل، هو أقدم معلم إسلامي باقٍ في مصر. كانت هذه الأداة لقياس الفيضان السنوي للنيل حيوية للاقتصاد الزراعي المصري — حدد مستوى الفيضان معدلات الضرائب وتنبأ بالمجاعة أو الخير. العمود الرخامي الثماني الأضلاع في مركز الصهريج مُعلَّم بقياسات متدرجة. أُضيف السقف المخروطي والزخارف الداخلية في القرن التاسع عشر. استُخدم المقياس باستمرار منذ بنائه حتى جعل بناء السد العالي في ستينيات القرن العشرين قياس الفيضان السنوي متقادماً.',
    activeWorship: false,
    clarificationEn: 'The decorative roof and interior inscriptions were added in the 19th century, not in the original 9th-century construction.',
    clarificationAr: 'السقف الزخرفي والنقوش الداخلية أُضيفت في القرن التاسع عشر، لا في البناء الأصلي من القرن التاسع.',
    architecturalStyle: 'Abbasid',
    currentFunction: 'Museum',
    status: 'published',
  },
  {
    slug: 'museum-of-islamic-art',
    nameEn: 'Museum of Islamic Art',
    nameAr: 'متحف الفن الإسلامي',
    period: 'modern',
    district: 'fustat',
    type: 'museum',
    foundedYear: 1903,
    founder: 'Khedive Abbas II',
    founderAr: 'الخديوي عباس الثاني',
    lat: '30.0438', lng: '31.2483',
    historyEn: 'The Museum of Islamic Art in Cairo, opened in 1903, houses one of the world\'s most important collections of Islamic art and artifacts. The museum contains over 100,000 objects spanning fourteen centuries of Islamic civilization, from the 7th century to the 19th century, collected from across Egypt and the Islamic world. Its collection includes woodwork, metalwork, ceramics, textiles, manuscripts, and architectural elements from demolished Cairo monuments. The building itself, in a neo-Mamluk style, was damaged in a 2014 car bombing but has been extensively restored. The museum serves as a reference collection for understanding the objects still in situ in Cairo\'s monuments.',
    historyAr: 'متحف الفن الإسلامي في القاهرة، المفتوح عام 1903م، يحتضن أحد أهم مجموعات الفن الإسلامي والتحف في العالم. يضم المتحف أكثر من 100,000 قطعة تمتد عبر أربعة عشر قرناً من الحضارة الإسلامية، من القرن السابع حتى القرن التاسع عشر، جُمعت من مصر والعالم الإسلامي. تشمل مجموعته الأعمال الخشبية والمعدنية والخزفية والمنسوجات والمخطوطات والعناصر المعمارية من معالم القاهرة المهدومة. تضرر المبنى نفسه بأسلوب نيو-مملوكي في تفجير سيارة عام 2014م لكنه رُمِّم على نطاق واسع. يعمل المتحف مجموعة مرجعية لفهم الأشياء الموجودة في موضعها الأصلي في معالم القاهرة.',
    activeWorship: false,
    clarificationEn: 'The Museum of Islamic Art is not located in Islamic Cairo but in the adjacent Bab al-Khalq district.',
    clarificationAr: 'متحف الفن الإسلامي لا يقع في القاهرة الإسلامية بل في حي باب الخلق المجاور.',
    architecturalStyle: 'Neo-Mamluk',
    currentFunction: 'Museum',
    status: 'published',
  },
  {
    slug: 'mosque-amr-ibn-al-as',
    nameEn: 'Mosque of Amr ibn al-As',
    nameAr: 'مسجد عمرو بن العاص',
    period: 'rashidun',
    district: 'fustat',
    type: 'mosque',
    foundedYear: 641,
    founder: 'Amr ibn al-As',
    founderAr: 'عمرو بن العاص',
    lat: '29.9992', lng: '31.2298',
    historyEn: 'The Mosque of Amr ibn al-As, founded in 641 CE, is the first mosque built in Africa and the oldest in Egypt. General Amr ibn al-As built it in the newly founded city of Fustat after the Arab conquest of Egypt. The original mosque was a simple hypostyle structure of mud brick, far smaller than the current building. It has been demolished and rebuilt many times over fourteen centuries, and nothing of the original structure survives above ground. The current building dates primarily from the 18th-century Ottoman restoration. Despite its reconstructed state, the mosque remains a major pilgrimage site and active place of worship.',
    historyAr: 'مسجد عمرو بن العاص، المؤسَّس عام 641م، هو أول مسجد بُني في أفريقيا وأقدم مسجد في مصر. بناه القائد عمرو بن العاص في مدينة الفسطاط المؤسَّسة حديثاً بعد الفتح العربي لمصر. كان المسجد الأصلي هيكلاً بسيطاً من الطوب اللبن، أصغر بكثير من المبنى الحالي. هُدم وأُعيد بناؤه مرات عديدة على مدى أربعة عشر قرناً، ولا يبقى شيء من الهيكل الأصلي فوق الأرض. يعود المبنى الحالي أساساً إلى الترميم العثماني في القرن الثامن عشر. رغم حالته المُعاد بناؤها، يظل المسجد موقعاً للحج الديني ومكاناً نشطاً للعبادة.',
    activeWorship: true,
    clarificationEn: 'Nothing of the original 7th-century mosque survives. The current building is primarily an 18th-century Ottoman reconstruction.',
    clarificationAr: 'لا يبقى شيء من المسجد الأصلي من القرن السابع. المبنى الحالي في معظمه إعادة بناء عثمانية من القرن الثامن عشر.',
    architecturalStyle: 'Ottoman (reconstructed)',
    currentFunction: 'Active Mosque',
    status: 'published',
  },
  {
    slug: 'sabil-kuttab-abd-al-rahman-katkhuda',
    nameEn: 'Sabil-Kuttab of Abd al-Rahman Katkhuda',
    nameAr: 'سبيل وكتاب عبد الرحمن كتخدا',
    period: 'late-ottoman',
    district: 'al-muizz',
    type: 'sabil',
    foundedYear: 1744,
    founder: 'Abd al-Rahman Katkhuda',
    founderAr: 'عبد الرحمن كتخدا',
    lat: '30.0500', lng: '31.2610',
    historyEn: 'The Sabil-Kuttab of Abd al-Rahman Katkhuda, built in 1744 CE, is one of the finest examples of the Ottoman charitable institution combining a public water fountain (sabil) with a Quranic school (kuttab) on the floor above. Abd al-Rahman Katkhuda, a powerful Mamluk bey under Ottoman rule, was the most prolific patron of architecture in 18th-century Cairo, commissioning over 50 buildings. This sabil-kuttab, positioned at the fork of al-Muizz Street, features an elegant Ottoman facade with colorful Iznik-style tiles and bronze grilles. The kuttab above provided free Quranic education to neighborhood children.',
    historyAr: 'سبيل وكتاب عبد الرحمن كتخدا، المبني عام 1744م، من أرقى نماذج المؤسسة الخيرية العثمانية التي تجمع نافورة مياه عامة (سبيل) مع مدرسة قرآنية (كتاب) في الطابق العلوي. كان عبد الرحمن كتخدا، بيك مملوكي نافذ في ظل الحكم العثماني، أكثر راعي العمارة إنتاجاً في القاهرة في القرن الثامن عشر، إذ أمر ببناء أكثر من 50 مبنى. يتميز هذا السبيل والكتاب، الواقع عند تفرع شارع المعز، بواجهة عثمانية أنيقة بكسوة من البلاط بأسلوب إزنيك الملون وشبكات برونزية. وفّر الكتاب العلوي تعليماً قرآنياً مجانياً لأطفال الحي.',
    activeWorship: false,
    clarificationEn: 'The sabil provided free drinking water to passersby, while the kuttab above provided free Quranic education — both were charitable endowments (waqf).',
    clarificationAr: 'وفّر السبيل مياه شرب مجانية للمارة، بينما وفّر الكتاب العلوي تعليماً قرآنياً مجانياً — كلاهما أوقاف خيرية.',
    architecturalStyle: 'Late Ottoman Cairene',
    currentFunction: 'Heritage Site',
    status: 'published',
  },
  {
    slug: 'mosque-al-hussein',
    nameEn: 'Al-Hussein Mosque and District',
    nameAr: 'مسجد الحسين والحي',
    period: 'fatimid',
    district: 'al-azhar',
    type: 'mosque',
    foundedYear: 1154,
    founder: 'Caliph al-Zafir (Fatimid)',
    founderAr: 'الخليفة الظافر (فاطمي)',
    lat: '30.0465', lng: '31.2628',
    historyEn: 'The Al-Hussein Mosque, originally built in 1154 CE and substantially rebuilt in the 19th century, is one of the most sacred sites in Egypt for both Sunni and Shia Muslims. The mosque is believed to contain the head of Husayn ibn Ali, grandson of the Prophet Muhammad, brought from Ascalon in 1153 CE. The current building, in a neo-Mamluk style, dates from 1873 CE. The surrounding district is Cairo\'s most vibrant religious and commercial neighborhood, especially during Mawlid al-Nabi celebrations. Non-Muslims are not permitted to enter the mosque interior, though the surrounding square and market are open to all.',
    historyAr: 'مسجد الحسين، المبني في الأصل عام 1154م والمُعاد بناؤه جوهرياً في القرن التاسع عشر، من أقدس المواقع في مصر لدى المسلمين السنة والشيعة على حد سواء. يُعتقد أن المسجد يحتضن رأس الحسين بن علي، حفيد النبي محمد، المجلوبة من عسقلان عام 1153م. يعود المبنى الحالي بأسلوبه النيو-مملوكي إلى عام 1873م. الحي المحيط به هو أكثر أحياء القاهرة حيوية دينياً وتجارياً، لا سيما خلال احتفالات المولد النبوي. لا يُسمح لغير المسلمين بدخول داخل المسجد، وإن كانت الساحة المحيطة والسوق مفتوحَين للجميع.',
    activeWorship: true,
    clarificationEn: 'Non-Muslims are not permitted inside the mosque. The surrounding square and Khan al-Khalili market are open to everyone.',
    clarificationAr: 'لا يُسمح لغير المسلمين بالدخول إلى داخل المسجد. الساحة المحيطة وسوق خان الخليلي مفتوحان للجميع.',
    architecturalStyle: 'Neo-Mamluk (19th century)',
    currentFunction: 'Active Mosque / Sacred Site',
    status: 'published',
  },
  {
    slug: 'khan-al-khalili',
    nameEn: 'Khan al-Khalili',
    nameAr: 'خان الخليلي',
    period: 'burji-mamluk',
    district: 'al-azhar',
    type: 'wakala',
    foundedYear: 1382,
    founder: 'Amir Jarkas al-Khalili',
    founderAr: 'الأمير جركس الخليلي',
    lat: '30.0473', lng: '31.2622',
    historyEn: 'Khan al-Khalili, established in 1382 CE by Amir Jarkas al-Khalili, is Cairo\'s most famous bazaar and one of the oldest continuously operating markets in the world. Built on the site of the Fatimid royal necropolis, the original khan was a commercial caravanserai for merchants from across the Islamic world. Sultan al-Ghuri rebuilt much of it in the early 16th century. Today the market extends across several blocks near al-Hussein Mosque, selling spices, jewelry, textiles, and crafts. The historic core of the market, with its medieval lanes and Ottoman-era facades, remains largely intact despite centuries of commercial activity.',
    historyAr: 'خان الخليلي، المؤسَّس عام 1382م من قِبل الأمير جركس الخليلي، هو أشهر أسواق القاهرة وأحد أقدم الأسواق التي تعمل باستمرار في العالم. بُني على موقع مقبرة الأسرة الفاطمية الملكية، وكان الخان الأصلي خاناً تجارياً للتجار من أرجاء العالم الإسلامي. أعاد السلطان الغوري بناء معظمه في مطلع القرن السادس عشر. اليوم يمتد السوق عبر عدة مبانٍ بالقرب من مسجد الحسين، يبيع التوابل والمجوهرات والمنسوجات والحرف. يظل النواة التاريخية للسوق بأزقتها الوسيطية وواجهاتها العثمانية محفوظة إلى حد بعيد رغم قرون من النشاط التجاري.',
    activeWorship: false,
    clarificationEn: 'Khan al-Khalili was built on the site of the Fatimid royal cemetery, not on an empty lot.',
    clarificationAr: 'بُني خان الخليلي على موقع مقبرة الأسرة الفاطمية الملكية، لا على أرض فضاء.',
    architecturalStyle: 'Mamluk / Ottoman',
    currentFunction: 'Active Market / Heritage Site',
    status: 'published',
  },
  {
    slug: 'bayn-al-qasrayn',
    nameEn: 'Bayn al-Qasrayn',
    nameAr: 'بين القصرين',
    period: 'fatimid',
    district: 'al-muizz',
    type: 'street',
    foundedYear: 969,
    founder: 'Fatimid Caliphate',
    founderAr: 'الخلافة الفاطمية',
    lat: '30.0500', lng: '31.2608',
    historyEn: 'Bayn al-Qasrayn, meaning "Between the Two Palaces," was the ceremonial heart of Fatimid Cairo, a grand esplanade flanked by the Eastern and Western Fatimid palaces. The palaces, which no longer exist, were among the largest royal complexes in the medieval Islamic world, housing the caliph\'s court, treasury, and thousands of servants. Today the site is occupied by the dense concentration of Mamluk monuments — the complexes of Qalawun, al-Nasir Muhammad, and Barquq — built on the ruins of the Fatimid palaces. The street name survives as a reminder of the vanished Fatimid royal city beneath the Mamluk monuments.',
    historyAr: 'بين القصرين، بمعنى "بين القصرين"، كان قلب القاهرة الفاطمية الاحتفالي، ساحة فسيحة تحف بها القصران الفاطميان الشرقي والغربي. القصران، اللذان لم يعودا موجودَين، كانا من أكبر المجمعات الملكية في العالم الإسلامي الوسيطي، يحتضنان بلاط الخليفة وخزينته وآلاف الخدم. اليوم يشغل الموقع التركيز الكثيف للمعالم المملوكية — مجمعات قلاوون والناصر محمد وبرقوق — المبنية على أنقاض القصور الفاطمية. يبقى اسم الشارع تذكيراً بالمدينة الملكية الفاطمية الزائلة تحت المعالم المملوكية.',
    activeWorship: false,
    clarificationEn: 'The Fatimid palaces of Bayn al-Qasrayn no longer exist. The current monuments are Mamluk buildings constructed on their ruins.',
    clarificationAr: 'القصور الفاطمية في بين القصرين لم تعد موجودة. المعالم الحالية مبانٍ مملوكية شُيِّدت على أنقاضها.',
    architecturalStyle: 'Fatimid (site) / Mamluk (current buildings)',
    currentFunction: 'Heritage Street',
    status: 'published',
  },
  {
    slug: 'mosque-al-salih-talai',
    nameEn: 'Mosque of al-Salih Tala\'i',
    nameAr: 'مسجد الصالح طلائع',
    period: 'fatimid',
    district: 'al-muizz',
    type: 'mosque',
    foundedYear: 1160,
    founder: 'Vizier Tala\'i ibn Ruzzik',
    founderAr: 'الوزير طلائع بن رزيك',
    lat: '30.0440', lng: '31.2609',
    historyEn: 'The Mosque of al-Salih Tala\'i, built in 1160 CE, is the last Fatimid mosque built in Cairo and one of the finest examples of Fatimid architecture. Vizier Tala\'i ibn Ruzzik built it outside Bab Zuweila to receive the head of Husayn ibn Ali, which he intended to house here before it was taken to the al-Hussein Mosque. The mosque\'s facade, with its keel-arch portico and engaged columns, is the most complete surviving Fatimid mosque facade in Cairo. The building originally stood at street level but subsequent raising of the street level has left it partially below grade, with shops built into the substructure.',
    historyAr: 'مسجد الصالح طلائع، المبني عام 1160م، هو آخر مسجد فاطمي بُني في القاهرة وأحد أرقى نماذج العمارة الفاطمية. بناه الوزير طلائع بن رزيك خارج باب زويلة لاستقبال رأس الحسين بن علي التي كان ينوي إيوائها هنا قبل أن تُنقل إلى مسجد الحسين. واجهة المسجد بأروقتها ذات الأقواس المدببة وأعمدتها المدمجة هي أكمل واجهة مسجد فاطمي باقية في القاهرة. كان المبنى في الأصل على مستوى الشارع، لكن الارتفاع اللاحق لمستوى الشارع تركه جزئياً تحت مستوى الأرض مع محلات مبنية في البنية التحتية.',
    activeWorship: true,
    clarificationEn: 'The mosque sits below current street level because streets have been raised over centuries by accumulated debris and construction.',
    clarificationAr: 'يقع المسجد تحت مستوى الشارع الحالي لأن الشوارع ارتفعت عبر القرون بتراكم الأنقاض والبناء.',
    architecturalStyle: 'Fatimid',
    currentFunction: 'Active Mosque',
    status: 'published',
  },
  {
    slug: 'citadel-of-cairo',
    nameEn: 'Cairo Citadel',
    nameAr: 'قلعة صلاح الدين الأيوبي',
    period: 'ayyubid',
    district: 'citadel',
    type: 'citadel',
    foundedYear: 1176,
    founder: 'Sultan Salah al-Din (Saladin)',
    founderAr: 'السلطان صلاح الدين الأيوبي',
    lat: '30.0288', lng: '31.2594',
    historyEn: 'The Cairo Citadel, begun in 1176 CE by Salah al-Din (Saladin), served as the seat of Egyptian government for nearly 700 years. Built on a spur of the Muqattam Hills overlooking the city, the Citadel was designed as a fortified royal city containing palaces, mosques, barracks, and administrative buildings. Successive dynasties — Ayyubid, Mamluk, Ottoman, and Muhammad Ali — added, demolished, and rebuilt structures within its walls. The most prominent surviving monument is the Mosque of Muhammad Ali (1848), whose Ottoman-style domes and pencil minarets dominate Cairo\'s skyline. The Citadel also contains the Mosque of al-Nasir Muhammad (1318) and several museums.',
    historyAr: 'قلعة القاهرة، التي بدأ بناؤها عام 1176م من قِبل صلاح الدين الأيوبي، كانت مقر الحكومة المصرية قرابة 700 عام. بُنيت على نتوء من جبل المقطم يطل على المدينة، وصُمِّمت القلعة كمدينة ملكية محصنة تحتوي قصوراً ومساجد وثكنات ومبانٍ إدارية. أضافت الأسرات المتعاقبة — الأيوبية والمملوكية والعثمانية ومحمد علي — هياكل داخل أسوارها وهدمتها وأعادت بناءها. أبرز المعالم الباقية مسجد محمد علي (1848م) الذي تهيمن قبابه العثمانية ومآذنه الرصاصية على أفق القاهرة. تضم القلعة أيضاً مسجد الناصر محمد (1318م) وعدة متاحف.',
    activeWorship: true,
    clarificationEn: 'The Citadel is not a single building but a fortified complex containing multiple mosques, palaces, and museums from different periods.',
    clarificationAr: 'القلعة ليست مبنى واحداً بل مجمع محصن يحتوي مساجد وقصوراً ومتاحف متعددة من حقب مختلفة.',
    architecturalStyle: 'Ayyubid / Mamluk / Ottoman composite',
    currentFunction: 'Heritage Site / Active Mosque / Museum',
    status: 'published',
  },
  {
    slug: 'mosque-muhammad-ali-citadel',
    nameEn: 'Mosque of Muhammad Ali',
    nameAr: 'مسجد محمد علي',
    period: 'modern',
    district: 'citadel',
    type: 'mosque',
    foundedYear: 1830,
    founder: 'Muhammad Ali Pasha',
    founderAr: 'محمد علي باشا',
    lat: '30.0287', lng: '31.2594',
    historyEn: 'The Mosque of Muhammad Ali, completed in 1848 CE, is the most visible landmark on Cairo\'s skyline and the centerpiece of the Citadel complex. Muhammad Ali Pasha, the Albanian-born founder of modern Egypt, commissioned this Ottoman-style mosque as his dynastic mausoleum and the symbol of his modernizing rule. The architect Yusuf Boshnak designed it in the style of Ottoman imperial mosques, with a large central dome, four semi-domes, and two slender pencil minarets. The alabaster-clad exterior gives the mosque its distinctive shimmering appearance. Muhammad Ali\'s tomb stands in the prayer hall. The mosque replaced several Mamluk structures that Muhammad Ali demolished.',
    historyAr: 'مسجد محمد علي، المكتمل عام 1848م، هو أكثر معالم أفق القاهرة وضوحاً ومحور مجمع القلعة. أمر محمد علي باشا، مؤسس مصر الحديثة المولود في ألبانيا، ببناء هذا المسجد بأسلوب عثماني كضريح أسري ورمز لحكمه التحديثي. صممه المعماري يوسف بوشناق بأسلوب المساجد الإمبراطورية العثمانية، بقبة مركزية كبيرة وأربع أنصاف قباب ومئذنتين رصاصيتين رفيعتين. يمنح الكساء الخارجي من الألباستر المسجد مظهره المتلألئ المميز. يقع ضريح محمد علي في قاعة الصلاة. حلّ المسجد محل عدة مبانٍ مملوكية هدمها محمد علي.',
    activeWorship: true,
    clarificationEn: 'Muhammad Ali was Albanian-born, not Egyptian. He founded the dynasty that ruled Egypt until 1952.',
    clarificationAr: 'محمد علي مولود في ألبانيا، لا مصري. أسس الأسرة التي حكمت مصر حتى عام 1952م.',
    architecturalStyle: 'Ottoman Imperial',
    currentFunction: 'Active Mosque / Royal Mausoleum',
    status: 'published',
  },
];

// Get existing slugs to avoid duplicates
const [existingPlaces] = await conn.execute('SELECT slug FROM places');
const existingSlugs = new Set(existingPlaces.map(p => p.slug));

let inserted = 0;
for (const place of newPlaces) {
  if (existingSlugs.has(place.slug)) {
    // Update existing place with richer content
    await conn.execute(
      `UPDATE places SET 
        historyEn=?, historyAr=?, clarificationEn=?, clarificationAr=?,
        architecturalStyle=?, currentFunction=?, activeWorship=?,
        lat=?, lng=?, status=?
       WHERE slug=?`,
      [
        place.historyEn, place.historyAr,
        place.clarificationEn || null, place.clarificationAr || null,
        place.architecturalStyle || null, place.currentFunction || null,
        place.activeWorship ? 1 : 0,
        place.lat, place.lng, place.status,
        place.slug
      ]
    );
    console.log(`Updated: ${place.slug}`);
  } else {
    const periodId = periodMap[place.period] || null;
    const districtId = districtMap[place.district] || null;
    const typeId = typeMap[place.type] || null;

    await conn.execute(
      `INSERT INTO places (slug, nameEn, nameAr, periodId, districtId, placeTypeId, foundedYear, 
        founderEn, founderAr, historyEn, historyAr, clarificationEn, clarificationAr,
        architecturalStyle, currentFunction, activeWorship, lat, lng, status, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        place.slug, place.nameEn, place.nameAr,
        periodId, districtId, typeId,
        place.foundedYear || null,
        place.founder || null, place.founderAr || null,
        place.historyEn, place.historyAr,
        place.clarificationEn || null, place.clarificationAr || null,
        place.architecturalStyle || null, place.currentFunction || null,
        place.activeWorship ? 1 : 0,
        place.lat, place.lng,
        place.status, 50
      ]
    );
    inserted++;
    console.log(`Inserted: ${place.slug}`);
  }
}

console.log(`Done. Inserted ${inserted} new places, updated ${newPlaces.length - inserted} existing.`);

// Add more curated comparisons (target: 14 total)
const [existingComparisons] = await conn.execute('SELECT slug FROM comparisons');
const existingCompSlugs = new Set(existingComparisons.map(c => c.slug));

const newComparisons = [
  {
    slug: 'fatimid-gates-comparison',
    titleEn: 'Three Gates, One Wall: Fatimid Military Architecture',
    titleAr: 'ثلاثة أبواب، سور واحد: العمارة العسكرية الفاطمية',
    descriptionEn: 'Compare Bab al-Futuh, Bab al-Nasr, and Bab Zuweila — the three surviving Fatimid gates built by Badr al-Jamali in 1087–1092 CE. Each gate has a distinct architectural character despite being built by the same patron.',
    descriptionAr: 'قارن بين باب الفتوح وباب النصر وباب زويلة — البوابات الفاطمية الثلاث الباقية التي بناها بدر الجمالي في 1087-1092م. لكل بوابة طابع معماري مميز رغم بنائها من قِبل نفس الراعي.',
    placeSlug1: 'bab-al-futuh', placeSlug2: 'bab-al-nasr', placeSlug3: 'bab-zuweila',
    status: 'published', sortOrder: 5
  },
  {
    slug: 'ibn-tulun-al-azhar',
    titleEn: 'Ibn Tulun vs. Al-Azhar: Two Founding Mosques',
    titleAr: 'ابن طولون مقابل الأزهر: مسجدان تأسيسيان',
    descriptionEn: 'Compare the Tulunid mosque of 879 CE with the Fatimid mosque of 970 CE. Both were built as congregational mosques for new capitals, yet their architectural languages are entirely different.',
    descriptionAr: 'قارن بين المسجد الطولوني من 879م والمسجد الفاطمي من 970م. كلاهما بُني مسجداً جامعاً لعاصمة جديدة، ومع ذلك تختلف لغتاهما المعمارية اختلافاً جذرياً.',
    placeSlug1: 'mosque-ibn-tulun', placeSlug2: 'mosque-al-azhar',
    status: 'published', sortOrder: 6
  },
  {
    slug: 'qalawun-barquq-mamluk-patronage',
    titleEn: 'Qalawun vs. Barquq: Bahri and Burji Mamluk Patronage',
    titleAr: 'قلاوون مقابل برقوق: رعاية المماليك البحرية والبرجية',
    descriptionEn: 'Compare the two great complexes that face each other at Bayn al-Qasrayn. Built a century apart, they reveal how Mamluk architectural ambition evolved from the Bahri to the Burji period.',
    descriptionAr: 'قارن بين المجمعين الكبيرين المتقابلَين في بين القصرين. بُنيا على مسافة قرن من الزمن، يكشفان كيف تطورت الطموحات المعمارية المملوكية من الحقبة البحرية إلى البرجية.',
    placeSlug1: 'complex-qalawun', placeSlug2: 'complex-barquq-muizz',
    status: 'published', sortOrder: 7
  },
  {
    slug: 'sultan-hasan-al-rifai',
    titleEn: 'Sultan Hasan vs. Al-Rifa\'i: Medieval vs. Modern',
    titleAr: 'السلطان حسن مقابل الرفاعي: وسيطي مقابل حديث',
    descriptionEn: 'Compare the 14th-century Mamluk masterpiece with its 19th-century neo-Mamluk neighbor. One is authentic medieval architecture; the other is a deliberate historicist imitation. Can you tell the difference?',
    descriptionAr: 'قارن بين التحفة المملوكية من القرن الرابع عشر وجارها النيو-مملوكي من القرن التاسع عشر. أحدهما عمارة وسيطية أصيلة والآخر تقليد تاريخاني مقصود. هل يمكنك تمييز الفرق؟',
    placeSlug1: 'complex-sultan-hasan', placeSlug2: 'mosque-al-rifai',
    status: 'published', sortOrder: 8
  },
  {
    slug: 'bab-zuweila-bab-futuh',
    titleEn: 'Bab al-Futuh vs. Bab Zuweila: Two Gates, One City',
    titleAr: 'باب الفتوح مقابل باب زويلة: بوابتان، مدينة واحدة',
    descriptionEn: 'Compare the northern and southern gates of Fatimid Cairo. Both were built by Badr al-Jamali, yet they have different tower shapes, different orientations, and different histories.',
    descriptionAr: 'قارن بين البوابتين الشمالية والجنوبية للقاهرة الفاطمية. كلتاهما بناهما بدر الجمالي، ومع ذلك تختلفان في شكل الأبراج والاتجاه والتاريخ.',
    placeSlug1: 'bab-al-futuh', placeSlug2: 'bab-zuweila',
    status: 'published', sortOrder: 9
  },
  {
    slug: 'ibn-tulun-al-hakim',
    titleEn: 'Ibn Tulun vs. Al-Hakim: Abbasid vs. Fatimid Congregational Mosques',
    titleAr: 'ابن طولون مقابل الحاكم: مساجد جامعة عباسية وفاطمية',
    descriptionEn: 'Compare the two largest early mosques of Cairo. Ibn Tulun (879 CE) reflects Abbasid Mesopotamian influence; al-Hakim (1013 CE) represents mature Fatimid architecture. Both are hypostyle mosques but with very different characters.',
    descriptionAr: 'قارن بين أكبر مسجدَين مبكرَين في القاهرة. ابن طولون (879م) يعكس التأثير العباسي الرافديني؛ الحاكم (1013م) يمثل العمارة الفاطمية الناضجة. كلاهما مسجد ذو أعمدة لكن بطابعَين مختلفَين جداً.',
    placeSlug1: 'mosque-ibn-tulun', placeSlug2: 'mosque-al-hakim',
    status: 'published', sortOrder: 10
  },
  {
    slug: 'al-aqmar-al-salih-talai-fatimid-facades',
    titleEn: 'Al-Aqmar vs. Al-Salih Tala\'i: Fatimid Street Facades',
    titleAr: 'الأقمر مقابل الصالح طلائع: واجهات الشارع الفاطمية',
    descriptionEn: 'Compare the two most important surviving Fatimid mosque facades on al-Muizz Street. Both solved the problem of aligning a mosque facade with a street while maintaining the correct prayer direction.',
    descriptionAr: 'قارن بين أهم واجهتَي مسجد فاطمي باقيتَين في شارع المعز. كلتاهما حلّت مشكلة محاذاة واجهة المسجد مع الشارع مع الحفاظ على اتجاه الصلاة الصحيح.',
    placeSlug1: 'mosque-al-aqmar', placeSlug2: 'mosque-al-salih-talai',
    status: 'published', sortOrder: 11
  },
  {
    slug: 'bayt-al-suhaymi-wakala-al-ghuri-ottoman',
    titleEn: 'Bayt al-Suhaymi vs. Wakala al-Ghuri: Domestic vs. Commercial',
    titleAr: 'بيت السحيمي مقابل وكالة الغوري: سكني مقابل تجاري',
    descriptionEn: 'Compare the finest surviving examples of Ottoman-period domestic and commercial architecture in Cairo. Both use a central courtyard as the organizing principle, but for very different purposes.',
    descriptionAr: 'قارن بين أرقى نماذج العمارة السكنية والتجارية من الحقبة العثمانية الباقية في القاهرة. كلاهما يستخدم الفناء المركزي كمبدأ تنظيمي، لكن لأغراض مختلفة جداً.',
    placeSlug1: 'bayt-al-suhaymi', placeSlug2: 'wakala-al-ghuri',
    status: 'published', sortOrder: 12
  },
  {
    slug: 'qalawun-sultan-hasan-mamluk-scale',
    titleEn: 'Qalawun vs. Sultan Hasan: The Evolution of Mamluk Scale',
    titleAr: 'قلاوون مقابل السلطان حسن: تطور المقياس المملوكي',
    descriptionEn: 'Compare the first great Mamluk complex on al-Muizz Street (1285 CE) with the greatest Mamluk monument (1363 CE). Seventy-five years separate them — how did Mamluk architectural ambition change?',
    descriptionAr: 'قارن بين أول مجمع مملوكي كبير في شارع المعز (1285م) وأعظم معلم مملوكي (1363م). خمسة وسبعون عاماً تفصلهما — كيف تغير الطموح المعماري المملوكي؟',
    placeSlug1: 'complex-qalawun', placeSlug2: 'complex-sultan-hasan',
    status: 'published', sortOrder: 13
  },
  {
    slug: 'mosque-al-ghuri-wakala-al-ghuri',
    titleEn: 'Al-Ghuri Mosque vs. Wakala al-Ghuri: Sacred and Commercial',
    titleAr: 'مسجد الغوري مقابل وكالة الغوري: مقدس وتجاري',
    descriptionEn: 'Compare two buildings by the same patron, facing each other across al-Muizz Street. The mosque and the commercial wakala represent the two poles of Mamluk urban life: the sacred and the mercantile.',
    descriptionAr: 'قارن بين مبنيَين لنفس الراعي يتقابلان عبر شارع المعز. يمثل المسجد والوكالة التجارية قطبَي الحياة الحضرية المملوكية: المقدس والتجاري.',
    placeSlug1: 'mosque-al-ghuri', placeSlug2: 'wakala-al-ghuri',
    status: 'published', sortOrder: 14
  },
];

let compInserted = 0;
for (const comp of newComparisons) {
  if (existingCompSlugs.has(comp.slug)) {
    console.log(`Comparison already exists: ${comp.slug}`);
    continue;
  }
  // Get place IDs for the comparison
  const [p1] = await conn.execute('SELECT id FROM places WHERE slug=?', [comp.placeSlug1]);
  const [p2] = await conn.execute('SELECT id FROM places WHERE slug=?', [comp.placeSlug2]);
  const [p3] = comp.placeSlug3 ? await conn.execute('SELECT id FROM places WHERE slug=?', [comp.placeSlug3]) : [[]];
  
  const placeIds = [p1[0]?.id, p2[0]?.id, p3[0]?.id].filter(Boolean);
  
  await conn.execute(
    `INSERT INTO comparisons (slug, titleEn, titleAr, descriptionEn, descriptionAr, placeIdsJson, status, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [comp.slug, comp.titleEn, comp.titleAr, comp.descriptionEn, comp.descriptionAr, JSON.stringify(placeIds), comp.status, comp.sortOrder]
  );
  compInserted++;
  console.log(`Inserted comparison: ${comp.slug}`);
}
console.log(`Inserted ${compInserted} new comparisons.`);

// Add more stories (target: 15 total)
const [existingStories] = await conn.execute('SELECT slug FROM stories');
const existingStorySlugs = new Set(existingStories.map(s => s.slug));

const newStories = [
  {
    slug: 'the-water-carriers-of-cairo',
    titleEn: 'The Water Carriers of Cairo',
    titleAr: 'سقاة القاهرة',
    summaryEn: 'How did a city of a million people get fresh water before modern plumbing? The story of Cairo\'s elaborate water distribution system, from the Nile to the sabil fountains.',
    summaryAr: 'كيف حصلت مدينة بمليون نسمة على المياه العذبة قبل وجود السباكة الحديثة؟ قصة نظام توزيع المياه المتطور في القاهرة، من النيل إلى نوافير السبيل.',
    status: 'published', sortOrder: 6
  },
  {
    slug: 'the-mamluk-slave-soldiers',
    titleEn: 'The Slave Soldiers Who Built an Empire',
    titleAr: 'الجنود العبيد الذين بنوا إمبراطورية',
    summaryEn: 'The Mamluks were enslaved soldiers who became sultans. How did a system of military slavery produce Cairo\'s greatest architectural patrons?',
    summaryAr: 'كان المماليك جنوداً مستعبَدين أصبحوا سلاطين. كيف أنتج نظام الاستعباد العسكري أعظم رعاة العمارة في القاهرة؟',
    status: 'published', sortOrder: 7
  },
  {
    slug: 'the-fatimid-city-beneath',
    titleEn: 'The Fatimid City Beneath Your Feet',
    titleAr: 'المدينة الفاطمية تحت أقدامك',
    summaryEn: 'The streets of Islamic Cairo are built on centuries of accumulated debris. What lies beneath al-Muizz Street, and how do archaeologists read the layers?',
    summaryAr: 'شوارع القاهرة الإسلامية مبنية على قرون من الأنقاض المتراكمة. ماذا يكمن تحت شارع المعز، وكيف يقرأ علماء الآثار الطبقات؟',
    status: 'published', sortOrder: 8
  },
  {
    slug: 'women-patrons-of-islamic-cairo',
    titleEn: 'Women Who Built Cairo',
    titleAr: 'النساء اللواتي بنين القاهرة',
    summaryEn: 'From Shajar al-Durr to Princess Khushyar, women played a crucial role as architectural patrons in Islamic Cairo. Their monuments tell a story of power, piety, and legacy.',
    summaryAr: 'من شجر الدر إلى الأميرة خوشيار، أدّت النساء دوراً محورياً كراعيات للعمارة في القاهرة الإسلامية. معالمهن تحكي قصة السلطة والتقوى والإرث.',
    status: 'published', sortOrder: 9
  },
  {
    slug: 'the-crusader-connection',
    titleEn: 'The Crusader Connection: Looted Stones and Borrowed Forms',
    titleAr: 'الصلة الصليبية: أحجار منهوبة وأشكال مستعارة',
    summaryEn: 'Cairo\'s monuments contain surprising traces of the Crusader world: Gothic decorations on Mamluk minarets, Frankish graffiti in Fatimid towers, and architectural ideas that crossed the battle lines.',
    summaryAr: 'تحتوي معالم القاهرة على آثار مفاجئة من العالم الصليبي: زخارف قوطية على مآذن مملوكية، ونقوش فرنجية في أبراج فاطمية، وأفكار معمارية عبرت خطوط المعارك.',
    status: 'published', sortOrder: 10
  },
  {
    slug: 'the-dome-as-language',
    titleEn: 'Reading the Dome: A Visual Language',
    titleAr: 'قراءة القبة: لغة بصرية',
    summaryEn: 'How to read the carved stone domes of the Mamluk period as a visual language of power and faith.',
    summaryAr: 'كيف تقرأ القباب الحجرية المنحوتة من الحقبة المملوكية كلغة بصرية للسلطة والإيمان.',
    status: 'published', sortOrder: 11
  },
  {
    slug: 'the-ottoman-transformation',
    titleEn: 'The Ottoman Transformation: How Cairo Changed After 1517',
    titleAr: 'التحول العثماني: كيف تغيرت القاهرة بعد 1517م',
    summaryEn: 'When the Ottomans conquered Cairo in 1517, they inherited the world\'s greatest Islamic city. How did Ottoman rule change Cairo\'s architecture, urban life, and cultural identity?',
    summaryAr: 'حين فتح العثمانيون القاهرة عام 1517م، ورثوا أعظم مدينة إسلامية في العالم. كيف غيّر الحكم العثماني عمارة القاهرة وحياتها الحضرية وهويتها الثقافية؟',
    status: 'published', sortOrder: 12
  },
  {
    slug: 'the-aga-khan-restoration',
    titleEn: 'Saving Historic Cairo: The Conservation Story',
    titleAr: 'إنقاذ القاهرة التاريخية: قصة الحفاظ',
    summaryEn: 'How did UNESCO, the Aga Khan Trust for Culture, and Egyptian heritage bodies work together to conserve one of the world\'s most endangered historic cities?',
    summaryAr: 'كيف تعاونت اليونسكو وصندوق الآغا خان للثقافة والهيئات المصرية للتراث للحفاظ على إحدى أكثر المدن التاريخية خطراً في العالم؟',
    status: 'published', sortOrder: 13
  },
  {
    slug: 'the-street-of-ten-centuries',
    titleEn: 'The Street of Ten Centuries',
    titleAr: 'شارع عشرة قرون',
    summaryEn: 'Al-Muizz Street has been the spine of Cairo for over a thousand years. Walk its length and read ten centuries of Islamic history in stone.',
    summaryAr: 'كان شارع المعز العمود الفقري للقاهرة لأكثر من ألف عام. امشِ على امتداده واقرأ عشرة قرون من التاريخ الإسلامي في الحجر.',
    status: 'published', sortOrder: 14
  },
  {
    slug: 'the-living-city',
    titleEn: 'The Living City: Islamic Cairo Today',
    titleAr: 'المدينة الحية: القاهرة الإسلامية اليوم',
    summaryEn: 'Islamic Cairo is not a museum. Two million people live and work in its medieval streets. What is daily life like in one of the world\'s oldest continuously inhabited urban areas?',
    summaryAr: 'القاهرة الإسلامية ليست متحفاً. مليونا شخص يعيشون ويعملون في شوارعها الوسيطية. كيف تبدو الحياة اليومية في إحدى أقدم المناطق الحضرية المأهولة باستمرار في العالم؟',
    status: 'published', sortOrder: 15
  },
];

let storyInserted = 0;
for (const story of newStories) {
  if (existingStorySlugs.has(story.slug)) {
    console.log(`Story already exists: ${story.slug}`);
    continue;
  }
  await conn.execute(
    `INSERT INTO stories (slug, titleEn, titleAr, summaryEn, summaryAr, status, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [story.slug, story.titleEn, story.titleAr, story.summaryEn, story.summaryAr, story.status, story.sortOrder]
  );
  storyInserted++;
  console.log(`Inserted story: ${story.slug}`);
}
console.log(`Inserted ${storyInserted} new stories.`);

await conn.end();
console.log('Expansion seed complete!');
