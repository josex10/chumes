import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { WeekReport } from "@/lib/dashboard/week-report";
import {
  eventCountLabel,
  formatRatioLabel,
  movementCountLabel,
} from "@/lib/dashboard/week-report";
import { CHUMES_COMPANY, CHUMES_LOGO_PATH } from "@/lib/quotes/pdf/company";
import { formatPdfCurrency } from "@/lib/quotes/pdf/format-pdf";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 36,
    paddingBottom: 56,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 12,
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 42,
    height: 42,
    objectFit: "contain",
  },
  brandName: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  range: {
    fontSize: 12,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  kpi: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  kpiValueLarge: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  kpiHint: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 3,
  },
  loss: {
    color: "#b91c1c",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f3f4f6",
    flexDirection: "row",
    overflow: "hidden",
    marginTop: 4,
  },
  caption: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  chartRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
  },
  chartColumn: {
    flex: 1,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 110,
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
  },
  dayCount: {
    fontSize: 8,
    marginBottom: 3,
  },
  dayBarTrack: {
    height: 78,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  dayBar: {
    width: 16,
    backgroundColor: "#111827",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  dayLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 4,
  },
  categoryBlock: {
    marginBottom: 8,
  },
  categoryMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  categoryTrack: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 2,
    flexDirection: "row",
  },
  categoryBar: {
    height: 8,
    backgroundColor: "#111827",
    borderRadius: 2,
  },
  empty: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableTotal: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  headerText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  cellText: {
    fontSize: 8,
  },
  colDate: { width: "16%" },
  colEvent: { width: "38%", paddingRight: 6 },
  colCustomer: { width: "26%", paddingRight: 6 },
  colMoney: { width: "20%", textAlign: "right" },
  colConcept: { width: "50%", paddingRight: 6 },
  colMethod: { width: "30%", paddingRight: 6 },
  close: {
    fontSize: 10,
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    fontSize: 8,
    color: "#6b7280",
  },
});

type WeekReportPdfDocumentProps = {
  report: WeekReport;
};

export function WeekReportPdfDocument({ report }: WeekReportPdfDocumentProps) {
  const profitIsLoss = report.profit < 0;
  const maxEvents = Math.max(...report.days.map((day) => day.count), 1);
  const maxCategory = Math.max(...report.categories.map((category) => category.total), 1);

  return (
    <Document title={`Resumen semanal ${report.weekRange}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <View style={styles.brandRow}>
              <Image src={CHUMES_LOGO_PATH} style={styles.logo} />
              <View>
                <Text style={styles.brandName}>{CHUMES_COMPANY.name}</Text>
                <Text style={styles.title}>Resumen semanal</Text>
              </View>
            </View>
          </View>
          <Text style={styles.range}>{report.weekRange.replaceAll("–", "-")}</Text>
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Facturado</Text>
            <Text style={styles.kpiValue}>{formatPdfCurrency(report.billed)}</Text>
            <Text style={styles.kpiHint}>{eventCountLabel(report.eventCount)}</Text>
            <Text style={styles.kpiHint}>
              Cobrado {formatPdfCurrency(report.collected)} · Pendiente{" "}
              {formatPdfCurrency(report.pending)}
            </Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Gastos</Text>
            <Text style={styles.kpiValue}>{formatPdfCurrency(report.expensesTotal)}</Text>
            <Text style={styles.kpiHint}>{movementCountLabel(report.expenseCount)}</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiLabel}>Utilidad</Text>
            <Text style={profitIsLoss ? [styles.kpiValueLarge, styles.loss] : styles.kpiValueLarge}>
              {formatPdfCurrency(report.profit)}
            </Text>
            <Text style={profitIsLoss ? [styles.kpiHint, styles.loss] : styles.kpiHint}>
              {report.margin === null ? "-" : `${formatRatioLabel(report.margin)} de margen`}
            </Text>
          </View>
        </View>

        <View style={styles.barTrack}>
          {report.bar.kind === "loss" && (
            <View style={{ flex: 1, backgroundColor: "#b91c1c" }} />
          )}
          {report.bar.kind === "profit" && (
            <View style={{ flex: 1, backgroundColor: "#111827" }} />
          )}
          {report.bar.kind === "split" && (
            <>
              <View
                style={{
                  width: `${report.bar.expenseRatio * 100}%`,
                  backgroundColor: "#9ca3af",
                }}
              />
              <View
                style={{
                  width: `${report.bar.profitRatio * 100}%`,
                  backgroundColor: "#111827",
                }}
              />
            </>
          )}
        </View>
        <Text style={styles.caption}>{report.bar.caption}</Text>

        <View style={styles.chartRow}>
          <View style={styles.chartColumn}>
            <Text style={styles.sectionTitle}>Eventos por día</Text>
            <View style={styles.dayRow}>
              {report.days.map((day) => (
                <View key={day.dateKey} style={styles.dayColumn}>
                  <View style={styles.dayBarTrack}>
                    <Text style={styles.dayCount}>{day.count}</Text>
                    <View
                      style={[
                        styles.dayBar,
                        {
                          height: Math.max(
                            day.count === 0 ? 2 : 4,
                            (day.count / maxEvents) * 56,
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.chartColumn}>
            <Text style={styles.sectionTitle}>Gastos por categoría</Text>
            {report.categories.length === 0 ? (
              <Text style={styles.empty}>No hay gastos esta semana</Text>
            ) : (
              report.categories.map((category) => (
                <View key={category.name} style={styles.categoryBlock}>
                  <View style={styles.categoryMeta}>
                    <Text style={styles.cellText}>{category.name}</Text>
                    <Text style={styles.cellText}>
                      {formatPdfCurrency(category.total)} · {formatRatioLabel(category.percent)}
                    </Text>
                  </View>
                  <View style={styles.categoryTrack}>
                    <View
                      style={[
                        styles.categoryBar,
                        {
                          width: `${Math.max(2, (category.total / maxCategory) * 100)}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>De dónde sale lo facturado</Text>
        {report.events.length === 0 ? (
          <Text style={styles.empty}>No hay eventos confirmados esta semana.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.colDate]}>Fecha</Text>
              <Text style={[styles.headerText, styles.colEvent]}>Evento</Text>
              <Text style={[styles.headerText, styles.colCustomer]}>Cliente</Text>
              <Text style={[styles.headerText, styles.colMoney]}>Facturado</Text>
            </View>
            {report.events.map((event) => (
              <View key={event.id} style={styles.tableRow}>
                <Text style={[styles.cellText, styles.colDate]}>{event.dateLabel}</Text>
                <Text style={[styles.cellText, styles.colEvent]}>{event.title}</Text>
                <Text style={[styles.cellText, styles.colCustomer]}>{event.customerName}</Text>
                <Text style={[styles.cellText, styles.colMoney]}>
                  {formatPdfCurrency(event.amount)}
                </Text>
              </View>
            ))}
            <View style={styles.tableTotal}>
              <Text style={[styles.headerText, { width: "80%" }]}>Total facturado</Text>
              <Text style={[styles.headerText, styles.colMoney]}>
                {formatPdfCurrency(report.billed)}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>En qué se fue el gasto</Text>
        {report.expenseRows.length === 0 ? (
          <Text style={styles.empty}>No hay gastos esta semana.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.colConcept]}>Concepto</Text>
              <Text style={[styles.headerText, styles.colMethod]}>Medio de pago</Text>
              <Text style={[styles.headerText, styles.colMoney]}>Monto</Text>
            </View>
            {report.expenseRows.map((expense) => (
              <View key={expense.id} style={styles.tableRow}>
                <Text style={[styles.cellText, styles.colConcept]}>{expense.concept}</Text>
                <Text style={[styles.cellText, styles.colMethod]}>{expense.paymentMethod}</Text>
                <Text style={[styles.cellText, styles.colMoney]}>
                  {formatPdfCurrency(expense.amount)}
                </Text>
              </View>
            ))}
            <View style={styles.tableTotal}>
              <Text style={[styles.headerText, { width: "80%" }]}>Total gastos</Text>
              <Text style={[styles.headerText, styles.colMoney]}>
                {formatPdfCurrency(report.expensesTotal)}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.close}>
          Facturado {formatPdfCurrency(report.billed)} - Gastos {formatPdfCurrency(report.expensesTotal)}{" "}
          = Utilidad {formatPdfCurrency(report.profit)}
        </Text>

        <Text style={styles.footer} fixed>
          Chumes · Resumen semanal · generado el {report.generatedLabel}
        </Text>
      </Page>
    </Document>
  );
}
