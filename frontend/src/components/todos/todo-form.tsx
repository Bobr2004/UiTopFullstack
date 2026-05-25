"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { Category } from "@/types/todo";

const todoFormSchema = z.object({
  text: z.string().trim().min(1, "Task text is required").max(200, "Maximum length is 200 characters"),
  categoryId: z.string().min(1, "Category is required"),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;

export function TodoForm({
  categories,
  isSubmitting,
  errorMessage,
  onSubmit,
}: {
  categories: Category[];
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (values: { text: string; categoryId: number }) => Promise<void>;
}) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      text: "",
      categoryId: "",
    },
  });

  async function submit(values: TodoFormValues) {
    await onSubmit({
      text: values.text.trim(),
      categoryId: Number(values.categoryId),
    });
    reset();
  }

  return (
    <form
      className="border-3 border-brutal bg-brutal-secondary p-4 shadow-brutal-lg"
      onSubmit={handleSubmit(submit)}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-start">
        <Field label="Task text" error={errors.text?.message}>
          <Input
            invalid={Boolean(errors.text)}
            placeholder="Write the next thing"
            {...register("text")}
          />
        </Field>

        <Field label="Category" error={errors.categoryId?.message}>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger invalid={Boolean(errors.categoryId)}>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Button className="mt-7 w-full lg:w-auto" loading={isSubmitting} type="submit">
          <Plus className="h-4 w-4 stroke-[3]" />
          Add
        </Button>
      </div>

      {errorMessage ? (
        <p className="mt-3 border-3 border-brutal bg-brutal-destructive px-3 py-2 text-sm font-black">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black uppercase tracking-wide">{label}</span>
      {children}
      {error ? <span className="mt-2 block text-xs font-black text-black">{error}</span> : null}
    </label>
  );
}
