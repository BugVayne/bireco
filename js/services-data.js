// Данные о сервисах компании. Тексты-заготовки — замените на реальные описания.
// Поле icon — встроенный SVG; tint — оттенок карточки-«фото».
// Поле full — массив блоков: { h: "заголовок" } или { p: "абзац" } (рендерится
// в js/main.js и build.py). Допускается и обычная строка (один абзац).

window.SERVICES = [
  {
    id: "management-reporting",
    tint: "#1d4ed8",
    img: "../images/services/management-reporting.jpg",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21h18"/><rect x="5" y="10" width="3.4" height="8" rx="0.6"/><rect x="10.3" y="6" width="3.4" height="12" rx="0.6"/><rect x="15.6" y="13" width="3.4" height="5" rx="0.6"/><path d="M5 6.5l5-3 5 2.5 4.5-2.5"/></svg>',
    title: { en: "Management Reporting", ru: "Управленческая отчётность" },
    short: {
      en: "Effective management starts with accurate, timely information — a comprehensive view of financial performance for executives.",
      ru: "Эффективное управление начинается с точной и своевременной информации — полный обзор финансовых показателей для руководителей.",
    },
    full: {
      en: [
        { p: "Our Management Reporting solution provides executives with a comprehensive overview of financial performance through standardized dashboards, KPI monitoring, budget variance analysis, profitability reporting and cash flow visibility." },
        { h: "Typical reports include" },
        { list: ["Executive Dashboard", "Profit & Loss Analysis", "Budget vs Actual", "Cash Flow Reporting", "Working Capital Analysis", "Financial KPI Dashboard", "Department Performance"] },
        { h: "Ideal for" },
        { list: ["CEOs", "CFOs", "Finance Managers", "Boards of Directors"] },
      ],
      ru: [
        { p: "Наше решение для управленческой отчётности даёт руководителям полный обзор финансовых показателей через стандартизированные панели, мониторинг KPI, анализ отклонений бюджета, отчёты о прибыльности и видимость денежного потока." },
        { h: "Типичные отчёты" },
        { list: ["Панель руководителя", "Анализ прибыли и убытков", "Бюджет против факта", "Отчёт о денежном потоке", "Анализ оборотного капитала", "Панель финансовых KPI", "Эффективность отделов"] },
        { h: "Идеально для" },
        { list: ["Генеральных директоров", "Финансовых директоров", "Финансовых менеджеров", "Советов директоров"] },
      ],
    },
  },
  {
    id: "sales-reporting",
    tint: "#0e7490",
    img: "../images/services/sales-reporting.jpg",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 17l5.2-5.2 3.6 3.6L21 7"/><path d="M15.5 7H21v5.5"/></svg>',
    title: { en: "Sales Reporting", ru: "Отчётность по продажам" },
    short: {
      en: "Understand what drives revenue and where the opportunities are — visibility across pipeline, customers and products.",
      ru: "Понимайте, что влияет на доход и где есть возможности — обзор воронки, клиентов и продуктов.",
    },
    full: {
      en: [
        { p: "Our Sales Reporting module provides visibility across the sales pipeline, customer performance, product profitability and sales team effectiveness." },
        { h: "Typical reports include" },
        { list: ["Revenue Analysis", "Sales Pipeline", "Customer Segmentation", "Product Performance", "Regional Sales", "Sales Forecasting", "Win/Loss Analysis"] },
      ],
      ru: [
        { p: "Наш модуль отчётности по продажам обеспечивает видимость всей воронки продаж, эффективности клиентов, прибыльности продуктов и работы команды продаж." },
        { h: "Типичные отчёты" },
        { list: ["Анализ дохода", "Воронка продаж", "Сегментация клиентов", "Эффективность продуктов", "Продажи по регионам", "Прогноз продаж", "Анализ побед и поражений"] },
      ],
    },
  },
  {
    id: "marketing-reporting",
    tint: "#7c3aed",
    img: "../images/services/marketing-reporting.jpg",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg>',
    title: { en: "Marketing Reporting", ru: "Маркетинговая отчётность" },
    short: {
      en: "Marketing decisions based on measurable outcomes — campaign effectiveness, acquisition, conversion and ROI.",
      ru: "Маркетинговые решения на основе измеримых результатов — эффективность кампаний, привлечение, конверсия и ROI.",
    },
    full: {
      en: [
        { p: "We consolidate marketing data into executive dashboards that monitor campaign effectiveness, customer acquisition, conversion rates and return on marketing investment." },
        { h: "Typical reports include" },
        { list: ["Campaign Performance", "Lead Generation", "Customer Acquisition Cost", "Conversion Funnel", "Marketing ROI", "Channel Performance"] },
      ],
      ru: [
        { p: "Мы собираем маркетинговые данные в управленческие панели, которые отслеживают эффективность кампаний, привлечение клиентов, коэффициенты конверсии и возврат инвестиций в маркетинг." },
        { h: "Типичные отчёты" },
        { list: ["Эффективность кампаний", "Генерация лидов", "Стоимость привлечения клиента", "Воронка конверсии", "ROI маркетинга", "Эффективность каналов"] },
      ],
    },
  },
  {
    id: "production-reporting",
    tint: "#b45309",
    img: "../images/services/production-reporting.jpg",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9"/></svg>',
    title: { en: "Production Reporting", ru: "Производственная отчётность" },
    short: {
      en: "Monitor production with meaningful operational KPIs — productivity, quality, downtime, capacity and cost.",
      ru: "Следите за производством через значимые операционные KPI — продуктивность, качество, простои, мощности и себестоимость.",
    },
    full: {
      en: [
        { p: "We help manufacturing businesses measure productivity, quality, downtime, capacity utilization and production costs using meaningful operational KPIs." },
        { h: "Typical reports include" },
        { list: ["Production Output", "OEE Indicators", "Downtime Analysis", "Quality Metrics", "Capacity Utilization", "Cost per Unit", "Waste Analysis"] },
      ],
      ru: [
        { p: "Мы помогаем производственным компаниям измерять продуктивность, качество, простои, использование мощностей и производственные расходы с помощью значимых операционных KPI." },
        { h: "Типичные отчёты" },
        { list: ["Выпуск продукции", "Показатели OEE", "Анализ простоев", "Метрики качества", "Использование мощностей", "Себестоимость единицы", "Анализ потерь"] },
      ],
    },
  },
  {
    id: "supply-chain-reporting",
    tint: "#047857",
    img: "../images/services/supply-chain-reporting.jpg",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="8.5" width="11" height="8" rx="1"/><path d="M13.5 11h4l3 3v2.5h-7z"/><circle cx="7" cy="18.5" r="1.7"/><circle cx="17" cy="18.5" r="1.7"/></svg>',
    title: { en: "Supply Chain Reporting", ru: "Отчётность по цепочкам поставок" },
    short: {
      en: "Complete visibility across your supply chain — procurement, inventory, suppliers and logistics.",
      ru: "Полная видимость цепочки поставок — закупки, запасы, поставщики и логистика.",
    },
    full: {
      en: [
        { p: "Our reporting solutions monitor procurement, inventory, supplier performance, logistics and operational efficiency to support better planning and cost control." },
        { h: "Typical reports include" },
        { list: ["Inventory Analysis", "Supplier Performance", "Delivery Reliability", "Procurement Dashboard", "Logistics KPIs", "Stock Turnover"] },
      ],
      ru: [
        { p: "Наши решения для отчётности отслеживают закупки, запасы, эффективность поставщиков, логистику и операционную эффективность для лучшего планирования и контроля расходов." },
        { h: "Типичные отчёты" },
        { list: ["Анализ запасов", "Эффективность поставщиков", "Надёжность поставок", "Панель закупок", "KPI по логистике", "Оборот запасов"] },
      ],
    },
  },
  {
    id: "security-it-reporting",
    tint: "#334155",
    img: "../images/services/security-it-reporting.jpg",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7.5 3v5.2c0 4.6-3.1 8-7.5 9.8-4.4-1.8-7.5-5.2-7.5-9.8V6z"/><path d="M9 12.2l2.1 2.1L15.3 10"/></svg>',
    title: { en: "IT & Cybersecurity Reporting", ru: "Отчётность по ИТ и кибербезопасности" },
    short: {
      en: "Timely insight into system performance, cybersecurity posture and IT service quality.",
      ru: "Своевременная информация о работе систем, состоянии кибербезопасности и качестве ИТ-услуг.",
    },
    full: {
      en: [
        { p: "Technology leaders require timely information about system performance, cybersecurity posture and IT service quality. Our reporting solutions consolidate technical data into executive dashboards suitable for both operational teams and senior management." },
        { h: "Typical reports include" },
        { list: ["Security Incident Dashboard", "Vulnerability Status", "Patch Compliance", "IT Service Performance", "Infrastructure Availability", "Security KPIs", "Executive Cyber Risk Dashboard"] },
      ],
      ru: [
        { p: "Руководителям в сфере технологий нужна своевременная информация о работе систем, состоянии кибербезопасности и качестве ИТ-услуг. Наши решения собирают технические данные в панели, подходящие как для операционных команд, так и для топ-менеджмента." },
        { h: "Типичные отчёты" },
        { list: ["Панель инцидентов безопасности", "Статус уязвимостей", "Соответствие патчам", "Производительность ИТ-услуг", "Доступность инфраструктуры", "KPI по безопасности", "Панель киберрисков для руководства"] },
      ],
    },
  },
  {
    id: "risk-management-reporting",
    tint: "#be123c",
    img: "../images/services/risk-management-reporting.jpg",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4l9 16H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.2" r="0.4" fill="currentColor"/></svg>',
    title: { en: "Risk Management Reporting", ru: "Отчётность по управлению рисками" },
    short: {
      en: "Identify, monitor and manage strategic, financial, operational and compliance risks.",
      ru: "Выявляйте, отслеживайте и управляйте стратегическими, финансовыми, операционными и комплаенс-рисками.",
    },
    full: {
      en: [
        { p: "Risk reporting enables organizations to identify, monitor and manage strategic, financial, operational and compliance risks. We help build structured risk dashboards that support informed governance and proactive decision-making." },
        { h: "Typical reports include" },
        { list: ["Enterprise Risk Dashboard", "Risk Heat Maps", "Key Risk Indicators (KRIs)", "Compliance Monitoring", "Audit Tracking", "Risk Trend Analysis"] },
      ],
      ru: [
        { p: "Отчётность по рискам позволяет организациям выявлять, отслеживать и управлять стратегическими, финансовыми, операционными и комплаенс-рисками. Мы помогаем создавать структурированные панели рисков, которые поддерживают информированное управление и проактивные решения." },
        { h: "Типичные отчёты" },
        { list: ["Панель корпоративных рисков", "Карты тепловых рисков", "Ключевые индикаторы риска (KRI)", "Мониторинг комплаенса", "Отслеживание аудита", "Анализ тенденций рисков"] },
      ],
    },
  },
];

// Новости из документа заказчика. Даты — по понедельникам, от свежих к старым.
// На «живом» сайте новости берутся из Google Таблицы (admin.html); этот массив —
// резерв, который показывается, только если бэкенд недоступен (см. README).
window.SAMPLE_NEWS = [
  {
    id: "real-time-management-reporting",
    date: "2026-06-22",
    title_en: "Why Real-Time Management Reporting Has Become a Business Priority",
    title_ru: "Почему отчётность для руководства в реальном времени стала приоритетом",
    summary_en: "Why leaders are moving beyond month-end reports toward real-time dashboards.",
    summary_ru: "Почему руководители уходят от отчётов в конце месяца к дашбордам в реальном времени.",
    body_en: "In today's rapidly changing business environment, executives can no longer rely solely on month-end reports. Organizations are increasingly investing in real-time management reporting to improve decision-making, monitor financial performance, and respond quickly to market changes.\n\nModern Business Intelligence platforms allow companies to combine financial and operational data into executive dashboards, giving leaders immediate visibility into key performance indicators and emerging risks.",
    body_ru: "В сегодняшней быстро меняющейся деловой среде руководители больше не могут полагаться только на отчёты в конце месяца. Организации всё чаще инвестируют в отчётность в реальном времени, чтобы улучшить принятие решений, следить за финансовыми показателями и быстро реагировать на изменения рынка.\n\nСовременные платформы бизнес-аналитики позволяют объединять финансовые и операционные данные в панели для руководителей, давая мгновенный доступ к ключевым показателям и возникающим рискам.",
    image: "",
  },
  {
    id: "five-kpis-every-ceo",
    date: "2026-06-15",
    title_en: "Five KPIs Every CEO Should Monitor Every Week",
    title_ru: "Пять ключевых показателей, за которыми CEO должен следить каждую неделю",
    summary_en: "Hundreds of metrics, but only a handful drive strategy — here are five.",
    summary_ru: "Сотни метрик, но стратегию определяют лишь несколько — вот пять.",
    body_en: "Many organizations collect hundreds of performance indicators, but only a few truly drive strategic decisions.\n\nBusiness leaders should consistently monitor: Revenue Growth, Gross Margin, Operating Cash Flow, Customer Acquisition Cost and Working Capital.\n\nRegular monitoring of these KPIs enables faster responses to business challenges and supports sustainable growth.",
    body_ru: "Многие компании собирают сотни показателей, но только некоторые действительно влияют на стратегические решения.\n\nРуководителям стоит постоянно отслеживать: рост выручки, валовую маржу, операционный денежный поток, стоимость привлечения клиента и оборотный капитал.\n\nРегулярное отслеживание этих показателей позволяет быстрее реагировать на бизнес-проблемы и поддерживать устойчивый рост.",
    image: "",
  },
  {
    id: "data-into-decisions",
    date: "2026-06-08",
    title_en: "Data Is No Longer the Challenge — Turning It into Decisions Is",
    title_ru: "Данные уже не проблема — сложнее превратить их в решения",
    summary_en: "Most companies have the data — the advantage is turning it into decisions.",
    summary_ru: "Данные есть почти у всех — преимущество в том, чтобы превратить их в решения.",
    body_en: "Most companies already possess significant volumes of operational and financial data. The real challenge lies in converting that information into meaningful insights.\n\nBusiness Intelligence solutions bridge this gap by integrating data from multiple systems, automating reporting processes, and presenting decision-makers with clear, actionable information.\n\nOrganizations that successfully transform data into business intelligence gain a significant competitive advantage.",
    body_ru: "Большинство компаний уже имеют значительные объёмы операционных и финансовых данных. Настоящая сложность — превратить эту информацию в полезные инсайты.\n\nРешения бизнес-аналитики помогают преодолеть этот разрыв, объединяя данные из разных систем, автоматизируя отчётность и предоставляя руководителям чёткую и применимую информацию.\n\nКомпании, которые успешно превращают данные в бизнес-аналитику, получают значительное конкурентное преимущество.",
    image: "",
  },
  {
    id: "cfos-digital-transformation",
    date: "2026-06-01",
    title_en: "The Growing Role of CFOs in Digital Transformation",
    title_ru: "Растущая роль финансовых директоров в цифровой трансформации",
    summary_en: "The CFO's mandate now stretches well beyond financial reporting.",
    summary_ru: "Мандат финансового директора давно вышел за рамки отчётности.",
    body_en: "The role of the Chief Financial Officer continues to evolve beyond financial reporting.\n\nToday's CFOs are increasingly responsible for business analytics, strategic planning, performance management and digital transformation initiatives.\n\nAs organizations seek greater transparency and efficiency, finance teams are becoming central to the implementation of Business Intelligence and data-driven decision-making.",
    body_ru: "Роль финансового директора продолжает развиваться и выходит за рамки финансовой отчётности.\n\nСегодня CFO всё чаще отвечают за бизнес-аналитику, стратегическое планирование, управление эффективностью и инициативы цифровой трансформации.\n\nПо мере стремления к прозрачности и эффективности финансовые команды становятся ключевыми в реализации бизнес-аналитики и решений на основе данных.",
    image: "",
  },
  {
    id: "supply-chain-visibility",
    date: "2026-05-25",
    title_en: "Supply Chain Visibility Continues to Drive Operational Resilience",
    title_ru: "Прозрачность цепочек поставок продолжает повышать устойчивость операций",
    summary_en: "Transparency across the supply chain is now a resilience strategy.",
    summary_ru: "Прозрачность цепочки поставок стала стратегией устойчивости.",
    body_en: "Recent market disruptions have highlighted the importance of supply chain transparency.\n\nOrganizations with real-time reporting capabilities are better equipped to monitor inventory levels, supplier performance, logistics efficiency and procurement costs.\n\nIntegrated reporting enables businesses to identify risks earlier and make proactive operational decisions.",
    body_ru: "Недавние рыночные потрясения показали, насколько важна прозрачность цепочек поставок.\n\nОрганизации с отчётностью в реальном времени лучше отслеживают уровень запасов, работу поставщиков, эффективность логистики и затраты на закупки.\n\nИнтегрированная отчётность позволяет раньше выявлять риски и принимать проактивные операционные решения.",
    image: "",
  },
  {
    id: "smes-business-intelligence",
    date: "2026-05-18",
    title_en: "Why SMEs Are Investing More in Business Intelligence",
    title_ru: "Почему малый и средний бизнес всё больше инвестирует в бизнес-аналитику",
    summary_en: "BI is no longer just for large enterprises — SMEs are catching up fast.",
    summary_ru: "BI уже не только для крупных компаний — малый и средний бизнес догоняет.",
    body_en: "Business Intelligence is no longer reserved for large enterprises.\n\nSmall and medium-sized businesses are increasingly adopting reporting solutions to improve profitability, optimize operations and strengthen strategic planning.\n\nCloud technologies and modular reporting solutions have made advanced analytics more accessible than ever before.",
    body_ru: "Бизнес-аналитика давно перестала быть прерогативой крупных компаний.\n\nМалые и средние предприятия всё чаще используют решения для отчётности, чтобы повысить прибыльность, оптимизировать операции и укрепить стратегическое планирование.\n\nОблачные технологии и модульные решения сделали продвинутую аналитику доступнее, чем когда-либо.",
    image: "",
  },
  {
    id: "executive-dashboards-strategic-asset",
    date: "2026-05-11",
    title_en: "Executive Dashboards: From Reporting Tool to Strategic Asset",
    title_ru: "Исполнительные панели: от инструмента отчётности к стратегическому активу",
    summary_en: "Dashboards have grown from static reports into core management systems.",
    summary_ru: "Дашборды выросли из статичных отчётов в ключевые управленческие системы.",
    body_en: "Executive dashboards have evolved from static reporting tools into essential management systems.\n\nModern dashboards provide leaders with instant visibility into financial performance, sales, operations and business risks, allowing organizations to make informed decisions based on reliable, up-to-date information.",
    body_ru: "Исполнительные панели эволюционировали от статичных инструментов отчётности в важные управленческие системы.\n\nСовременные панели дают руководителям мгновенный доступ к информации о финансах, продажах, операциях и бизнес-рисках, позволяя принимать обоснованные решения на основе надёжной и актуальной информации.",
    image: "",
  },
  {
    id: "risk-management-advantage",
    date: "2026-05-04",
    title_en: "Risk Management Reporting Is Becoming a Competitive Advantage",
    title_ru: "Отчётность по управлению рисками становится конкурентным преимуществом",
    summary_en: "Proactive risk reporting is turning into a real competitive edge.",
    summary_ru: "Проактивная отчётность по рискам превращается в конкурентное преимущество.",
    body_en: "Organizations are placing greater emphasis on proactive risk management.\n\nBy integrating financial, operational, cybersecurity and compliance data into unified dashboards, companies gain a clearer understanding of enterprise-wide risks and can respond more effectively to changing business conditions.",
    body_ru: "Организации всё больше уделяют внимание проактивному управлению рисками.\n\nИнтегрируя финансовые, операционные, кибербезопасные и комплаенс-данные в единые панели, компании получают более ясное понимание рисков на уровне всего предприятия и эффективнее реагируют на меняющиеся условия.",
    image: "",
  },
  {
    id: "ai-business-analytics",
    date: "2026-04-27",
    title_en: "Artificial Intelligence Is Transforming Business Analytics",
    title_ru: "Искусственный интеллект меняет бизнес-аналитику",
    summary_en: "AI doesn't replace reporting — it sharpens trends, anomalies and forecasts.",
    summary_ru: "ИИ не заменяет отчётность — он усиливает тренды, аномалии и прогнозы.",
    body_en: "Artificial Intelligence is increasingly supporting Business Intelligence by identifying trends, detecting anomalies and improving forecasting accuracy.\n\nRather than replacing management reporting, AI enhances analytical capabilities, allowing executives to focus on strategic decision-making while routine analysis becomes increasingly automated.",
    body_ru: "Искусственный интеллект всё больше помогает бизнес-аналитике, выявляя тенденции, обнаруживая аномалии и повышая точность прогнозирования.\n\nИИ не заменяет отчётность для руководства, а улучшает аналитические возможности, позволяя сосредоточиться на стратегических решениях, пока рутинный анализ автоматизируется.",
    image: "",
  },
  {
    id: "data-driven-organization",
    date: "2026-04-20",
    title_en: "Building a Data-Driven Organization Starts with Better Reporting",
    title_ru: "Организация на данных начинается с улучшенной отчётности",
    summary_en: "A data-driven organization is built on a foundation of reliable reporting.",
    summary_ru: "Организация на данных строится на фундаменте надёжной отчётности.",
    body_en: "Successful digital transformation begins with reliable business reporting.\n\nOrganizations that establish standardized reporting processes create a strong foundation for advanced analytics, forecasting, automation and strategic growth.\n\nBusiness Intelligence enables leaders to move from intuition-based decisions to evidence-based management.",
    body_ru: "Успешная цифровая трансформация начинается с надёжной бизнес-отчётности.\n\nОрганизации, которые выстраивают стандартизированные процессы отчётности, создают прочную основу для продвинутой аналитики, прогнозирования, автоматизации и стратегического роста.\n\nБизнес-аналитика позволяет переходить от решений на основе интуиции к управлению на основе фактов.",
    image: "",
  },
];
