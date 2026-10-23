import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';

const macros = {
  '\\E': '\\mathbb{E}',
  '\\Var': '\\operatorname{Var}',
  '\\Cov': '\\operatorname{Cov}',
  '\\MSE': '\\operatorname{MSE}',
  '\\Bias': '\\operatorname{Bias}',
  '\\SE': '\\operatorname{SE}',
  '\\iid': '\\overset{\\mathrm{iid}}{\\sim}',
  '\\N': '\\mathcal{N}',
  '\\R': '\\mathbb{R}',
  '\\Prob': '\\mathbb{P}',
  '\\checkmark': '\\text{✓}'
};

// Helper to wrap math
const m = expr => `<span class="math inline">\\(${expr}\\)</span>`;
const M = expr => `<span class="math display">\\[${expr}\\]</span>`;

const session1Sections = [
  {
    id: 's-ta1-1',
    title: '۱. مرور توزیع‌های پرکاربرد آماری و امید ریاضی',
    html: `
<p>سلام به همهٔ دانشجویان عزیز کارشناسی آمار! به اولین جلسه از حل تمرین درس شیرین و بنیادین <strong>«روش‌های آماری»</strong> خوش آمدید.</p>
<p>قبل از اینکه وارد مباحث اصلی استنباط و برآورد نقطه‌ای شویم، برای گرم شدن دستمان با محاسبات، خلاصه‌ای از فرمول‌های طلایی توزیع‌های پرکاربرد و خواص حیاتی امید ریاضی و واریانس را دوره می‌کنیم.</p>

<blockquote class="book-box reminder">
<p class="box-title">یادآوری ۱ | فرمول‌های کلیدی توزیع‌های پرکاربرد</p>
<p>در جدول زیر، مهم‌ترین توزیع‌های گسسته و پیوسته که در این ترم مدام با آن‌ها روبه‌رو می‌شویم جمع‌آوری شده است (با فرض ${m('q = 1 - p')}):</p>
<div class="table-wrap">
<table>
<thead>
<tr>
<th>توزیع</th>
<th>نماد و پارامترها</th>
<th>تابع جرم / چگالی احتمال</th>
<th>امید ریاضی ${m('\\E(X)')}</th>
<th>واریانس ${m('\\Var(X)')}</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>برنولی</strong></td>
<td>${m('X \\sim \\operatorname{Bernoulli}(p)')}</td>
<td>${m('p^x (1-p)^{1-x} \\quad (x \\in \\{0, 1\\})')}</td>
<td>${m('p')}</td>
<td>${m('p(1-p)')}</td>
</tr>
<tr>
<td><strong>دوجمله‌ای</strong></td>
<td>${m('X \\sim \\operatorname{Bin}(n, p)')}</td>
<td>${m('\\binom{n}{x} p^x (1-p)^{n-x} \\quad (x = 0, \\dots, n)')}</td>
<td>${m('np')}</td>
<td>${m('np(1-p)')}</td>
</tr>
<tr>
<td><strong>پواسون</strong></td>
<td>${m('X \\sim \\operatorname{Poisson}(\\lambda)')}</td>
<td>${m('\\frac{\\lambda^x e^{-\\lambda}}{x!} \\quad (x = 0, 1, 2, \\dots)')}</td>
<td>${m('\\lambda')}</td>
<td>${m('\\lambda')}</td>
</tr>
<tr>
<td><strong>یکنواخت پیوسته</strong></td>
<td>${m('X \\sim U(a, b)')}</td>
<td>${m('\\frac{1}{b-a} \\quad (a < x < b)')}</td>
<td>${m('\\frac{a+b}{2}')}</td>
<td>${m('\\frac{(b-a)^2}{12}')}</td>
</tr>
<tr>
<td><strong>نمایی</strong></td>
<td>${m('X \\sim \\operatorname{Exp}(\\lambda)')}</td>
<td>${m('\\lambda e^{-\\lambda x} \\quad (x > 0)')}</td>
<td>${m('\\frac{1}{\\lambda}')}</td>
<td>${m('\\frac{1}{\\lambda^2}')}</td>
</tr>
<tr>
<td><strong>نرمال</strong></td>
<td>${m('X \\sim \\mathcal{N}(\\mu, \\sigma^2)')}</td>
<td>${m('\\frac{1}{\\sigma\\sqrt{2\\pi}} \\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)')}</td>
<td>${m('\\mu')}</td>
<td>${m('\\sigma^2')}</td>
</tr>
<tr>
<td><strong>گاما</strong></td>
<td>${m('X \\sim \\operatorname{Gamma}(\\alpha, \\lambda)')}</td>
<td>${m('\\frac{\\lambda^\\alpha}{\\Gamma(\\alpha)} x^{\\alpha-1} e^{-\\lambda x} \\quad (x > 0)')}</td>
<td>${m('\\frac{\\alpha}{\\lambda}')}</td>
<td>${m('\\frac{\\alpha}{\\lambda^2}')}</td>
</tr>
</tbody>
</table>
</div>
</blockquote>

<blockquote class="book-box definition">
<p class="box-title">تعریف | امید ریاضی (Expected Value)</p>
<p>امید ریاضی یک متغیر تصادفی ${m('X')} که با نماد ${m('\\E(X)')} یا ${m('\\mu')} نمایش داده می‌شود، میانگین وزنی تمام مقادیر ممکن متغیر برحسب احتمال وقوع آن‌هاست:</p>
${M('\\E(X) = \\begin{cases} \\displaystyle\\sum_x x\\,p_X(x) & \\text{اگر متغیر گسسته باشد} \\\\[8pt] \\displaystyle\\int_{-\\infty}^{+\\infty} x\\,f_X(x)\\,dx & \\text{اگر متغیر پیوسته باشد} \\end{cases}')}
</blockquote>

<blockquote class="book-box reminder">
<p class="box-title">یادآوری ۲ | ۵ قانون طلایی و ابزاری امید ریاضی، واریانس و کوواریانس</p>
<ol>
<li><strong>خاصیت خطی بودن امید ریاضی (بدون نیاز به استقلال!):</strong>
${M('\\E(aX + bY + c) = a\\E(X) + b\\E(Y) + c')}
امید ریاضی همیشه عملگری خطی است، حتی اگر ${m('X')} و ${m('Y')} به شدت به هم وابسته باشند!</li>
<li><strong>رابطهٔ بازگشتی واریانس:</strong>
${M('\\Var(X) = \\E(X^2) - [\\E(X)]^2 \\implies \\E(X^2) = \\Var(X) + [\\E(X)]^2')}</li>
<li><strong>واریانس تبدیل خطی:</strong>
${M('\\Var(aX + b) = a^2 \\Var(X)')}
توجه کنید که اضافه شدن عدد ثابت ${m('b')} پراکندگی را تغییر نمی‌دهد و ضریب ${m('a')} به توان دو می‌رسد.</li>
<li><strong>رابطهٔ کوواریانس:</strong>
${M('\\Cov(X, Y) = \\E(XY) - \\E(X)\\E(Y) \\implies \\E(XY) = \\Cov(X, Y) + \\E(X)\\E(Y)')}</li>
<li><strong>پیامد استقلال:</strong>
اگر ${m('X')} و ${m('Y')} مستقل باشند، ${m('\\Cov(X, Y) = 0')} خواهد بود و در نتیجه:
${M('\\E(XY) = \\E(X)\\E(Y) \\qquad , \\qquad \\Var(X + Y) = \\Var(X) + \\Var(Y)')}</li>
</ol>
</blockquote>

<blockquote class="book-box reminder">
<p class="box-title">یادآوری ۳ | رفتارهای امید ریاضی، واریانس و کوواریانس در ترکیب‌های خطی</p>
<p>یکی از کلیدی‌ترین ابزارهای ما در طول این درس، تحلیل رفتار ترکیب‌های خطی متغیرهای تصادفی (مثل میانگین نمونه ${m('\\bar{X} = \\frac{1}{n}\\sum X_i')} و برآوردگرهای خطی) است:</p>
<ol>
<li><strong>امید ریاضی در ترکیب‌های خطی (همواره خطی، بدون نیاز به استقلال):</strong>
${M('\\E\\!\\left(\\sum_{i=1}^n a_i X_i + c\\right) = \\sum_{i=1}^n a_i \\E(X_i) + c')}
به‌عنوان حالت خاص دو متغیره: ${m('\\E(aX + bY + c) = a\\E(X) + b\\E(Y) + c')}.</li>
<li><strong>رفتار کوواریانس در ترکیب‌های خطی (خاصیت دوخطی یا Bilinearity):</strong>
کوواریانس نسبت به هر دو ورودی خود کاملاً خطی عمل می‌کند و اعداد ثابت هیچ کوواریانسی ندارند:
<ul>
<li><strong>تقارن:</strong> ${m('\\Cov(X, Y) = \\Cov(Y, X)')}</li>
<li><strong>کوواریانس متغیر با خودش:</strong> ${m('\\Cov(X, X) = \\Var(X)')}</li>
<li><strong>کوواریانس با عدد ثابت:</strong> برای هر عدد ثابت ${m('c')}، ${m('\\Cov(X, c) = 0')}</li>
<li><strong>اثر ضرایب و اعداد ثابت:</strong>
${M('\\Cov(aX + b, cY + d) = ac\\,\\Cov(X, Y)')}
(ثابت‌های ${m('b')} و ${m('d')} کاملاً حذف می‌شوند؛ چون انتقال مقادیر تأثیری بر هم‌پراکندگی ندارد).</li>
<li><strong>پخش‌پذیری روی جمع:</strong> ${m('\\Cov(X + Y, Z) = \\Cov(X, Z) + \\Cov(Y, Z)')}</li>
<li><strong>ترکیب خطی عمومی:</strong>
${M('\\Cov\\!\\left(\\sum_{i=1}^n a_i X_i, \\sum_{j=1}^m b_j Y_j\\right) = \\sum_{i=1}^n \\sum_{j=1}^m a_i b_j \\Cov(X_i, Y_j)')}</li>
</ul>
</li>
<li><strong>رفتار واریانس در ترکیب‌های خطی (پیوند مستقیم با کوواریانس):</strong>
چون ${m('\\Var(W) = \\Cov(W, W)')} است، واریانس ترکیب خطی مستقیماً از بسط دوخطی کوواریانس به دست می‌آید:
<ul>
<li><strong>دو متغیر:</strong>
${M('\\Var(aX + bY + c) = a^2\\Var(X) + b^2\\Var(Y) + 2ab\\,\\Cov(X, Y)')}
${M('\\Var(aX - bY) = a^2\\Var(X) + b^2\\Var(Y) - 2ab\\,\\Cov(X, Y)')}
(توجه: حتی در تفریق، واریانس‌ها با هم جمع می‌شوند چون ${m('(-b)^2 = b^2')}، ولی علامت کوواریانس منفی می‌شود).</li>
<li><strong>فرمول کلی برای ${m('n')} متغیر تصادفی:</strong>
${M('\\Var\\!\\left(\\sum_{i=1}^n a_i X_i\\right) = \\sum_{i=1}^n a_i^2 \\Var(X_i) + 2\\sum_{1 \\le i < j \\le n} a_i a_j \\Cov(X_i, X_j)')}</li>
<li><strong>حالت ویژه (متغیرهای ناهمبسته یا مستقل):</strong> اگر ${m('\\Cov(X_i, X_j) = 0')} به ازای هر ${m('i \\neq j')} باشد، تمامی جملات کوواریانس صفر شده و واریانس جمع، دقیقاً برابر با جمع واریانس‌ها با ضرایب مجذور می‌شود:
${M('\\Var\\!\\left(\\sum_{i=1}^n a_i X_i\\right) = \\sum_{i=1}^n a_i^2 \\Var(X_i)')}
به‌ویژه برای متغیرهای مستقل: ${m('\\Var(X \\pm Y) = \\Var(X) + \\Var(Y)')}.</li>
</ul>
</li>
</ol>
</blockquote>

<blockquote class="book-box example">
<p class="box-title">مثال کلاسی ۱ | محاسبهٔ امید ریاضی میانگین نمونه</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, X_2, \\dots, X_n')} یک نمونهٔ تصادفی از جامعه‌ای با میانگین ${m('\\mu')} باشند (یعنی ${m('\\E(X_i) = \\mu')}). امید ریاضی میانگین نمونه یعنی ${m('\\bar{X} = \\frac{1}{n}\\sum_{i=1}^n X_i')} را محاسبه کنید.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">حل گام‌به‌گام با بیان مفهومی</p>
<p><strong class="step-label">◄ گام اول: نوشتن تعریف میانگین نمونه</strong><br>
میانگین نمونه برابر جمع داده‌ها تقسیم بر تعداد کل (${m('n')}) است:
${M('\\bar{X} = \\frac{1}{n}(X_1 + X_2 + \\dots + X_n)')}</p>

<p><strong class="step-label">◄ گام دوم: اعمال امید ریاضی و استفاده از خاصیت خطی</strong><br>
چون ضریب ${m('\\frac{1}{n}')} ثابت است، از داخل امید ریاضی بیرون می‌آید:
${M('\\E(\\bar{X}) = \\E\\!\\left(\\frac{1}{n}\\sum_{i=1}^n X_i\\right) = \\frac{1}{n} \\sum_{i=1}^n \\E(X_i)')}</p>

<p><strong class="step-label">◄ گام سوم: جایگذاری امید ریاضی هر مشاهده</strong><br>
چون تمام داده‌ها از یک جامعه با میانگین ${m('\\mu')} آمده‌اند:
${M('\\E(\\bar{X}) = \\frac{1}{n} \\big( \\underbrace{\\mu + \\mu + \\dots + \\mu}_{n \\text{ بار}} \\big) = \\frac{1}{n} (n\\mu) = \\mu')}</p>
<p class="note-box"><strong>نتیجهٔ ملموس:</strong> میانگین حسابی نمونه، به‌طور متوسط دقیقاً مساوی میانگین واقعی جامعه یعنی ${m('\\mu')} است!</p>
</blockquote>
`
  },
  {
    id: 's-ta1-2',
    title: '۲. اصلاً «برآورد نقطه‌ای» یعنی چه؟',
    html: `
<p>بیایید با یک مثال ملموس از دانشگاه خودمان صحبت کنیم تا موضوع کاملاً برایتان شفاف شود:</p>
<p>فرض کنید می‌خواهیم مشخصات تحصیلی و عملکرد دانشجویان <strong>دانشکدهٔ علوم ریاضی</strong> را ارزیابی کنیم. در این مطالعه، کل دانشجویان دانشکدهٔ ریاضی، <strong>جامعهٔ آماری</strong> ما هستند. در دل این جامعه، سه کمیت ناشناخته وجود دارد که به آن‌ها <strong>پارامترهای جامعه</strong> می‌گوییم:</p>

<ul>
<li><strong>میانگین جامعه (${m('\\mu')}):</strong> میانگین واقعی معدل کل تمامی دانشجویان دانشکده.</li>
<li><strong>واریانس جامعه (${m('\\sigma^2')}):</strong> میزان پراکندگی یا نوسان نمرات دانشجوها حول میانگین.</li>
<li><strong>نسبت جامعه (${m('p')}):</strong> نسبت دانشجویانی که در ترم اول نمرهٔ ریاضی عمومی ۱ را بالای ۱۷ گرفته‌اند.</li>
</ul>

<blockquote class="book-box important">
<p class="box-title">چالش اساسی در استنباط آماری</p>
<p>ما این پارامترهای واقعی (${m('\\mu, \\sigma^2, p')}) را <strong>در اختیار نداریم!</strong> برای دانستن مقدار دقیق آن‌ها باید پروندهٔ تک‌تک چند صد دانشجو را بررسی کنیم که وقت‌گیر، هزینه‌بر یا عملاً غیرممکن است.</p>
</blockquote>

<div class="ta-diagram-card">
  <div class="ta-diagram-col pop">
    <div class="ta-badge">جامعهٔ آماری (نامعلوم)</div>
    <h4>دانشجویان دانشکدهٔ ریاضی</h4>
    <p>پارامترهای مجهول و ثابت:</p>
    <div class="math-pill">${m('\\mu \\quad , \\quad \\sigma^2 \\quad , \\quad p')}</div>
  </div>
  <div class="ta-diagram-arrow">
    <span class="arrow-line"></span>
    <span class="arrow-text">نمونه‌گیری تصادفی (${m('n')} نفر)</span>
    <span class="arrow-head">◀</span>
  </div>
  <div class="ta-diagram-col samp">
    <div class="ta-badge">نمونهٔ آماری (معلوم)</div>
    <h4>مثلاً ۳۰ نفر دانشجو</h4>
    <p>مشاهدات عددی ثبت‌شده:</p>
    <div class="math-pill">${m('X_1, X_2, \\dots, X_n')}</div>
  </div>
</div>

<p><strong>راه‌حل آمار چیست؟</strong> یک نمونهٔ تصادفی مثلاً ${m('n = 30')} نفره انتخاب کرده و معدل‌های آن‌ها را ثبت می‌کنیم: ${m('X_1, \\dots, X_n')}. حالا از روی این ۳۰ داده، می‌خواهیم <strong>یک عدد تک (یک نقطه)</strong> حدس بزنیم که معرف پارامتر مجهول جامعه باشد. به این کار <strong>برآورد نقطه‌ای (Point Estimation)</strong> می‌گویند.</p>

<blockquote class="book-box definition">
<p class="box-title">تعریف | برآوردگر (Estimator) در برابر برآورد (Estimate)</p>
<p>فرمول یا ضابطه‌ای که تابعی از مشاهدات نمونه است مانند ${m('T(X_1, \\dots, X_n)')} را <strong>برآوردگر</strong> می‌نامند. برآوردگر یک <em>متغیر تصادفی</em> است چون از نمونه‌ای به نمونهٔ دیگر تغییر می‌کند.</p>
<p>وقتی نمونه جمع‌آوری شده و مقادیر عددی در فرمول قرار گرفتند و یک عدد حاصل شد (مثلاً ${m('\\bar{x} = 16.4')})، به آن عددِ خاص <strong>برآورد</strong> گفته می‌شود.</p>
</blockquote>

<p>نمونه‌های معروفی که همه می‌شناسیم:</p>
<ul>
<li>برای حدس زدن میانگین جامعه (${m('\\mu')})، از میانگین نمونه استفاده می‌کنیم: ${m('\\bar{X} = \\frac{1}{n}\\sum X_i')}</li>
<li>برای حدس زدن واریانس جامعه (${m('\\sigma^2')})، از واریانس نمونه استفاده می‌کنیم: ${m('S^2 = \\frac{1}{n-1}\\sum (X_i - \\bar{X})^2')}</li>
<li>برای حدس زدن نسبت جامعه (${m('p')})، از نسبت نمونه استفاده می‌کنیم: ${m('\\hat{p} = \\frac{\\text{تعداد موارد موفق}}{n}')}</li>
</ul>

<p>اما یک پرسش اساسی مطرح می‌شود: <strong>از کجا بفهمیم یک برآوردگر خوب است یا بد؟</strong> اگر کسی پیشنهاد دهد «برای برآورد ${m('\\mu')}، فقط نمرهٔ نفر اول را برداریم (${m('X_1')})» و دیگری بگوید «میانگین بگیریم (${m('\\bar{X}')})»، چگونه قضاوت کنیم؟</p>
<p>علم آمار سه معیار بنیادین برای سنجش کیفیت برآوردگرها معرفی می‌کند که در بخش‌های بعدی به آن‌ها می‌پردازیم:</p>
<ol>
<li><strong>نااریبی (Unbiasedness):</strong> آیا برآوردگر به‌طور میانگین درست به هدف می‌زند یا خطای ساختاری دارد؟</li>
<li><strong>کارایی (Efficiency):</strong> بین برآوردگرهایی که به هدف می‌زنند، کدام‌یک خطای تصادفی و نوسان کمتری دارد؟</li>
<li><strong>سازگاری (Consistency):</strong> با افزایش حجم نمونه (${m('n \\to \\infty')})، آیا برآوردگر به مقدار واقعی میل می‌کند؟</li>
</ol>
`
  },
  {
    id: 's-ta1-3',
    title: '۳. معیار اول: نااریبی (Unbiasedness)',
    html: `
<blockquote class="book-box definition">
<p class="box-title">تعریف | برآوردگر نااریب و مقدار اریبی</p>
<p>فرض کنید ${m('T = T(X_1, \\dots, X_n)')} یک برآوردگر برای پارامتر مجهول ${m('\\theta')} باشد. می‌گوییم ${m('T')} یک <strong>برآوردگر نااریب</strong> برای ${m('\\theta')} است هرگاه امید ریاضی آن دقیقاً برابر خود پارامتر شود:</p>
${M('\\E_\\theta(T) = \\theta \\qquad (\\forall \\theta)')}
<p>اگر این برابری برقرار نباشد، برآوردگر را <strong>اریب (Biased)</strong> می‌نامیم و مقدار انحراف میانگین آن از پارامتر را <strong>اریبی (Bias)</strong> می‌گوییم:</p>
${M('b_\\theta(T) = \\Bias_\\theta(T) = \\E_\\theta(T) - \\theta')}
</blockquote>

<p><strong>تفسیر شهودی:</strong> فرض کنید به یک سیبل تیراندازی می‌کنید که خال سیاه وسط آن، پارامتر واقعی ${m('\\theta')} است. اگر تفنگ کالیبره نباشد و تیرها همواره به سمت راست یا پایین متمایل شوند، تیراندازی شما اریب است. اما اگر پراکندگی تیرها به گونه‌ای باشد که مرکز ثقل آن‌ها دقیقاً روی خال وسط بیفتد، تفنگ نااریب است!</p>

<blockquote class="book-box example">
<p class="box-title">مثال کلاسی ۲ | نااریبی میانگین نمونه</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, \\dots, X_n')} نمونه‌ای تصادفی از جامعه‌ای با میانگین ${m('\\theta')} باشد (${m('\\E(X_i) = \\theta')}). نشان دهید ${m('T(X) = \\bar{X}')} برآوردگر نااریب برای ${m('\\theta')} است.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">اثبات نااریبی میانگین نمونه</p>
<p><strong class="step-label">◄ گام اول: نوشتن امید ریاضی میانگین نمونه</strong>
${M('\\E(\\bar{X}) = \\E\\!\\left(\\frac{1}{n} \\sum_{i=1}^n X_i\\right) = \\frac{1}{n} \\sum_{i=1}^n \\E(X_i)')}</p>
<p><strong class="step-label">◄ گام دوم: جایگذاری فرض مسئله</strong><br>
چون ${m('\\E(X_i) = \\theta')}، داریم:
${M('\\E(\\bar{X}) = \\frac{1}{n} \\sum_{i=1}^n \\theta = \\frac{1}{n} (n\\theta) = \\theta')}
چون ${m('\\E(\\bar{X}) = \\theta')} شد، اریبی برابر صفر است (${m('b_\\theta(\\bar{X}) = 0')}) و در نتیجه ${m('\\bar{X}')} یک برآوردگر نااریب برای ${m('\\theta')} است. ${m('\\blacksquare')}</p>
</blockquote>

<blockquote class="book-box example">
<p class="box-title">مثال کلاسی ۳ | بررسی نااریبی واریانس نمونه و کشف ضریب اصلاحی</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, \\dots, X_n')} یک نمونهٔ تصادفی از جامعه‌ای با میانگین ${m('\\mu')} و واریانس ${m('\\sigma^2')} باشد. برآوردگر زیر را در نظر بگیرید:</p>
${M('\\hat{\\sigma}^2 = \\frac{1}{n} \\sum_{i=1}^n (X_i - \\bar{X})^2')}
<p>آیا ${m('\\hat{\\sigma}^2')} یک برآوردگر نااریب برای ${m('\\sigma^2')} است؟ اگر نه، مقدار اریبی آن را بیابید و برآوردگر نااریب مناسب را معرفی کنید.</p>
</blockquote>

<blockquote class="book-box reminder">
<p class="box-title">یادآوری | روابط کمکی ضروری برای اثبات</p>
<ul>
<li>${m('\\Var(X_i) = \\sigma^2 \\implies \\E(X_i^2) = \\Var(X_i) + [\\E(X_i)]^2 = \\sigma^2 + \\mu^2')}</li>
<li><strong>محاسبهٔ واریانس میانگین نمونه (به دلیل استقلال مشاهدات نمونه):</strong>
${M('\\Var(\\bar{X}) = \\Var\\!\\left(\\frac{1}{n}\\sum_{i=1}^n X_i\\right) = \\frac{1}{n^2}\\sum_{i=1}^n \\Var(X_i) = \\frac{1}{n^2}(n\\sigma^2) = \\frac{\\sigma^2}{n}')}
در نتیجه:
${M('\\E(\\bar{X}^2) = \\Var(\\bar{X}) + [\\E(\\bar{X})]^2 = \\frac{\\sigma^2}{n} + \\mu^2')}</li>
<li><strong>کوواریانس بین مشاهدهٔ ${m('i')}ام و میانگین نمونه (${m('\\Cov(X_i, \\bar{X})')}):</strong>
${M('\\begin{aligned} \\Cov(X_i, \\bar{X}) &= \\Cov\\!\\left(X_i, \\frac{1}{n}\\sum_{j=1}^n X_j\\right) \\\\[6pt] &= \\frac{1}{n} \\sum_{j=1}^n \\Cov(X_i, X_j) \\\\[6pt] &= \\frac{1}{n} \\Big[ \\Cov(X_i, X_i) + \\sum_{j \\neq i} \\Cov(X_i, X_j) \\Big] \\\\[6pt] &= \\frac{1}{n} \\Big[ \\Var(X_i) + 0 \\Big] = \\frac{1}{n}\\Var(X_i) = \\frac{\\sigma^2}{n} \\end{aligned}')}
<p><strong>ضریب ${m('\\frac{1}{n}')} از کجا آمده و این رابطه چگونه به دست آمده است؟</strong></p>
<ul>
<li><strong>منشأ ضریب ${m('\\frac{1}{n}')}:</strong> در تعریف میانگین نمونه داریم ${m('\\bar{X} = \\frac{1}{n}\\sum_{j=1}^n X_j')}. طبق خاصیت دوخطی بودن کوواریانس (Bilinearity)، ضریب ثابت ${m('\\frac{1}{n}')} مستقیماً از مؤلفهٔ دوم کوواریانس بیرون می‌آید: ${m('\\Cov(X, cY) = c\\,\\Cov(X, Y)')} و عملگر سیگما نیز پخش می‌شود.</li>
<li><strong>چرا از کل سیگما فقط یک جمله باقی ماند؟</strong> مجموع ${m('\\sum_{j=1}^n \\Cov(X_i, X_j)')} شامل ${m('n')} جمله است:
<ul>
<li>اگر ${m('j = i')} باشد، کوواریانس هر متغیر با خودش برابر واریانس آن است: ${m('\\Cov(X_i, X_i) = \\Var(X_i) = \\sigma^2')}.</li>
<li>اگر ${m('j \\neq i')} باشد (تعداد ${m('n-1')} جملهٔ دیگر)، چون داده‌های نمونه تصادفی از هم مستقل هستند (${m('X_i \\iid')})، کوواریانس هر دو مشاهدهٔ متمایز صفر است: ${m('\\Cov(X_i, X_j) = 0')}.</li>
</ul>
بنابراین تمام ${m('n-1')} جملهٔ دیگر صفر می‌شوند و فقط همان یک جملهٔ ${m('\\Var(X_i) = \\sigma^2')} باقی می‌ماند که با ضرب در ضریب ${m('\\frac{1}{n}')}، حاصل دقیقاً ${m('\\frac{1}{n}\\Var(X_i) = \\frac{\\sigma^2}{n}')} می‌شود.
</li>
</ul>
در نتیجه برای امید ریاضی حاصل‌ضرب ${m('X_i \\bar{X}')} خواهیم داشت:
${M('\\E(X_i \\bar{X}) = \\Cov(X_i, \\bar{X}) + \\E(X_i)\\E(\\bar{X}) = \\frac{\\sigma^2}{n} + \\mu^2')}</li>
</ul>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">اثبات گام‌به‌گام و دقیق</p>
<p><strong class="step-label">◄ گام اول: باز کردن عبارت داخل پرانتز</strong><br>
می‌دانیم ${m('(X_i - \\bar{X})^2 = X_i^2 - 2X_i\\bar{X} + \\bar{X}^2')}. پس با اعمال امید ریاضی:
${M('\\E(\\hat{\\sigma}^2) = \\frac{1}{n} \\sum_{i=1}^n \\Big[ \\E(X_i^2) + \\E(\\bar{X}^2) - 2\\E(X_i\\bar{X}) \\Big]')}</p>

<p><strong class="step-label">◄ گام دوم: جایگذاری روابط کمکی</strong>
${M('\\E(X_i^2) = \\sigma^2 + \\mu^2 \\quad , \\quad \\E(\\bar{X}^2) = \\frac{\\sigma^2}{n} + \\mu^2 \\quad , \\quad -2\\E(X_i\\bar{X}) = -2\\left(\\frac{\\sigma^2}{n} + \\mu^2\\right)')}</p>

<p><strong class="step-label">◄ گام سوم: ساده‌سازی داخل پرانتز</strong><br>
جملات شامل ${m('\\mu^2')} همدیگر را خنثی می‌کنند (${m('\\mu^2 + \\mu^2 - 2\\mu^2 = 0')}) و برای جملات شامل ${m('\\sigma^2')} داریم:
${M('\\sigma^2 + \\frac{\\sigma^2}{n} - \\frac{2\\sigma^2}{n} = \\sigma^2 \\left(1 - \\frac{1}{n}\\right) = \\frac{n-1}{n}\\sigma^2')}</p>

<p><strong class="step-label">◄ گام چهارم: نتیجه‌گیری نهایی</strong><br>
چون این حاصل به ${m('i')} وابسته نیست، جمع ${m('n')} تایی و تقسیم بر ${m('n')} همان مقدار را می‌دهد:
${M('\\E(\\hat{\\sigma}^2) = \\frac{1}{n} \\cdot n \\cdot \\left(\\frac{n-1}{n}\\sigma^2\\right) = \\frac{n-1}{n}\\sigma^2 \\neq \\sigma^2')}
<p class="note-box">امید ریاضی ${m('\\hat{\\sigma}^2')} برابر با ${m('\\sigma^2')} نشد! بلکه شد ${m('\\frac{n-1}{n}\\sigma^2')}. پس این برآوردگر اریب است و اریبی آن برابر است با:
${M('\\Bias(\\hat{\\sigma}^2) = \\frac{n-1}{n}\\sigma^2 - \\sigma^2 = -\\frac{\\sigma^2}{n}')}</p>
</blockquote>

<blockquote class="book-box result">
<p class="box-title">نتیجهٔ کلیدی | تولد واریانس نمونه‌ای نااریب (${m('S^2')})</p>
<p>برای خنثی کردن این اریبی، کافی است دو طرف رابطه را در ضریب معکوس یعنی ${m('\\frac{n}{n-1}')} ضرب کنیم:</p>
${M('\\E\\!\\left(\\frac{n}{n-1}\\hat{\\sigma}^2\\right) = \\sigma^2 \\implies S^2 = \\frac{1}{n-1}\\sum_{i=1}^n (X_i - \\bar{X})^2')}
<p>به همین دلیل است که در تمامی کتب معتبر آمار، واریانس نمونه را با مخرج ${m('n-1')} تعریف می‌کنند نه ${m('n')}!</p>
</blockquote>
`
  },
  {
    id: 's-ta1-4',
    title: '۴. معیار دوم: کارایی (Efficiency) و خطای میانگین مربعات (MSE)',
    html: `
<p>فرض کنید دو برآوردگر مختلف داریم که هر دو برای پارامتر مجهول ${m('\\theta')} نااریب هستند. اکنون سؤال این است: <strong>کدام‌یک عملکرد بهتری دارد و مطمئن‌تر است؟</strong></p>
<p>پاسخ شهودی و علمی: برآوردگری که <strong>واریانس کمتری</strong> داشته باشد! واریانس کمتر یعنی پراکندگی کمتر دور هدف، خطای تصادفی کمتر و تخمین‌های پایدارتر.</p>

<blockquote class="book-box definition">
<p class="box-title">تعریف | کارایی نسبی دو برآوردگر نااریب</p>
<p>اگر ${m('T_1')} و ${m('T_2')} دو برآوردگر <strong>نااریب</strong> برای پارامتر ${m('\\theta')} باشند، کارایی نسبی ${m('T_1')} نسبت به ${m('T_2')} با نسبت عکس واریانس‌های آن‌ها تعریف می‌شود:</p>
${M('e(T_1, T_2) = \\frac{\\Var(T_2)}{\\Var(T_1)}')}
<ul>
<li>اگر ${m('e(T_1, T_2) > 1')} باشد، یعنی ${m('\\Var(T_1) < \\Var(T_2)')} و برآوردگر ${m('T_1')} کاراتر (بهتر) از ${m('T_2')} است.</li>
<li>اگر ${m('e(T_1, T_2) < 1')} باشد، برآوردگر ${m('T_2')} کاراتر است.</li>
</ul>
</blockquote>

<blockquote class="book-box reminder">
<p class="box-title">یادآوری | تعمیم به برآوردگرهای اریب با خطای میانگین مربعات (MSE)</p>
<p>اگر حداقل یکی از برآوردگرها اریب باشد، مقایسهٔ صرف واریانس عادلانه نیست! در این صورت از معیار <strong>میانگین توان دوم خطاها (Mean Squared Error)</strong> استفاده می‌کنیم:</p>
${M('\\MSE_\\theta(T) = \\E_\\theta(T - \\theta)^2 = \\Var_\\theta(T) + [\\Bias_\\theta(T)]^2')}
<p>و کارایی نسبی در حالت کلی برابر است با:</p>
${M('e(T_1, T_2) = \\frac{\\MSE_\\theta(T_2)}{\\MSE_\\theta(T_1)}')}
</blockquote>

<blockquote class="book-box example">
<p class="box-title">مثال کلاسی ۴ | مقایسهٔ کارایی در نمونه‌گیری از توزیع دوجمله‌ای</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, \\dots, X_n')} یک نمونهٔ تصادفی از توزیع دوجمله‌ای ${m('\\operatorname{Bin}(k, \\theta)')} باشند. کارایی برآوردگر ${m('T_1 = \\bar{X}_n')} را نسبت به ${m('T_2 = \\frac{X_1 - \\bar{X}}{n}')} در برآورد پارامتر ${m('k\\theta')} به دست آورید.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">تحلیل و محاسبهٔ گام‌به‌گام</p>
<p>در اینجا پارامتر مورد نظر، میانگین توزیع دوجمله‌ای یعنی ${m('\\tau = k\\theta')} است.</p>

<p><strong class="step-label">◄ گام اول: بررسی کامل برآوردگر اول (${m('T_1 = \\bar{X}')})</strong><br>
امید ریاضی: ${m('\\E(T_1) = \\E(\\bar{X}) = k\\theta \\implies \\Bias(T_1) = 0')} (نااریب است).<br>
واریانس:
${M('\\Var(T_1) = \\frac{\\Var(X_i)}{n} = \\frac{k\\theta(1-\\theta)}{n}')}
چون نااریب است، MSE دقیقاً با واریانس برابر است:
${M('\\MSE_{k\\theta}(T_1) = \\frac{k\\theta(1-\\theta)}{n} \\qquad \\text{--- (رابطهٔ ۱)}')}</p>

<p><strong class="step-label">◄ گام دوم: بررسی کامل برآوردگر دوم (${m('T_2 = \\frac{X_1 - \\bar{X}}{n}')})</strong><br>
امید ریاضی:
${M('\\E(T_2) = \\frac{1}{n}\\big[\\E(X_1) - \\E(\\bar{X})\\big] = \\frac{1}{n}[k\\theta - k\\theta] = 0')}
چون امید ریاضی صفر شد، اریبی بسیار بزرگ است:
${M('b_{k\\theta}(T_2) = 0 - k\\theta = -k\\theta')}
واریانس ${m('T_2')}:
${M('\\Var(T_2) = \\frac{1}{n^2}\\big[\\Var(X_1) + \\Var(\\bar{X}) - 2\\Cov(X_1, \\bar{X})\\big]')}
با جایگذاری ${m('\\Cov(X_1, \\bar{X}) = \\frac{\\Var(X_1)}{n}')}:
${M('\\Var(T_2) = \\frac{1}{n^2}\\left[ k\\theta(1-\\theta) + \\frac{k\\theta(1-\\theta)}{n} - 2\\frac{k\\theta(1-\\theta)}{n} \\right] = \\frac{k\\theta(1-\\theta)(n-1)}{n^3}')}
حالا خطای میانگین مربعات ${m('T_2')} را حساب می‌کنیم:
${M('\\MSE_{k\\theta}(T_2) = \\Var(T_2) + \\Bias^2 = \\frac{k\\theta(1-\\theta)(n-1)}{n^3} + k^2\\theta^2 \\qquad \\text{--- (رابطهٔ ۲)}')}</p>

<p><strong class="step-label">◄ گام سوم: محاسبهٔ نسبت کارایی و ساده‌سازی نهایی</strong>
${M('e(T_1, T_2) = \\frac{\\MSE(T_2)}{\\MSE(T_1)} = \\frac{k^2\\theta^2 + \\frac{k\\theta(1-\\theta)(n-1)}{n^3}}{\\frac{k\\theta(1-\\theta)}{n}}')}
کسر صورت را به دو بخش تفکیک و بر مخرج تقسیم می‌کنیم:
${M('e(T_1, T_2) = \\frac{k^2\\theta^2}{\\frac{k\\theta(1-\\theta)}{n}} + \\frac{\\frac{k\\theta(1-\\theta)(n-1)}{n^3}}{\\frac{k\\theta(1-\\theta)}{n}} = \\frac{nk\\theta}{1-\\theta} + \\frac{n-1}{n^2} = \\frac{n^3 k\\theta + (n-1)(1-\\theta)}{n^2(1-\\theta)}')}</p>
<p class="note-box">چون صورت کسر شامل جملهٔ درجه سه ${m('n^3')} است، مقدار ${m('e(T_1, T_2)')} برای نمونه‌های بزرگ فوق‌العاده بزرگتر از ۱ است. این نشان می‌دهد برآوردگر میانگین نمونه (${m('T_1')}) با اختلاف نجومی از ${m('T_2')} بهتر و کاراتر است!</p>
</blockquote>
`
  },
  {
    id: 's-ta1-5',
    title: '۵. معیار سوم: سازگاری (Consistency)',
    html: `
<p>تا اینجا اندازهٔ نمونه ${m('n')} را ثابت فرض کردیم. اما در کاربردهای واقعی، پرسش اساسی این است: <strong>اگر داده‌های بیشتری جمع‌آوری کنیم (${m('n \\to \\infty')})، آیا حدس ما به حقیقت می‌پیوندد؟</strong> به این رفتار مجانبی، <strong>سازگاری</strong> می‌گویند.</p>

<blockquote class="book-box definition">
<p class="box-title">تعریف | برآوردگر سازگار (همگرایی در احتمال)</p>
<p>دنبالهٔ برآوردگرهای ${m('T_n = T(X_1, \\dots, X_n)')} برای پارامتر ${m('\\theta')} را <strong>سازگار</strong> می‌نامیم هرگاه ${m('T_n')} در احتمال به ${m('\\theta')} همگرا شود (${m('T_n \\xrightarrow{P} \\theta')})؛ یعنی به ازای هر عدد مثبتِ دلخواه ${m('\\varepsilon > 0')}:</p>
${M('\\lim_{n \\to \\infty} \\Prob_\\theta\\big(|T_n - \\theta| < \\varepsilon\\big) = 1 \\quad \\iff \\quad \\lim_{n \\to \\infty} \\Prob_\\theta\\big(|T_n - \\theta| \\ge \\varepsilon\\big) = 0')}
</blockquote>

<blockquote class="book-box result">
<p class="box-title">قضیه و شرط کافی برای سازگاری (با نامساوی چبیشف)</p>
<p>اگر برای یک برآوردگر داشته باشیم:</p>
${M('\\lim_{n \\to \\infty} \\MSE_\\theta(T_n) = 0 \\quad \\Big(\\text{یعنی } \\lim_{n\\to\\infty} \\Var(T_n) = 0 \\text{ و } \\lim_{n\\to\\infty} \\Bias(T_n) = 0\\Big)')}
<p>آنگاه ${m('T_n')} قطعاً یک برآوردگر سازگار برای ${m('\\theta')} است.</p>
</blockquote>

<p><strong>اثبات خیلی ساده با نامساوی چبیشف:</strong> طبق نامساوی چبیشف برای هر ${m('\\varepsilon > 0')} داریم:
${M('\\Prob_\\theta\\big(|T_n - \\theta| \\ge \\varepsilon\\big) \\le \\frac{\\E_\\theta(T_n - \\theta)^2}{\\varepsilon^2} = \\frac{\\MSE_\\theta(T_n)}{\\varepsilon^2}')}
وقتی ${m('n \\to \\infty')}، چون فرض کردیم ${m('\\MSE \\to 0')}، طرف راست کسر به صفر میل می‌کند و اثبات فوراً تمام می‌شود!</p>

<blockquote class="book-box example">
<p class="box-title">مثال کلاسی ۵ | اثبات سازگاری میانگین نمونه</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, \\dots, X_n')} یک نمونهٔ تصادفی از جامعه‌ای با میانگین ${m('\\theta')} و واریانس متناهی ${m('\\sigma^2')} باشد. نشان دهید میانگین نمونه ${m('\\bar{X}_n')} برآوردگر سازگار برای ${m('\\theta')} است.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">اثبات با استفاده از شرط کافی سازگاری</p>
<p><strong class="step-label">◄ گام اول: محاسبهٔ اریبی و واریانس</strong><br>
می‌دانیم میانگین نمونه نااریب است: ${m('\\E(\\bar{X}_n) = \\theta \\implies \\Bias(\\bar{X}_n) = 0')}.<br>
واریانس آن نیز برابر است با: ${m('\\Var(\\bar{X}_n) = \\frac{\\sigma^2}{n}')}.</p>

<p><strong class="step-label">◄ گام دوم: محاسبهٔ حد خطای میانگین مربعات (MSE)</strong>
${M('\\lim_{n \\to \\infty} \\MSE_\\theta(\\bar{X}_n) = \\lim_{n \\to \\infty} \\left(\\frac{\\sigma^2}{n} + 0^2\\right) = \\lim_{n \\to \\infty} \\frac{\\sigma^2}{n} = 0')}</p>

<p><strong class="step-label">◄ گام سوم: نتیجه‌گیری نهایی</strong><br>
چون حد MSE صفر شد، طبق شرط کافی سازگاری بلافاصله نتیجه می‌شود:
${M('\\bar{X}_n \\xrightarrow{\\;P\\;} \\theta \\qquad (\\bar{X}_n \\text{ برآوردگر سازگار است})')}
<p class="note-box">این نتیجه دقیقاً همان <strong>قانون ضعیف اعداد بزرگ (WLLN)</strong> است که به ما اطمینان می‌دهد با نمونه‌گیری بزرگ، میانگین نمونه به واقعیت جامعه همگرا خواهد شد.</p>
</blockquote>
`
  },
  {
    id: 's-ta1-6',
    title: '۶. مجموعه تمرین‌های حل‌شده و دسته‌بندی‌شده',
    html: `
<p>در این بخش، ۶ تمرین متنوع و دسته‌بندی‌شده پیرامون نااریبی، کارایی و سازگاری با بیان گام‌به‌گام و روان حل شده‌اند.</p>

<h3 class="ta-group-title">بخش الف: تمرین‌های نااریبی</h3>

<blockquote class="book-box example">
<p class="box-title">تمرین ۱ | تعیین ضرایب ترکیب خطی نااریب</p>
<p><strong>صورت مسئله:</strong> اگر ${m('T_1')} و ${m('T_2')} دو برآوردگر نااریب برای پارامتر ${m('\\theta')} باشند، ضرایب ثابت ${m('a_1')} و ${m('a_2')} را چنان بیابید که ترکیب خطی ${m('T = a_1 T_1 + a_2 T_2')} نیز یک برآوردگر نااریب برای ${m('\\theta')} باشد.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">حل گام‌به‌گام تمرین ۱</p>
<p><strong class="step-label">◄ گام اول: نوشتن فرض مسئله</strong><br>
چون ${m('T_1')} و ${m('T_2')} نااریب هستند: ${m('\\E(T_1) = \\theta')} و ${m('\\E(T_2) = \\theta')}.</p>

<p><strong class="step-label">◄ گام دوم: محاسبهٔ امید ریاضی ترکیب خطی</strong><br>
از خاصیت خطی بودن امید ریاضی استفاده می‌کنیم:
${M('\\E(T) = \\E(a_1 T_1 + a_2 T_2) = a_1 \\E(T_1) + a_2 \\E(T_2) = a_1 \\theta + a_2 \\theta = (a_1 + a_2)\\theta')}</p>

<p><strong class="step-label">◄ گام سوم: برقراری شرط نااریبی</strong><br>
می‌خواهیم برای هر مقدار دلخواه ${m('\\theta')} تساوی ${m('\\E(T) = \\theta')} برقرار باشد:
${M('(a_1 + a_2)\\theta = \\theta \\iff a_1 + a_2 = 1')}
<p class="note-box"><strong>نتیجه:</strong> هر ترکیب محدب از دو برآوردگر نااریب (مانند میانگین سادهٔ آن‌ها ${m('\\frac{T_1 + T_2}{2}')})، مجدداً نااریب است! توجه کنید در این اثبات هیچ نیازی به فرض استقلال بین ${m('T_1')} و ${m('T_2')} نبود.</p>
</blockquote>

<blockquote class="book-box example">
<p class="box-title">تمرین ۲ | بررسی اریبی در توزیع نمایی</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, \\dots, X_n')} یک نمونهٔ تصادفی از توزیع نمایی با پارامتر ${m('\\lambda > 0')} باشد (با میانگین ${m('\\E(X_i) = \\frac{1}{\\lambda}')}). نشان دهید برآوردگر پیشنهادی ${m('T = \\frac{n}{n+1}\\bar{X}')} یک برآوردگر نااریب برای پارامتر ${m('\\theta = \\frac{1}{\\lambda}')} نیست و مقدار اریبی آن را تعیین کنید.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">حل گام‌به‌گام تمرین ۲</p>
<p><strong class="step-label">◄ گام اول: محاسبهٔ امید ریاضی ${m('T')}</strong><br>
می‌دانیم ${m('\\E(\\bar{X}) = \\E(X_i) = \\frac{1}{\\lambda}')}. بنابراین:
${M('\\E(T) = \\E\\!\\left(\\frac{n}{n+1}\\bar{X}\\right) = \\frac{n}{n+1}\\E(\\bar{X}) = \\frac{n}{(n+1)\\lambda}')}</p>

<p><strong class="step-label">◄ گام دوم: محاسبهٔ اریبی</strong><br>
چون هدف ما برآورد پارامتر ${m('\\theta = \\frac{1}{\\lambda}')} است، تفاضل را محاسبه می‌کنیم:
${M('\\Bias(T) = \\E(T) - \\frac{1}{\\lambda} = \\frac{n}{(n+1)\\lambda} - \\frac{1}{\\lambda} = \\frac{n - (n+1)}{(n+1)\\lambda} = -\\frac{1}{(n+1)\\lambda}')}
<p class="note-box">علامت منفی نشان می‌دهد این برآوردگر مقدار پارامتر را کمی کمتر از واقعیت تخمین می‌زند (کم‌تخمین). اما با بزرگ شدن نمونه (${m('n \\to \\infty')})، این اریبی به صفر میل می‌کند که اصطلاحاً به آن «نااریبی مجانبی» می‌گویند.</p>
</blockquote>

<blockquote class="book-box example">
<p class="box-title">تمرین ۳ | برآورد مساحت مستطیل با مشاهدات مستقل</p>
<p><strong>صورت مسئله:</strong> برای برآورد مساحت یک زمین مستطیلی، طول (${m('X')}) و عرض (${m('Y')}) به‌طور مستقل اندازه‌گیری می‌شوند. توزیع احتمال تجربی آن‌ها به صورت زیر است:</p>
<div class="table-wrap">
<table>
<thead><tr><th>${m('x')}</th><th>8</th><th>10</th><th>11</th></tr></thead>
<tbody><tr><td>${m('\\Pr(X=x)')}</td><td>1/4</td><td>1/4</td><td>1/2</td></tr></tbody>
</table>
</div>
<div class="table-wrap">
<table>
<thead><tr><th>${m('y')}</th><th>4</th><th>6</th></tr></thead>
<tbody><tr><td>${m('\\Pr(Y=y)')}</td><td>1/2</td><td>1/2</td></tr></tbody>
</table>
</div>
<p>طول و عرض واقعی زمین به ترتیب ۱۰ و ۵ متر و مساحت واقعی ۵۰ مترمربع است. نااریبی برآوردگر طول (${m('X')})، عرض (${m('Y')}) و مساحت (${m('A = XY')}) را بررسی کنید و سپس واریانس مساحت یعنی ${m('\\Var(A)')} را به دست آورید.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">حل گام‌به‌گام تمرین ۳</p>
<p><strong class="step-label">◄ گام اول: بررسی نااریبی طول (${m('X')}) و عرض (${m('Y')})</strong>
${M('\\E(X) = 8\\left(\\frac{1}{4}\\right) + 10\\left(\\frac{1}{4}\\right) + 11\\left(\\frac{1}{2}\\right) = 2 + 2.5 + 5.5 = 10')}
چون ${m('\\E(X) = 10')} با طول واقعی برابر است، برآوردگر طول نااریب است.<br>
برای عرض:
${M('\\E(Y) = 4\\left(\\frac{1}{2}\\right) + 6\\left(\\frac{1}{2}\\right) = 2 + 3 = 5')}
چون ${m('\\E(Y) = 5')} با عرض واقعی برابر است، برآوردگر عرض نیز نااریب است.</p>

<p><strong class="step-label">◄ گام دوم: بررسی نااریبی برآوردگر مساحت (${m('A = XY')})</strong><br>
چون در صورت مسئله قید شده اندازه‌گیری‌ها <strong>مستقل</strong> هستند:
${M('\\E(A) = \\E(XY) = \\E(X)\\E(Y) = 10 \\times 5 = 50')}
چون ${m('\\E(A) = 50')} دقیقاً مساوی مساحت واقعی شد، ${m('A')} نیز یک برآوردگر نااریب برای مساحت است.</p>

<p><strong class="step-label">◄ گام سوم: محاسبهٔ واریانس مساحت ${m('\\Var(A)')}</strong><br>
از رابطهٔ ${m('\\Var(A) = \\E(A^2) - [\\E(A)]^2')} استفاده می‌کنیم. به دلیل استقلال:
${M('\\E(X^2) = 64\\left(\\frac{1}{4}\\right) + 100\\left(\\frac{1}{4}\\right) + 121\\left(\\frac{1}{2}\\right) = 16 + 25 + 60.5 = 101.5 = \\frac{203}{2}')}
${M('\\E(Y^2) = 16\\left(\\frac{1}{2}\\right) + 36\\left(\\frac{1}{2}\\right) = 8 + 18 = 26')}
بنابراین:
${M('\\E(A^2) = \\E(X^2 Y^2) = \\E(X^2)\\E(Y^2) = \\frac{203}{2} \\times 26 = 203 \\times 13 = 2639')}
در نتیجه واریانس مساحت برابر است با:
${M('\\Var(A) = 2639 - (50)^2 = 2639 - 2500 = 139')}</p>
</blockquote>

<h3 class="ta-group-title">بخش ب: تمرین‌های کارایی</h3>

<blockquote class="book-box example">
<p class="box-title">تمرین ۴ | مقایسهٔ کارایی دو برآوردگر میانگین</p>
<p><strong>صورت مسئله:</strong> از جامعه‌ای با میانگین ${m('\\mu')} و واریانس ${m('\\sigma^2 > 0')}، نمونه‌ای با اندازهٔ ۳ یعنی ${m('(X_1, X_2, X_3)')} در دست داریم. دو برآوردگر زیر برای برآورد ${m('\\mu')} پیشنهاد شده‌اند:</p>
${M('T_1 = \\frac{X_1 + X_2 + X_3}{3} = \\bar{X} \\qquad , \\qquad T_2 = \\frac{X_1 + 2X_2 + X_3}{4}')}
<p>الف) نشان دهید هر دو برآوردگر نااریب هستند.<br>
ب) کارایی نسبی ${m('T_1')} نسبت به ${m('T_2')} را محاسبه نموده و مشخص کنید کدام برآوردگر ارجح است؟</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">حل گام‌به‌گام تمرین ۴</p>
<p><strong class="step-label">◄ الف) بررسی نااریبی دو برآوردگر</strong>
${M('\\E(T_1) = \\frac{\\E(X_1) + \\E(X_2) + \\E(X_3)}{3} = \\frac{3\\mu}{3} = \\mu \\quad \\checkmark')}
${M('\\E(T_2) = \\frac{\\E(X_1) + 2\\E(X_2) + \\E(X_3)}{4} = \\frac{4\\mu}{4} = \\mu \\quad \\checkmark')}
هر دو برآوردگر نااریب هستند (چون مجموع ضرایب آن‌ها مساوی ۱ است).</p>

<p><strong class="step-label">◄ ب) محاسبهٔ واریانس‌ها و کارایی نسبی</strong><br>
چون متغیرها مستقل و دارای واریانس یکسان ${m('\\sigma^2')} هستند:
${M('\\Var(T_1) = \\frac{\\Var(X_1) + \\Var(X_2) + \\Var(X_3)}{9} = \\frac{3\\sigma^2}{9} = \\frac{\\sigma^2}{3} = \\frac{8\\sigma^2}{24}')}
${M('\\Var(T_2) = \\frac{\\Var(X_1) + 4\\Var(X_2) + \\Var(X_3)}{16} = \\frac{6\\sigma^2}{16} = \\frac{3\\sigma^2}{8} = \\frac{9\\sigma^2}{24}')}
حالا کارایی نسبی ${m('T_1')} نسبت به ${m('T_2')} را حساب می‌کنیم:
${M('e(T_1, T_2) = \\frac{\\Var(T_2)}{\\Var(T_1)} = \\frac{\\frac{3}{8}\\sigma^2}{\\frac{1}{3}\\sigma^2} = \\frac{3}{8} \\times \\frac{3}{1} = \\frac{9}{8} = 1.125 > 1')}
<p class="note-box">چون ${m('e(T_1, T_2) > 1')} شد، واریانس ${m('T_1')} کمتر است و در نتیجه میانگین حسابی ساده (${m('T_1')}) کاراتر و بهتر از ${m('T_2')} است. این یک اصل مهم آماری را نشان می‌دهد: <em>وقتی مشاهدات دارای واریانس‌های یکسان هستند، وزن مساوی دادن به مشاهدات کمترین واریانس را به دست می‌دهد!</em></p>
</blockquote>

<h3 class="ta-group-title">بخش ج: تمرین‌های سازگاری</h3>

<blockquote class="book-box example">
<p class="box-title">تمرین ۵ | سازگاری برآوردگر کران بالا در توزیع یکنواخت</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, \\dots, X_n')} یک نمونهٔ تصادفی از توزیع یکنواخت ${m('U(0, \\theta)')} با پارامتر نامعلوم ${m('\\theta > 0')} باشند. نشان دهید برآوردگر ${m('T_n = 2\\bar{X}_n')} یک برآوردگر سازگار برای ${m('\\theta')} است.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">حل گام‌به‌گام تمرین ۵</p>
<p><strong class="step-label">◄ گام اول: بررسی نااریبی</strong><br>
برای ${m('X_i \\sim U(0, \\theta)')}، میانگین جامعه برابر ${m('\\E(X_i) = \\frac{\\theta}{2}')} است. پس:
${M('\\E(T_n) = \\E(2\\bar{X}_n) = 2\\E(\\bar{X}_n) = 2\\left(\\frac{\\theta}{2}\\right) = \\theta')}
بنابراین برآوردگر نااریب است و ${m('\\Bias(T_n) = 0')}.</p>

<p><strong class="step-label">◄ گام دوم: محاسبهٔ واریانس</strong><br>
واریانس توزیع یکنواخت برابر است با: ${m('\\Var(X_i) = \\frac{\\theta^2}{12}')}.<br>
واریانس میانگین نمونه: ${m('\\Var(\\bar{X}_n) = \\frac{\\theta^2}{12n}')}.<br>
در نتیجه واریانس ${m('T_n')}:
${M('\\Var(T_n) = \\Var(2\\bar{X}_n) = 4\\Var(\\bar{X}_n) = 4\\left(\\frac{\\theta^2}{12n}\\right) = \\frac{\\theta^2}{3n}')}</p>

<p><strong class="step-label">◄ گام سوم: بررسی حد خطای میانگین مربعات (MSE)</strong>
${M('\\lim_{n \\to \\infty} \\MSE_\\theta(T_n) = \\lim_{n \\to \\infty} \\left(\\frac{\\theta^2}{3n} + 0\\right) = 0')}
چون حد خطای میانگین مربعات صفر است، طبق شرط کافی سازگاری اثبات می‌شود که:
${M('2\\bar{X}_n \\xrightarrow{\\;P\\;} \\theta \\qquad (T_n \\text{ برآوردگر سازگار است})')}</p>
</blockquote>

<blockquote class="book-box example">
<p class="box-title">تمرین ۶ | اثبات سازگاری میانگین نمونه در توزیع نرمال با نامساوی چبیشف</p>
<p><strong>صورت مسئله:</strong> فرض کنید ${m('X_1, \\dots, X_n')} متغیرهای تصادفی مستقل با توزیع یکسان نرمال ${m('\\mathcal{N}(\\theta, 1)')} باشند. با استفاده از تعریف همگرایی در احتمال و نامساوی چبیشف، مستقیماً اثبات کنید که میانگین نمونه ${m('\\bar{X}_n')} برای پارامتر ${m('\\theta')} سازگار است.</p>
</blockquote>

<blockquote class="book-box solution">
<p class="box-title">حل گام‌به‌گام تمرین ۶</p>
<p><strong class="step-label">◄ گام اول: استخراج میانگین و واریانس</strong><br>
چون مشاهدات از ${m('\\mathcal{N}(\\theta, 1)')} هستند:
${M('\\E(\\bar{X}_n) = \\theta \\qquad , \\qquad \\Var(\\bar{X}_n) = \\frac{1}{n}')}</p>

<p><strong class="step-label">◄ گام دوم: اعمال نامساوی چبیشف</strong><br>
برای هر عدد دلخواه و مثبت ${m('\\varepsilon > 0')}، طبق نامساوی چبیشف احتمال دوری ${m('\\bar{X}_n')} از میانگینش را کران‌دار می‌کنیم:
${M('\\Prob_\\theta\\big(|\\bar{X}_n - \\theta| \\ge \\varepsilon\\big) \\le \\frac{\\Var(\\bar{X}_n)}{\\varepsilon^2} = \\frac{1}{n\\varepsilon^2}')}</p>

<p><strong class="step-label">◄ گام سوم: محاسبهٔ حد وقتی ${m('n \\to \\infty')}</strong><br>
با میل کردن حجم نمونه به بی‌نهایت:
${M('\\lim_{n \\to \\infty} \\frac{1}{n\\varepsilon^2} = 0')}
چون مقدار احتمال همواره نامنفی است (${m('\\ge 0')})، با توجه به قضیهٔ فشردگی (ساندویچ) داریم:
${M('0 \\le \\lim_{n \\to \\infty} \\Prob_\\theta\\big(|\\bar{X}_n - \\theta| \\ge \\varepsilon\\big) \\le 0 \\implies \\lim_{n \\to \\infty} \\Prob_\\theta\\big(|\\bar{X}_n - \\theta| \\ge \\varepsilon\\big) = 0')}
این تساوی دقیقاً تعریف همگرایی در احتمال است، پس:
${M('\\bar{X}_n \\xrightarrow{\\;P\\;} \\theta \\qquad (\\bar{X}_n \\text{ برآوردگر سازگار است})')}</p>
</blockquote>
`
  }
];

const taSessions = [
  {
    id: 'session-1',
    number: 1,
    title: 'جلسه اول: برآورد نقطه‌ای، نااریبی، کارایی و سازگاری',
    shortTitle: 'جلسه اول',
    subtitle: 'مرور توزیع‌ها، امید ریاضی، مفهوم برآورد نقطه‌ای، نااریبی، کارایی، سازگاری و ۶ تمرین حل‌شده',
    description: 'درس‌نامهٔ جامع، مثال‌های کلاسی و تمرین‌های حل‌شده با بیان گام‌به‌گام · مدرس حل تمرین: علیرضا جهانبخش',
    pdf: 'assets/ta/session-1.pdf',
    pages: 32,
    intro: `
<div class="ta-session-hero">
  <div class="ta-session-badge">کلاس‌های حل تمرین درس روش‌های آماری</div>
  <p class="ta-session-lead">در این جلسه مبحث برآورد نقطه‌ای را از ریشه بررسی می‌کنیم: از فلسفهٔ استنباط و تخمین پارامترهای جامعه گرفته تا ۳ ویژگی کلیدی برآوردگر خوب یعنی <strong>نااریبی</strong>، <strong>کارایی</strong> و <strong>سازگاری</strong> همراه با ۶ تمرین حل‌شده با بیان ساده و محاوره‌ای.</p>
</div>
`,
    sections: session1Sections
  },
  {
    id: 'session-2',
    number: 2,
    title: 'جلسه دوم: به‌زودی اضافه می‌شود',
    shortTitle: 'جلسه دوم',
    subtitle: 'موضوعات و تمرین‌های جلسه دوم کلاس‌های حل تمرین',
    description: 'به‌زودی پس از تشکیل کلاس در دسترس قرار خواهد گرفت.',
    pages: 0,
    intro: `
<div class="ta-placeholder-card">
  <div class="ta-placeholder-icon">⏳</div>
  <h3>جلسه دوم هنوز برگزار نشده است</h3>
  <p>متن کامل جزوه، نکات مفهومی و تمرین‌های حل‌شده این جلسه به‌زودی پس از ارائه در کلاس حل تمرین در این بخش قرار می‌گیرد.</p>
  <a href="#ta-1" class="primary" style="display:inline-block;margin-top:16px;">مشاهدهٔ جلسه اول (برآورد نقطه‌ای) ←</a>
</div>
`,
    sections: []
  },
  {
    id: 'session-3',
    number: 3,
    title: 'جلسه سوم: به‌زودی اضافه می‌شود',
    shortTitle: 'جلسه سوم',
    subtitle: 'موضوعات و تمرین‌های جلسه سوم کلاس‌های حل تمرین',
    description: 'به‌زودی پس از تشکیل کلاس در دسترس قرار خواهد گرفت.',
    pages: 0,
    intro: `
<div class="ta-placeholder-card">
  <div class="ta-placeholder-icon">⏳</div>
  <h3>جلسه سوم هنوز برگزار نشده است</h3>
  <p>متن کامل جزوه، نکات مفهومی و تمرین‌های حل‌شده این جلسه به‌زودی پس از ارائه در کلاس حل تمرین در این بخش قرار می‌گیرد.</p>
  <a href="#ta-1" class="primary" style="display:inline-block;margin-top:16px;">مشاهدهٔ جلسه اول (برآورد نقطه‌ای) ←</a>
</div>
`,
    sections: []
  },
  {
    id: 'session-4',
    number: 4,
    title: 'جلسه چهارم: به‌زودی اضافه می‌شود',
    shortTitle: 'جلسه چهارم',
    subtitle: 'موضوعات و تمرین‌های جلسه چهارم کلاس‌های حل تمرین',
    description: 'به‌زودی پس از تشکیل کلاس در دسترس قرار خواهد گرفت.',
    pages: 0,
    intro: `
<div class="ta-placeholder-card">
  <div class="ta-placeholder-icon">⏳</div>
  <h3>جلسه چهارم هنوز برگزار نشده است</h3>
  <p>متن کامل جزوه، نکات مفهومی و تمرین‌های حل‌شده این جلسه به‌زودی پس از ارائه در کلاس حل تمرین در این بخش قرار می‌گیرد.</p>
  <a href="#ta-1" class="primary" style="display:inline-block;margin-top:16px;">مشاهدهٔ جلسه اول (برآورد نقطه‌ای) ←</a>
</div>
`,
    sections: []
  }
];

// Verify all math equations with KaTeX
console.log('Testing all math expressions in ta-sessions.json with KaTeX...');
let equationCount = 0;
for (const session of taSessions) {
  const fullHtml = session.intro + session.sections.map(s => s.html).join('');
  const mathMatches = fullHtml.match(/<span class="math (inline|display)">\\([\[\(])([\s\S]*?)\\([\]\)])<\/span>/g) || [];
  for (const match of mathMatches) {
    equationCount++;
    const isDisplay = match.includes('display');
    const rawMatch = match.match(/<span class="math (?:inline|display)">\\([\[\(])([\s\S]*?)\\([\]\)])<\/span>/);
    const expr = rawMatch[2];
    try {
      katex.renderToString(expr, {
        throwOnError: true,
        strict: 'ignore',
        macros,
        displayMode: isDisplay
      });
    } catch (e) {
      console.error(`KaTeX ERROR in session ${session.id}:`, expr);
      throw e;
    }
  }
}
console.log(`PASS: All ${equationCount} math equations in ta-sessions.json render perfectly with KaTeX!`);

const outPath = path.resolve('dist/ta-sessions.json');
fs.writeFileSync(outPath, JSON.stringify(taSessions, null, 2), 'utf8');
console.log(`Saved ${outPath} successfully.`);
