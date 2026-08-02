import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  getAllCategories,
  getAllProducts,
} from "@/lib/actions/product.actions";
import ProductCard from "@/components/shared/product/product-card";
import { StarIcon } from "lucide-react";

const prices = [
  {
    name: "$1 to $50",
    value: "1-50",
  },
  {
    name: "$51 to $100",
    value: "51-100",
  },
  {
    name: "$101 to $200",
    value: "101-200",
  },
  {
    name: "$201 to $500",
    value: "201-500",
  },
  {
    name: "$501 to $1,000",
    value: "501-1000",
  },
];

const ratings = [4, 3, 2, 1];

const sortOrders = [
  { name: "Newest", value: "newest" },
  { name: "Price: Low to High", value: "lowest" },
  { name: "Price: High to Low", value: "highest" },
  { name: "Customer Rating", value: "rating" },
];

const isFilterSet = (value?: string) =>
  Boolean(value && value !== "all" && value.trim() !== "");

const getPriceLabel = (value: string) =>
  prices.find((p) => p.value === value)?.name ?? value;

const getRatingLabel = (value: string) => `${value} stars & up`;

export async function generateMetadata(props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
  }>;
}) {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
  } = await props.searchParams;

  const isQuerySet = isFilterSet(q);
  const isCategorySet = isFilterSet(category);
  const isPriceSet = isFilterSet(price);
  const isRatingSet = isFilterSet(rating);

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    const titleParts = [
      isQuerySet ? `Search: ${q}` : null,
      isCategorySet ? `Department: ${category}` : null,
      isPriceSet ? `Price: ${getPriceLabel(price)}` : null,
      isRatingSet ? `Rating: ${getRatingLabel(rating)}` : null,
    ].filter(Boolean);

    return {
      title: titleParts.join(" | "),
    };
  } else
    return {
      title: "Search Products",
    };
}

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}) => {
  const {
    q = "all",
    category = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = await props.searchParams;
  const activeSort = sortOrders.some((s) => s.value === sort) ? sort : "newest";

  // 131 - construct filter url
  const getFilterUrl = ({
    c,
    p,
    s,
    r,
    pg,
  }: {
    c?: string;
    p?: string;
    s?: string;
    r?: string;
    pg?: string;
  }) => {
    const params = { q, category, price, sort: activeSort, rating, page };

    if (c) params.category = c;
    if (p) params.price = p;
    if (s) params.sort = s;
    if (r) params.rating = r;
    if (pg) params.page = pg;

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort: activeSort,
    page: Number(page),
  });

  const categories = await getAllCategories();
  const priceOptions = Array.from(
    new Map(prices.map((p) => [p.value, p])).values(),
  );
  const priceOptionText = new Set(
    priceOptions.flatMap((p) => [p.name, p.value]),
  );
  const categoryOptions = Array.from(
    categories
      .reduce((map, item) => {
        const categoryName = item.category.trim();

        if (!categoryName || priceOptionText.has(categoryName)) return map;

        const key = categoryName.toLowerCase();
        const existing = map.get(key);

        map.set(key, {
          category: existing?.category ?? categoryName,
          _count: (existing?._count ?? 0) + Number(item._count),
        });

        return map;
      }, new Map<string, { category: string; _count: number }>())
      .values(),
  );
  const ratingOptions = Array.from(new Set(ratings)).sort((a, b) => b - a);
  const filterLinkClass = (isActive: boolean) =>
    cn(
      "flex min-h-9 items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
      isActive
        ? "bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        : "text-foreground",
    );
  const renderRatingStars = (value: number, isActive: boolean) => (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={`rating-${value}-star-${index}`}
          className={cn(
            "size-3.5",
            index < value
              ? isActive
                ? "fill-primary-foreground text-primary-foreground"
                : "fill-yellow-400 text-yellow-400"
              : isActive
                ? "text-primary-foreground/40"
                : "text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
  const activeFilters = [
    isFilterSet(q) ? { label: "Search", value: q } : null,
    isFilterSet(category) ? { label: "Department", value: category } : null,
    isFilterSet(price)
      ? {
          label: "Price",
          value: getPriceLabel(price),
        }
      : null,
    isFilterSet(rating)
      ? { label: "Rating", value: getRatingLabel(rating) }
      : null,
  ].filter(
    (filter): filter is { label: string; value: string } => filter !== null,
  );

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-md border bg-card p-4 shadow-sm md:sticky md:top-24">
        {/* Category Links */}
        <section>
          <div className="mb-2 text-sm font-semibold text-muted-foreground">
            Department
          </div>
          <ul className="space-y-1">
            <li key="category-all">
              <Link
                className={filterLinkClass(
                  category === "all" || category === "",
                )}
                href={getFilterUrl({ c: "all", pg: "1" })}
              >
                <span>Any</span>
              </Link>
            </li>
            {categoryOptions.map((x) => {
              const isActive = category === x.category;

              return (
                <li key={`category-${x.category}`}>
                  <Link
                    className={filterLinkClass(isActive)}
                    href={getFilterUrl({ c: x.category, pg: "1" })}
                  >
                    <span>{x.category}</span>
                    <span
                      className={cn(
                        "ml-3 rounded-sm px-1.5 py-0.5 text-xs",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {x._count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Price Filter */}
        <section className="mt-6 border-t pt-4">
          <div className="mb-2 text-sm font-semibold text-muted-foreground">
            Price
          </div>
          <ul className="space-y-1">
            <li key="price-all">
              <Link
                className={filterLinkClass(price === "all" || price === "")}
                href={getFilterUrl({ p: "all", pg: "1" })}
              >
                <span>Any</span>
              </Link>
            </li>
            {priceOptions.map((p) => (
              <li key={`price-${p.value}`}>
                <Link
                  className={filterLinkClass(price === p.value)}
                  href={getFilterUrl({ p: p.value, pg: "1" })}
                >
                  <span>{p.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Rating Filter */}
        <section className="mt-6 border-t pt-4">
          <div className="mb-2 text-sm font-semibold text-muted-foreground">
            Customer Rating
          </div>
          <ul className="space-y-1">
            <li key="rating-all">
              <Link
                className={filterLinkClass(rating === "all" || rating === "")}
                href={getFilterUrl({ r: "all", pg: "1" })}
              >
                <span>Any</span>
              </Link>
            </li>
            {ratingOptions.map((r) => {
              const ratingValue = String(r);
              const isActive = rating === ratingValue;

              return (
                <li key={`rating-${ratingValue}`}>
                  <Link
                    className={filterLinkClass(isActive)}
                    href={getFilterUrl({ r: ratingValue, pg: "1" })}
                  >
                    {renderRatingStars(r, isActive)}
                    <span className="ml-3 shrink-0">{r} stars & up</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>

      <div className="space-y-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="flex min-h-8 min-w-0 flex-wrap items-center gap-2 text-sm">
            {activeFilters.length > 0 ? (
              <>
                <span className="font-medium">Active filters:</span>
                {activeFilters.map((filter) => (
                  <Badge
                    key={`${filter.label}-${filter.value}`}
                    variant="outline"
                    className="h-auto bg-background py-1"
                  >
                    <span className="text-muted-foreground">
                      {filter.label}:
                    </span>
                    <span>{filter.value}</span>
                  </Badge>
                ))}
                <Link
                  href="/search"
                  className="font-medium text-primary hover:underline"
                >
                  Clear all
                </Link>
              </>
            ) : (
              <span className="text-muted-foreground">All products</span>
            )}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
            <span className="shrink-0 text-sm text-muted-foreground">
              Sort by
            </span>
            <div className="flex flex-wrap gap-1 xl:justify-end">
              {sortOrders.map((s) => (
                <Link
                  key={`sort-${s.value}`}
                  href={getFilterUrl({ s: s.value, pg: "1" })}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
                    activeSort === s.value
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "text-foreground",
                  )}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.data.length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              No products found
            </div>
          )}

          {products.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
