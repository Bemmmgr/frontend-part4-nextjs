"use client";

import z from "zod";
import { Product } from "@/types";
import { ControllerRenderProps, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { productDefaultValues } from "@/lib/constants";
import { insetProductsSchema, updateProductSchema } from "@/lib/validators";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import slugify from "slugify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();

  /*
    z.input<typeof schema> 是“进入 Zod 校验前的数据类型”；
    z.output<typeof schema> 是“经过 Zod 校验/转换后的数据类型”；
    z.infer<typeof schema> 基本等于 z.output<typeof schema>
    表单原始输入值的类型。
    创建商品 schema 校验成功之后的数据类型。
    更新商品 schema 校验成功之后的数据类型。
  */
  type ProductFormInput = z.input<typeof insetProductsSchema>;
  type ProductFormOutput = z.output<typeof insetProductsSchema>;
  type ProductUpdateOutput = z.output<typeof updateProductSchema>;

  /*
  const form = useForm<z.infer<typeof insetProductsSchema>>({
    resolver:
      type === "Update"
        ? zodResolver(updateProductSchema)
        : zodResolver(insetProductsSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });
  */
  const form = useForm<ProductFormInput, undefined, ProductFormOutput>({
    resolver: zodResolver(insetProductsSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  const images = useWatch({ control: form.control, name: "images" }) || [];
  const isFeatured = useWatch({ control: form.control, name: "isFeatured" });
  const banner = useWatch({ control: form.control, name: "banner" });

  // 110 - create product form submission
  const onSubmit = async (values: ProductFormOutput) => {
    if (type === "Create") {
      const response = await createProduct(values);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push("/admin/products");
    }

    if (type === "Update") {
      if (!productId) {
        toast.error("Product ID is missing");
        router.push("/admin/products");
        return;
      }

      const response = await updateProduct({
        ...values,
        id: productId,
      } satisfies ProductUpdateOutput);

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      toast.success(response.message);
      router.push("/admin/products");
    }
  };

  return (
    /*
    FormField
    负责把 category 字段接入 React Hook Form

    control={form.control}
        说明这个字段属于哪个 form

    name="category"
        说明这个字段对应 values.category

    render={({ field }) => ...}
        说明这个字段 UI 怎么渲染

    Input {...field}
        把输入框和 React Hook Form 绑定起来

    FormMessage
        自动显示 category 的校验错误
    */

    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter slug" {...field} />
                    <Button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true }),
                        );
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          {/* category */}
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<ProductFormInput, "category">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<ProductFormInput, "brand">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          {/* price */}
          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<ProductFormInput, "price">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({
              field,
            }: {
              field: ControllerRenderProps<ProductFormInput, "stock">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter stock"
                    value={field.value as number}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="upload-field flex flex-col md:flex-row gap-5">
          {/* images */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card className="py-0">
                  <CardContent className="space-y-4 p-4">
                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {images.map((image) => (
                          <Image
                            key={image}
                            src={image}
                            alt="product image"
                            className="size-20 rounded-md border object-cover object-center"
                            width={100}
                            height={100}
                          />
                        ))}
                      </div>
                    )}
                    <FormControl>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (!res?.[0]) return;

                          form.setValue("images", [...images, res[0].ufsUrl], {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`ERROR! ${error.message}`);
                        }}
                      />
                    </FormControl>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {/* isFeatured */}
          <Card className="py-0">
            <CardContent className="space-y-4 p-4">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="m-0">Is Featured?</FormLabel>
                  </FormItem>
                )}
              />

              {isFeatured && banner && (
                <Image
                  src={banner}
                  alt="banner image"
                  className="h-40 w-full rounded-md border object-cover"
                  width={1920}
                  height={680}
                />
              )}

              {isFeatured && !banner && (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    if (!res?.[0]) return;

                    form.setValue("banner", res[0].ufsUrl, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`ERROR! ${error.message}`);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          {/* description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<ProductFormInput, "description">;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {/* submit */}
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Submitting..." : `${type} Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
