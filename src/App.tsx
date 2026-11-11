import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";

type SectionKey = "home" | "assistant" | "databases" | "servers" | "monitoring" | "journal" | "settings";
type IconName =
  | "home"
  | "bot"
  | "database"
  | "server"
  | "activity"
  | "list"
  | "settings"
  | "cpu"
  | "memory"
  | "disk"
  | "check"
  | "warning"
  | "arrow"
  | "plus"
  | "chevron"
  | "clock"
  | "spark"
  | "send"
  | "shield"
  | "search"
  | "refresh"
  | "file"
  | "terminal"
  | "filter"
  | "serverStack"
  | "close"
  | "menu";
type RangeKey = "1ч" | "24ч" | "7д";
type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  time: string;
  report?: boolean;
  error?: boolean;
};

const iconShapes: Record<IconName, ReactNode> = {
  home: <><path d="m3 10.5 9-7 9 7" /><path d="M5.5 9v11.5h13V9M9.5 20.5v-7h5v7" /></>,
  bot: <><path d="M12 3v3" /><rect x="3.5" y="7" width="17" height="13.5" rx="4" /><path d="M8 13h.01M16 13h.01M9 17h6M8 3h8" /></>,
  database: <><ellipse cx="12" cy="5" rx="8.5" ry="3" /><path d="M3.5 5v7c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3V5M3.5 12v7c0 1.7 3.8 3 8.5 3s8.5-1.3 8.5-3v-7" /></>,
  server: <><rect x="3" y="3.5" width="18" height="7" rx="2" /><rect x="3" y="13.5" width="18" height="7" rx="2" /><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" /></>,
  activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6h.01M4 12h.01M4 18h.01" /></>,
  settings: <><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3H3.8a1.8 1.8 0 0 1 0-3.6H4a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 0 1 3.6 0V2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" transform="translate(0 2) scale(.83) translate(2.4 -2.4)" /></>,
  cpu: <><rect x="5" y="5" width="14" height="14" rx="3" /><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" /><path d="M9 9h6v6H9z" /></>,
  memory: <><path d="M5 6.5h14v11H5z" /><path d="M8 3v3.5m4-3.5v3.5m4-3.5v3.5M8 17.5V21m4-3.5V21m4-3.5V21M2 9h3m-3 6h3m14-6h3m-3 6h3" /><path d="M8.5 10h7v4h-7z" /></>,
  disk: <><ellipse cx="12" cy="6" rx="8.5" ry="3.2" /><path d="M3.5 6v12c0 1.8 3.8 3.2 8.5 3.2s8.5-1.4 8.5-3.2V6" /><path d="M3.5 12c0 1.8 3.8 3.2 8.5 3.2s8.5-1.4 8.5-3.2" /></>,
  check: <><path d="m5 12 4.4 4.4L19.5 6.5" /></>,
  warning: <><path d="m12 3 9 16H3l9-16Z" /><path d="M12 9v4m0 3h.01" /></>,
  arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
  plus: <><path d="M12 5v14m-7-7h14" /></>,
  chevron: <><path d="m9 18 6-6-6-6" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>,
  send: <><path d="m21 3-7.5 18-3.7-7.8L2 9.5 21 3Z" /><path d="M9.8 13.2 21 3" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0 1 11.7-2L20 12M4 12l2.8 5a7 7 0 0 0 11.7-2" /></>,
  file: <><path d="M6 3.5h8l4 4v13H6z" /><path d="M14 3.5v4h4M9 12h6m-6 4h6" /></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="m7 9 3 3-3 3m6 0h4" /></>,
  filter: <><path d="M4 6h16M7 12h10m-7 6h4" /><circle cx="8" cy="6" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="11" cy="18" r="1.5" /></>,
  serverStack: <><rect x="4" y="3" width="16" height="7" rx="2" /><rect x="4" y="14" width="16" height="7" rx="2" /><path d="M8 6.5h.01M8 17.5h.01M12 6.5h4M12 17.5h4" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
};

function Icon({ name, size = 18, strokeWidth = 1.7 }: { name: IconName; size?: number; strokeWidth?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconShapes[name]}
    </svg>
  );
}

const navItems: { id: SectionKey; label: string; icon: IconName }[] = [
  { id: "home", label: "Главная", icon: "home" },
  { id: "assistant", label: "ИИ-администратор", icon: "bot" },
  { id: "databases", label: "Базы данных", icon: "database" },
  { id: "servers", label: "Серверы", icon: "server" },
  { id: "monitoring", label: "Мониторинг", icon: "activity" },
  { id: "journal", label: "Журнал операций", icon: "list" },
  { id: "settings", label: "Настройки", icon: "settings" },
];

const databases = [
  { id: "erp-main", name: "ERP_Main", description: "Основная база 1С", size: "184,2 ГБ", sizeValue: 184.2, state: "В работе", updated: "2 мин назад" },
  { id: "erp-archive", name: "ERP_Archive", description: "Архив операций", size: "76,8 ГБ", sizeValue: 76.8, state: "В работе", updated: "18 мин назад" },
  { id: "hr-prod", name: "HR_Prod", description: "Кадровый контур", size: "24,6 ГБ", sizeValue: 24.6, state: "В работе", updated: "1 ч назад" },
];

const disks = [
  { name: "C:", label: "Система", used: 72, detail: "184 / 256 ГБ" },
  { name: "D:", label: "Данные", used: 60, detail: "612 / 1 024 ГБ" },
  { name: "E:", label: "Архив", used: 62, detail: "318 / 512 ГБ" },
];

const serverNodes = [
  { id: "sql", name: "SQL Server", host: "SRV-SQL-DEMO", role: "Сервер баз данных", version: "SQL Server 2022", cpu: "34%", memory: "68%", uptime: "18 д 06 ч" },
  { id: "app", name: "1С:Предприятие", host: "SRV-APP-DEMO", role: "Сервер приложений", version: "Платформа 8.3.24", cpu: "22%", memory: "54%", uptime: "12 д 19 ч" },
];

const initialMessages: Message[] = [
  {
    id: 1,
    role: "user",
    text: "Покажи, сколько места занимают базы данных SQL Server и сколько свободного места осталось на дисках",
    time: "10:42",
  },
  {
    id: 2,
    role: "assistant",
    text: "Собрал сводку по базам и томам. Ниже — демонстрационный отчёт; к серверу данные не запрашивались.",
    time: "10:42",
    report: true,
  },
];

const journalEvents = [
  { id: 1, time: "10:42:18", category: "ai", icon: "bot" as IconName, title: "Сформирован отчёт по хранилищу", detail: "Запрос пользователя · SQL Server и свободное место на дисках", state: "Демо-ответ" },
  { id: 2, time: "10:37:04", category: "system", icon: "refresh" as IconName, title: "Обновлены показатели мониторинга", detail: "Сводка CPU, RAM и дисковых томов", state: "Симуляция" },
  { id: 3, time: "10:21:51", category: "system", icon: "database" as IconName, title: "Проверено состояние баз данных", detail: "3 базы · тестовый набор показателей", state: "Успешно" },
  { id: 4, time: "09:58:33", category: "ai", icon: "spark" as IconName, title: "Создана рекомендация по архиву", detail: "Архивирование старых журналов транзакций", state: "Предложение" },
  { id: 5, time: "09:44:09", category: "system", icon: "server" as IconName, title: "Проверена доступность узлов", detail: "SQL Server и сервер 1С · локальная симуляция", state: "Успешно" },
];

const rangeSeries: Record<RangeKey, { cpu: number[]; memory: number[]; labels: string[] }> = {
  "1ч": {
    cpu: [22, 25, 23, 29, 27, 34, 31, 37, 33, 39, 36, 31, 34, 30, 35, 32, 38, 34, 36, 34],
    memory: [54, 54, 55, 55, 55, 56, 56, 57, 58, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68, 68],
    labels: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50", "11:00"],
  },
  "24ч": {
    cpu: [17, 19, 20, 18, 26, 31, 34, 37, 30, 26, 32, 40, 36, 32, 28, 34, 43, 39, 35, 30],
    memory: [52, 52, 53, 53, 54, 55, 57, 60, 62, 61, 62, 63, 64, 65, 66, 67, 67, 68, 68, 68],
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Сейчас"],
  },
  "7д": {
    cpu: [21, 23, 18, 29, 25, 35, 32, 28, 40, 36, 30, 33, 29, 38, 43, 37, 31, 35, 32, 34],
    memory: [48, 49, 50, 52, 54, 55, 57, 56, 58, 59, 61, 62, 64, 63, 65, 66, 67, 67, 68, 68],
    labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
  },
};

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "numeric", month: "short" }).format(date).replace(" г.", "");
}

function BrandMark() {
  return (
    <div className="brand-lockup" aria-label="AI Server Admin">
      <div className="brand-mark">
        <svg viewBox="0 0 38 38" fill="none" aria-hidden="true">
          <path d="M8.5 27.5 18.8 8l10.7 19.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.7 20.5h12.1M6 31h26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".62" />
          <circle cx="19" cy="8" r="2.2" fill="currentColor" />
        </svg>
      </div>
      <div className="brand-type">
        <strong>AI SERVER</strong>
        <span>ADMIN</span>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  brand = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  action?: ReactNode;
  brand?: boolean;
}) {
  return (
    <div className={`page-heading ${brand ? "page-heading-brand" : ""}`}>
      <div className="page-heading-copy">
        <div className="eyebrow"><span className="eyebrow-mark" />{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="page-heading-actions">{action}</div> : null}
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      <span className="demo-banner-icon"><Icon name="shield" size={16} /></span>
      <span><strong>Демонстрационный режим.</strong> Показатели симулированы и не получены с реального сервера.</span>
      <span className="demo-banner-label">DEMO DATA</span>
    </div>
  );
}

function MiniSpark({ color = "#8fd4c3", variant = 0 }: { color?: string; variant?: number }) {
  const lines = [
    "2,23 12,20 22,21 32,12 42,15 52,8 62,11 72,4",
    "2,20 12,17 22,21 32,18 42,9 52,13 62,7 72,4",
    "2,22 12,13 22,17 32,7 42,14 52,11 62,4 72,8",
  ];
  return (
    <svg className="mini-spark" viewBox="0 0 74 28" aria-hidden="true">
      <polyline points={lines[variant % lines.length]} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ServiceCard({
  kind,
  name,
  subline,
  version,
  host,
  onClick,
}: {
  kind: "sql" | "oneC";
  name: string;
  subline: string;
  version: string;
  host: string;
  onClick: () => void;
}) {
  return (
    <button className="service-card panel interactive-panel" onClick={onClick} type="button">
      <div className={`service-symbol ${kind}`}>
        {kind === "sql" ? <Icon name="database" size={22} /> : <span>1C</span>}
      </div>
      <div className="service-main">
        <div className="service-topline">
          <span className="service-type">{subline}</span>
          <span className="status-label"><i className="status-dot" />В работе</span>
        </div>
        <div className="service-name">{name}</div>
        <div className="service-meta"><span>{version}</span><span className="meta-separator" />{host}</div>
      </div>
      <div className="service-trend">
        <MiniSpark variant={kind === "sql" ? 0 : 1} />
        <span>ДЕМО-УЗЕЛ</span>
      </div>
      <span className="service-arrow"><Icon name="arrow" size={16} /></span>
    </button>
  );
}

function UsageProgress({ value, tone = "mint" }: { value: number; tone?: "mint" | "blue" | "amber" }) {
  return (
    <div className={`usage-track ${tone}`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  unit,
  detail,
  progress,
  variant,
  onClick,
}: {
  icon: IconName;
  label: string;
  value: string;
  unit: string;
  detail: string;
  progress: number;
  variant: number;
  onClick: () => void;
}) {
  return (
    <button className="metric-card panel interactive-panel" onClick={onClick} type="button">
      <div className="metric-header">
        <div className="metric-icon"><Icon name={icon} size={17} /></div>
        <div className="metric-label">{label}<span>на текущем узле</span></div>
        <MiniSpark variant={variant} color={variant === 1 ? "#89bce7" : "#8fd4c3"} />
      </div>
      <div className="metric-value-row"><strong>{value}<small>{unit}</small></strong><span className="metric-detail">{detail}</span></div>
      <UsageProgress value={progress} tone={variant === 1 ? "blue" : "mint"} />
    </button>
  );
}

function DiskCard({ onClick }: { onClick: () => void }) {
  return (
    <button className="disk-card panel interactive-panel" onClick={onClick} type="button">
      <div className="disk-card-heading">
        <div className="metric-icon"><Icon name="disk" size={17} /></div>
        <div className="metric-label">Использование дисков<span>3 демонстрационных тома</span></div>
        <Icon name="arrow" size={15} />
      </div>
      <div className="disk-volume-list">
        {disks.map((disk) => (
          <div className="disk-volume" key={disk.name}>
            <div className="disk-volume-label"><strong>{disk.name}</strong><span>{disk.label}</span><small>{disk.detail}</small></div>
            <div className="disk-volume-progress"><UsageProgress value={disk.used} tone={disk.used > 70 ? "amber" : "blue"} /><span>{disk.used}%</span></div>
          </div>
        ))}
      </div>
    </button>
  );
}

function RangeSelector({ value, onChange }: { value: RangeKey; onChange: (value: RangeKey) => void }) {
  return (
    <div className="range-selector" role="group" aria-label="Период графика">
      {(["1ч", "24ч", "7д"] as RangeKey[]).map((range) => (
        <button className={value === range ? "selected" : ""} onClick={() => onChange(range)} key={range} type="button">
          {range}
        </button>
      ))}
    </div>
  );
}

function makeLine(values: number[]) {
  return values.map((value, index) => {
    const x = 34 + (index / (values.length - 1)) * 572;
    const y = 166 - (value / 100) * 128;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function makeArea(values: number[]) {
  return `${makeLine(values)} L606 168 L34 168 Z`;
}

function ActivityChart({ range, large = false }: { range: RangeKey; large?: boolean }) {
  const series = rangeSeries[range];
  return (
    <div className={`chart-wrap ${large ? "chart-wrap-large" : ""}`}>
      <div className="chart-axis-labels" aria-hidden="true"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div>
      <svg className="activity-chart" viewBox="0 0 640 190" preserveAspectRatio="none" role="img" aria-label={`Демонстрационный график нагрузки за ${range}`}>
        <defs>
          <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#85d5c2" stopOpacity=".16" /><stop offset="100%" stopColor="#85d5c2" stopOpacity="0" /></linearGradient>
          <linearGradient id="memoryFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8db8e6" stopOpacity=".09" /><stop offset="100%" stopColor="#8db8e6" stopOpacity="0" /></linearGradient>
        </defs>
        {[38, 70, 102, 134, 166].map((y) => <line key={y} x1="34" y1={y} x2="606" y2={y} className="chart-gridline" />)}
        <path d={makeArea(series.memory)} fill="url(#memoryFill)" />
        <path d={makeArea(series.cpu)} fill="url(#cpuFill)" />
        <path d={makeLine(series.memory)} className="chart-line chart-line-memory" />
        <path d={makeLine(series.cpu)} className="chart-line chart-line-cpu" />
      </svg>
      <div className="chart-x-labels" aria-hidden="true">
        {series.labels.map((label) => <span key={label}>{label}</span>)}
      </div>
    </div>
  );
}

function DatabaseOverview({ onSelect, onAll }: { onSelect: (id: string) => void; onAll: () => void }) {
  return (
    <section className="panel data-panel">
      <div className="panel-heading">
        <div><div className="panel-kicker">SQL SERVER · ДЕМО-ДАННЫЕ</div><h2>Базы данных</h2></div>
        <button className="text-action" type="button" onClick={onAll}>Все базы <Icon name="arrow" size={15} /></button>
      </div>
      <div className="database-overview-list">
        <div className="overview-list-labels"><span>ИМЯ И НАЗНАЧЕНИЕ</span><span>ОБЪЁМ</span><span>СТАТУС</span></div>
        {databases.map((db) => (
          <button className="overview-db-row" key={db.id} type="button" onClick={() => onSelect(db.id)}>
            <span className="db-name-cell"><span className="db-mini-icon"><Icon name="database" size={15} /></span><span><strong>{db.name}</strong><small>{db.description}</small></span></span>
            <strong className="db-size">{db.size}</strong>
            <span className="db-state"><i className="status-dot" />Активна</span>
          </button>
        ))}
      </div>
      <div className="panel-footnote"><span className="footnote-dot" />Все значения в списке являются демонстрационными</div>
    </section>
  );
}

function LoadPanel({ range, onRangeChange }: { range: RangeKey; onRangeChange: (range: RangeKey) => void }) {
  return (
    <section className="panel load-panel">
      <div className="panel-heading">
        <div><div className="panel-kicker">ТЕСТОВАЯ ТЕЛЕМЕТРИЯ</div><h2>Нагрузка системы</h2></div>
        <RangeSelector value={range} onChange={onRangeChange} />
      </div>
      <div className="chart-legend">
        <span><i className="legend-line cpu" />CPU <strong>34%</strong></span>
        <span><i className="legend-line memory" />RAM <strong>68%</strong></span>
        <span className="legend-now"><i className="status-dot" />Сейчас</span>
      </div>
      <ActivityChart range={range} />
      <div className="chart-note"><Icon name="activity" size={14} /> История показателей построена на демо-наборе</div>
    </section>
  );
}

function RecentActivity({ onOpenJournal }: { onOpenJournal: () => void }) {
  return (
    <section className="panel recent-panel">
      <div className="panel-heading">
        <div><div className="panel-kicker">ДЕМО-СИМУЛЯЦИЯ</div><h2>Последние операции</h2></div>
        <button className="text-action" type="button" onClick={onOpenJournal}>Журнал <Icon name="arrow" size={15} /></button>
      </div>
      <div className="recent-list">
        {journalEvents.slice(0, 3).map((event) => (
          <div className="recent-item" key={event.id}>
            <span className={`recent-icon ${event.category}`}><Icon name={event.icon} size={15} /></span>
            <div className="recent-copy"><strong>{event.title}</strong><span>{event.detail}</span></div>
            <time>{event.time.slice(0, 5)}</time>
          </div>
        ))}
      </div>
    </section>
  );
}

function OverviewPage({
  setSection,
  setSelectedDatabase,
  setSelectedServer,
  range,
  setRange,
}: {
  setSection: (section: SectionKey) => void;
  setSelectedDatabase: (id: string) => void;
  setSelectedServer: (id: string) => void;
  range: RangeKey;
  setRange: (range: RangeKey) => void;
}) {
  const goToServer = (id: string) => {
    setSelectedServer(id);
    setSection("servers");
  };
  const goToDatabase = (id: string) => {
    setSelectedDatabase(id);
    setSection("databases");
  };
  return (
    <div className="page-stack page-enter">
      <SectionHeading
        brand
        eyebrow="ЦЕНТР УПРАВЛЕНИЯ · ОБЗОР"
        title={<><span>AI SERVER</span> <em>ADMIN</em></>}
        description="Интеллектуальное управление Windows Server, SQL Server и 1С."
        action={<button className="button-primary" type="button" onClick={() => setSection("assistant")}><Icon name="spark" size={17} />Спросить ИИ<Icon name="arrow" size={15} /></button>}
      />
      <DemoBanner />

      <section className="page-section">
        <div className="section-row-heading"><div><h2>Сервисы</h2><span>Состояние узлов тестового контура</span></div><span className="section-count">02 УЗЛА</span></div>
        <div className="service-grid">
          <ServiceCard kind="sql" name="SQL Server" subline="УПРАВЛЕНИЕ БАЗАМИ" version="2022 Standard" host="SRV-SQL-DEMO" onClick={() => goToServer("sql")} />
          <ServiceCard kind="oneC" name="1С:Предприятие" subline="СЕРВЕР ПРИЛОЖЕНИЙ" version="Платформа 8.3.24" host="SRV-APP-DEMO" onClick={() => goToServer("app")} />
        </div>
      </section>

      <section className="page-section">
        <div className="section-row-heading"><div><h2>Ресурсы</h2><span>Последний снимок демо-показателей</span></div><span className="live-caption"><i className="status-dot" />ОБНОВЛЕНО СЕЙЧАС</span></div>
        <div className="resource-grid">
          <MetricCard icon="cpu" label="Процессор" value="34" unit="%" detail="Нормальная нагрузка" progress={34} variant={0} onClick={() => setSection("monitoring")} />
          <MetricCard icon="memory" label="Оперативная память" value="68" unit="%" detail="20,4 из 32 ГБ" progress={68} variant={1} onClick={() => setSection("monitoring")} />
          <DiskCard onClick={() => setSection("monitoring")} />
        </div>
      </section>

      <div className="overview-bottom-grid">
        <DatabaseOverview onSelect={goToDatabase} onAll={() => setSection("databases")} />
        <LoadPanel range={range} onRangeChange={setRange} />
      </div>
      <RecentActivity onOpenJournal={() => setSection("journal")} />
    </div>
  );
}

function StorageReport() {
  return (
    <div className="report-card">
      <div className="report-heading">
        <div className="report-icon"><Icon name="database" size={17} /></div>
        <div><strong>Сводка по хранилищу</strong><span>Снимок демонстрационной среды</span></div>
        <span className="report-tag">DEMO</span>
      </div>
      <div className="report-totals">
        <div><span>Объём баз SQL</span><strong>285,6 <small>ГБ</small></strong></div>
        <div><span>Свободно на дисках</span><strong>678 <small>ГБ</small></strong></div>
      </div>
      <div className="report-details-grid">
        <div className="report-section">
          <div className="report-section-title">БАЗЫ ДАННЫХ <span>3</span></div>
          {databases.map((db) => <div className="report-data-row" key={db.id}><span><i className="report-status-dot" />{db.name}</span><strong>{db.size}</strong></div>)}
        </div>
        <div className="report-section">
          <div className="report-section-title">СВОБОДНО НА ТОМАХ <span>3</span></div>
          <div className="report-data-row"><span><b className="volume-label">C:</b>Система</span><strong>72 ГБ</strong></div>
          <div className="report-data-row"><span><b className="volume-label">D:</b>Данные</span><strong>412 ГБ</strong></div>
          <div className="report-data-row"><span><b className="volume-label">E:</b>Архив</span><strong>194 ГБ</strong></div>
        </div>
      </div>
      <div className="report-disclaimer"><Icon name="shield" size={13} /> Демонстрационный отчёт. Реальные серверы не опрашивались.</div>
    </div>
  );
}

function AssistantMessageContent({ message, onRetry }: { message: Message; onRetry: () => void }) {
  if (message.error) {
    return (
      <div className="message-error">
        <div className="error-icon"><Icon name="warning" size={18} /></div>
        <div><strong>Не удалось получить ответ</strong><p>Локальный ИИ сейчас недоступен. Это демонстрационный сценарий ошибки, сервер не затронут.</p><button type="button" className="retry-button" onClick={onRetry}><Icon name="refresh" size={14} />Повторить запрос</button></div>
      </div>
    );
  }
  return (
    <>
      <p className="assistant-text">{message.text}</p>
      {message.report ? <StorageReport /> : (
        <div className="generic-report">
          <div className="generic-report-heading"><span className="status-dot" />Результат проверки <span>ДЕМО</span></div>
          <div className="generic-report-grid"><div><span>Узлы</span><strong>2 доступны</strong></div><div><span>Состояние</span><strong>Без отклонений</strong></div><div><span>Источники</span><strong>Симуляция</strong></div></div>
          <small>Показатели условные. Подключение к реальным источникам отсутствует.</small>
        </div>
      )}
    </>
  );
}

function AssistantPage({
  messages,
  input,
  setInput,
  onSend,
  onNewChat,
  onRetry,
  loading,
}: {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  onSend: (event?: FormEvent<HTMLFormElement>) => void;
  onNewChat: () => void;
  onRetry: (message: Message) => void;
  loading: boolean;
}) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (input.trim() && !loading) onSend();
    }
  };

  const choosePrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="page-stack page-enter assistant-page">
      <SectionHeading
        eyebrow="ЛОКАЛЬНЫЙ ИИ · ДЕМО-РЕЖИМ"
        title="ИИ-администратор"
        description="Опишите задачу обычным языком. Команды и ответы здесь симулированы."
        action={<button className="button-secondary new-chat-button" type="button" onClick={onNewChat}><Icon name="plus" size={16} />Новый диалог</button>}
      />
      <div className="chat-layout">
        <section className="chat-panel panel">
          <div className="chat-panel-top">
            <div className="chat-agent">
              <div className="chat-agent-avatar"><Icon name="spark" size={19} /></div>
              <div><strong>Системный администратор</strong><span><i className="status-dot" />Локальная модель · демонстрация</span></div>
            </div>
            <span className="chat-session-label">СЕССИЯ БЕЗ ПОДКЛЮЧЕНИЯ</span>
          </div>
          <div className={`chat-transcript ${messages.length === 0 ? "chat-transcript-empty" : ""}`} ref={transcriptRef}>
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-orbit"><div className="welcome-core"><Icon name="spark" size={25} /></div><i /><b /></div>
                <span className="welcome-kicker">ВАШ ЛОКАЛЬНЫЙ ИИ-АССИСТЕНТ</span>
                <h2>С чего начнём?</h2>
                <p>Задайте вопрос об инфраструктуре или выберите пример. Сейчас ответы формируются на тестовых данных.</p>
                <div className="prompt-suggestions">
                  <button type="button" onClick={() => choosePrompt("Покажи базы данных и их размер")}>Сколько занимают базы данных?<Icon name="arrow" size={14} /></button>
                  <button type="button" onClick={() => choosePrompt("Проверь состояние серверов")}>Проверь состояние серверов<Icon name="arrow" size={14} /></button>
                  <button type="button" onClick={() => choosePrompt("Покажи ошибку подключения ИИ")}>Показать сценарий ошибки<Icon name="warning" size={14} /></button>
                </div>
              </div>
            ) : (
              <div className="message-list">
                {messages.map((message) => (
                  <div className={`message-row ${message.role}`} key={message.id}>
                    <div className={`message-avatar ${message.role}`}>{message.role === "assistant" ? <Icon name="spark" size={16} /> : <span>ВЫ</span>}</div>
                    <div className="message-content">
                      <div className="message-meta"><strong>{message.role === "assistant" ? "ИИ-администратор" : "Вы"}</strong><time>{message.time}</time>{message.role === "assistant" ? <span className="message-demo-tag">ДЕМО</span> : null}</div>
                      <div className={`message-bubble ${message.role === "assistant" ? "assistant-bubble" : "user-bubble"}`}>
                        {message.role === "assistant" ? <AssistantMessageContent message={message} onRetry={() => onRetry(message)} /> : <p>{message.text}</p>}
                      </div>
                    </div>
                  </div>
                ))}
                {loading ? (
                  <div className="message-row assistant loading-row">
                    <div className="message-avatar assistant"><Icon name="spark" size={16} /></div>
                    <div className="message-content"><div className="message-meta"><strong>ИИ-администратор</strong><span className="message-demo-tag">ДЕМО</span></div><div className="typing-bubble"><span className="typing-dots"><i /><i /><i /></span><span>Анализирую демо-среду</span></div></div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
          <form className="chat-input-area" onSubmit={onSend}>
            <div className="chat-composer">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите запрос на русском языке..."
                aria-label="Сообщение ИИ-администратору"
              />
              <button type="submit" className="send-button" disabled={!input.trim() || loading} aria-label="Отправить сообщение"><Icon name="send" size={17} /></button>
            </div>
            <div className="composer-footer"><span><Icon name="shield" size={13} />Демо-режим: команды не выполняются на сервере</span><span>Enter — отправить · Shift + Enter — новая строка</span></div>
          </form>
        </section>
        <aside className="assistant-context">
          <section className="context-panel panel">
            <div className="context-panel-heading"><span className="context-icon"><Icon name="serverStack" size={16} /></span><span>КОНТЕКСТ СЕССИИ</span></div>
            <div className="context-summary"><strong>Тестовый контур</strong><span>Демонстрационные источники</span></div>
            <div className="context-source"><span className="source-icon"><Icon name="database" size={15} /></span><div><strong>SQL Server</strong><small>3 тестовые базы</small></div><i className="status-dot" /></div>
            <div className="context-source"><span className="source-icon one-c">1C</span><div><strong>1С:Предприятие</strong><small>Симуляция доступна</small></div><i className="status-dot" /></div>
            <div className="context-source"><span className="source-icon"><Icon name="disk" size={15} /></span><div><strong>Дисковые тома</strong><small>3 тестовых тома</small></div><i className="status-dot" /></div>
          </section>
          <section className="context-panel context-tip panel">
            <div className="context-panel-heading"><span className="context-icon tip-icon"><Icon name="spark" size={16} /></span><span>ПРИМЕР ЗАПРОСА</span></div>
            <p>«Покажи, какие базы данных занимают больше всего места»</p>
            <button type="button" onClick={() => choosePrompt("Покажи, какие базы данных занимают больше всего места")} className="text-action">Использовать пример <Icon name="arrow" size={14} /></button>
          </section>
          <div className="context-disclaimer"><Icon name="shield" size={15} /><p>Прототип не имеет доступа к реальной инфраструктуре. Все ответы помечены как демо.</p></div>
        </aside>
      </div>
    </div>
  );
}

function DatabasesPage({
  selectedDatabase,
  setSelectedDatabase,
  search,
  setSearch,
}: {
  selectedDatabase: string;
  setSelectedDatabase: (id: string) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const selected = databases.find((db) => db.id === selectedDatabase) ?? databases[0];
  const filtered = useMemo(() => databases.filter((db) => `${db.name} ${db.description}`.toLowerCase().includes(search.toLowerCase())), [search]);
  return (
    <div className="page-stack page-enter">
      <SectionHeading eyebrow="SQL SERVER · ДЕМО-ДАННЫЕ" title="Базы данных" description="Состояние и занимаемое пространство баз тестового контура." action={<span className="total-size-badge"><Icon name="database" size={15} />285,6 ГБ <small>всего</small></span>} />
      <DemoBanner />
      <div className="database-page-layout">
        <section className="panel database-table-panel">
          <div className="database-toolbar"><div><div className="panel-kicker">SQL SERVER 2022 · SRV-SQL-DEMO</div><h2>Все базы <span>03</span></h2></div><label className="search-field"><Icon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Найти базу..." /></label></div>
          <div className="db-table-head"><span>БАЗА ДАННЫХ</span><span>СОСТОЯНИЕ</span><span>РАЗМЕР</span><span>ОБНОВЛЕНО</span></div>
          <div className="db-table-body">
            {filtered.map((db) => (
              <button className={`db-table-row ${selected?.id === db.id ? "active" : ""}`} key={db.id} type="button" onClick={() => setSelectedDatabase(db.id)}>
                <span className="table-db-name"><span className="table-db-icon"><Icon name="database" size={16} /></span><span><strong>{db.name}</strong><small>{db.description}</small></span></span>
                <span className="table-status"><i className="status-dot" />{db.state}</span><strong className="table-size">{db.size}</strong><span className="table-updated">{db.updated}</span>
              </button>
            ))}
            {filtered.length === 0 ? <div className="empty-filter"><Icon name="search" size={19} />Совпадений не найдено</div> : null}
          </div>
          <div className="database-table-footer"><span><i className="demo-outline-dot" />Демонстрационная информация</span><span>3 из 3 баз</span></div>
        </section>
        {selected ? (
          <aside className="database-detail-panel panel">
            <div className="detail-topline"><span className="detail-icon"><Icon name="database" size={19} /></span><span className="status-label"><i className="status-dot" />Активна</span></div>
            <div className="detail-database-title"><div className="panel-kicker">SQL SERVER · ДЕМО</div><h2>{selected.name}</h2><p>{selected.description}</p></div>
            <div className="detail-size-block"><span>Занимаемое пространство</span><strong>{selected.size}</strong><UsageProgress value={selected.sizeValue / 2.85} tone="mint" /><small>Доля от общего объёма демонстрационных баз</small></div>
            <div className="detail-rows"><div><span>Сервер</span><strong>SRV-SQL-DEMO</strong></div><div><span>Совместимость</span><strong>SQL Server 2022</strong></div><div><span>Последнее обновление</span><strong>{selected.updated}</strong></div></div>
            <div className="detail-disclaimer"><Icon name="shield" size={14} />Значения для визуального прототипа</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function ServersPage({ selectedServer, setSelectedServer }: { selectedServer: string; setSelectedServer: (id: string) => void }) {
  const selected = serverNodes.find((node) => node.id === selectedServer) ?? serverNodes[0];
  return (
    <div className="page-stack page-enter">
      <SectionHeading eyebrow="ИНФРАСТРУКТУРА · ДЕМО-КОНТУР" title="Серверы" description="Узлы Windows Server и роли тестовой среды." action={<span className="connected-badge"><i className="status-dot" />2 узла в симуляции</span>} />
      <DemoBanner />
      <div className="servers-page-layout">
        <section className="panel server-list-panel">
          <div className="panel-heading"><div><div className="panel-kicker">УЗЛЫ ИНФРАСТРУКТУРЫ</div><h2>Список серверов</h2></div><span className="section-count">02</span></div>
          <div className="server-select-list">
            {serverNodes.map((node) => (
              <button className={`server-select-row ${selected?.id === node.id ? "active" : ""}`} type="button" key={node.id} onClick={() => setSelectedServer(node.id)}>
                <span className={`server-node-icon ${node.id}`}><Icon name={node.id === "sql" ? "database" : "server"} size={19} /></span>
                <span className="server-select-copy"><strong>{node.name}</strong><small>{node.host}</small></span>
                <span className="status-label"><i className="status-dot" />В работе</span><Icon name="chevron" size={16} />
              </button>
            ))}
          </div>
          <div className="server-list-footnote"><Icon name="shield" size={14} />Подключение к физическим узлам отключено</div>
        </section>
        {selected ? (
          <section className="panel server-detail-panel">
            <div className="server-detail-header">
              <div className={`server-node-icon large ${selected.id}`}><Icon name={selected.id === "sql" ? "database" : "server"} size={23} /></div>
              <div><div className="panel-kicker">ДЕТАЛИ УЗЛА · ДЕМО</div><h2>{selected.name}</h2><span>{selected.role}</span></div>
              <span className="status-label"><i className="status-dot" />Работает</span>
            </div>
            <div className="server-metrics">
              <div><span>CPU</span><strong>{selected.cpu}</strong><UsageProgress value={Number.parseInt(selected.cpu, 10)} /></div>
              <div><span>Память</span><strong>{selected.memory}</strong><UsageProgress value={Number.parseInt(selected.memory, 10)} tone="blue" /></div>
              <div><span>Uptime</span><strong>{selected.uptime}</strong><small>Условное время работы</small></div>
            </div>
            <div className="server-info-list"><div><span>Имя узла</span><strong>{selected.host}</strong></div><div><span>Операционная система</span><strong>Windows Server 2022</strong></div><div><span>Версия компонента</span><strong>{selected.version}</strong></div><div><span>Источник статуса</span><strong>Демонстрационная симуляция</strong></div></div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function MonitoringPage({ range, setRange, setSection }: { range: RangeKey; setRange: (value: RangeKey) => void; setSection: (section: SectionKey) => void }) {
  return (
    <div className="page-stack page-enter">
      <SectionHeading eyebrow="ТЕЛЕМЕТРИЯ · ДЕМО-ПОТОК" title="Мониторинг" description="Нагрузка и системные ресурсы тестовых серверов." action={<RangeSelector value={range} onChange={setRange} />} />
      <DemoBanner />
      <div className="monitoring-top-grid">
        <div className="monitoring-kpi panel"><span className="metric-icon"><Icon name="cpu" size={17} /></span><span>Процессор</span><strong>34<small>%</small></strong><UsageProgress value={34} /><em>Средняя нагрузка</em></div>
        <div className="monitoring-kpi panel"><span className="metric-icon blue"><Icon name="memory" size={17} /></span><span>Память</span><strong>68<small>%</small></strong><UsageProgress value={68} tone="blue" /><em>20,4 ГБ из 32 ГБ</em></div>
        <div className="monitoring-kpi panel"><span className="metric-icon amber"><Icon name="disk" size={17} /></span><span>Свободное место</span><strong>678<small>ГБ</small></strong><div className="kpi-inline-note"><i className="status-dot" />3 тома · демо</div><button type="button" onClick={() => setSection("databases")}>К базам данных <Icon name="arrow" size={13} /></button></div>
      </div>
      <section className="panel monitoring-chart-panel">
        <div className="panel-heading"><div><div className="panel-kicker">СРЕДНЯЯ ЗАГРУЗКА · SRV-SQL-DEMO</div><h2>Нагрузка системы</h2></div><RangeSelector value={range} onChange={setRange} /></div>
        <div className="chart-legend"><span><i className="legend-line cpu" />CPU <strong>34%</strong></span><span><i className="legend-line memory" />RAM <strong>68%</strong></span><span className="legend-now"><i className="status-dot" />Демо-данные</span></div>
        <ActivityChart range={range} large />
      </section>
      <section className="panel volumes-panel">
        <div className="panel-heading"><div><div className="panel-kicker">ЁМКОСТЬ · ТЕСТОВЫЕ ДИСКИ</div><h2>Дисковые тома</h2></div><span className="section-count">3 ТОМА</span></div>
        <div className="volume-detail-grid">{disks.map((disk) => <div className="volume-detail" key={disk.name}><div className="volume-detail-heading"><span className="volume-drive">{disk.name}</span><div><strong>{disk.label}</strong><span>{disk.detail} занято</span></div><strong className="volume-percent">{disk.used}%</strong></div><UsageProgress value={disk.used} tone={disk.used > 70 ? "amber" : "blue"} /><small>{disk.used > 70 ? "Требует внимания" : "Запас свободного места в норме"} · демонстрационный показатель</small></div>)}</div>
      </section>
    </div>
  );
}

function JournalPage({ filter, setFilter }: { filter: "all" | "ai" | "system"; setFilter: (value: "all" | "ai" | "system") => void }) {
  const events = journalEvents.filter((event) => filter === "all" || event.category === filter);
  return (
    <div className="page-stack page-enter">
      <SectionHeading eyebrow="АУДИТ · ДЕМО-СРЕДА" title="Журнал операций" description="История действий и проверок тестового интерфейса." action={<button className="button-secondary" type="button" onClick={() => setFilter("all")}><Icon name="refresh" size={15} />Сбросить фильтр</button>} />
      <DemoBanner />
      <section className="panel journal-panel">
        <div className="journal-toolbar"><div><div className="panel-kicker">ПОСЛЕДНИЕ СОБЫТИЯ</div><h2>Активность <span>{events.length.toString().padStart(2, "0")}</span></h2></div><div className="journal-filters" role="group" aria-label="Фильтр журнала"><button type="button" className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>Все</button><button type="button" className={filter === "ai" ? "selected" : ""} onClick={() => setFilter("ai")}>ИИ</button><button type="button" className={filter === "system" ? "selected" : ""} onClick={() => setFilter("system")}>Система</button></div></div>
        <div className="journal-list">{events.map((event) => <div className="journal-row" key={event.id}><time>{event.time}</time><span className={`journal-event-icon ${event.category}`}><Icon name={event.icon} size={16} /></span><div className="journal-event-copy"><strong>{event.title}</strong><span>{event.detail}</span></div><span className="journal-state">{event.state}</span></div>)}</div>
        <div className="journal-footer"><Icon name="shield" size={14} />Записи сгенерированы интерфейсом прототипа. Реальные действия не выполнялись.</div>
      </section>
    </div>
  );
}

function SettingsPage({ values, onToggle, model, setModel }: { values: { refresh: boolean; confirm: boolean; notify: boolean }; onToggle: (key: "refresh" | "confirm" | "notify") => void; model: string; setModel: (value: string) => void }) {
  return (
    <div className="page-stack page-enter">
      <SectionHeading eyebrow="РАБОЧЕЕ ОКРУЖЕНИЕ · ДЕМО" title="Настройки" description="Параметры интерфейса-прототипа и поведения ассистента." />
      <DemoBanner />
      <div className="settings-layout">
        <section className="panel settings-panel">
          <div className="panel-heading"><div><div className="panel-kicker">ПАРАМЕТРЫ ПРОТОТИПА</div><h2>Поведение системы</h2></div><span className="section-count">ЛОКАЛЬНО</span></div>
          <div className="setting-row"><span className="setting-icon"><Icon name="refresh" size={17} /></span><div className="setting-copy"><strong>Обновление демонстрационных показателей</strong><span>Показывать динамические значения в виджетах мониторинга</span></div><button type="button" role="switch" aria-checked={values.refresh} onClick={() => onToggle("refresh")} className={`toggle-switch ${values.refresh ? "on" : ""}`}><i /></button></div>
          <div className="setting-row"><span className="setting-icon"><Icon name="shield" size={17} /></span><div className="setting-copy"><strong>Подтверждение команд ИИ</strong><span>В реальной интеграции опасные действия будут требовать подтверждения</span></div><button type="button" role="switch" aria-checked={values.confirm} onClick={() => onToggle("confirm")} className={`toggle-switch ${values.confirm ? "on" : ""}`}><i /></button></div>
          <div className="setting-row"><span className="setting-icon"><Icon name="activity" size={17} /></span><div className="setting-copy"><strong>Уведомления о событиях</strong><span>Настройка только для текущего сеанса предпросмотра</span></div><button type="button" role="switch" aria-checked={values.notify} onClick={() => onToggle("notify")} className={`toggle-switch ${values.notify ? "on" : ""}`}><i /></button></div>
          <div className="setting-row model-setting"><span className="setting-icon"><Icon name="bot" size={17} /></span><div className="setting-copy"><strong>Модель ассистента</strong><span>Выбор отображаемой модели для будущей интеграции</span></div><label className="model-select-label"><span className="sr-only">Модель ассистента</span><select value={model} onChange={(event) => setModel(event.target.value)}><option>Ollama · демонстрация</option><option>Локальная модель · режим теста</option></select></label></div>
          <div className="settings-footer"><Icon name="shield" size={14} />Настройки не сохраняются на сервере и действуют только в этом предпросмотре.</div>
        </section>
        <aside className="settings-side panel"><div className="settings-side-icon"><Icon name="terminal" size={22} /></div><div className="panel-kicker">ЭТАП 1 · ПРОТОТИП</div><h2>Безопасно по умолчанию</h2><p>Подключение к Python API, Ollama, SQL Server и Windows Server на этом этапе не выполняется.</p><div className="settings-side-status"><i className="status-dot" />Реальных команд нет</div></aside>
      </div>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionKey>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [range, setRange] = useState<RangeKey>("1ч");
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState("erp-main");
  const [selectedServer, setSelectedServer] = useState("sql");
  const [dbSearch, setDbSearch] = useState("");
  const [journalFilter, setJournalFilter] = useState<"all" | "ai" | "system">("all");
  const [settings, setSettings] = useState({ refresh: true, confirm: true, notify: false });
  const [model, setModel] = useState("Ollama · демонстрация");
  const sendTimer = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (sendTimer.current !== null) window.clearTimeout(sendTimer.current);
  }, []);

  const sectionLabel = navItems.find((item) => item.id === activeSection)?.label ?? "Главная";

  const queueMessage = (text: string, retry = false) => {
    const stamp = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date());
    setMessages((current) => [...current, { id: Date.now(), role: "user", text, time: stamp }]);
    setLoading(true);

    sendTimer.current = window.setTimeout(() => {
      const isError = !retry && /ошиб|сбо[йя]|недоступ|error|откаж/i.test(text);
      const includesStorage = /баз|sql|мест|диск|хранил|объ[её]м/i.test(text);
      const reply: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: isError
          ? ""
          : includesStorage
            ? "Проверил тестовые значения. Объём трёх баз — 285,6 ГБ, суммарно свободно на томах — 678 ГБ."
            : "В тестовом контуре оба узла доступны, критичных отклонений в демонстрационных показателях нет.",
        time: new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
        report: !isError && includesStorage,
        error: isError,
      };
      setMessages((current) => [...current, reply]);
      setLoading(false);
      sendTimer.current = null;
    }, 1250);
  };

  const handleSend = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    queueMessage(text);
  };

  const handleNewChat = () => {
    if (sendTimer.current !== null) window.clearTimeout(sendTimer.current);
    sendTimer.current = null;
    setLoading(false);
    setMessages([]);
    setInput("");
  };

  const handleRetry = () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUserMessage) return;
    const failedUserId = lastUserMessage.id;
    setMessages((current) => current.filter((message) => !message.error && message.id !== failedUserId));
    setInput("");
    queueMessage(lastUserMessage.text, true);
  };

  const toggleSetting = (key: "refresh" | "confirm" | "notify") => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="app-shell">
      {sidebarOpen ? <button className="sidebar-scrim" aria-label="Закрыть меню" type="button" onClick={() => setSidebarOpen(false)} /> : null}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <BrandMark />
        <div className="sidebar-environment"><span className="environment-mark"><i /></span><span><strong>Локальная среда</strong><small>DEMO · ОТКЛЮЧЕНО ОТ PROD</small></span><Icon name="chevron" size={14} /></div>
        <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="main-nav" aria-label="Главное меню">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} className={`nav-link ${activeSection === item.id ? "active" : ""}`} aria-current={activeSection === item.id ? "page" : undefined}>
              <span className="nav-icon"><Icon name={item.icon} size={18} /></span><span>{item.label}</span>{item.id === "assistant" ? <i className="nav-ai-mark" /> : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-bottom-line"><span className="secure-mark"><Icon name="shield" size={15} /></span><span><strong>Безопасный режим</strong><small>Команды не выполняются</small></span></div>
          <div className="sidebar-version"><span>AI SERVER ADMIN</span><span>v0.1 · prototype</span></div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-button" type="button" aria-label="Открыть меню" onClick={() => setSidebarOpen(true)}><Icon name="menu" size={19} /></button>
            <div className="topbar-crumb"><span>AI SERVER ADMIN</span><Icon name="chevron" size={13} /><strong>{sectionLabel}</strong></div>
          </div>
          <div className="topbar-right">
            <span className="topbar-demo"><i />ДЕМО-СРЕДА</span>
            <span className="topbar-divider" />
            <span className="topbar-ai"><i className="status-dot" />ИИ локально</span>
            <span className="topbar-divider topbar-clock-divider" />
            <div className="topbar-clock"><time>{formatClock(now)}</time><span>{formatDate(now)}</span></div>
          </div>
        </header>

        <main className="main-content">
          <div className="content-wrap" key={activeSection}>
            {activeSection === "home" ? <OverviewPage setSection={setActiveSection} setSelectedDatabase={setSelectedDatabase} setSelectedServer={setSelectedServer} range={range} setRange={setRange} /> : null}
            {activeSection === "assistant" ? <AssistantPage messages={messages} input={input} setInput={setInput} onSend={handleSend} onNewChat={handleNewChat} onRetry={handleRetry} loading={loading} /> : null}
            {activeSection === "databases" ? <DatabasesPage selectedDatabase={selectedDatabase} setSelectedDatabase={setSelectedDatabase} search={dbSearch} setSearch={setDbSearch} /> : null}
            {activeSection === "servers" ? <ServersPage selectedServer={selectedServer} setSelectedServer={setSelectedServer} /> : null}
            {activeSection === "monitoring" ? <MonitoringPage range={range} setRange={setRange} setSection={setActiveSection} /> : null}
            {activeSection === "journal" ? <JournalPage filter={journalFilter} setFilter={setJournalFilter} /> : null}
            {activeSection === "settings" ? <SettingsPage values={settings} onToggle={toggleSetting} model={model} setModel={setModel} /> : null}
          </div>
        </main>
      </div>
    </div>
  );
}