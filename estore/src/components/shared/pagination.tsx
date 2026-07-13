"use client";

import { formUrlQuery } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

// 089 - orders pagination
type PaginationProps = {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (btnType: string) => {
    const pageValue = btnType === "next" ? Number(page) + 1 : Number(page) - 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || "page",
      value: pageValue.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={Number(page) <= 1}
        onClick={() => handleClick("prev")}
      >
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      <Button
        size="sm"
        variant="outline"
        disabled={Number(page) >= totalPages}
        onClick={() => handleClick("next")}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
