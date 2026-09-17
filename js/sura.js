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

// الحصول على معاملات URL
const params = new URLSearchParams(window.location.search);
const suraNum = parseInt(params.get("sura"));

// عناصر DOM
const container = document.getElementById("ayahs");
const title = document.getElementById("sura-title");
const suraInfo = document.getElementById("sura-info");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const noResults = document.getElementById("no-results");
const progressBar = document.getElementById("progress-bar");
const loadMoreContainer = document.getElementById("load-more-container");
const loadMoreBtn = document.getElementById("load-more-btn");
const ayahSearch = document.getElementById("ayah-search");
const searchBtn = document.getElementById("search-btn");
const clearSearchBtn = document.getElementById("clear-search");
const completionMessage = document.getElementById("completion-message");
const searchResultsSection = document.getElementById("search-results-section");
const searchResultsContent = document.getElementById("search-results-content");
const closeSearchResults = document.getElementById("close-search-results");
const shareModal = document.getElementById("share-modal");
const shareModalClose = document.getElementById("share-modal-close");
const shareLinkInput = document.getElementById("share-link-input");
const copyLinkBtn = document.getElementById("copy-link-btn");
const copySuccess = document.getElementById("copy-success");
const copySiteBtn = document.getElementById("copy-site-btn");
const copySiteSuccess = document.getElementById("copy-site-success");
const SITE_URL = "https://ayatshare.com";

// متغيرات عامة
const BATCH_SIZE = 15;
let currentBatch = 0;
let totalAyahs = 0;
let allAyahsLoaded = false;
let availableAyahs = 0;
let suraTexts = [];
let currentShareAyah = null;
let currentAudio = null;
let currentPlayingButton = null;

function localImagePath(suraNumber, ayahIndex) {
return `quran_images/sura_${suraNumber}/ayah_${ayahIndex}.png`;
}

function absoluteImageUrl(suraNumber, ayahIndex) {
return `${SITE_URL}/quran_images/sura_${suraNumber}/ayah_${ayahIndex}.png`;
}

function getAyahSnippet(ayahIndex, maxLength = 90) {
const text = (suraTexts[ayahIndex - 1] || "").trim();
return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function getShareTitle(ayahIndex) {
return `سورة ${suras[suraNum - 1]} - آية ${ayahIndex}`;
}

function getShareText(ayahIndex) {
return `${getShareTitle(ayahIndex)}
${suraTexts[ayahIndex - 1] || ''}`.trim();
}

function showCopySuccess(element, message) {
element.innerHTML = `<i class="fas fa-check"></i> ${message}`;
element.style.display = 'block';
setTimeout(() => element.style.display = 'none', 3000);
}

async function copyToClipboard(text) {
if (navigator.clipboard && window.isSecureContext) {
await navigator.clipboard.writeText(text);
return;
}
const textArea = document.createElement('textarea');
textArea.value = text;
textArea.style.position = 'fixed';
textArea.style.opacity = '0';
document.body.appendChild(textArea);
textArea.focus();
textArea.select();
document.execCommand('copy');
document.body.removeChild(textArea);
}

async function getImageFile(ayahIndex) {
const imagePath = localImagePath(suraNum, ayahIndex);
const response = await fetch(imagePath, { cache: 'force-cache' });
if (!response.ok) {
throw new Error(`Unable to load image: ${imagePath}`);
}
const blob = await response.blob();
const fileName = `sura_${suraNum}_ayah_${ayahIndex}.png`;
return new File([blob], fileName, { type: blob.type || 'image/png' });
}

async function shareImageFile(ayahIndex) {
if (!navigator.share || !navigator.canShare) {
return false;
}
try {
const imageFile = await getImageFile(ayahIndex);
const shareData = {
title: getShareTitle(ayahIndex),
text: getShareText(ayahIndex),
files: [imageFile]
};
if (!navigator.canShare({ files: [imageFile] })) {
return false;
}
await navigator.share(shareData);
return true;
} catch (error) {
console.warn('تعذر مشاركة الصورة مباشرة:', error);
return false;
}
}

// تحميل نص السورة من الملفات المحلية
function loadLocalSura(suraNum) {
return new Promise((resolve, reject) => {
const script = document.createElement("script");
script.src = `quran_text/sura_${suraNum}.js`;
script.onload = () => {
resolve(window[`sura_${suraNum}`] || []);
};
script.onerror = () => reject(`فشل تحميل ملف sura_${suraNum}.js`);
document.body.appendChild(script);
});
}

// التحقق من وجود صورة الآية
function checkAyahImageExists(ayahIndex) {
return new Promise((resolve) => {
if (ayahIndex < 1 || ayahIndex > totalAyahs) {
resolve(false);
return;
}
const img = new Image();
img.onload = () => resolve(true);
img.onerror = () => resolve(false);
setTimeout(() => {
img.src = localImagePath(suraNum, ayahIndex);
}, 50);
});
}

// تبديل تشغيل الصوت
function toggleAyahAudio(ayahIndex, button) {
if (currentAudio) {
currentAudio.pause();
currentAudio = null;
}
if (currentPlayingButton === button) {
resetAudioButton(button);
currentPlayingButton = null;
return;
}
if (currentPlayingButton) {
resetAudioButton(currentPlayingButton);
}
playAyahAudio(ayahIndex, button);
}

// تشغيل صوت الآية
function playAyahAudio(ayahIndex, button) {
button.innerHTML = `<i class="fas fa-pause"></i> إيقاف`;
button.classList.add('playing');
currentPlayingButton = button;
const suraFolder = suraNum.toString().padStart(3, '0');
const ayahFile = ayahIndex.toString().padStart(3, '0');
const audioPath = `sound/${suraFolder}/${suraFolder}${ayahFile}.mp3`;
currentAudio = new Audio(audioPath);
currentAudio.addEventListener('loadeddata', function() {
console.log(`🎵 جاري تشغيل: ${audioPath}`);
});
currentAudio.addEventListener('canplaythrough', function() {
currentAudio.play().catch(error => {
console.error('❌ خطأ في تشغيل الصوت:', error);
resetAudioButton(button);
});
});
currentAudio.addEventListener('ended', function() {
resetAudioButton(button);
currentPlayingButton = null;
currentAudio = null;
});
currentAudio.addEventListener('error', function(e) {
console.error('❌ خطأ في تحميل الصوت:', audioPath, e);
button.innerHTML = `<i class="fas fa-exclamation-triangle"></i> خطأ`;
button.style.background = '#dc3545';
setTimeout(() => {
resetAudioButton(button);
}, 2000);
});
}

// إعادة تعيين زر الصوت
function resetAudioButton(button) {
button.innerHTML = `<i class="fas fa-play"></i> استماع`;
button.classList.remove('playing');
}

// تحميل دفعة من الآيات
async function loadAyahBatch() {
if (allAyahsLoaded) return;
const startIndex = currentBatch * BATCH_SIZE + 1;
const endIndex = Math.min(startIndex + BATCH_SIZE - 1, totalAyahs);
console.log(`جاري تحميل الآيات من ${startIndex} إلى ${endIndex} من أصل ${totalAyahs}`);
let loadedInThisBatch = 0;
for (let i = startIndex; i <= endIndex; i++) {
createAyahCard(i);
loadedInThisBatch++;
availableAyahs++;
}
console.log(`✅ تم تجهيز ${loadedInThisBatch} آية للعرض`);
currentBatch++;
const progress = (availableAyahs / totalAyahs) * 100;
progressBar.style.width = `${progress}%`;
if (endIndex >= totalAyahs) {
allAyahsLoaded = true;
loadMoreContainer.style.display = 'none';
showCompletionMessage();
}
if (currentBatch === 1) {
loading.style.display = "none";
container.style.display = "grid";
if (endIndex < totalAyahs) {
loadMoreContainer.style.display = "block";
}
}
}

// عرض رسالة الإكمال
function showCompletionMessage() {
if (availableAyahs === 0) {
completionMessage.innerHTML = `
<i class="fas fa-info-circle"></i>
<h3>لا توجد صور متاحة لهذه السورة</h3>
<p>عفواً، لا توجد صور للآيات متاحة حالياً لسورة ${suras[suraNum-1]}</p>
`;
} else if (availableAyahs < totalAyahs) {
completionMessage.innerHTML = `
<i class="fas fa-check-circle"></i>
<h3>تم تحميل جميع الآيات المتاحة</h3>
<p>تم عرض ${availableAyahs} من أصل ${totalAyahs} آية متاحة لهذه السورة</p>
`;
} else {
completionMessage.innerHTML = `
<i class="fas fa-check-circle"></i>
<h3>تم تحميل جميع آيات السورة</h3>
<p>تم عرض جميع الآيات المتاحة لهذه السورة</p>
`;
}
completionMessage.style.display = 'block';
}

// إنشاء كارت الآية
function createAyahCard(ayahIndex) {
const card = document.createElement("div");
card.className = "ayah-card";
card.id = `ayah-${ayahIndex}`;
card.dataset.ayahNumber = ayahIndex;
const ayahNumber = document.createElement("div");
ayahNumber.className = "ayah-number";
ayahNumber.textContent = ayahIndex;
ayahNumber.title = `آية رقم ${ayahIndex}`;
const imageContainer = document.createElement("div");
imageContainer.className = "image-container";
const placeholder = document.createElement("div");
placeholder.className = "image-placeholder";
placeholder.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>جاري تحميل الآية...</span>`;
const img = document.createElement("img");
img.className = "ayah-image";
img.alt = `${getShareTitle(ayahIndex)} - ${getAyahSnippet(ayahIndex, 70)}`;
img.loading = ayahIndex <= 3 ? "eager" : "lazy";
img.decoding = "async";
if (ayahIndex <= 3) {
img.fetchPriority = "high";
}
imageContainer.appendChild(placeholder);
imageContainer.appendChild(img);
const imageCredit = document.createElement("p");
imageCredit.className = "ayah-image-credit";
imageCredit.innerHTML = `<a href="https://surahquran.com/" target="_blank" rel="noopener">الموقع الرئيسي للصور</a>`;
const ayahText = document.createElement("p");
ayahText.className = "ayah-text";
ayahText.textContent = suraTexts[ayahIndex-1] || "النص غير متاح";
const actionButtons = document.createElement("div");
actionButtons.className = "action-buttons";
const firstRow = document.createElement("div");
firstRow.className = "action-row";
const downloadLink = document.createElement("a");
downloadLink.href = localImagePath(suraNum, ayahIndex);
downloadLink.download = `sura_${suraNum}_ayah_${ayahIndex}.png`;
downloadLink.className = "action-btn download-btn";
downloadLink.innerHTML = `<i class="fas fa-download"></i> تنزيل`;
const shareButton = document.createElement("button");
shareButton.className = "action-btn share-btn";
shareButton.innerHTML = `<i class="fas fa-share-alt"></i> مشاركة`;
shareButton.addEventListener('click', () => openShareModal(ayahIndex));
firstRow.appendChild(downloadLink);
firstRow.appendChild(shareButton);
const secondRow = document.createElement("div");
secondRow.className = "action-row";
const listenButton = document.createElement("button");
listenButton.className = "action-btn listen-btn";
listenButton.innerHTML = `<i class="fas fa-play"></i> استماع`;
listenButton.addEventListener('click', () => toggleAyahAudio(ayahIndex, listenButton));
secondRow.appendChild(listenButton);
actionButtons.appendChild(firstRow);
actionButtons.appendChild(secondRow);
card.appendChild(ayahNumber);
card.appendChild(imageContainer);
card.appendChild(imageCredit);
card.appendChild(ayahText);
card.appendChild(actionButtons);
container.appendChild(card);
img.onload = function() {
img.classList.add('loaded');
placeholder.style.display = 'none';
};
img.onerror = function() {
placeholder.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>خطأ في تحميل الآية</span>`;
downloadLink.style.display = 'none';
};
setTimeout(() => {
img.src = localImagePath(suraNum, ayahIndex);
}, 0);
}

// إنشاء كارت نتيجة البحث
function createSearchResultCard(ayahIndex) {
const card = document.createElement("div");
card.className = "search-result-card";
const ayahNumber = document.createElement("div");
ayahNumber.className = "ayah-number";
ayahNumber.textContent = ayahIndex;
const imageContainer = document.createElement("div");
imageContainer.className = "image-container";
const placeholder = document.createElement("div");
placeholder.className = "image-placeholder";
placeholder.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>جاري تحميل الآية...</span>`;
const img = document.createElement("img");
img.className = "ayah-image";
img.alt = `${getShareTitle(ayahIndex)} - ${getAyahSnippet(ayahIndex, 70)}`;
img.loading = "eager";
img.decoding = "async";
img.fetchPriority = "high";
imageContainer.appendChild(placeholder);
imageContainer.appendChild(img);
const imageCredit = document.createElement("p");
imageCredit.className = "ayah-image-credit";
imageCredit.innerHTML = `<a href="https://surahquran.com/" target="_blank" rel="noopener">الموقع الرئيسي للصور</a>`;
const ayahText = document.createElement("p");
ayahText.className = "ayah-text";
ayahText.textContent = suraTexts[ayahIndex-1] || "النص غير متاح";
const actionButtons = document.createElement("div");
actionButtons.className = "action-buttons";
const firstRow = document.createElement("div");
firstRow.className = "action-row";
const downloadLink = document.createElement("a");
downloadLink.href = localImagePath(suraNum, ayahIndex);
downloadLink.download = `sura_${suraNum}_ayah_${ayahIndex}.png`;
downloadLink.className = "action-btn download-btn";
downloadLink.innerHTML = `<i class="fas fa-download"></i> تنزيل`;
const shareButton = document.createElement("button");
shareButton.className = "action-btn share-btn";
shareButton.innerHTML = `<i class="fas fa-share-alt"></i> مشاركة`;
shareButton.addEventListener('click', () => openShareModal(ayahIndex));
firstRow.appendChild(downloadLink);
firstRow.appendChild(shareButton);
const secondRow = document.createElement("div");
secondRow.className = "action-row";
const listenButton = document.createElement("button");
listenButton.className = "action-btn listen-btn";
listenButton.innerHTML = `<i class="fas fa-play"></i> استماع`;
listenButton.addEventListener('click', () => toggleAyahAudio(ayahIndex, listenButton));
secondRow.appendChild(listenButton);
actionButtons.appendChild(firstRow);
actionButtons.appendChild(secondRow);
card.appendChild(ayahNumber);
card.appendChild(imageContainer);
card.appendChild(imageCredit);
card.appendChild(ayahText);
card.appendChild(actionButtons);
img.onload = function() {
img.classList.add('loaded');
placeholder.style.display = 'none';
};
img.onerror = function() {
placeholder.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>خطأ في تحميل الآية</span>`;
downloadLink.style.display = 'none';
};
setTimeout(() => {
img.src = localImagePath(suraNum, ayahIndex);
}, 0);
return card;
}

// فتح نافذة المشاركة
async function openShareModal(ayahIndex) {
currentShareAyah = ayahIndex;
const sharedDirectly = await shareImageFile(ayahIndex);
if (sharedDirectly) {
return;
}
const imageUrl = absoluteImageUrl(suraNum, ayahIndex);
const shareText = getShareText(ayahIndex);
shareLinkInput.value = imageUrl;
shareModal.style.display = 'flex';
setupShareEvents(imageUrl, shareText);
}

// إعداد أحداث المشاركة
function setupShareEvents(imageUrl, shareText) {
document.querySelectorAll('.share-option').forEach(option => {
option.replaceWith(option.cloneNode(true));
});
const newShareOptions = document.querySelectorAll('.share-option');
newShareOptions.forEach(option => {
option.addEventListener('click', () => {
const platform = option.dataset.platform;
shareToPlatform(platform, imageUrl, shareText);
});
});
}

// المشاركة على منصة معينة
async function shareToPlatform(platform, imageUrl, shareText) {
if (currentShareAyah && await shareImageFile(currentShareAyah)) {
closeShareModal();
return;
}
const encodedText = encodeURIComponent(shareText);
let shareUrl = '';
switch(platform) {
case 'whatsapp':
shareUrl = `https://wa.me/?text=${encodedText}%0A${encodeURIComponent(imageUrl)}`;
break;
case 'facebook':
shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodedText}`;
break;
case 'twitter':
shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(imageUrl)}`;
break;
}
if (shareUrl) {
window.open(shareUrl, '_blank', 'width=600,height=400');
}
}

// إغلاق نافذة المشاركة
function closeShareModal() {
shareModal.style.display = 'none';
copySuccess.style.display = 'none';
copySiteSuccess.style.display = 'none';
}

// البحث عن آية
async function searchAyah(ayahNumber) {
noResults.style.display = 'none';
searchResultsSection.style.display = 'none';
if (ayahNumber < 1 || ayahNumber > totalAyahs) {
noResults.innerHTML = `<i class="fas fa-exclamation-triangle"></i><p>رقم الآية يجب أن يكون بين 1 و ${totalAyahs}</p>`;
noResults.style.display = 'block';
return;
}
searchResultsContent.innerHTML = '';
const resultCard = createSearchResultCard(ayahNumber);
searchResultsContent.appendChild(resultCard);
searchResultsSection.style.display = 'block';
searchResultsSection.scrollIntoView({ behavior: 'smooth' });
}

// مسح البحث
function clearSearch() {
ayahSearch.value = '';
noResults.style.display = 'none';
searchResultsSection.style.display = 'none';
}

// تحديث meta tags
function updateMetaTags(suraName, suraNum) {
const pageTitle = `سورة ${suraName} - موقع آيات | القرآن الكريم`;
const pageDescription = `اقرأ وتدبر سورة ${suraName} كاملة مع إمكانية تحميل الآيات ومشاركتها. سورة ${suraName} هي السورة رقم ${suraNum} في القرآن الكريم.`;
const pageUrl = `${SITE_URL}/sura.html?sura=${suraNum}`;
document.title = pageTitle;
document.querySelector('meta[name="description"]').setAttribute('content', pageDescription);
document.querySelector('meta[property="og:title"]').setAttribute('content', pageTitle);
document.querySelector('meta[property="og:description"]').setAttribute('content', pageDescription);
document.querySelector('meta[property="og:url"]').setAttribute('content', pageUrl);
document.querySelector('meta[property="og:image"]').setAttribute('content', `${SITE_URL}/img/og-image.jpg`);
document.querySelector('meta[property="og:image:secure_url"]').setAttribute('content', `${SITE_URL}/img/og-image.jpg`);
document.querySelector('meta[name="twitter:title"]').setAttribute('content', pageTitle);
document.querySelector('meta[name="twitter:description"]').setAttribute('content', pageDescription);
document.querySelector('meta[name="twitter:image"]').setAttribute('content', `${SITE_URL}/img/og-image.jpg`);
document.querySelector('link[rel="canonical"]').setAttribute('href', pageUrl);
}

// تهيئة الصفحة
async function initializePage() {
if (suraNum && suraNum >= 1 && suraNum <= 114) {
updateMetaTags(suras[suraNum-1], suraNum);
title.innerHTML = `<i class="fas fa-book-open"></i> سورة ${suras[suraNum-1]}`;
totalAyahs = ayahCount[suraNum-1];
ayahSearch.placeholder = `ابحث برقم الآية (1-${totalAyahs})...`;
ayahSearch.max = totalAyahs;
suraInfo.innerHTML = `
<div class="info-item">
<i class="fas fa-hashtag"></i>
<span>رقم السورة: ${suraNum}</span>
</div>
<div class="info-item">
<i class="fas fa-list-ol"></i>
<span>عدد الآيات: ${totalAyahs}</span>
</div>
<div class="info-item">
<i class="fas fa-quran"></i>
<span>الجزء: ${Math.ceil(suraNum / 20)}</span>
</div>
`;
try {
suraTexts = await loadLocalSura(suraNum);
await loadAyahBatch();
} catch (err) {
loading.style.display = "none";
error.style.display = "block";
}
} else {
loading.style.display = "none";
error.style.display = "block";
}
}

// الأحداث
loadMoreBtn.addEventListener("click", loadAyahBatch);
searchBtn.addEventListener("click", () => {
const ayahNumber = parseInt(ayahSearch.value);
if (ayahNumber) searchAyah(ayahNumber);
});
ayahSearch.addEventListener("keypress", (e) => {
if (e.key === "Enter") {
const ayahNumber = parseInt(ayahSearch.value);
if (ayahNumber) searchAyah(ayahNumber);
}
});
clearSearchBtn.addEventListener("click", clearSearch);
closeSearchResults.addEventListener("click", clearSearch);
document.querySelectorAll('.nav-btn[data-ayah]').forEach(btn => {
btn.addEventListener('click', () => {
const ayah = btn.dataset.ayah;
if (ayah === '1') {
ayahSearch.value = '1';
searchAyah(1);
} else if (ayah === 'last') {
ayahSearch.value = totalAyahs;
searchAyah(totalAyahs);
}
});
});
shareModalClose.addEventListener('click', closeShareModal);
copyLinkBtn.addEventListener('click', () => {
copyToClipboard(shareLinkInput.value).then(() => {
showCopySuccess(copySuccess, 'تم نسخ رابط الصورة بنجاح');
});
});
copySiteBtn.addEventListener('click', () => {
const siteInput = document.querySelector('.share-link-container:last-child .share-link-input');
copyToClipboard(siteInput.value).then(() => {
showCopySuccess(copySiteSuccess, 'تم نسخ رابط الموقع بنجاح');
});
});
shareModal.addEventListener('click', (e) => {
if (e.target === shareModal) closeShareModal();
});
window.addEventListener('beforeunload', function() {
if (currentAudio) {
currentAudio.pause();
currentAudio = null;
}
});


document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('keydown', function(e) {
if (e.keyCode === 123 || 
(e.ctrlKey && e.key.toLowerCase() === 'u') || 
(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')) {
e.preventDefault();
}
});

// بدء التهيئة
initializePage();
