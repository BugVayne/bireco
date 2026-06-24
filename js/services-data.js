// Данные о сервисах компании. Тексты-заготовки — замените на реальные описания.
// Поле icon — встроенный SVG; tint — оттенок карточки-«фото».
// Поле full — массив блоков: { h: "заголовок" } или { p: "абзац" } (рендерится
// в js/main.js и build.py). Допускается и обычная строка (один абзац).

window.SERVICES = [
  {
    id: "management-reporting",
    tint: "#1d4ed8",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21h18"/><rect x="5" y="10" width="3.4" height="8" rx="0.6"/><rect x="10.3" y="6" width="3.4" height="12" rx="0.6"/><rect x="15.6" y="13" width="3.4" height="5" rx="0.6"/><path d="M5 6.5l5-3 5 2.5 4.5-2.5"/></svg>',
    title: { en: "Management Reporting", ru: "Управленческая отчётность" },
    short: {
      en: "Executive dashboards and KPI reporting that give leadership a single, trusted view of the business.",
      ru: "Дашборды и KPI-отчётность, которые дают руководству единую достоверную картину бизнеса.",
    },
    full: {
      en: [
        { h: "What we build" },
        { p: "We build management reporting systems that consolidate financial and operational data from all your sources into one coherent picture." },
        { p: "This includes monthly close packs, P&L and cash-flow dashboards, plan-vs-actual analysis, and drill-down from company level all the way to individual transactions." },
        { h: "What you get" },
        { p: "Reports update automatically, so your team spends time on decisions instead of assembling spreadsheets." },
        { p: "We also help define the right KPI tree, so every metric on the dashboard has a clear owner and a target." },
      ],
      ru: [
        { h: "Что мы делаем" },
        { p: "Мы строим системы управленческой отчётности, которые консолидируют финансовые и операционные данные из всех ваших источников в единую картину." },
        { p: "Сюда входят пакеты закрытия месяца, дашборды P&L и денежных потоков, план-факт анализ и детализация от уровня компании до отдельных транзакций." },
        { h: "Что вы получаете" },
        { p: "Отчёты обновляются автоматически — команда тратит время на решения, а не на сведение таблиц." },
        { p: "Также помогаем выстроить дерево KPI, чтобы у каждой метрики был владелец и целевое значение." },
      ],
    },
  },
  {
    id: "sales-reporting",
    tint: "#0e7490",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 17l5.2-5.2 3.6 3.6L21 7"/><path d="M15.5 7H21v5.5"/></svg>',
    title: { en: "Sales Reporting", ru: "Отчётность по продажам" },
    short: {
      en: "Pipeline, conversion and revenue analytics that show exactly where sales are won and lost.",
      ru: "Аналитика воронки, конверсии и выручки, которая показывает, где именно выигрываются и теряются продажи.",
    },
    full: {
      en: [
        { h: "What we build" },
        { p: "Sales reporting connected directly to your CRM and billing systems: pipeline health, conversion by stage, win/loss analysis, sales-rep performance, and territory and product mix." },
        { p: "Forecasting models built on historical conversion let managers see expected revenue weeks ahead." },
        { h: "What you get" },
        { p: "Daily-updated leaderboards and target tracking keep the team focused." },
        { p: "Management gets reliable forecasts backed by data instead of optimistic guesses." },
      ],
      ru: [
        { h: "Что мы делаем" },
        { p: "Отчётность по продажам, подключённая напрямую к CRM и биллингу: состояние воронки, конверсия по этапам, анализ выигранных и проигранных сделок, эффективность менеджеров, разрезы по территориям и продуктам." },
        { p: "Модели прогноза на основе исторической конверсии — руководители видят ожидаемую выручку на недели вперёд." },
        { h: "Что вы получаете" },
        { p: "Ежедневно обновляемые рейтинги и контроль целей держат команду в фокусе." },
        { p: "Менеджмент получает надёжные прогнозы на основе данных вместо оптимистичных оценок." },
      ],
    },
  },
  {
    id: "marketing-reporting",
    tint: "#7c3aed",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    title: { en: "Marketing Reporting", ru: "Маркетинговая отчётность" },
    short: {
      en: "Campaign performance, channel ROI and funnel analytics across all your marketing platforms.",
      ru: "Эффективность кампаний, ROI каналов и аналитика воронки по всем маркетинговым платформам.",
    },
    full: {
      en: [
        { h: "What we build" },
        { p: "We unify data from advertising platforms, web analytics, email tools and CRM into a single marketing data model." },
        { p: "On top of it: cost per lead and per acquisition by channel and campaign, multi-touch attribution, cohort retention, and funnel drop-off analysis." },
        { h: "What you get" },
        { p: "Marketing leaders see which budgets actually generate revenue — not just clicks." },
        { p: "Spend can be reallocated with confidence, backed by data rather than intuition." },
      ],
      ru: [
        { h: "Что мы делаем" },
        { p: "Мы объединяем данные рекламных платформ, веб-аналитики, email-сервисов и CRM в единую маркетинговую модель данных." },
        { p: "Поверх неё: стоимость лида и привлечения по каналам и кампаниям, мультиканальная атрибуция, когортный анализ удержания и анализ потерь на этапах воронки." },
        { h: "Что вы получаете" },
        { p: "Руководители маркетинга видят, какие бюджеты действительно приносят выручку, а не только клики." },
        { p: "Расходы можно перераспределять уверенно — на основе данных, а не интуиции." },
      ],
    },
  },
  {
    id: "production-reporting",
    tint: "#b45309",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9"/></svg>',
    title: { en: "Production Reporting", ru: "Производственная отчётность" },
    short: {
      en: "OEE, downtime, quality and cost reporting that makes shop-floor performance visible in real time.",
      ru: "Отчётность по OEE, простоям, качеству и себестоимости — производство как на ладони в реальном времени.",
    },
    full: {
      en: [
        { h: "What we build" },
        { p: "Production reporting built on data from MES, SCADA, ERP and manual logs: overall equipment effectiveness (OEE), downtime causes, scrap and rework rates, output per line and per shift, and unit-cost dynamics." },
        { p: "We deliver shift dashboards on the shop floor, weekly performance reviews for plant management, and consolidated views at the holding level." },
        { h: "What you get" },
        { p: "Bottlenecks and recurring loss patterns become visible — and fixable." },
      ],
      ru: [
        { h: "Что мы делаем" },
        { p: "Производственная отчётность на данных MES, SCADA, ERP и ручных журналов: общая эффективность оборудования (OEE), причины простоев, доля брака и переделок, выработка по линиям и сменам, динамика себестоимости." },
        { p: "Мы делаем сменные дашборды в цеху, еженедельные обзоры эффективности для руководства завода и консолидированные представления на уровне холдинга." },
        { h: "Что вы получаете" },
        { p: "Узкие места и повторяющиеся потери становятся видимыми — и устранимыми." },
      ],
    },
  },
  {
    id: "supply-chain-reporting",
    tint: "#047857",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="8.5" width="11" height="8" rx="1"/><path d="M13.5 11h4l3 3v2.5h-7z"/><circle cx="7" cy="18.5" r="1.7"/><circle cx="17" cy="18.5" r="1.7"/></svg>',
    title: { en: "Supply Chain Reporting", ru: "Отчётность по цепочкам поставок" },
    short: {
      en: "Inventory, delivery SLA and supplier performance analytics across the whole supply chain.",
      ru: "Аналитика запасов, SLA доставки и эффективности поставщиков по всей цепочке поставок.",
    },
    full: {
      en: [
        { h: "What we build" },
        { p: "End-to-end supply chain visibility: stock levels and turnover by warehouse and SKU, out-of-stock and overstock alerts, OTIF delivery performance, supplier lead times and reliability scoring, and transportation cost analytics." },
        { h: "What you get" },
        { p: "Demand-vs-supply dashboards help planners act before shortages happen." },
        { p: "Procurement gets objective data to back supplier negotiations." },
      ],
      ru: [
        { h: "Что мы делаем" },
        { p: "Сквозная прозрачность цепочки поставок: уровни запасов и оборачиваемость по складам и SKU, алерты по дефициту и излишкам, показатель OTIF, сроки и надёжность поставщиков, аналитика транспортных затрат." },
        { h: "Что вы получаете" },
        { p: "Дашборды «спрос-предложение» позволяют планировщикам действовать до возникновения дефицита." },
        { p: "Закупки получают объективные данные для переговоров с поставщиками." },
      ],
    },
  },
  {
    id: "security-it-reporting",
    tint: "#334155",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7.5 3v5.2c0 4.6-3.1 8-7.5 9.8-4.4-1.8-7.5-5.2-7.5-9.8V6z"/><path d="M9 12.2l2.1 2.1L15.3 10"/></svg>',
    title: { en: "Security & IT Reporting", ru: "Отчётность по ИТ и безопасности" },
    short: {
      en: "Incident, SLA and infrastructure health reporting for IT and information security teams.",
      ru: "Отчётность по инцидентам, SLA и состоянию инфраструктуры для команд ИТ и ИБ.",
    },
    full: {
      en: [
        { h: "What we build" },
        { p: "Reporting for CIO and CISO offices: incident volume and resolution times, SLA compliance by service, infrastructure availability and capacity trends, vulnerability and patching status, and audit-ready compliance reports." },
        { h: "What you get" },
        { p: "Data is collected from ITSM, monitoring and security tools automatically." },
        { p: "Manual monthly slide decks are replaced with always-current dashboards." },
      ],
      ru: [
        { h: "Что мы делаем" },
        { p: "Отчётность для офисов CIO и CISO: объём инцидентов и сроки их решения, соблюдение SLA по сервисам, доступность и ёмкость инфраструктуры, статус уязвимостей и патчей, отчёты для аудитов и комплаенса." },
        { h: "Что вы получаете" },
        { p: "Данные собираются из ITSM, систем мониторинга и средств защиты автоматически." },
        { p: "Ручные ежемесячные презентации заменяются всегда актуальными дашбордами." },
      ],
    },
  },
  {
    id: "risk-management-reporting",
    tint: "#be123c",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4l9 16H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r="0.4" fill="currentColor"/></svg>',
    title: { en: "Risk Management Reporting", ru: "Отчётность по управлению рисками" },
    short: {
      en: "Risk registers, exposure dashboards and early-warning indicators for management and the board.",
      ru: "Реестры рисков, дашборды экспозиции и индикаторы раннего предупреждения для менеджмента и совета директоров.",
    },
    full: {
      en: [
        { h: "What we build" },
        { p: "We turn risk management from a static register into a living reporting system: consolidated risk maps, key risk indicators with thresholds and alerts, exposure and limit-utilization dashboards, and scenario and sensitivity views." },
        { p: "Board-level risk reports are generated automatically." },
        { h: "What you get" },
        { p: "Risk owners see their indicators in real time." },
        { p: "The risk function spends its time on analysis instead of data collection." },
      ],
      ru: [
        { h: "Что мы делаем" },
        { p: "Мы превращаем управление рисками из статичного реестра в живую систему отчётности: консолидированные карты рисков, ключевые индикаторы риска с порогами и алертами, дашборды экспозиции и использования лимитов, сценарные представления." },
        { p: "Риск-отчёты для совета директоров готовятся автоматически." },
        { h: "Что вы получаете" },
        { p: "Владельцы рисков видят свои индикаторы в реальном времени." },
        { p: "Риск-функция тратит время на анализ, а не на сбор данных." },
      ],
    },
  },
];

// Демо-новости: показываются, пока не настроен Apps Script (см. README).
window.SAMPLE_NEWS = [
  {
    id: "demo-1",
    date: "2026-06-01",
    title_en: "We launched our new website",
    title_ru: "Мы запустили новый сайт",
    summary_en: "A new home for our insights, services and stories — built for clarity.",
    summary_ru: "Новый дом для наших новостей, сервисов и историй — сделан ради ясности.",
    body_en: "Welcome to our new website! Here you will find detailed descriptions of our reporting services, industry expertise and regular analytics from our team. This is a demo news item — connect the Google Sheet backend to manage real news.",
    body_ru: "Добро пожаловать на наш новый сайт! Здесь вы найдёте подробные описания наших сервисов отчётности, отраслевую экспертизу и регулярную аналитику от нашей команды. Это демонстрационная новость — подключите бэкенд Google Таблицы, чтобы управлять реальными новостями.",
    image: "",
  },
  {
    id: "demo-2",
    date: "2026-05-18",
    title_en: "Five signs your company has outgrown spreadsheets",
    title_ru: "Пять признаков, что компания переросла Excel",
    summary_en: "When manual reporting starts costing more than a BI solution.",
    summary_ru: "Когда ручная отчётность начинает стоить дороже, чем BI-решение.",
    body_en: "Manual spreadsheet reporting works — until it doesn't. In this article we look at five practical signs that it is time to move to automated reporting: version chaos, copy-paste errors, week-long month closes, conflicting numbers in different departments and analysts spending most of their time assembling data instead of analyzing it.",
    body_ru: "Ручная отчётность в таблицах работает — до определённого момента. В этой статье мы разбираем пять практических признаков того, что пора переходить на автоматизированную отчётность: хаос версий, ошибки копирования, закрытие месяца длиной в неделю, расходящиеся цифры в разных отделах и аналитики, тратящие большую часть времени на сбор данных вместо анализа.",
    image: "",
  },
  {
    id: "demo-3",
    date: "2026-04-30",
    title_en: "Case study: sales reporting for a distribution company",
    title_ru: "Кейс: отчётность по продажам для дистрибьютора",
    summary_en: "From weekly manual reports to daily dashboards in eight weeks.",
    summary_ru: "От еженедельных ручных отчётов к ежедневным дашбордам за восемь недель.",
    body_en: "Our client, a regional distribution company, used to assemble sales reports manually every Friday. We connected their ERP and CRM to a unified data model and delivered daily-updated dashboards covering pipeline, conversion and territory performance. Management now sees yesterday's numbers every morning. This is a demo news item.",
    body_ru: "Наш клиент, региональная дистрибьюторская компания, собирал отчёты по продажам вручную каждую пятницу. Мы подключили их ERP и CRM к единой модели данных и внедрили ежедневно обновляемые дашборды по воронке, конверсии и территориям. Руководство теперь каждое утро видит вчерашние цифры. Это демонстрационная новость.",
    image: "",
  },
  {
    id: "demo-4",
    date: "2026-04-02",
    title_en: "How we approach KPI design",
    title_ru: "Как мы подходим к проектированию KPI",
    summary_en: "A good dashboard starts long before the first chart.",
    summary_ru: "Хороший дашборд начинается задолго до первого графика.",
    body_en: "Before building any dashboard we run a short KPI design phase: which decisions will this report support, who owns each metric, what is the target and what action follows when the number turns red. This article describes our framework. This is a demo news item.",
    body_ru: "Перед созданием любого дашборда мы проводим короткий этап проектирования KPI: какие решения будет поддерживать отчёт, кто владелец каждой метрики, какова цель и какое действие следует, когда показатель «краснеет». В этой статье мы описываем наш подход. Это демонстрационная новость.",
    image: "",
  },
];
