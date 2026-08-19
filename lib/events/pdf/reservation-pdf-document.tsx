import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { EventReservationPdfData } from "@/lib/events/pdf/types";
import {
  CHUMES_COMPANY,
  CHUMES_LOGO_PATH,
  RESERVATION_PDF_FOOTER,
} from "@/lib/quotes/pdf/company";
import {
  formatPdfCurrency,
  formatPdfDate,
  formatPdfDateTime,
  formatPdfEventDate,
} from "@/lib/quotes/pdf/format-pdf";

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
  colQty: { width: "10%", textAlign: "right", paddingRight: 6 },
  colProduct: { width: "28%", paddingRight: 8 },
  colDescription: { width: "62%" },
  headerText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  cellText: {
    fontSize: 8,
    lineHeight: 1.35,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginLeft: "auto",
    width: 240,
    paddingTop: 8,
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

type ReservationPdfDocumentProps = {
  data: EventReservationPdfData;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function buildNotes(data: EventReservationPdfData): string | null {
  const parts = [data.event.notes?.trim(), data.quote.notes?.trim()].filter(
    Boolean,
  ) as string[];

  if (parts.length === 0) return null;
  return parts.join("\n\n");
}

export function ReservationPdfDocument({ data }: ReservationPdfDocumentProps) {
  const { event, quote } = data;
  const customer = event.customers;
  const items = quote.quote_items ?? [];
  const phone = event.customer_contacts?.phone ?? customer.phone ?? null;
  const notes = buildNotes(data);
  const hasDelivery = quote.delivery_fee != null && Number(quote.delivery_fee) > 0;

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
              <Text style={styles.title}>Confirmación de reserva</Text>
              <Text style={styles.quoteNumber}>Cotización {quote.quote_number}</Text>
            </View>
            <View style={styles.metaBlock}>
              <Text style={styles.metaText}>
                Cotización: {formatPdfDate(quote.created_at)}
              </Text>
              <Text style={styles.metaText}>
                Reserva: {formatPdfDate(event.reserved_at ?? event.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.twoColumnSection}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <InfoRow label="Nombre" value={customer.name} />
            {phone ? <InfoRow label="Teléfono" value={phone} /> : null}
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Evento</Text>
            <InfoRow label="Título" value={event.title} />
            <InfoRow
              label="Fecha evento"
              value={formatPdfEventDate(event.event_date)}
            />
            <InfoRow
              label="Entrega"
              value={formatPdfDateTime(event.delivery_date)}
            />
            <InfoRow
              label="Recogida"
              value={formatPdfDateTime(event.pickup_date)}
            />
            {event.estimated_location ? (
              <InfoRow label="Ubicación" value={event.estimated_location} />
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Artículos confirmados</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colQty]}>Cant.</Text>
            <Text style={[styles.headerText, styles.colProduct]}>Artículo</Text>
            <Text style={[styles.headerText, styles.colDescription]}>
              Descripción
            </Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colQty]}>
                {Number(item.quantity)}
              </Text>
              <Text style={[styles.cellText, styles.colProduct]}>
                {item.products.name}
              </Text>
              <Text style={[styles.cellText, styles.colDescription]}>
                {item.description?.trim() || "—"}
              </Text>
            </View>
          ))}

          {hasDelivery ? (
            <View style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colQty]}>1</Text>
              <Text style={[styles.cellText, styles.colProduct]}>Transporte</Text>
              <Text style={[styles.cellText, styles.colDescription]}>
                {quote.delivery_zones?.name ?? "Entrega"}
              </Text>
            </View>
          ) : null}
        </View>

        {notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={styles.notes}>{notes}</Text>
          </View>
        ) : null}

        <View style={styles.totalRow}>
          <Text>Total confirmado</Text>
          <Text>{formatPdfCurrency(Number(quote.total))}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{RESERVATION_PDF_FOOTER}</Text>
        </View>
      </Page>
    </Document>
  );
}
