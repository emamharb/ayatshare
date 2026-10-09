// بيانات السور
const suras = [
"الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
"هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
"الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
"لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
"فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
"الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
"الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
"نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
"التكوير","الإنفطار","المطففين","الإنشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
"الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
"القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
"المسد","الإخلاص","الفلق","الناس"
];

const ayahCount = [
7, 286, 200, 176, 120, 165, 206, 75, 129, 109,
123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
11, 8, 3, 9, 5, 4, 7, 3, 6, 3,
5, 4, 5, 6
];

const totalQuranAyahs = ayahCount.reduce((sum, count) => sum + count, 0);

// عناصر DOM
const list = document.getElementById("sura-list");
const searchInput = document.getElementById("search-input");
const randomAyahBtn = document.getElementById("random-ayah-btn");
const randomAyahResult = document.getElementById("random-ayah-result");
const randomAyahNumber = document.getElementById("random-ayah-number");
const randomAyahSura = document.getElementById("random-ayah-sura");
const randomAyahImage = document.getElementById("random-ayah-image");
const randomAyahPlaceholder = document.getElementById("random-ayah-placeholder");
const randomAyahText = document.getElementById("random-ayah-text");
const downloadBtn = document.getElementById("download-btn");
const listenBtn = document.getElementById("listen-btn");
const goToSuraBtn = document.getElementById("go-to-sura-btn");
const buttonText = document.getElementById("button-text");

// متغيرات عامة
let currentAudio = null;
let currentPlayingButton = null;
let shownAyahs = new Set();
let currentAyah = null;

// عرض قائمة السور
function renderSuraList(filteredSuras = null) {
list.innerHTML = '';
const surasToRender = filteredSuras || suras;
surasToRender.forEach((suraItem) => {
const card = document.createElement("div");
card.className = "sura-card";
const a = document.createElement("a");
let suraName, suraIndex;
if (typeof suraItem === 'object') {
suraName = suraItem.name;
suraIndex = suraItem.index;
} else {
suraName = suraItem;
suraIndex = suras.indexOf(suraItem);
}
a.href = `sura.html?sura=${suraIndex + 1}`;
const number = document.createElement("div");
number.className = "sura-number";
number.textContent = suraIndex + 1;
const suraNameElement = document.createElement("div");
suraNameElement.className = "sura-name";
suraNameElement.textContent = `سورة ${suraName}`;
a.appendChild(number);
a.appendChild(suraNameElement);
card.appendChild(a);
list.appendChild(card);
});
}

// تحميل السورة من الملفات المحلية
function loadLocalSura(suraNum) {
return new Promise((resolve, reject) => {
const script = document.createElement("script");
script.src = new URL(`quran_text/sura_${suraNum}.js`, document.baseURI).href;
script.onload = () => {
resolve(window[`sura_${suraNum}`] || []);
};
script.onerror = () => reject(`فشل تحميل ملف sura_${suraNum}.js`);
document.body.appendChild(script);
});
}

// التحقق من وجود صورة الآية
function checkAyahImageExists(suraNum, ayahIndex) {
return new Promise((resolve) => {
if (ayahIndex < 1 || ayahIndex > ayahCount[suraNum-1]) {
resolve(false);
return;
}
const img = new Image();
img.onload = () => resolve(true);
img.onerror = () => resolve(false);
setTimeout(() => {
img.src = new URL(`quran_images/sura_${suraNum}/ayah_${ayahIndex}.png`, document.baseURI).href;
}, 50);
});
}

// إنشاء معرف فريد للآية
function createAyahId(sura, ayah) {
return `${sura}:${ayah}`;
}

// تبديل تشغيل الصوت
function toggleAyahAudio() {
if (!currentAyah) return;
if (currentAudio) {
currentAudio.pause();
currentAudio = null;
}
if (currentPlayingButton === listenBtn) {
resetAudioButton();
currentPlayingButton = null;
return;
}
if (currentPlayingButton) {
resetAudioButton();
}
playAyahAudio();
}

// تشغيل صوت الآية
function playAyahAudio() {
const { sura, ayah } = currentAyah;
listenBtn.innerHTML = `<i class="fas fa-pause"></i> إيقاف`;
listenBtn.classList.add('playing');
currentPlayingButton = listenBtn;
const suraFolder = sura.toString().padStart(3, '0');
const ayahFile = ayah.toString().padStart(3, '0');
const audioPath = new URL(`sound/${suraFolder}/${suraFolder}${ayahFile}.mp3`, document.baseURI).href;
currentAudio = new Audio(audioPath);
currentAudio.addEventListener('loadeddata', function() {
console.log(`🎵 جاري تشغيل: ${audioPath}`);
});
currentAudio.addEventListener('canplaythrough', function() {
currentAudio.play().catch(error => {
console.error('❌ خطأ في تشغيل الصوت:', error);
resetAudioButton();
});
});
currentAudio.addEventListener('ended', function() {
resetAudioButton();
currentPlayingButton = null;
currentAudio = null;
});
currentAudio.addEventListener('error', function(e) {
console.error('❌ خطأ في تحميل الصوت:', audioPath, e);
listenBtn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> خطأ`;
listenBtn.style.background = '#dc3545';
setTimeout(() => {
resetAudioButton();
}, 2000);
});
}

// إعادة تعيين زر الصوت
function resetAudioButton() {
listenBtn.innerHTML = `<i class="fas fa-play"></i> استماع`;
listenBtn.classList.remove('playing');
listenBtn.style.background = '';
}

// الحصول على آية عشوائية
async function getRandomAyah() {
if (shownAyahs.size >= totalQuranAyahs) {
shownAyahs.clear();
}
let randomSura, randomAyah;
let attempts = 0;
const maxAttempts = 100;
do {
randomSura = Math.floor(Math.random() * 114) + 1;
randomAyah = Math.floor(Math.random() * ayahCount[randomSura-1]) + 1;
attempts++;
if (attempts >= maxAttempts) {
for (let s = 1; s <= 114; s++) {
for (let a = 1; a <= ayahCount[s-1]; a++) {
const ayahId = createAyahId(s, a);
if (!shownAyahs.has(ayahId)) {
randomSura = s;
randomAyah = a;
break;
}
}
}
break;
}
} while (shownAyahs.has(createAyahId(randomSura, randomAyah)));
shownAyahs.add(createAyahId(randomSura, randomAyah));
return { sura: randomSura, ayah: randomAyah };
}

// تحميل صورة الآية
function downloadImage() {
if (!currentAyah) return;
const { sura, ayah } = currentAyah;
const imageUrl = new URL(`quran_images/sura_${sura}/ayah_${ayah}.png`, document.baseURI).href;
const link = document.createElement('a');
link.href = imageUrl;
link.download = `sura_${sura}_ayah_${ayah}.png`;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
}

// عرض آية عشوائية
async function showRandomAyah() {
randomAyahBtn.classList.add('spinning');
randomAyahBtn.disabled = true;
buttonText.textContent = 'جارٍ الاختيار العشوائي';
randomAyahResult.style.display = 'none';
if (currentAudio) {
currentAudio.pause();
currentAudio = null;
}
resetAudioButton();
await new Promise(resolve => setTimeout(resolve, 2000));
try {
currentAyah = await getRandomAyah();
const { sura, ayah } = currentAyah;
const imageExists = await checkAyahImageExists(sura, ayah);
if (imageExists) {
randomAyahNumber.textContent = ayah;
randomAyahSura.textContent = `سورة ${suras[sura-1]}`;
try {
const suraTexts = await loadLocalSura(sura);
randomAyahText.textContent = suraTexts[ayah-1] || "النص غير متاح";
} catch (error) {
console.error('❌ خطأ في تحميل نص الآية:', error);
randomAyahText.textContent = "النص غير متاح حالياً";
}
goToSuraBtn.href = `sura.html?sura=${sura}`;
randomAyahPlaceholder.style.display = 'flex';
randomAyahImage.style.display = 'none';
randomAyahImage.onload = function() {
randomAyahImage.classList.add('loaded');
randomAyahPlaceholder.style.display = 'none';
randomAyahImage.style.display = 'block';
};
randomAyahImage.onerror = function() {
randomAyahPlaceholder.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>خطأ في تحميل الآية</span>`;
};
randomAyahImage.src = new URL(`quran_images/sura_${sura}/ayah_${ayah}.png`, document.baseURI).href;
randomAyahResult.style.display = 'block';
} else {
console.warn(`⚠️ صورة الآية ${ayah} من سورة ${suras[sura-1]} غير متوفرة، جاري إعادة المحاولة...`);
shownAyahs.delete(createAyahId(sura, ayah));
await showRandomAyah();
return;
}
} catch (error) {
console.error('❌ خطأ في عرض الآية العشوائية:', error);
randomAyahPlaceholder.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>حدث خطأ، جاري إعادة المحاولة...</span>`;
randomAyahResult.style.display = 'block';
setTimeout(showRandomAyah, 2000);
return;
} finally {
randomAyahBtn.classList.remove('spinning');
randomAyahBtn.disabled = false;
buttonText.textContent = 'اضغط للأختيار';
}
}

// البحث عن السور
function searchSuras() {
const searchTerm = searchInput.value.trim().toLowerCase();
if (searchTerm === '') {
renderSuraList();
return;
}
const filtered = suras
.map((name, index) => ({ name, index }))
.filter(sura => sura.name.toLowerCase().includes(searchTerm));
renderSuraList(filtered);
}

// تعطيل النقر بالزر الأيمن
document.addEventListener('contextmenu', function(e) {
e.preventDefault();
});

// تعطيل بعض اختصارات لوحة المفاتيح
document.addEventListener('keydown', function(e) {
if (e.keyCode === 123) {
e.preventDefault();
}
if (e.ctrlKey && e.key.toLowerCase() === 'u') {
e.preventDefault();
}
if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
e.preventDefault();
}
});

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
renderSuraList();
const initialSearch = new URLSearchParams(window.location.search).get('search');
if (initialSearch) {
searchInput.value = initialSearch;
searchSuras();
}
randomAyahBtn.addEventListener('click', showRandomAyah);
downloadBtn.addEventListener('click', downloadImage);
listenBtn.addEventListener('click', toggleAyahAudio);
searchInput.addEventListener('input', searchSuras);
});
