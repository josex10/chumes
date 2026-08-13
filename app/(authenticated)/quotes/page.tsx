import Link from "next/link";
import { getQuotes } from "@/lib/quotes/queries";
import { formatCurrency } from "@/lib/quotes/format";
import { QuoteDownloadButton } from "@/components/quotes/quote-download-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Quotes</h1>
          <p className="mt-2 text-muted-foreground">
            Manage commercial proposals for Chumes customers.
          </p>
        </div>
        <Link href="/quotes/new" className={cn(buttonVariants())}>
          New quote
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground">No quotes yet.</p>
          <Link
            href="/quotes/new"
            className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}
          >
            Create your first quote
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quote_number}</TableCell>
                  <TableCell>{quote.customers.name}</TableCell>
                  <TableCell>{quote.quote_statuses.name}</TableCell>
                  <TableCell>{formatCurrency(Number(quote.total))}</TableCell>
                  <TableCell>
                    {new Date(quote.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <QuoteDownloadButton
                        quoteId={quote.id}
                        label="PDF"
                        variant="ghost"
                        size="sm"
                      />
                      <Link
                        href={`/quotes/${quote.id}/edit`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                        )}
                      >
                        Edit
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
