import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  CHUMES_COMPANY,
  CHUMES_LOGO_PATH,
  QUOTE_PDF_FOOTER,
} from "@/lib/quotes/pdf/company";
import {
  formatPdfCurrency,
  formatPdfDate,
  formatPdfTaxRate,
} from "@/lib/quotes/pdf/format-pdf";
import type { QuoteWithRelations } from "@/lib/supabase/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 88,
    height: 88,
    objectFit: "contain",
  },
  headerBrand: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 9,
    color: "#6b7280",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  quoteNumber: {
    fontSize: 11,
    color: "#374151",
    marginTop: 2,
  },
  metaBlock: {
    alignItems: "flex-end",
  },
  metaText: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 2,
  },
  twoColumnSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 18,
  },
  column: {
    width: "48%",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    color: "#111827",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 90,
    color: "#6b7280",
    fontSize: 9,
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
  },
  section: {
    marginBottom: 18,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "flex-start",
  },
  colDescription: { width: "57%", paddingRight: 10 },
  colQty: { width: "10%", textAlign: "center", paddingRight: 8 },
  colUnit: { width: "13%", textAlign: "right", paddingRight: 4 },
  colTax: { width: "10%", textAlign: "right", paddingRight: 4 },
  colTotal: { width: "12%", textAlign: "right" },
  headerText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  cellText: {
    fontSize: 8,
    lineHeight: 1.35,
  },
  summary: {
    marginTop: 12,
    marginLeft: "auto",
    width: 220,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  summaryLabel: {
    color: "#6b7280",
  },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  notes: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.4,
  },
});

type QuotePdfDocumentProps = {
  quote: QuoteWithRelations;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export function QuotePdfDocument({ quote }: QuotePdfDocumentProps) {
  const customer = quote.customers;
  const items = quote.quote_items ?? [];
  const hasDelivery =
    quote.estimated_location ||
    quote.delivery_zones?.name ||
    quote.delivery_fee != null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Image src={CHUMES_LOGO_PATH} style={styles.logo} />
            <View style={styles.headerBrand}>
              <Text style={styles.companyName}>{CHUMES_COMPANY.name}</Text>
              <Text style={styles.companyTagline}>{CHUMES_COMPANY.tagline}</Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>Cotización</Text>
              <Text style={styles.quoteNumber}>{quote.quote_number}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaText}>
                Emisión: {formatPdfDate(quote.created_at)}
              </Text>
              <Text style={styles.metaText}>
                Válida hasta: {formatPdfDate(quote.valid_until)}
              </Text>
              <Text style={styles.metaText}>
                Estado: {quote.quote_statuses.name}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.twoColumnSection}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <InfoRow label="Nombre" value={customer.name} />
            {customer.identification ? (
              <InfoRow label="Identificación" value={customer.identification} />
            ) : null}
            {customer.email ? (
              <InfoRow label="Correo" value={customer.email} />
            ) : null}
            {customer.phone ? (
              <InfoRow label="Teléfono" value={customer.phone} />
            ) : null}
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Entrega</Text>
            {hasDelivery ? (
              <>
                {quote.estimated_location ? (
                  <InfoRow
                    label="Ubicación"
                    value={quote.estimated_location}
                  />
                ) : null}
                {quote.delivery_zones?.name ? (
                  <InfoRow label="Zona" value={quote.delivery_zones.name} />
                ) : null}
              </>
            ) : (
              <Text style={styles.infoValue}>—</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colQty]}>Cantidad</Text>
            <Text style={[styles.headerText, styles.colDescription]}>
              Descripción
            </Text>
            <Text style={[styles.headerText, styles.colUnit]}>Precio unit.</Text>
            <Text style={[styles.headerText, styles.colTax]}>Impuesto</Text>
            <Text style={[styles.headerText, styles.colTotal]}>Total</Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colQty]}>
                {Number(item.quantity)}
              </Text>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>
                  {item.description || "—"}
                </Text>
              </View>
              <Text style={[styles.cellText, styles.colUnit]}>
                {formatPdfCurrency(Number(item.unit_price))}
              </Text>
              <Text style={[styles.cellText, styles.colTax]}>
                {item.taxes?.name ?? formatPdfTaxRate(Number(item.tax_rate))}
              </Text>
              <Text style={[styles.cellText, styles.colTotal]}>
                {formatPdfCurrency(Number(item.line_total))}
              </Text>
            </View>
          ))}
          {quote.delivery_fee != null && Number(quote.delivery_fee) >= 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colQty]}>1</Text>
              <View style={styles.colDescription}>
                <Text style={styles.cellText}>
                  Transporte
                  {quote.delivery_zones?.name
                    ? ` — ${quote.delivery_zones.name}`
                    : ""}
                </Text>
              </View>
              <Text style={[styles.cellText, styles.colUnit]}>
                {formatPdfCurrency(Number(quote.delivery_fee))}
              </Text>
              <Text style={[styles.cellText, styles.colTax]}>
                {quote.delivery_taxes?.name ?? "—"}
              </Text>
              <Text style={[styles.cellText, styles.colTotal]}>
                {formatPdfCurrency(
                  Number(quote.delivery_fee) +
                    Number(quote.delivery_tax_amount ?? 0) -
                    (Number(quote.subtotal) > 0
                      ? Number(quote.discount_amount) *
                        (Number(quote.delivery_fee) / Number(quote.subtotal))
                      : 0),
                )}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text>{formatPdfCurrency(Number(quote.subtotal))}</Text>
          </View>
          {Number(quote.discount_amount) > 0 ? (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Descuento
                  {quote.discount_codes?.code
                    ? ` (${quote.discount_codes.code})`
                    : quote.manual_discount_value
                      ? " (manual)"
                      : ""}
                </Text>
                <Text>-{formatPdfCurrency(Number(quote.discount_amount))}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Base imponible</Text>
                <Text>
                  {formatPdfCurrency(
                    Number(quote.subtotal) - Number(quote.discount_amount),
                  )}
                </Text>
              </View>
            </>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Impuestos</Text>
            <Text>{formatPdfCurrency(Number(quote.tax_total))}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text>Total</Text>
            <Text>{formatPdfCurrency(Number(quote.total))}</Text>
          </View>
        </View>

        {quote.notes ? (
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notes}>{quote.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>{QUOTE_PDF_FOOTER}</Text>
        </View>
      </Page>
    </Document>
  );
}
