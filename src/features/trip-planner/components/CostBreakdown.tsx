import { BedDouble, Coffee, ReceiptText, ShipWheel, Ticket, Utensils } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import type { TripCostCategory, TripCostEstimate } from "@/features/planner/types";
import styles from "./TripPlanner.module.scss";

type CostBreakdownProps = {
  costs: TripCostEstimate;
};

const costIcons: Record<TripCostCategory, LucideIcon> = {
  Accommodation: BedDouble,
  Food: Utensils,
  Transport: ShipWheel,
  Tickets: Ticket,
  CoffeeExtra: Coffee,
};

function formatCurrency(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function CostBreakdown({ costs }: CostBreakdownProps) {
  const locale = useLocale();
  const cost = useTranslations("Cost");

  return (
    <section className={styles.panel} aria-labelledby="cost-breakdown-title">
      <div className={styles.panelHeading}>
        <span className={styles.panelIcon}>
          <ReceiptText size={18} aria-hidden="true" />
        </span>
        <div>
          <h2 id="cost-breakdown-title">{cost("title")}</h2>
          <p>{cost("description")}</p>
        </div>
      </div>
      <div className={styles.costList}>
        {costs.items.map((item) => {
          const Icon = costIcons[item.label];

          return (
            <div className={styles.costRow} key={item.label}>
              <span>
                <Icon size={17} aria-hidden="true" />
                {cost(`items.${item.label}`)}
              </span>
              <strong>{formatCurrency(item.amount, locale)}</strong>
            </div>
          );
        })}
        <div className={styles.totalRow}>
          <span>{cost("total")}</span>
          <strong>{formatCurrency(costs.total, locale)}</strong>
        </div>
      </div>
    </section>
  );
}
