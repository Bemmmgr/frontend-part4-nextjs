import { Metadata } from "next";
import Link from "next/link";
import { formatId } from "@/lib/utils";
import { getAllUsers, deleteUser } from "@/lib/actions/user.actions";
import DeleteDialog from "@/components/shared/delete-dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/shared/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 117 - get & display users
export const metadata: Metadata = {
  title: "Admin Users",
};

const AdminUserPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page = "1" } = await props.searchParams;

  const users = await getAllUsers({
    page: Number(page),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="h2-bold tracking-normal">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage customer accounts, roles, and user access.
        </p>
      </div>

      <Card className="border py-0 shadow-xs">
        <CardHeader className="border-b p-5">
          <CardTitle className="text-lg font-bold">User List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.data.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No users found.
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
                  <TableHead className="text-xs font-semibold text-muted-foreground">
                    EMAIL
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold text-muted-foreground">
                    ROLE
                  </TableHead>
                  <TableHead className="pr-5 text-right text-xs font-semibold text-muted-foreground">
                    ACTIONS
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-5 font-mono text-xs text-muted-foreground">
                      {formatId(user.id)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex min-w-56 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                          {user.name?.trim().charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium leading-5">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatId(user.id)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={user.role === "admin" ? "default" : "outline"}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>

                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}`}>Edit</Link>
                        </Button>

                        <DeleteDialog id={user.id} action={deleteUser} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {users.totalPages > 1 && (
        <Pagination page={Number(page) || 1} totalPages={users?.totalPages} />
      )}
    </div>
  );
};

export default AdminUserPage;
