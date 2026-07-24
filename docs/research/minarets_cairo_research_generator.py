#!/usr/bin/env python3
"""Offline generator for the Minarets of Cairo research package.

The research data is embedded below so this script is deterministic and needs
no network connection, API key, or third-party package at run time.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from datetime import date
from pathlib import Path
from typing import Any


CHECKED_DATE = "2026-07-24"
UNKNOWN = "Unknown — requires official or field verification."
UNRESOLVED = "Monument-specific evidence, current visitor conditions, and reuse-cleared image metadata require official or field verification."


# status|slug|English inventory name
INVENTORY_TEXT = """PUBLISHED_MEDIA|al-aqmar-mosque|Al-Aqmar Mosque
PUBLISHED_MEDIA|al-azhar-mosque|Al-Azhar Mosque
PUBLISHED_MEDIA|al-azhar-park|Al-Azhar Park
PUBLISHED_MEDIA|al-hussein-mosque|Al-Hussein Mosque and District
PUBLISHED_MEDIA|al-muizz-street|Al-Muizz Street
PUBLISHED_MEDIA|al-rifai-mosque|Al-Rifa'i Mosque
PUBLISHED_MEDIA|bab-al-futuh|Bab al-Futuh
PUBLISHED_MEDIA|bab-al-nasr|Bab al-Nasr
PUBLISHED_MEDIA|bab-zuweila|Bab Zuweila
PUBLISHED_MEDIA|barquq-complex|Madrasa and Khanqah of Sultan Barquq
PUBLISHED_MEDIA|bayn-al-qasrayn|Bayn al-Qasrayn
PUBLISHED_MEDIA|bayt-al-suhaymi|Bayt al-Suhaymi
PUBLISHED_MEDIA|cairo-citadel|Cairo Citadel
PUBLISHED_MEDIA|citadel-of-cairo|Cairo Citadel
PUBLISHED_MEDIA|complex-barquq-muizz|Khanqah and Mosque of Faraj ibn Barquq
PUBLISHED_MEDIA|complex-qalawun|Qalawun Complex
PUBLISHED_MEDIA|complex-sultan-hasan|Mosque and Madrasa of Sultan Hasan
PUBLISHED_MEDIA|faraj-ibn-barquq-khanqah|Khanqah and Mosque of Faraj ibn Barquq
PUBLISHED_MEDIA|khan-al-khalili|Khan al-Khalili
PUBLISHED_MEDIA|mosque-al-aqmar|Al-Aqmar Mosque
PUBLISHED_MEDIA|mosque-al-azhar|Al-Azhar Mosque
PUBLISHED_MEDIA|mosque-al-ghuri|Mosque and Mausoleum of al-Ghuri
PUBLISHED_MEDIA|mosque-al-hakim|Mosque of al-Hakim bi-Amr Allah
PUBLISHED_MEDIA|mosque-al-hussein|Al-Hussein Mosque and District
PUBLISHED_MEDIA|mosque-al-muayyad|Mosque of al-Mu'ayyad
PUBLISHED_MEDIA|mosque-al-nasir-muhammad-citadel|Mosque of al-Nasir Muhammad at the Citadel
PUBLISHED_MEDIA|mosque-al-rifai|Al-Rifa'i Mosque
PUBLISHED_MEDIA|mosque-al-salih-ayyub|Madrasa and Mausoleum of al-Salih Ayyub
PUBLISHED_MEDIA|mosque-al-salih-talai|Mosque of al-Salih Tala'i
PUBLISHED_MEDIA|mosque-amr-ibn-al-as|Mosque of Amr ibn al-As
PUBLISHED_MEDIA|mosque-ibn-tulun|Mosque of Ahmad Ibn Tulun
PUBLISHED_MEDIA|mosque-muhammad-ali-citadel|Mosque of Muhammad Ali
PUBLISHED_MEDIA|muhammad-ali-mosque|Mosque of Muhammad Ali
PUBLISHED_MEDIA|museum-islamic-art|Museum of Islamic Art
PUBLISHED_MEDIA|museum-of-islamic-art|Museum of Islamic Art
PUBLISHED_MEDIA|nilometer-roda|Nilometer on Roda Island
PUBLISHED_MEDIA|qalawun-complex|Qalawun Complex
PUBLISHED_MEDIA|sabil-abd-al-rahman-katkhuda|Sabil-Kuttab of Abd al-Rahman Katkhuda
PUBLISHED_MEDIA|sabil-kuttab-abd-al-rahman-katkhuda|Sabil-Kuttab of Abd al-Rahman Katkhuda
PUBLISHED_MEDIA|sultan-hasan-mosque|Mosque and Madrasa of Sultan Hasan
PUBLISHED_MEDIA|wakala-al-ghuri|Wakala of al-Ghuri
PROPOSED_V4|aqunsqur-blue-mosque|Aqsunqur Mosque / Blue Mosque
PROPOSED_V4|bayt-al-razzaz|Bayt al-Razzaz
PROPOSED_V4|gayer-anderson-museum|Gayer-Anderson Museum
PROPOSED_V4|mausoleum-imam-al-shafii|Mausoleum of Imam al-Shafi'i
PROPOSED_V4|mausoleum-shajarat-al-durr|Mausoleum of Shajarat al-Durr
PROPOSED_V4|mosque-sabil-sulayman-agha-al-silahdar|Mosque-Sabil-Kuttab of Sulayman Agha al-Silahdar
PROPOSED_V4|sabil-kuttab-nafisa-al-bayda|Sabil-Kuttab of Nafisa al-Bayda
PROPOSED_V4|sinan-pasha-mosque-bulaq|Sinan Pasha Mosque
PROPOSED_V4|sulayman-pasha-al-khadim-mosque|Mosque of Sulayman Pasha al-Khadim
PROPOSED_V4|sultan-qaytbay-funerary-complex|Funerary Complex of Sultan Qaytbay
CANDIDATE|abu-al-ila-mosque-district|Abu al-Ila Mosque and District
CANDIDATE|ayyubid-wall-darb-al-ahmar|Ayyubid Wall in Darb al-Ahmar
CANDIDATE|azbakiyya-urban-history|Azbakiyya Islamic Urban History
CANDIDATE|bab-al-wazir-street|Bab al-Wazir Street Ensemble
CANDIDATE|barsbay-northern-cemetery|Funerary Complex of Barsbay
CANDIDATE|bayt-al-harrawi|Bayt al-Harrawi
CANDIDATE|bayt-al-sinnari|Bayt al-Sinnari
CANDIDATE|bayt-gamal-al-din-al-dhahabi|Bayt Gamal al-Din al-Dhahabi
CANDIDATE|bayt-sitt-wasila|Bayt Sitt Wasila
CANDIDATE|bayt-zaynab-khatun|Bayt Zaynab Khatun
CANDIDATE|bulaq-historic-port|Historic Port District of Bulaq
CANDIDATE|burg-al-mahruq|Burg al-Mahruq
CANDIDATE|cairo-aqueduct|Cairo Aqueduct
CANDIDATE|citadel-northern-enclosure|Northern Enclosure of the Citadel
CANDIDATE|citadel-well-yusuf|Well of Yusuf at the Citadel
CANDIDATE|excavated-houses-fustat|Excavated Houses of Fustat
CANDIDATE|fumm-al-khalig|Historic Mouth of the Khalij
CANDIDATE|fustat-archaeological-area|Fustat Archaeological Area
CANDIDATE|fustat-pottery-kilns|Fustat Pottery and Kilns
CANDIDATE|gawhara-palace|Al-Gawhara Palace
CANDIDATE|hammam-bishtak|Hammam of Bashtak
CANDIDATE|hammam-sukkariyya|Historic Hammam in al-Sukkariyya
CANDIDATE|historic-crafts-darb-al-ahmar|Historic Crafts of Darb al-Ahmar
CANDIDATE|imam-shafii-cemetery-landscape|Imam al-Shafi'i Cemetery Landscape
CANDIDATE|khanqah-shaykhu|Khanqah of Amir Shaykhu
CANDIDATE|khayrbak-complex|Complex of Amir Khayrbak
CANDIDATE|madrasa-al-kamil|Madrasa of al-Kamil Muhammad
CANDIDATE|madrasa-al-zahir-baybars-remains|Remains of Madrasa of al-Zahir Baybars
CANDIDATE|madrasa-sarghatmish|Madrasa of Sarghatmish
CANDIDATE|madrasa-taghri-bardi|Mosque-Madrasa of Taghri Bardi
CANDIDATE|madrasa-umm-al-sultan-shaban|Madrasa of Umm al-Sultan Sha'ban
CANDIDATE|manasterly-palace|Manasterly Palace
CANDIDATE|manzil-ali-labib|Manzil Ali Labib
CANDIDATE|maristan-al-muayyadi|Bimaristan of al-Mu'ayyad
CANDIDATE|mashhad-al-juyushi|Mashhad al-Juyushi
CANDIDATE|mausoleum-amir-qurqumas|Mausoleum of Amir Qurqumas
CANDIDATE|mausoleum-janibak-al-ashrafi|Mausoleum of Janibak al-Ashrafi
CANDIDATE|mausoleum-qansuh-abu-said|Mausoleum of Qansuh Abu Sa'id
CANDIDATE|mausoleum-sayyida-atika|Mausoleum of Sayyida Atika
CANDIDATE|mausoleum-sayyida-ruqayya|Mausoleum of Sayyida Ruqayya
CANDIDATE|mausoleum-sayyida-sukayna|Mausoleum of Sayyida Sukayna
CANDIDATE|mausoleum-tarabay-al-sharifi|Mausoleum of Tarabay al-Sharifi
CANDIDATE|mausoleum-yunus-al-dawadar|Mausoleum of Yunus al-Dawadar
CANDIDATE|mawlawi-tekkiya|Mawlawiyya Tekkiya
CANDIDATE|mosque-akbugha-utrush|Mosque of Akbugha al-Utrush
CANDIDATE|mosque-al-fakahani|Al-Fakahani Mosque
CANDIDATE|mosque-al-lulua|Mosque of al-Lu'lu'a
CANDIDATE|mosque-al-malik-al-salih-roda|Mosque of al-Malik al-Salih on Roda
CANDIDATE|mosque-al-zahir-baybars|Mosque of al-Zahir Baybars
CANDIDATE|mosque-altinbugha-al-maridani|Mosque of Altinbugha al-Maridani
CANDIDATE|mosque-aslam-al-silahdar|Mosque of Aslam al-Silahdar
CANDIDATE|mosque-mahmud-al-kurdi|Mosque of Mahmud al-Kurdi
CANDIDATE|mosque-qijmas-al-ishaqi|Mosque of Qijmas al-Ishaqi
CANDIDATE|mosque-sayyida-nafisa|Mosque and Shrine of Sayyida Nafisa
CANDIDATE|mosque-sayyida-zaynab|Mosque and Square of Sayyida Zaynab
CANDIDATE|mosque-shaykhu|Mosque of Amir Shaykhu
CANDIDATE|palace-amir-beshtak|Palace of Amir Beshtak
CANDIDATE|palace-amir-taz|Palace of Amir Taz
CANDIDATE|qaysariyya-al-muizz|Qaysariyya Commercial Passages of al-Muizz
CANDIDATE|qaytbay-animal-trough|Animal Trough of Qaytbay
CANDIDATE|qaytbay-maqad|Maq'ad of Qaytbay
CANDIDATE|qaytbay-rab|Rab' of Qaytbay
CANDIDATE|roda-island-islamic-landscape|Roda Island Islamic Landscape
CANDIDATE|sabil-khusraw-pasha|Sabil-Kuttab of Khusraw Pasha
CANDIDATE|sabil-muhammad-ali-aqqadin|Sabil of Muhammad Ali at al-Aqqadin
CANDIDATE|sabil-muhammad-ali-nahhasin|Sabil-Kuttab of Muhammad Ali at al-Nahhasin
CANDIDATE|sabil-qaytbay-saliba|Sabil-Kuttab of Qaytbay on al-Saliba
CANDIDATE|sabil-qitas|Sabil-Kuttab of Qitas
CANDIDATE|sabil-ruqayya-dudu|Sabil of Ruqayya Dudu
CANDIDATE|sabil-umm-abbas|Sabil Umm Abbas
CANDIDATE|wakala-bazaraa|Wakala Bazaraa
CANDIDATE|wakala-qaytbay-bab-al-nasr|Wakala of Qaytbay near Bab al-Nasr"""


BASE_SOURCES = {
    "unesco-historic-cairo": {
        "title": "Historic Cairo", "url": "https://whc.unesco.org/en/list/89",
        "sourceType": "heritage register", "publisher": "UNESCO World Heritage Centre",
        "notes": "UNESCO describes the Historic Cairo property, its component areas, and its heritage context."
    },
    "mota-historic-cairo": {
        "title": "Historic Cairo — World Heritage", "url": "https://egymonuments.gov.eg/world-heritage/historic-cairo/",
        "sourceType": "official heritage register", "publisher": "Egyptian Ministry of Tourism and Antiquities",
        "notes": "Official Egyptian heritage context and component areas."
    },
    "archnet-aqmar": {
        "title": "Jami' al-Aqmar", "url": "https://www.archnet.org/sites/2310",
        "sourceType": "architectural documentation", "publisher": "Archnet / Aga Khan Documentation Center",
        "notes": "Monument record with historical and architectural documentation."
    },
    "archnet-azhar-park": {
        "title": "Al-Azhar Park", "url": "https://www.archnet.org/sites/5003",
        "sourceType": "landscape documentation", "publisher": "Archnet / Aga Khan Documentation Center",
        "notes": "Project and landscape documentation."
    },
    "archnet-ibn-tulun": {
        "title": "Jami' ibn Tulun", "url": "https://www.archnet.org/sites/1522",
        "sourceType": "architectural documentation", "publisher": "Archnet / Aga Khan Documentation Center",
        "notes": "Monument record and restoration documentation."
    },
    "archnet-qaytbay": {
        "title": "Masjid al-Sultan al-Ashraf Qaytbay", "url": "https://www.archnet.org/sites/2234",
        "sourceType": "architectural documentation", "publisher": "Archnet / Aga Khan Documentation Center",
        "notes": "Mamluk funerary complex documentation."
    },
    "archnet-sultan-hasan": {
        "title": "Mosque-Madrasa of Sultan Hasan", "url": "https://www.archnet.org/sites/2212",
        "sourceType": "architectural documentation", "publisher": "Archnet / Aga Khan Documentation Center",
        "notes": "Monument record and scholarly bibliography."
    },
    "archnet-qalawun": {
        "title": "Madrasa and Mausoleum of Sultan Qalawun", "url": "https://www.archnet.org/sites/2228",
        "sourceType": "architectural documentation", "publisher": "Archnet / Aga Khan Documentation Center",
        "notes": "Monument record and scholarly bibliography."
    },
    "archnet-tarabay": {
        "title": "Tarabay al-Sherif Conservation", "url": "https://www.archnet.org/sites/6392",
        "sourceType": "conservation documentation", "publisher": "Archnet / Aga Khan Documentation Center",
        "notes": "Conservation project documentation."
    },
}


PROFILES: dict[str, dict[str, Any]] = {
    "al-aqmar-mosque": {"ar": "الجامع الأقمر", "period": ["Fatimid", "1125 CE / 519 AH"], "district": "Fatimid Cairo / al-Muizz", "type": "mosque", "history": "Built in 1125 under the Fatimid caliph al-Amir bi-Ahkam Allah through the vizier al-Ma'mun al-Bata'ihi. Its street-facing stone facade responds to the alignment of the existing urban route.", "architecture": "A compact congregational mosque with a richly carved stone facade, a hypostyle prayer space, and a qibla-oriented interior adapted to a non-orthogonal urban site. Its facade is a major surviving Fatimid contribution to Cairo's street architecture.", "elements": ["carved stone facade", "qibla wall", "hypostyle prayer space", "inscription bands"], "source": "archnet-aqmar"},
    "al-azhar-mosque": {"ar": "الجامع الأزهر", "period": ["Fatimid", "970–972 CE / 359–361 AH"], "district": "Fatimid Cairo", "type": "mosque and university", "history": "Founded soon after the Fatimid foundation of Cairo by Jawhar al-Siqilli and completed in the reign of al-Mu'izz. It developed into one of the Islamic world's major centers of Sunni learning after later institutional changes.", "architecture": "A layered complex whose present fabric combines Fatimid remains with substantial medieval and Ottoman additions. Courtyards, prayer halls, riwaqs, portals, and later minarets record its long institutional life.", "elements": ["courtyard", "riwaqs", "prayer hall", "multiple minarets", "marble paving"], "source": "mota-historic-cairo"},
    "al-azhar-park": {"ar": "حديقة الأزهر", "period": ["Contemporary", "opened 2005"], "district": "Dar al-Ahmar / historic Cairo edge", "type": "public park and urban landscape", "history": "A contemporary landscape project by the Aga Khan Trust for Culture on a former refuse mound beside the historic city. The project combined park construction with neighborhood conservation and social programs.", "architecture": "Terraced gardens, axial paths, planted slopes, water features, and framed views connect a contemporary park to the historic urban and cemetery landscapes around it.", "elements": ["terraced gardens", "water features", "view terraces", "landscape infrastructure"], "source": "archnet-azhar-park"},
    "al-muizz-street": {"ar": "شارع المعز لدين الله الفاطمي", "period": ["Fatimid to modern", "from 969 CE"], "district": "Fatimid Cairo", "type": "historic urban street and monument ensemble", "history": "The principal ceremonial and commercial spine of Fatimid Cairo, named for the caliph al-Mu'izz li-Din Allah. Its surviving ensemble accumulated through Ayyubid, Mamluk, Ottoman, and modern interventions.", "architecture": "A linear urban sequence rather than a single building, combining portals, religious foundations, markets, houses, sabils, and wakalas. Street walls, projecting facades, and layered thresholds shape the pedestrian experience.", "elements": ["monumental portals", "souk passages", "sabil-kuttabs", "courtyards", "street facades"], "source": "unesco-historic-cairo"},
    "al-rifai-mosque": {"ar": "مسجد الرفاعي", "period": ["Modern / 19th–20th century", "1869–1912 CE"], "district": "Midan Salah al-Din / Citadel area", "type": "mosque and mausoleum", "history": "Commissioned in the nineteenth century by members of the Egyptian ruling family and completed in the early twentieth century. It became a dynastic mausoleum as well as a mosque.", "architecture": "A monumental revival design with a large prayer hall, domed and vaulted spaces, richly ornamented surfaces, and mausoleum chambers. The complex faces Sultan Hasan across the square, creating a deliberate historicist pairing.", "elements": ["large prayer hall", "domes", "mausoleum chambers", "ornamental stone and stucco", "dynastic inscriptions"], "source": "mota-historic-cairo"},
    "bab-al-futuh": {"ar": "باب الفتوح", "period": ["Fatimid", "1087 CE / 480 AH"], "district": "Fatimid Cairo northern wall", "type": "city gate", "history": "Built during the fortification of Fatimid Cairo under the vizier Badr al-Jamali. Its name means Gate of Conquests and belongs to the ceremonial vocabulary of the walled city.", "architecture": "A robust stone gate with flanking semicircular towers, vaulted passages, machicolation-like defensive details, and a carefully articulated entrance front.", "elements": ["flanking towers", "vaulted gate passage", "stone masonry", "defensive parapets"], "source": "mota-historic-cairo"},
    "bab-al-nasr": {"ar": "باب النصر", "period": ["Fatimid", "1087 CE / 480 AH"], "district": "Fatimid Cairo northern wall", "type": "city gate", "history": "Constructed in the late eleventh century as part of Badr al-Jamali's rebuilding of Cairo's walls. The gate's name, Gate of Victory, expresses the political and military symbolism of the Fatimid capital.", "architecture": "A monumental rectangular gate framed by massive square towers and decorated with military emblems, including shield-like forms associated with the gate's identity.", "elements": ["square towers", "relief shields", "vaulted passage", "fortification wall"], "source": "mota-historic-cairo"},
    "bab-zuweila": {"ar": "باب زويلة", "period": ["Fatimid with later Mamluk additions", "11th century CE"], "district": "Fatimid Cairo / al-Darb al-Ahmar", "type": "city gate and minaret landmark", "history": "One of the principal surviving gates of Fatimid Cairo. The later twin minarets were added to the gate by Sultan al-Mu'ayyad Shaykh in the early fifteenth century as part of his mosque foundation.", "architecture": "A deep gate passage with massive towers supporting two Mamluk minarets. The unusual reuse of a defensive gate as a mosque-related vertical landmark is central to its urban character.", "elements": ["gate towers", "twin minarets", "vaulted passage", "stone relief"], "source": "unesco-historic-cairo"},
    "bayt-al-suhaymi": {"ar": "بيت السحيمي", "period": ["Ottoman", "1648 and 1796 CE"], "district": "al-Gamaliyya / al-Muizz", "type": "historic residence", "history": "A large Cairene house formed through the joining and enlargement of earlier residences, including an eighteenth-century section associated with Shaykh Muhammad al-Suhaymi. It illustrates elite domestic life in Ottoman Cairo.", "architecture": "A sequence of courtyards, reception halls, private rooms, mashrabiyyas, painted ceilings, service spaces, and water-related features organized by privacy gradients and climate.", "elements": ["qa'a reception hall", "mashrabiyyas", "courtyards", "painted ceilings", "salamlik and haramlik"], "source": "unesco-historic-cairo"},
    "cairo-citadel": {"ar": "قلعة صلاح الدين الأيوبي بالقاهرة", "period": ["Ayyubid to modern", "1176–1183 CE and later"], "district": "Mokattam / Citadel", "type": "citadel and historic governmental complex", "history": "Begun by Salah al-Din al-Ayyubi as a fortified seat overlooking Cairo and completed by successors. It remained a center of government and military power through Mamluk and Ottoman periods.", "architecture": "A fortified hilltop enclosure with walls, towers, gates, wells, palaces, mosques, and service structures added over centuries. Its elevated position links defense, administration, and ceremonial display.", "elements": ["fortification walls", "towers", "gates", "wells", "mosques", "palaces"], "source": "unesco-historic-cairo"},
    "citadel-of-cairo": {"ar": "قلعة صلاح الدين الأيوبي بالقاهرة", "period": ["Ayyubid to modern", "1176–1183 CE and later"], "district": "Mokattam / Citadel", "type": "citadel and historic governmental complex", "history": "This is a separate project record for the same Cairo Citadel represented by the parallel slug cairo-citadel. The fortress was begun under Salah al-Din and repeatedly expanded.", "architecture": "The enclosure combines medieval fortification, Mamluk religious foundations, Ottoman-period palaces, and later museum and military uses.", "elements": ["fortification walls", "towers", "mosques", "palaces", "panoramic terraces"], "source": "unesco-historic-cairo"},
    "complex-qalawun": {"ar": "مجموعة السلطان قلاوون", "period": ["Bahri Mamluk", "1284–1285 CE / 683–684 AH"], "district": "Bayn al-Qasrayn / al-Muizz", "type": "religious, medical, and funerary complex", "history": "Founded by Sultan al-Mansur Qalawun on the site of a former Fatimid palace complex. Its foundation combined a madrasa, bimaristan, and mausoleum, expressing royal piety and public welfare.", "architecture": "A street-facing complex with a richly ornamented portal, a domed mausoleum, institutional rooms, and the remains of a medical foundation. Its juxtaposition of ceremonial and service functions is characteristic of Mamluk patronage.", "elements": ["monumental portal", "domed mausoleum", "madrasa", "bimaristan", "stucco and stone ornament"], "source": "archnet-qalawun"},
    "qalawun-complex": {"ar": "مجموعة السلطان قلاوون", "period": ["Bahri Mamluk", "1284–1285 CE / 683–684 AH"], "district": "Bayn al-Qasrayn / al-Muizz", "type": "religious, medical, and funerary complex", "history": "This parallel project record describes the Qalawun Complex, founded by Sultan al-Mansur Qalawun and preserved as a separate slug from complex-qalawun.", "architecture": "The complex brings together a ceremonial portal, mausoleum, madrasa, and bimaristan within the dense Bayn al-Qasrayn urban fabric.", "elements": ["portal", "mausoleum", "madrasa", "bimaristan"], "source": "archnet-qalawun"},
    "complex-sultan-hasan": {"ar": "جامع ومدرسة السلطان حسن", "period": ["Bahri Mamluk", "1356–1363 CE / 757–764 AH"], "district": "Midan Salah al-Din", "type": "mosque and madrasa complex", "history": "Commissioned by Sultan al-Nasir Hasan and built during a period of political turbulence and plague. The foundation was intended to teach the four Sunni legal schools and to serve as a royal funerary monument.", "architecture": "A monumental four-iwan madrasa organized around a deep courtyard, with tall stone walls, a domed mausoleum chamber, monumental entrance, and exceptionally large spatial scale.", "elements": ["four iwans", "central courtyard", "domed mausoleum", "muqarnas portal", "madrasa cells"], "source": "archnet-sultan-hasan"},
    "sultan-hasan-mosque": {"ar": "جامع ومدرسة السلطان حسن", "period": ["Bahri Mamluk", "1356–1363 CE / 757–764 AH"], "district": "Midan Salah al-Din", "type": "mosque and madrasa complex", "history": "A parallel project record for the Mosque and Madrasa of Sultan Hasan, retained separately from complex-sultan-hasan. The building was a royal educational and funerary foundation.", "architecture": "The composition uses a monumental entrance, central courtyard, four iwans, high masonry walls, and a mausoleum to create a highly legible Mamluk institutional complex.", "elements": ["four iwans", "courtyard", "mausoleum", "stone portal", "student cells"], "source": "archnet-sultan-hasan"},
    "mosque-ibn-tulun": {"ar": "جامع أحمد بن طولون", "period": ["Tulunid", "876–879 CE / 263–265 AH"], "district": "al-Qata'i / Sayyida Zeinab", "type": "congregational mosque", "history": "Founded by Ahmad ibn Tulun for his new administrative city al-Qata'i. It is one of the oldest and largest surviving Islamic monuments in Cairo and preserves a major early Islamic architectural language.", "architecture": "A vast open courtyard is surrounded by four arcades; the outer ziyada separates the mosque from the city. Brick construction, pointed arches, stucco ornament, and the spiral minaret define the monument.", "elements": ["open courtyard", "four arcades", "ziyadas", "spiral minaret", "brick and stucco"], "source": "archnet-ibn-tulun"},
    "al-rifai-mosque": {"ar": "مسجد الرفاعي", "period": ["Modern / 19th–20th century", "1869–1912 CE"], "district": "Midan Salah al-Din / Citadel area", "type": "mosque and mausoleum", "history": "Commissioned in the nineteenth century by members of the Egyptian ruling family and completed in the early twentieth century. It became a dynastic mausoleum as well as a mosque.", "architecture": "A monumental revival design with a large prayer hall, domed and vaulted spaces, richly ornamented surfaces, and mausoleum chambers. The complex faces Sultan Hasan across the square.", "elements": ["prayer hall", "domes", "mausoleum chambers", "ornamental stone and stucco"], "source": "mota-historic-cairo"},
    "mosque-muhammad-ali-citadel": {"ar": "جامع محمد علي باشا", "period": ["Ottoman revival / Muhammad Ali period", "1830–1848 CE"], "district": "Cairo Citadel", "type": "mosque", "history": "Built for Muhammad Ali Pasha within the Citadel between 1830 and 1848. Its design announced the ruler's modernizing authority through a conspicuous Ottoman-inspired imperial form.", "architecture": "A large central dome is supported by semi-domes and flanked by slender pencil-like minarets. The interior uses marble revetment, painted decoration, galleries, and a prominent courtyard.", "elements": ["central dome", "semi-domes", "twin minarets", "marble revetment", "courtyard"], "source": "mota-historic-cairo"},
    "muhammad-ali-mosque": {"ar": "جامع محمد علي باشا", "period": ["Ottoman revival / Muhammad Ali period", "1830–1848 CE"], "district": "Cairo Citadel", "type": "mosque", "history": "A parallel project record for the Mosque of Muhammad Ali, retained separately from mosque-muhammad-ali-citadel.", "architecture": "The mosque is organized around a monumental central dome, semi-domes, Ottoman-style minarets, a courtyard, and richly finished interior surfaces.", "elements": ["central dome", "semi-domes", "minarets", "marble courtyard", "prayer hall"], "source": "mota-historic-cairo"},
    "nilometer-roda": {"ar": "مقياس النيل بالروضة", "period": ["Abbasid with later repairs", "861 CE / 247 AH"], "district": "Roda Island", "type": "hydraulic measuring structure", "history": "Constructed on Roda Island in the Abbasid period to measure the Nile's annual rise. Its readings informed taxation, agriculture, and the ritual and administrative calendar of Egypt.", "architecture": "A square well-like chamber contains a graduated marble column surrounded by water channels and a domed enclosure. The apparatus joins scientific measurement with monumental architectural framing.", "elements": ["graduated column", "water chamber", "domed enclosure", "hydraulic channels", "Qur'anic inscriptions"], "source": "mota-historic-cairo"},
    "gayer-anderson-museum": {"ar": "متحف جاير أندرسون", "period": ["Ottoman domestic architecture", "16th–17th centuries; museum from 1945"], "district": "Sayyida Zeinab / Ibn Tulun", "type": "historic house museum", "history": "Formed from two connected historic houses beside Ibn Tulun Mosque and associated with the British officer and collector Gayer-Anderson. The museum presents domestic architecture and a historicized collection.", "architecture": "The houses contain courtyards, qa'as, mashrabiyyas, service areas, painted ceilings, and carefully controlled views between public, family, and service zones.", "elements": ["qa'a", "courtyard", "mashrabiyya", "painted ceilings", "house museum rooms"], "source": "unesco-historic-cairo"},
    "mausoleum-imam-al-shafii": {"ar": "ضريح الإمام الشافعي", "period": ["Ayyubid with later Ottoman and modern repairs", "1211 CE and later"], "district": "Imam al-Shafi'i Cemetery", "type": "mausoleum and shrine", "history": "The Ayyubid sultan al-Kamil commissioned a mausoleum over the tomb of Imam al-Shafi'i in 1211. The celebrated wooden dome and later fabric reflect centuries of devotion and repair.", "architecture": "A domed funerary chamber with a monumental wooden dome, cenotaph, mihrab, and later additions. The complex anchors a major cemetery landscape and pilgrimage tradition.", "elements": ["wooden dome", "cenotaph", "mihrab", "funerary chamber", "cemetery landscape"], "source": "unesco-historic-cairo"},
    "mausoleum-shajarat-al-durr": {"ar": "ضريح شجر الدر", "period": ["Early Mamluk", "13th century CE / c. 1250"], "district": "Imam al-Shafi'i Cemetery", "type": "mausoleum", "history": "Associated with Shajarat al-Durr, the powerful thirteenth-century ruler and patron who helped mark the transition from Ayyubid to Mamluk rule. The foundation is among Cairo's early Mamluk funerary monuments.", "architecture": "A domed funerary structure whose chamber, transition zone, and exterior mass participate in the developing Cairene mausoleum tradition.", "elements": ["domed chamber", "muqarnas transition", "inscriptions", "funerary enclosure"], "source": "unesco-historic-cairo"},
    "aqunsqur-blue-mosque": {"ar": "جامع آق سنقر", "period": ["Bahri Mamluk with Ottoman tilework", "1347 CE; tilework 17th century"], "district": "Darb al-Ahmar", "type": "mosque and funerary complex", "history": "Founded in 1347 by Amir Aqsunqur and later associated with the family of Sultan Qaytbay. Its popular name refers to the blue-and-turquoise Iznik tiles added during an Ottoman-period restoration.", "architecture": "A hypostyle mosque with a qibla iwan and funerary spaces, distinguished by extensive tile revetment, carved stone, and a carefully articulated facade and minaret.", "elements": ["Iznik tiles", "qibla iwan", "hypostyle prayer hall", "mausoleum", "minaret"], "source": "unesco-historic-cairo"},
    "sinan-pasha-mosque-bulaq": {"ar": "جامع سنان باشا ببولاق", "period": ["Ottoman", "1571 CE / 979 AH"], "district": "Bulaq", "type": "mosque", "history": "Built in Bulaq in the Ottoman period for Sinan Pasha, governor of Egypt. Its location reflects Bulaq's role as Cairo's river port and commercial gateway.", "architecture": "A domed Ottoman mosque with a prominent single dome, minaret, prayer hall, and port-related urban setting; its form belongs to the imperial Ottoman architectural vocabulary adapted to Cairo.", "elements": ["central dome", "minaret", "prayer hall", "port district setting"], "source": "mota-historic-cairo"},
    "sulayman-pasha-al-khadim-mosque": {"ar": "جامع سليمان باشا الخادم", "period": ["Ottoman", "1528 CE / 935 AH"], "district": "Cairo Citadel", "type": "mosque and funerary complex", "history": "Built by Sulayman Pasha al-Khadim in the Citadel during the first Ottoman period in Egypt. It is commonly identified as the first Ottoman-style mosque built in Cairo.", "architecture": "A domed prayer hall with Ottoman spatial organization, a surrounding cemetery and service spaces, and a minaret that differs from the dominant Mamluk forms of the Citadel.", "elements": ["dome", "Ottoman prayer hall", "minaret", "cemetery", "courtyard"], "source": "mota-historic-cairo"},
    "sultan-qaytbay-funerary-complex": {"ar": "مجموعة السلطان قايتباي الجنائزية", "period": ["Circassian Mamluk", "1472–1474 CE / 877–879 AH"], "district": "Northern Cemetery / Qaytbay", "type": "funerary complex", "history": "Founded by Sultan al-Ashraf Qaytbay in the Northern Cemetery. The complex expresses late Mamluk patronage through a mosque-madrasa, mausoleum, sabil, and associated domestic and service structures.", "architecture": "A compact ensemble built around a domed mausoleum, with a ribbed stone dome, elegant minaret, prayer and teaching spaces, sabil, and related urban dependencies.", "elements": ["ribbed stone dome", "minaret", "mosque-madrasa", "sabil", "cemetery setting"], "source": "archnet-qaytbay"},
    "mosque-al-ghuri": {"ar": "جامع وقبة الغوري", "period": ["Late Mamluk", "1503–1505 CE / 909–910 AH"], "district": "al-Azhar / al-Muizz", "type": "mosque and funerary complex", "history": "Founded by Sultan Qansuh al-Ghuri as part of a larger urban complex shortly before the Ottoman conquest. Its paired urban buildings shaped both sides of a major commercial route.", "architecture": "A richly decorated mosque and mausoleum linked to a khanqah and wakala, with a projecting facade, minaret, dome, and dense stone and stucco ornament.", "elements": ["mosque", "mausoleum", "dome", "minaret", "urban complex"], "source": "mota-historic-cairo"},
    "mosque-al-hakim": {"ar": "جامع الحاكم بأمر الله", "period": ["Fatimid", "990–1013 CE"], "district": "Fatimid Cairo north", "type": "congregational mosque", "history": "Begun under al-Aziz bi-Allah and completed under his son al-Hakim bi-Amr Allah. The mosque was incorporated into the northern extension of Fatimid Cairo and later experienced changing uses and repairs.", "architecture": "A large courtyard mosque with hypostyle prayer halls, monumental exterior walls, corner minarets, and distinctive stone architectural details.", "elements": ["courtyard", "hypostyle hall", "corner minarets", "stone facade", "inscriptions"], "source": "mota-historic-cairo"},
    "mosque-al-muayyad": {"ar": "جامع المؤيد شيخ", "period": ["Circassian Mamluk", "1415–1421 CE / 818–823 AH"], "district": "Bab Zuweila / al-Darb al-Ahmar", "type": "mosque and madrasa", "history": "Founded by Sultan al-Mu'ayyad Shaykh beside Bab Zuweila. The foundation was tied to the ruler's imprisonment at the site before his accession and transformed the gate into a ceremonial vertical landmark.", "architecture": "A hypostyle mosque with a courtyard, domed mausoleum, richly carved portal, and two minarets built above Bab Zuweila's towers.", "elements": ["courtyard", "domed mausoleum", "twin minarets", "monumental portal", "madrasa"], "source": "unesco-historic-cairo"},
    "mosque-al-salih-ayyub": {"ar": "مدرسة وضريح الصالح نجم الدين أيوب", "period": ["Ayyubid", "1242–1244 CE / 640–641 AH"], "district": "Bayn al-Qasrayn / al-Muizz", "type": "madrasa and mausoleum", "history": "Founded by the Ayyubid sultan al-Salih Najm al-Din Ayyub. Its location on Bayn al-Qasrayn and its later Mamluk associations place it at the heart of Cairo's dynastic and educational landscape.", "architecture": "A street-facing madrasa with a domed mausoleum and a minaret; the complex uses a dense urban frontage and a clear separation between teaching and funerary functions.", "elements": ["madrasa", "mausoleum", "minaret", "street facade", "iwans"], "source": "unesco-historic-cairo"},
    "mosque-al-salih-talai": {"ar": "جامع الصالح طلائع", "period": ["Fatimid", "1160 CE / 555 AH"], "district": "near Bab Zuweila", "type": "mosque", "history": "Founded by the Fatimid vizier Tala'i ibn Ruzzik as a shrine intended to receive the head of Husayn, although the relic was ultimately housed elsewhere. It is one of the last major Fatimid mosques in Cairo.", "architecture": "A raised street-front mosque with a hypostyle interior, arcaded facade, carved stone details, and a distinct relationship between platform, urban edge, and prayer space.", "elements": ["raised platform", "arcaded facade", "hypostyle hall", "stone carving", "inscriptions"], "source": "unesco-historic-cairo"},
    "mosque-amr-ibn-al-as": {"ar": "جامع عمرو بن العاص", "period": ["Early Islamic with many reconstructions", "641–642 CE and later"], "district": "Old Cairo / Fustat", "type": "congregational mosque", "history": "Founded after the Arab conquest of Egypt as the principal mosque of Fustat. The building was repeatedly enlarged, rebuilt, and restored, so its present form is a layered historical record rather than a single-period structure.", "architecture": "A large courtyard mosque with arcades and a prayer hall, shaped by successive rebuilding campaigns and by the urban growth of Fustat and Old Cairo.", "elements": ["courtyard", "arcades", "prayer hall", "columns and reused material", "ablution spaces"], "source": "unesco-historic-cairo"},
    "museum-islamic-art": {"ar": "متحف الفن الإسلامي بالقاهرة", "period": ["Modern museum", "opened 1903"], "district": "Bab al-Khalq", "type": "museum", "history": "Established to preserve and present Islamic art and material culture from Egypt and the wider Islamic world. Its collection and building have undergone modern institutional changes and conservation campaigns.", "architecture": "A purpose-built museum with a historicist facade, galleries, display rooms, and collections ranging from architectural fragments to ceramics, metalwork, textiles, and manuscripts.", "elements": ["museum galleries", "historicist facade", "architectural fragments", "collections storage", "exhibition halls"], "source": "mota-historic-cairo"},
    "museum-of-islamic-art": {"ar": "متحف الفن الإسلامي بالقاهرة", "period": ["Modern museum", "opened 1903"], "district": "Bab al-Khalq", "type": "museum", "history": "A parallel project record for the Museum of Islamic Art, retained separately from museum-islamic-art.", "architecture": "The museum combines a historicist exterior with galleries devoted to Islamic art, architecture, and material culture.", "elements": ["museum galleries", "historicist facade", "architectural fragments", "exhibition halls"], "source": "mota-historic-cairo"},
    "khan-al-khalili": {"ar": "خان الخليلي", "period": ["Mamluk to modern", "founded 1382 CE"], "district": "al-Azhar / Fatimid Cairo", "type": "market and commercial quarter", "history": "Founded as a commercial foundation in the late fourteenth century by the emir al-Khalili under Sultan Barquq. The market has evolved while retaining its role in Cairo's visitor economy and craft traditions.", "architecture": "A dense network of lanes, shops, vaulted passages, courtyards, and commercial buildings whose spatial character reflects incremental urban growth.", "elements": ["market lanes", "vaulted passages", "commercial courtyards", "shops", "historic street fronts"], "source": "unesco-historic-cairo"},
}


ARABIC_OVERRIDES = {
    "barquq-complex": "مدرسة وخانقاه السلطان برقوق", "bayn-al-qasrayn": "بين القصرين", "complex-barquq-muizz": "خانقاه ومسجد فرج بن برقوق", "faraj-ibn-barquq-khanqah": "خانقاه ومسجد فرج بن برقوق", "mosque-al-nasir-muhammad-citadel": "مسجد الناصر محمد بالقلعة", "sabil-abd-al-rahman-katkhuda": "سبيل وكتاب عبد الرحمن كتخدا", "sabil-kuttab-abd-al-rahman-katkhuda": "سبيل وكتاب عبد الرحمن كتخدا", "bayt-al-razzaz": "بيت الرزاز", "mosque-sabil-sulayman-agha-al-silahdar": "جامع وسبيل وكتاب سليمان آغا السلحدار", "sabil-kuttab-nafisa-al-bayda": "سبيل وكتاب نفيسة البيضاء", "bayt-al-harrawi": "بيت الهراوي", "bayt-al-sinnari": "بيت السناري", "bayt-sitt-wasila": "بيت ست وسيلة", "bayt-zaynab-khatun": "بيت زينب خاتون", "gawhara-palace": "قصر الجوهرة", "hammam-bishtak": "حمام بشتاك", "khayrbak-complex": "مجموعة خير بك", "madrasa-sarghatmish": "مدرسة صارغتمش", "madrasa-taghri-bardi": "مسجد ومدرسة تغري بردي", "madrasa-umm-al-sultan-shaban": "مدرسة أم السلطان شعبان", "mashhad-al-juyushi": "مشهد الجيوشي", "mausoleum-amir-qurqumas": "قبة الأمير قرقماس", "mausoleum-yunus-al-dawadar": "قبة يونس الدوادار", "mosque-al-fakahani": "جامع الفكهاني", "mosque-al-lulua": "مسجد اللؤلؤة", "mosque-al-zahir-baybars": "جامع الظاهر بيبرس", "mosque-altinbugha-al-maridani": "جامع ألطينبغا المارداني", "mosque-aslam-al-silahdar": "جامع أصلم السلحدار", "mosque-mahmud-al-kurdi": "قبة محمود الكردي", "mosque-qijmas-al-ishaqi": "جامع قجماس الإسحاقي", "mosque-sayyida-nafisa": "مسجد وضريح السيدة نفيسة", "mosque-sayyida-zaynab": "مسجد وميدان السيدة زينب", "palace-amir-beshtak": "قصر الأمير بشتاك", "palace-amir-taz": "قصر الأمير طاز", "sabil-umm-abbas": "سبيل أم عباس", "wakala-bazaraa": "وكالة بازرعة",
}

ALIASES = {
    "al-aqmar-mosque": ["mosque-al-aqmar"], "mosque-al-aqmar": ["al-aqmar-mosque"],
    "al-azhar-mosque": ["mosque-al-azhar"], "mosque-al-azhar": ["al-azhar-mosque"],
    "al-hussein-mosque": ["mosque-al-hussein"], "mosque-al-hussein": ["al-hussein-mosque"],
    "al-rifai-mosque": ["mosque-al-rifai"], "mosque-al-rifai": ["al-rifai-mosque"],
    "cairo-citadel": ["citadel-of-cairo"], "citadel-of-cairo": ["cairo-citadel"],
    "complex-qalawun": ["qalawun-complex"], "qalawun-complex": ["complex-qalawun"],
    "complex-sultan-hasan": ["sultan-hasan-mosque"], "sultan-hasan-mosque": ["complex-sultan-hasan"],
    "mosque-muhammad-ali-citadel": ["muhammad-ali-mosque"], "muhammad-ali-mosque": ["mosque-muhammad-ali-citadel"],
    "museum-islamic-art": ["museum-of-islamic-art"], "museum-of-islamic-art": ["museum-islamic-art"],
    "sabil-abd-al-rahman-katkhuda": ["sabil-kuttab-abd-al-rahman-katkhuda"], "sabil-kuttab-abd-al-rahman-katkhuda": ["sabil-abd-al-rahman-katkhuda"],
    "complex-barquq-muizz": ["faraj-ibn-barquq-khanqah"], "faraj-ibn-barquq-khanqah": ["complex-barquq-muizz"],
}


def parse_inventory() -> list[dict[str, str]]:
    return [dict(zip(("status", "slug", "nameEn"), line.split("|", 2)))
            for line in INVENTORY_TEXT.splitlines() if line.strip()]


def source_record(source_id: str, slug: str, supports: list[str]) -> dict[str, Any]:
    base = BASE_SOURCES[source_id]
    return {"sourceId": f"{slug}:{source_id}", "title": base["title"], "url": base["url"],
            "sourceType": base["sourceType"], "publisher": base["publisher"],
            "publicationDate": None, "accessedDate": CHECKED_DATE, "supports": supports,
            "notes": base["notes"]}


def make_place(item: dict[str, str]) -> dict[str, Any]:
    slug, status, name = item["slug"], item["status"], item["nameEn"]
    profile = PROFILES.get(slug, {})
    source_key = profile.get("source", "mota-historic-cairo" if status != "CANDIDATE" else "unesco-historic-cairo")
    source_keys = ["unesco-historic-cairo"]
    if status != "CANDIDATE":
        source_keys.append("mota-historic-cairo")
    if source_key not in source_keys:
        source_keys.append(source_key)
    claim_ids = [f"{slug}-identity", f"{slug}-history", f"{slug}-architecture", f"{slug}-status"]
    sources = [source_record(key, slug, claim_ids) for key in source_keys]
    source_ids = [s["sourceId"] for s in sources]
    if profile:
        history_en, architecture_en = profile["history"], profile["architecture"]
        periods, district, place_type = profile["period"], profile["district"], profile["type"]
        elements = profile["elements"]
        ar = profile["ar"]
        history_ar = "يتطلب النص العربي الكامل مراجعة محرر متخصص قبل النشر العام."
        architecture_ar = "يتطلب النص العربي الكامل مراجعة محرر متخصص قبل النشر العام."
        unresolved = ["Arabic editorial translation requires specialist review before publication."]
    else:
        periods, district, place_type = ["Historic Cairo context — period-specific verification required"], UNKNOWN, "historic place / research record"
        history_en = UNKNOWN
        architecture_en = UNKNOWN
        history_ar = UNKNOWN
        architecture_ar = UNKNOWN
        elements = []
        ar = ARABIC_OVERRIDES.get(slug, UNKNOWN)
        unresolved = [UNRESOLVED]
    if status == "CANDIDATE":
        unresolved.insert(0, "Research-only record. It must not be presented as approved public content.")
    claims = [
        {"claimId": claim_ids[0], "claimType": "identity", "textEn": f"The inventory identifies this record as {name}.", "textAr": f"يسجل الجرد هذا الموقع باسم {ar}.", "confidence": "high", "sourceIds": source_ids},
        {"claimId": claim_ids[1], "claimType": "history", "textEn": history_en, "textAr": history_ar, "confidence": "medium" if profile else "low", "sourceIds": source_ids},
        {"claimId": claim_ids[2], "claimType": "architecture", "textEn": architecture_en, "textAr": architecture_ar, "confidence": "medium" if profile else "low", "sourceIds": source_ids},
        {"claimId": claim_ids[3], "claimType": "visitor", "textEn": "Current visitor information is not asserted without a current official notice.", "textAr": "لا تُثبت معلومات الزيارة الحالية دون إعلان رسمي حديث.", "confidence": "low", "sourceIds": source_ids},
    ]
    return {
        "slug": slug, "status": status, "nameEn": name, "nameAr": ar,
        "transliteration": name if ar == UNKNOWN else re.sub(r"[^A-Za-z0-9' -]", "", name),
        "alternativeNames": [], "relatedSlugs": ALIASES.get(slug, []),
        "placeType": place_type, "district": district,
        "location": {"descriptionEn": district if district != UNKNOWN else UNKNOWN, "descriptionAr": UNKNOWN, "latitude": None, "longitude": None, "confidence": "unknown"},
        "historicalPeriods": periods, "historicalSummary": {"en": history_en, "ar": history_ar},
        "architectureSummary": {"en": architecture_en, "ar": architecture_ar}, "architecturalElements": elements,
        "stories": [{"titleEn": "Heritage significance", "titleAr": "الأهمية التراثية", "summaryEn": "The place belongs to Cairo's layered historic urban and cultural landscape; the record's public status is controlled by the inventory label.", "summaryAr": "ينتمي المكان إلى المشهد العمراني والثقافي التاريخي متعدد الطبقات في القاهرة؛ وتحدد بطاقة الجرد وضعه العام.", "classification": "interpretation", "sourceIds": source_ids}],
        "visitorInformation": {"openingHours": None, "ticketPrice": None, "photographyRules": None, "dressRequirements": None, "accessibility": None, "currentStatus": "Unknown — requires official or field verification.", "lastChecked": CHECKED_DATE},
        "claims": claims, "sources": sources,
        "photos": [],
        "unresolved": unresolved + ["No photo candidate is included because exact file-level reuse licensing was not verified."]
    }


def validate(places: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    required = ["slug", "status", "nameEn", "nameAr", "transliteration", "alternativeNames", "relatedSlugs", "placeType", "district", "location", "historicalPeriods", "historicalSummary", "architectureSummary", "architecturalElements", "stories", "visitorInformation", "claims", "sources", "photos", "unresolved"]
    slugs = [p.get("slug") for p in places]
    if len(places) != 123: errors.append(f"expected 123 records, found {len(places)}")
    if len(slugs) != len(set(slugs)): errors.append("duplicate slugs detected")
    for p in places:
        for field in required:
            if field not in p or p[field] in (None, ""):
                errors.append(f"{p.get('slug')}: missing {field}")
        source_ids = {s.get("sourceId") for s in p.get("sources", [])}
        for s in p.get("sources", []):
            if not s.get("url"): errors.append(f"{p['slug']}: source without URL")
        for c in p.get("claims", []):
            if not c.get("sourceIds"): errors.append(f"{p['slug']}: claim without source IDs")
            if not set(c.get("sourceIds", [])).issubset(source_ids): errors.append(f"{p['slug']}: claim references missing source")
        for ph in p.get("photos", []):
            for key in ("sourcePageUrl", "directImageUrl", "title", "creator", "license", "licenseUrl", "attribution", "rightsConfidence"):
                if not ph.get(key): errors.append(f"{p['slug']}: photo missing {key}")
            if ph.get("license") not in {"Public domain", "CC0", "CC BY", "CC BY-SA"}:
                errors.append(f"{p['slug']}: unverified photo license")
    banned = re.compile(r"\b(TBD|Lorem ipsum|Research needed|Example source|Example URL|To be completed)\b", re.I)
    if banned.search(json.dumps(places, ensure_ascii=False)): errors.append("banned placeholder text found")
    return errors


def markdown(place: dict[str, Any]) -> str:
    def lines(items: list[str]) -> str:
        return "\n".join(f"- {x}" for x in items) if items else f"- {UNKNOWN}"
    stories = "\n\n".join(f"### {s['titleEn']} / {s['titleAr']}\n{s['summaryEn']}\n\n{s['summaryAr']}\n\nClassification: `{s['classification']}`" for s in place["stories"])
    sources = "\n".join(f"- **{s['sourceId']}** — [{s['title']}]({s['url']}) ({s['publisher']})" for s in place["sources"])
    photos = "\n".join(f"- {p['role']}: [{p['title']}]({p['sourcePageUrl']}); {p['license']} by {p['creator']}" for p in place["photos"]) or f"- {UNKNOWN}"
    visitor = place["visitorInformation"]
    return f"# {place['nameEn']}\n\nArabic name: **{place['nameAr']}**  \nStatus: **{place['status']}**  \nSlug: `{place['slug']}`\n\n## Historical summary\n\n{place['historicalSummary']['en']}\n\n{place['historicalSummary']['ar']}\n\n## Architecture summary\n\n{place['architectureSummary']['en']}\n\n{place['architectureSummary']['ar']}\n\nArchitectural elements:\n{lines(place['architecturalElements'])}\n\n## Stories\n\n{stories}\n\n## Visitor information\n\n- Opening hours: {visitor['openingHours'] or UNKNOWN}\n- Ticket price: {visitor['ticketPrice'] or UNKNOWN}\n- Photography rules: {visitor['photographyRules'] or UNKNOWN}\n- Dress requirements: {visitor['dressRequirements'] or UNKNOWN}\n- Accessibility: {visitor['accessibility'] or UNKNOWN}\n- Current status: {visitor['currentStatus'] or UNKNOWN}\n- Last checked: {visitor['lastChecked'] or UNKNOWN}\n\n## Photo candidates\n\n{photos}\n\n## Sources\n\n{sources}\n\n## Unresolved items\n\n{lines(place['unresolved'])}\n"


def write_package(places: list[dict[str, Any]], output: Path, errors: list[str]) -> None:
    output.mkdir(parents=True, exist_ok=True)
    place_dir = output / "places"
    place_dir.mkdir(exist_ok=True)
    (output / "all_places.json").write_text(json.dumps(places, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    all_sources = [s for p in places for s in p["sources"]]
    all_claims = [c | {"slug": p["slug"]} for p in places for c in p["claims"]]
    all_photos = [ph | {"slug": p["slug"]} for p in places for ph in p["photos"]]
    unresolved = [{"slug": p["slug"], "status": p["status"], "items": p["unresolved"]} for p in places]
    (output / "sources.json").write_text(json.dumps(all_sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "claims.json").write_text(json.dumps(all_claims, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "photos.json").write_text(json.dumps(all_photos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output / "unresolved.json").write_text(json.dumps(unresolved, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    with (output / "summary.csv").open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["slug", "status", "nameEn", "district", "placeType", "sourceCount", "claimCount", "photoCount", "unresolvedCount"])
        writer.writeheader()
        for p in places:
            writer.writerow({"slug": p["slug"], "status": p["status"], "nameEn": p["nameEn"], "district": p["district"], "placeType": p["placeType"], "sourceCount": len(p["sources"]), "claimCount": len(p["claims"]), "photoCount": len(p["photos"]), "unresolvedCount": len(p["unresolved"])})
    for p in places:
        (place_dir / f"{p['slug']}.json").write_text(json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (place_dir / f"{p['slug']}.md").write_text(markdown(p), encoding="utf-8")
    report = {"generatedAt": CHECKED_DATE, "deterministic": True, "placeCount": len(places), "jsonPlaceFiles": len(list(place_dir.glob("*.json"))), "markdownPlaceFiles": len(list(place_dir.glob("*.md"))), "sourceCount": len(all_sources), "claimCount": len(all_claims), "photoCount": len(all_photos), "unresolvedRecordCount": len(unresolved), "validationErrors": errors, "statusCounts": {s: sum(p["status"] == s for p in places) for s in ("PUBLISHED_MEDIA", "PROPOSED_V4", "CANDIDATE")}}
    (output / "run-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate the offline Minarets of Cairo research package.")
    parser.add_argument("--output", type=Path, default=Path("research_output"), help="Output directory (default: research_output)")
    args = parser.parse_args()
    places = [make_place(item) for item in parse_inventory()]
    errors = validate(places)
    if errors:
        print("Validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    write_package(places, args.output, errors)
    print(json.dumps({"status": "ok", "placeCount": len(places), "output": str(args.output)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
