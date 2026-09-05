import type { Config } from "tailwindcss";

/* -------------------------------------------------------------------------- */
/*  Design tokens — bảng màu "Tím pastel"                                      */
/*  Mọi màu dùng trong app đều lấy từ đây (không hard-code màu trong component) */
/* -------------------------------------------------------------------------- */

/** Tím pastel — màu thương hiệu chính (500 = #B5A8D5) */
const lavender = {
  50: "#FAF9FC",
  100: "#F3F0FA",
  200: "#E6E0F4",
  300: "#D6CCEC",
  400: "#C5B9E1",
  500: "#B5A8D5",
  600: "#9A88C4",
  700: "#7E6BAB",
  800: "#62528A",
  900: "#453A63",
  950: "#2A2340",
};

/** Hồng pastel nhạt — accent phụ (trạng thái / thẻ tag) */
const blossom = {
  50: "#FDF7FA",
  100: "#FBEBF2",
  200: "#F6D7E4",
  300: "#EEBBD0",
  400: "#E399B7",
  500: "#D4779C",
  600: "#BC5A80",
  700: "#9A4667",
  800: "#773850",
  900: "#552839",
};

/** Xanh mint pastel nhạt — accent phụ (trạng thái / thẻ tag) */
const mint = {
  50: "#F2FBF7",
  100: "#E0F5EC",
  200: "#C2EAD9",
  300: "#9BDBC0",
  400: "#6FC7A3",
  500: "#48AC86",
  600: "#348E6C",
  700: "#297257",
  800: "#215945",
  900: "#193F32",
};

/** Đỏ san hô pastel — dùng cho cảnh báo trễ hạn (hài hoà với tông tím) */
const coral = {
  50: "#FEF5F4",
  100: "#FCE7E5",
  200: "#F8CDC9",
  300: "#F0A9A3",
  400: "#E4837C",
  500: "#D25F58",
  600: "#B94A44",
  700: "#973B36",
  800: "#742E2A",
  900: "#52201E",
};

const config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        /* --- Bảng màu pastel --- */
        lavender,
        blossom,
        mint,
        coral,

        /* --- Token ngữ nghĩa (shadcn/ui), điều khiển bằng CSS variables --- */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          ...lavender,
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          muted: "hsl(var(--sidebar-muted))",
          active: "hsl(var(--sidebar-active))",
          "active-foreground": "hsl(var(--sidebar-active-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
        /* Màu trạng thái pastel dùng cho badge / tag */
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        /* Màu biểu đồ (recharts) */
        chart: {
          "not-started": "hsl(var(--chart-not-started))",
          "in-progress": "hsl(var(--chart-in-progress))",
          done: "hsl(var(--chart-done))",
          overdue: "hsl(var(--chart-overdue))",
          accent: "hsl(var(--chart-accent))",
          grid: "hsl(var(--chart-grid))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        "2xl": "calc(var(--radius) + 4px)",
        "3xl": "calc(var(--radius) + 12px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgb(69 58 99 / 0.04), 0 1px 3px 0 rgb(69 58 99 / 0.06)",
        card: "0 2px 8px -2px rgb(69 58 99 / 0.08), 0 6px 20px -8px rgb(69 58 99 / 0.10)",
        lift: "0 8px 24px -6px rgb(69 58 99 / 0.16)",
        glow: "0 0 0 4px rgb(181 168 213 / 0.22)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.35s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
