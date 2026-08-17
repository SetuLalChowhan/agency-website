import { Router } from "express";
import { asyncHandler, ok } from "../lib/errors";
import {
  SiteSettings,
  ThemeSettings,
  Navigation,
  Footer,
  SeoDefaults,
  HomePage,
  Page,
} from "../models/settings";

const router = Router();

/** One fetch the client uses to hydrate layout + theme + homepage structure. */
router.get(
  "/bootstrap",
  asyncHandler(async (_req, res) => {
    const [settings, theme, navigation, footer, seo, homepage, dynamicPages] = await Promise.all([
      SiteSettings.findOne().lean(),
      ThemeSettings.findOne().lean(),
      Navigation.findOne().lean(),
      Footer.findOne().lean(),
      SeoDefaults.findOne().lean(),
      HomePage.findOne().lean(),
      Page.find({ status: "PUBLISHED" }).sort({ order: 1 }).lean(),
    ]);

    const sections = (homepage?.sections ?? [])
      .filter((s: any) => s.enabled !== false)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    // Merge dynamic pages with showInNav into navigation items
    const navItems: any[] = [...(navigation?.items ?? [])];
    const footerColumns: any[] = footer?.columns ? JSON.parse(JSON.stringify(footer.columns)) : [];

    for (const p of dynamicPages) {
      const pageHref = `/${p.slug}`;
      if (p.showInNav && !navItems.some((it: any) => it.href === pageHref || it.href === `/${p.slug}/`)) {
        navItems.push({
          label: p.title,
          href: pageHref,
          type: "internal",
          target: "_self",
          enabled: true,
        });
      }

      if (p.showInFooter && footerColumns.length > 0) {
        const targetCol = footerColumns[0];
        if (targetCol && targetCol.links && !targetCol.links.some((l: any) => l.href === pageHref)) {
          targetCol.links.push({ label: p.title, href: pageHref });
        }
      }
    }

    ok(res, {
      settings,
      theme,
      navigation: navigation ? { ...navigation, items: navItems } : { items: navItems },
      footer: footer ? { ...footer, columns: footerColumns } : { columns: footerColumns },
      seo,
      homepage: { sections },
    });
  })
);

export default router;
