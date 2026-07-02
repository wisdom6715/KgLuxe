// /product/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories } from "./data";
import Component from "./Component";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) return {};
  return { title: `${category.title} | KgLuxee` };
}

export default function Page({ params }: PageProps) {
  const category = categories.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <Header />
      <Component data={category!} />
      <Footer />
    </>
  );
}