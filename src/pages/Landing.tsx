import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Shield,
  Truck,
  RefreshCcw,
  Star,
  Zap,
  ShoppingBag,
} from "lucide-react";
import logo from "@/assets/logo.svg";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const navigate = useNavigate();
  const featuredProducts = useQuery(api.products.featured);

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      desc: "On orders over ฿1,500",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      desc: "100% protected checkout",
    },
    {
      icon: RefreshCcw,
      title: "Easy Returns",
      desc: "30-day return policy",
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      desc: "2-5 business days",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="flex flex-col items-center justify-center py-16 sm:py-24 lg:py-32 text-center"
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-xs font-medium"
              >
                <Star className="h-3 w-3 mr-1.5 fill-amber-400 text-amber-400" />
                Trusted by 10,000+ customers
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-3xl"
            >
              Premium Products,{" "}
              <span className="text-primary">Curated</span> for You
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed"
            >
              Discover a handpicked selection of quality products designed to
              elevate your everyday experience. Shop with confidence.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-3"
            >
              <Button
                size="lg"
                className="h-11 px-8 text-sm font-semibold"
                onClick={() => navigate("/shop")}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Collection
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-8 text-sm font-semibold"
                onClick={() => navigate("/auth")}
              >
                Create Account
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mt-12 sm:mt-16 grid grid-cols-3 gap-8 sm:gap-16"
            >
              {[
                { value: "10K+", label: "Customers" },
                { value: "500+", label: "Products" },
                { value: "4.9", label: "Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-border/40 bg-card/50 text-center py-6 h-full">
                    <CardContent className="p-4">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {feature.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Featured Products
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Our most popular items, handpicked for you
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-primary"
                onClick={() => navigate("/shop")}
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              {featuredProducts === undefined ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-muted animate-pulse aspect-square" />
                ))
              ) : featuredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No products yet. Seed the database to get started.</p>
                </div>
              ) : (
                featuredProducts.map((product) => (
                  <Card
                    key={product._id}
                    className="group border-border/50 overflow-hidden cursor-pointer card-elevated"
                    onClick={() => navigate("/shop")}
                  >
                    <div className="product-image-wrap aspect-square bg-muted/30">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="p-3">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {product.category}
                      </p>
                      <h3 className="text-sm font-semibold mt-0.5 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-base font-bold text-primary mt-1">
                        ฿{product.price.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </motion.div>

            <div className="mt-6 text-center sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/shop")}
              >
                View All Products
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-primary px-6 py-12 sm:px-12 sm:py-16 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">
                Ready to Start Shopping?
              </h2>
              <p className="mt-3 text-sm text-primary-foreground/80 max-w-md mx-auto">
                Create your account and get access to exclusive deals, fast
                shipping, and premium customer support.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-11 px-8 text-sm font-semibold"
                  onClick={() => navigate("/shop")}
                >
                  Shop Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-8 text-sm font-semibold border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Velnox" className="h-6 w-6 rounded-lg" />
              <span className="text-sm font-bold">Velnox</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Velnox. All rights reserved. Built with care.
            </p>
          </div>
        </div>
      </footer>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
