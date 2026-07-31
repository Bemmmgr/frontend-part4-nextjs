"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";

// 122 - admin search form
const AdminSearch = () => {
  // 获取当前页面路径，pathname 不包含 query string。
  const pathname = usePathname();
  const formActionUrl = pathname.includes("/admin/orders")
    ? "/admin/orders"
    : pathname.includes("/admin/users")
      ? "/admin/users"
      : "/admin/products";

  const searchParams = useSearchParams();
  const queryValue = searchParams.get("query") || "";

  return (
    <form
      key={`${formActionUrl}-${queryValue}`}
      action={formActionUrl}
      method="GET"
    >
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        defaultValue={queryValue}
        className="md:w-[100px] lg:w-[300px]"
      />
      <button className="sr-only" type="submit">
        Search
      </button>
    </form>
  );
};

export default AdminSearch;
