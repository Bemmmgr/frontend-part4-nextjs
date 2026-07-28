import Link from "next/link";
import Image from "next/image";
import { formatId, fomatCurrency } from "@/lib/utils";
import { getAllProducts, deleteProduct } from "@/lib/actions/product.actions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/shared/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteDialog from "@/components/shared/delete-dialog";

// 103 - get products for admin page
const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || "";
  const category = searchParams.category || "";

  const products = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="h2-bold tracking-normal">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage product catalog, pricing, stock, and product details.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/products/create">Create Product</Link>
        </Button>
      </div>

      <Card className="border py-0 shadow-xs">
        <CardHeader className="border-b p-5">
          <CardTitle className="text-lg font-bold">Product List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {products.data.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No products found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5 text-xs font-semibold text-muted-foreground">
                    ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    NAME
                  </TableHead>
                  <TableHead className="text-right text-xs font-semibold text-muted-foreground">
                    PRICE
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    CATEGORY
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                    STOCK
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                    RATING
                  </TableHead>
                  <TableHead className="pr-5 text-right text-xs font-semibold text-muted-foreground">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                      {formatId(product.id)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex min-w-72 items-center gap-3">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-md border object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-medium leading-5">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {fomatCurrency(product.price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          product.stock > 0 ? "secondary" : "destructive"
                        }
                      >
                        {product.stock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {product.rating.toString()}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/products/${product.id}`}>Edit</Link>
                      </Button>

                      {/* Delete */}
                      <DeleteDialog id={product.id} action={deleteProduct} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {products?.totalPage && products.totalPage > 1 && (
        <Pagination page={page} totalPages={products.totalPage} />
      )}
    </div>
  );
};

export default AdminProductsPage;
