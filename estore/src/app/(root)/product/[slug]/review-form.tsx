"use client";

import { z } from "zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReviewSchema } from "@/lib/validators";
import { reviewFormDefaultValues } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUpdateReview,
  getReviewByProductId,
} from "@/lib/actions/review.actions";
import { toast } from "sonner";

const ratingOptions = [
  { value: "5", label: "5 - Excellent" },
  { value: "4", label: "4 - Good" },
  { value: "3", label: "3 - Average" },
  { value: "2", label: "2 - Fair" },
  { value: "1", label: "1 - Poor" },
];

type ReviewFormProps = {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
};

const ReviewForm = ({
  userId,
  productId,
  onReviewSubmitted,
}: ReviewFormProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<
    z.input<typeof insertReviewSchema>,
    unknown,
    z.output<typeof insertReviewSchema>
  >({
    resolver: zodResolver(insertReviewSchema),
    defaultValues: {
      ...reviewFormDefaultValues,
      productId,
      userId,
    },
  });

  // open form handler
  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);

    if (!isOpen) return;

    form.reset({
      ...reviewFormDefaultValues,
      productId,
      userId,
    });

    const review = await getReviewByProductId({ productId });

    if (review) {
      form.reset({
        title: review.title,
        description: review.description,
        rating: review.rating,
        productId,
        userId,
      });
    }
  };

  // submit form handler
  const onSubmit: SubmitHandler<z.infer<typeof insertReviewSchema>> = async (
    values,
  ) => {
    const response = await createUpdateReview({ ...values, productId });

    if (!response.success) {
      toast.error(response.message);
      return;
    }

    toast.success(response.message);
    setOpen(false);

    onReviewSubmitted();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form method="post" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your thoughts with other customers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => {
                  const ratingValue = field.value ? String(field.value) : "";

                  return (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={ratingValue === "0" ? "" : ratingValue}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent position="popper">
                          {ratingOptions.map((option) => (
                            <SelectItem
                              key={`rating-${option.value}`}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Submitting.." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
